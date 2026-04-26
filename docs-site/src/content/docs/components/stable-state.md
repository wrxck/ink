---
title: "Stable State"
description: "useState replacement that skips re-renders when the new value is structurally equal to the old one. Kills polling-induced flicker."
---

A `useState` replacement for Ink apps that **skips re-renders when the new value is structurally equal to the old one**. Kills the flicker you get when a polling hook calls `setState` every 10 seconds with identical data.

## Install

```bash
npm install @matthesketh/ink-stable-state
```

## The problem

A common Ink pattern: fetch some data on a timer, dump it into state, render a list.

```tsx
function useHealth() {
  const [data, setData] = useState([]);
  useInterval(() => {
    fetch('/health').then(setData);  // ← flicker: setState even when nothing changed
  }, 10_000);
  return data;
}
```

React doesn't know your two arrays are structurally equal — it sees a new reference and re-renders. On a terminal that means a visible repaint every 10 seconds even when nothing changed.

## The fix

```tsx
import { useStableState } from '@matthesketh/ink-stable-state';

function useHealth() {
  const [data, setData] = useStableState([]);
  useInterval(() => {
    fetch('/health').then(setData);  // ← same value? skipped. Different? re-render.
  }, 10_000);
  return data;
}
```

Drop-in for `useState`, identical signature, works with functional updaters too.

## API

### `useStableState<T>(initial, isEqual?)`

```ts
const [value, setValue] = useStableState<T>(
  initial: T,
  isEqual?: (a: T, b: T) => boolean,
);
```

| Arg       | Type                    | Default          | Description                                                                 |
|-----------|-------------------------|------------------|-----------------------------------------------------------------------------|
| `initial` | `T`                     | —                | Initial value (eager).                                                      |
| `isEqual` | `(a, b) => boolean`     | `defaultEquals`  | Returns `true` when the two values should be treated as the same.           |

Returns `[value, setValue]` — exactly like `useState`. `setValue` accepts either a value or a functional updater.

### `defaultEquals<T>(a, b)`

JSON-stringify comparison with safe fallbacks:

- `Object.is` short-circuit for identical references and primitives.
- `null` / `undefined` handled correctly.
- `JSON.stringify` for everything else.
- Returns `false` if stringify throws (e.g. cyclic structures) — caller still gets correctness, just no memoisation benefit.

Exported separately so you can compose:

```ts
import { defaultEquals } from '@matthesketh/ink-stable-state';

const equalIgnoringTimestamp = (a, b) =>
  defaultEquals({ ...a, ts: 0 }, { ...b, ts: 0 });
```

## When to use it

- ✅ Polling hooks that re-fetch identical data on a timer.
- ✅ Subscription handlers where the source emits redundant updates.
- ✅ Any place you'd reach for `useMemo` + `useState` together to dodge re-renders.

## When NOT to use it

- ❌ State that changes every render anyway (e.g. animation frames). Equality check overhead is wasted.
- ❌ State containing functions, class instances, or anything else `JSON.stringify` can't faithfully represent — provide your own `isEqual` instead.
- ❌ Massive payloads (multi-MB) where stringify cost exceeds re-render cost. Use a custom shallow `isEqual` instead.
