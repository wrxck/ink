# @matthesketh/ink-*

A collection of 30 composable UI components for building terminal applications with [Ink 5](https://github.com/vadimdemedes/ink) and React.

**Docs**: [ink.hesketh.pro](https://ink.hesketh.pro) | **npm**: [@matthesketh](https://www.npmjs.com/~matthesketh)

## Packages

### Layout

| Package | Description |
|---------|-------------|
| `@matthesketh/ink-viewport` | Terminal size hook and viewport-aware layout |
| `@matthesketh/ink-split-pane` | Resizable side-by-side or top-bottom panel layout |
| `@matthesketh/ink-modal` | Overlay dialog component |
| `@matthesketh/ink-rule` | Horizontal divider with optional centred label |

### Navigation

| Package | Description |
|---------|-------------|
| `@matthesketh/ink-tabs` | Tab bar with active indicator, badges, and keyboard nav |
| `@matthesketh/ink-breadcrumb` | Navigation trail/breadcrumb |
| `@matthesketh/ink-scrollable-list` | Windowed scrollable list with follow-cursor scrolling |
| `@matthesketh/ink-pager` | Less-like scrollable content viewer |
| `@matthesketh/ink-tree` | Collapsible tree view with keyboard navigation |

### Input

| Package | Description |
|---------|-------------|
| `@matthesketh/ink-input-dispatcher` | Single-point input routing (no competing useInput handlers) |
| `@matthesketh/ink-fuzzy-select` | Filterable select with fuzzy matching |
| `@matthesketh/ink-checkbox` | Inline checkbox toggle |
| `@matthesketh/ink-radio` | Radio button group for single-select |
| `@matthesketh/ink-switch` | On/off toggle switch |
| `@matthesketh/ink-textarea` | Multi-line text input with cursor and scrolling |
| `@matthesketh/ink-masked-input` | Template-formatted input (IPs, dates, phones) |
| `@matthesketh/ink-form` | Form builder with text inputs, selects, checkboxes |
| `@matthesketh/ink-file-picker` | Filesystem navigator and file picker |

### Data Display

| Package | Description |
|---------|-------------|
| `@matthesketh/ink-table` | Table with keyboard nav, alignment, sorting indicators |
| `@matthesketh/ink-chart` | Sparklines, bar charts, line charts (Unicode blocks) |
| `@matthesketh/ink-gauge` | Progress gauge and donut visualisation |
| `@matthesketh/ink-pipeline` | Multi-step pipeline visualisation |
| `@matthesketh/ink-task-list` | Step/task progress display |
| `@matthesketh/ink-timeline` | Chronological event timeline |
| `@matthesketh/ink-diff` | Text diff viewer with add/remove colouring |
| `@matthesketh/ink-markdown` | Render markdown in the terminal |
| `@matthesketh/ink-log-viewer` | Rolling log display with auto-scroll and filtering |

### Feedback

| Package | Description |
|---------|-------------|
| `@matthesketh/ink-toast` | Timed ephemeral toast notifications |
| `@matthesketh/ink-status-bar` | Fixed-position status bar with key hints and slots |
| `@matthesketh/ink-keybinding-help` | Auto-formatted keybinding reference overlay |

## Install

Each package is published independently:

```bash
npm install @matthesketh/ink-toast @matthesketh/ink-table
```

All packages have `ink` and `react` as peer dependencies.

## Development

```bash
git clone https://github.com/wrxck/ink.git
cd ink
npm install
npm run build
npm test
```

This is an npm workspaces monorepo. Each package in `packages/` has its own `src/`, `tsconfig.json`, and tests.

## License

MIT
