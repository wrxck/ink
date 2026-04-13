---
title: Installation
description: How to install @matthesketh/ink components
---

## Prerequisites

- **Node.js** 18 or later
- **Ink 5** and **React 18** in your project

## Install individual packages

Each component is published as a separate npm package:

```bash
npm install @matthesketh/ink-table @matthesketh/ink-toast
```

All packages list `ink` and `react` as peer dependencies. If you don't already have them:

```bash
npm install ink react
```

## TypeScript

Every package ships with `.d.ts` type declarations. No `@types/*` packages needed.

## Peer dependencies

All packages share the same peer dependency versions:

| Package | Version |
|---------|---------|
| `ink` | `5.x` |
| `react` | `18.x` |

## Import style

All packages use named exports:

```tsx
import { Table } from '@matthesketh/ink-table';
import { ScrollableList } from '@matthesketh/ink-scrollable-list';
import { ToastProvider, useToast } from '@matthesketh/ink-toast';
```

## Monorepo development

To work on the packages locally:

```bash
git clone https://github.com/wrxck/ink.git
cd ink
npm install
npm run build
npm test
```

The repo uses npm workspaces. Changes to one package are immediately available to others during development.
