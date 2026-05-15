import React, { useState } from 'react';
import { EventEmitter } from 'node:events';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Force Ink's real (non-CI) render path so the flicker branch is reachable.
// In CI mode Ink skips cursor rendering entirely; in debug mode (what
// ink-testing-library uses) onRender returns before the clear-screen branch.
// This proof must exercise the genuine production path.
vi.mock('is-in-ci', () => ({ default: false }));

// eslint-disable-next-line import/first
import { render, Box, Text, useInput } from 'ink';
// eslint-disable-next-line import/first
import { Viewport } from '../src/viewport.js';

// Ink writes this exact sequence (ansiEscapes.clearTerminal) before a frame
// whenever the frame height is >= stdout.rows. A full-screen wipe on every
// re-render is the flicker. Its absence is the proof there is none.
const CLEAR_TERMINAL = '\u001b[2J\u001b[3J\u001b[H';
const ROWS = 24;
const COLUMNS = 80;
const DOWN_ARROW = '\u001b[B';
const SCROLL_STEPS = 20;

/** A stdout that records every byte Ink writes and reports a fixed size. */
class RecordingStdout extends EventEmitter {
  columns = COLUMNS;
  rows = ROWS;
  isTTY = true;
  writes: string[] = [];
  write = (data: string): boolean => {
    this.writes.push(data);
    return true;
  };
}

/** A TTY-like stdin Ink can attach to and receive keypresses from. Mirrors
 *  ink-testing-library's stdin: a keypress is delivered via both the
 *  'readable'/read() and 'data' paths so Ink picks it up however it listens. */
class FakeStdin extends EventEmitter {
  isTTY = true;
  data: string | null = null;
  press = (data: string): void => {
    this.data = data;
    this.emit('readable');
    this.emit('data', data);
  };
  setEncoding(): void {}
  setRawMode(): void {}
  resume(): void {}
  pause(): void {}
  ref(): void {}
  unref(): void {}
  read = (): string | null => {
    const d = this.data;
    this.data = null;
    return d;
  };
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** A windowed list whose selection (and visible window) moves on every
 *  down-arrow — a faithful stand-in for scrolling a real Ink UI. */
function ScrollableList(): React.JSX.Element {
  const items = Array.from({ length: 200 }, (_, i) => `item-${i}`);
  const [selected, setSelected] = useState(0);
  useInput((_input, key) => {
    if (key.downArrow) {
      setSelected((s) => Math.min(items.length - 1, s + 1));
    }
  });
  const windowSize = ROWS - 2;
  const start = Math.max(
    0,
    Math.min(selected - (windowSize >> 1), items.length - windowSize),
  );
  return (
    <Box flexDirection="column">
      {items.slice(start, start + windowSize).map((item, i) => (
        <Text key={item} inverse={start + i === selected}>
          {item}
        </Text>
      ))}
    </Box>
  );
}

/** The pre-fix Viewport: root box pinned to the FULL terminal height. */
function LegacyViewport({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <Box flexDirection="column" height={ROWS}>
      {children}
    </Box>
  );
}

interface ScrollResult {
  /** Number of full-screen clears (flickers) Ink emitted. */
  clears: number;
  /** Every byte Ink wrote, concatenated — the raw terminal output. */
  output: string;
}

/** Mount `node` with Ink's production render path and scroll it
 *  SCROLL_STEPS times, recording everything Ink writes to the terminal. */
async function scrollAndRecord(node: React.JSX.Element): Promise<ScrollResult> {
  const stdout = new RecordingStdout();
  const stdin = new FakeStdin();
  const app = render(node, {
    stdout: stdout as unknown as NodeJS.WriteStream,
    stdin: stdin as unknown as NodeJS.ReadStream,
    debug: false,
    exitOnCtrlC: false,
    patchConsole: false,
  });

  await sleep(40);
  for (let i = 0; i < SCROLL_STEPS; i++) {
    stdin.press(DOWN_ARROW);
    await sleep(45); // > Ink's 32ms render throttle, so each scroll renders
  }
  await sleep(60);
  app.unmount();

  const output = stdout.writes.join('');
  return { clears: output.split(CLEAR_TERMINAL).length - 1, output };
}

describe('Viewport flicker proof', () => {
  beforeEach(() => {
    process.setMaxListeners(0);
    Object.defineProperty(process.stdout, 'rows', {
      value: ROWS,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(process.stdout, 'columns', {
      value: COLUMNS,
      writable: true,
      configurable: true,
    });
  });

  it('CONTROL: a full-terminal-height frame makes Ink flicker on every scroll render', async () => {
    // Reproduces the pre-fix Viewport (height = rows). This both proves the
    // bug was real and proves the recorder genuinely detects clearTerminal —
    // without this anchor, a "0 clears" result below would be meaningless.
    const { clears } = await scrollAndRecord(
      <LegacyViewport>
        <ScrollableList />
      </LegacyViewport>,
    );
    expect(clears).toBeGreaterThan(0);
  });

  it('Viewport scrolls 20 rows and emits ZERO full-screen clears', async () => {
    const { clears, output } = await scrollAndRecord(
      <Viewport>
        <ScrollableList />
      </Viewport>,
    );

    // The scroll genuinely happened: item-30 is only ever in the visible
    // window after ~20 down-arrows, so its presence proves Ink really
    // re-rendered the list — "0 clears" is not a no-op artifact.
    expect(output).toContain('item-30');

    // ...and across every one of those re-renders, Ink never wiped the
    // screen. Zero clearTerminal sequences => zero flicker.
    expect(clears).toBe(0);
  });
});
