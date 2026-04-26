/**
 * @matthesketh/ink-stable-state
 *
 * `useStableState<T>(value, isEqual?)` — a drop-in `useState` replacement for
 * the common Ink pattern of "fetch data on a poll, dump it into state". The
 * problem: fetching the same payload every N seconds and calling `setState`
 * unconditionally triggers a re-render every cycle even when nothing changed,
 * which on a terminal renderer manifests as a visible flicker.
 *
 * `useStableState` short-circuits the `setState` call when the new value is
 * structurally equal to the previous one. Default equality is JSON-string
 * comparison (cheap, dependency-free, handles arrays/objects/primitives).
 * For deep objects with non-serialisable members (functions, Symbols, Dates
 * you care about) pass your own `isEqual`.
 *
 * Returns the same `[value, setValue]` shape as `useState` so it's a
 * drop-in replacement.
 */

import { useRef, useState, useCallback, useEffect } from 'react';

export type Equals<T> = (a: T, b: T) => boolean;

/** Default equality: stringify both sides and compare. Fast, allocation-free
 *  on the read path (we only stringify when setValue is called), and handles
 *  the everyday cases (primitives, arrays of objects, polled JSON payloads). */
export function defaultEquals<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;
  // Fast path for null / undefined: Object.is already covered identical;
  // mismatched null/undefined is a real change.
  if (a == null || b == null) return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    // Cyclic or otherwise unstringifiable — fall back to identity.
    return false;
  }
}

/**
 * `useState` that skips the update when the new value matches the old.
 *
 * Returns `[value, setValue]` exactly like `useState`. Functional updaters
 * (`setValue(prev => next)`) are supported and equality-checked the same way.
 *
 * @param initial   The initial value (eager — pass a thunk if construction is expensive).
 * @param isEqual   Custom equality. Defaults to JSON-stringify comparison.
 */
export function useStableState<T>(
  initial: T,
  isEqual: Equals<T> = defaultEquals,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValueRaw] = useState<T>(initial);
  const lastRef = useRef<T>(initial);
  const eqRef = useRef(isEqual);
  // Track the latest isEqual via effect (not at render-time) so we don't
  // mutate refs during render — keeps StrictMode happy.
  useEffect(() => {
    eqRef.current = isEqual;
  }, [isEqual]);

  const setValue = useCallback((next: T | ((prev: T) => T)) => {
    setValueRaw(prev => {
      const candidate = typeof next === 'function'
        ? (next as (p: T) => T)(prev)
        : next;
      if (eqRef.current(lastRef.current, candidate)) {
        // No change — return the same reference so React skips the re-render.
        return prev;
      }
      lastRef.current = candidate;
      return candidate;
    });
  }, []);

  return [value, setValue];
}
