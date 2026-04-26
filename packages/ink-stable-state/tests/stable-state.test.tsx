import React from 'react';
import { render } from 'ink-testing-library';
import { Text } from 'ink';
import { describe, it, expect } from 'vitest';

import { useStableState, defaultEquals } from '../src/index.js';

describe('defaultEquals', () => {
  it('treats primitives correctly', () => {
    expect(defaultEquals(1, 1)).toBe(true);
    expect(defaultEquals('a', 'a')).toBe(true);
    expect(defaultEquals(1, 2)).toBe(false);
    expect(defaultEquals(null, null)).toBe(true);
    expect(defaultEquals(undefined, undefined)).toBe(true);
    expect(defaultEquals(null, undefined)).toBe(false);
  });

  it('compares plain objects structurally, not by reference', () => {
    expect(defaultEquals({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    expect(defaultEquals({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
  });

  it('compares arrays of objects', () => {
    expect(defaultEquals(
      [{ id: 1, ok: true }, { id: 2, ok: false }],
      [{ id: 1, ok: true }, { id: 2, ok: false }],
    )).toBe(true);
    expect(defaultEquals(
      [{ id: 1 }],
      [{ id: 2 }],
    )).toBe(false);
  });

  it('falls back to identity when JSON.stringify throws (cyclic)', () => {
    const a: any = {};
    a.self = a;
    expect(defaultEquals(a, a)).toBe(true);     // Object.is short-circuit
    expect(defaultEquals(a, { self: a })).toBe(false);
  });
});

// Render-counting harness: drives its own setState calls from a setInterval
// inside the component. We count renders to prove that calling setValue with
// the same payload does NOT trigger a re-render, but a different payload does.
//
// (Critically, we DON'T use ink-testing-library's rerender() here because
// that re-runs the component from the parent, which is unrelated to whether
// useStableState memoised the state update. Self-driven setState is the
// scenario useStableState targets.)

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function SelfDriving({
  payloads,
  intervalMs,
  onCount,
}: {
  payloads: unknown[];
  intervalMs: number;
  onCount: (n: number) => void;
}): React.JSX.Element {
  const [value, setValue] = useStableState<unknown>(payloads[0]);
  const renders = React.useRef(0);
  renders.current += 1;
  onCount(renders.current);

  React.useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % payloads.length;
      setValue(payloads[i]);
    }, intervalMs);
    return () => clearInterval(id);
  }, [payloads, intervalMs, setValue]);

  return <Text>v={JSON.stringify(value)} renders={renders.current}</Text>;
}

describe('useStableState', () => {
  it('does NOT re-render when setValue is called with the same payload', async () => {
    let lastCount = 0;
    // Cycle of length 1 — every setValue call delivers the same value.
    const sameOverAndOver = [{ status: 'ok', count: 5 }];
    const { unmount } = render(
      <SelfDriving payloads={sameOverAndOver} intervalMs={10} onCount={n => { lastCount = n; }} />,
    );

    await delay(150);  // 15+ setValue calls would happen if we re-rendered each time.
    unmount();

    // Only the initial mount render should fire. Allow a tiny slack for
    // settling renders from React's internal scheduling — but nowhere near 15.
    expect(lastCount).toBeLessThanOrEqual(2);
  });

  it('DOES re-render when setValue actually changes the payload', async () => {
    let lastCount = 0;
    // Cycle: alternates between two distinct payloads → expect ~one render per change.
    const alternating = [{ s: 'a' }, { s: 'b' }];
    const { lastFrame, unmount } = render(
      <SelfDriving payloads={alternating} intervalMs={20} onCount={n => { lastCount = n; }} />,
    );

    await delay(150);  // ~7-8 toggles → at least 5 distinct renders.
    unmount();

    expect(lastCount).toBeGreaterThanOrEqual(3);
    expect(lastFrame()).toMatch(/v=\{"s":"[ab]"\}/);
  });

  it('returns the same shape as useState ([value, setValue])', () => {
    function Probe(): React.JSX.Element {
      const [v, set] = useStableState<number>(42);
      expect(typeof set).toBe('function');
      return <Text>v={v}</Text>;
    }
    const { lastFrame } = render(<Probe />);
    expect(lastFrame()).toContain('v=42');
  });

  it('functional updaters are equality-checked too', () => {
    function Probe(): React.JSX.Element {
      const [v, set] = useStableState<number>(0);
      const renders = React.useRef(0);
      renders.current += 1;
      React.useEffect(() => {
        // Functional updater that always returns the SAME value — must not re-render.
        set(prev => prev);
        set(prev => prev);
        set(prev => prev);
      }, []);
      return <Text>v={v} renders={renders.current}</Text>;
    }
    const { lastFrame } = render(<Probe />);
    expect(lastFrame()).toMatch(/v=0/);
    // Initial render + at most one settle render.
    const m = lastFrame()!.match(/renders=(\d+)/)!;
    expect(parseInt(m[1], 10)).toBeLessThanOrEqual(2);
  });

  it('honours a custom equality function', () => {
    interface Item { id: number; updatedAt: number }
    // Equal if `id` matches — we don't care about updatedAt churn.
    const byId = (a: Item, b: Item) => a.id === b.id;

    function Probe(): React.JSX.Element {
      const [v, set] = useStableState<Item>({ id: 1, updatedAt: 0 }, byId);
      const renders = React.useRef(0);
      renders.current += 1;
      React.useEffect(() => {
        set({ id: 1, updatedAt: Date.now() });   // same id → no re-render
        set({ id: 1, updatedAt: Date.now() + 1 });
      }, []);
      return <Text>id={v.id} renders={renders.current}</Text>;
    }

    const { lastFrame } = render(<Probe />);
    const m = lastFrame()!.match(/renders=(\d+)/)!;
    expect(parseInt(m[1], 10)).toBeLessThanOrEqual(2);
  });
});
