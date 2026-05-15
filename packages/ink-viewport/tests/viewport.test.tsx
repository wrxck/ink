import React from 'react';
import { render } from 'ink-testing-library';
import { Text } from 'ink';
import { describe, it, expect, beforeEach } from 'vitest';

import { Viewport } from '../src/viewport.js';
import { useAvailableHeight } from '../src/context.js';

function HeightDisplay(): React.JSX.Element {
  const height = useAvailableHeight();
  return <Text>height:{height}</Text>;
}

describe('Viewport', () => {
  beforeEach(() => {
    Object.defineProperty(process.stdout, 'rows', { value: 40, writable: true, configurable: true });
  });

  it('renders strictly shorter than the terminal so Ink avoids its full-screen clear', () => {
    // Ink falls back to ansiEscapes.clearTerminal — a full-screen wipe that
    // flickers on every re-render — whenever a frame's height is >= stdout.rows.
    // The viewport must keep the rendered frame strictly below the terminal height.
    const { lastFrame } = render(
      <Viewport>
        <Text>content</Text>
      </Viewport>
    );
    const frameHeight = lastFrame()!.split('\n').length;
    expect(frameHeight).toBeLessThan(process.stdout.rows!);
  });

  it('provides available height minus chrome (within the flicker-safe viewport)', () => {
    // available = (rows - 1) - chrome = (40 - 1) - 6
    const { lastFrame } = render(
      <Viewport chrome={6}>
        <HeightDisplay />
      </Viewport>
    );
    expect(lastFrame()).toContain('height:33');
  });

  it('defaults chrome=0 so available height is one row short of terminal rows', () => {
    // available = rows - 1 = 40 - 1
    const { lastFrame } = render(
      <Viewport>
        <HeightDisplay />
      </Viewport>
    );
    expect(lastFrame()).toContain('height:39');
  });

  it('useAvailableHeight returns default 20 outside Viewport', () => {
    const { lastFrame } = render(<HeightDisplay />);
    expect(lastFrame()).toContain('height:20');
  });
});
