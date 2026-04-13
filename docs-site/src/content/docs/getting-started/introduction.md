---
title: Introduction
description: 30 composable UI components for Ink 5 terminal apps
---

`@matthesketh/ink-*` is a collection of 30 production-grade UI components for building terminal applications with [Ink 5](https://github.com/vadimdemedes/ink) and React.

## Why?

Ink gives you React for the terminal, but the ecosystem of reusable components is thin. These packages fill the gaps with components you'd expect in any UI toolkit: tables, forms, modals, toasts, charts, trees, tabs, and more.

Every component:
- Works with **Ink 5** and **React 18**
- Ships with **TypeScript declarations**
- Has **zero runtime dependencies** beyond ink and react
- Follows consistent API patterns

## Packages by category

### Layout
`viewport`, `split-pane`, `modal`, `rule`

### Navigation
`tabs`, `breadcrumb`, `scrollable-list`, `pager`, `tree`

### Input
`input-dispatcher`, `fuzzy-select`, `checkbox`, `radio`, `switch`, `textarea`, `masked-input`, `form`, `file-picker`

### Data Display
`table`, `chart`, `gauge`, `pipeline`, `task-list`, `timeline`, `diff`, `markdown`, `log-viewer`

### Feedback
`toast`, `status-bar`, `keybinding-help`

## Quick example

```tsx
import React from 'react';
import { render } from 'ink';
import { Table } from '@matthesketh/ink-table';

const data = [
  { name: 'Alice', role: 'Admin' },
  { name: 'Bob', role: 'User' },
];

function App() {
  return <Table data={data} columns={['name', 'role']} />;
}

render(<App />);
```

## Source

All packages live in the [wrxck/ink](https://github.com/wrxck/ink) monorepo and are published independently to npm under the `@matthesketh` scope.
