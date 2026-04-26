import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://ink.hesketh.pro',
  integrations: [
    starlight({
      title: '@matthesketh/ink',
      description: '30 composable UI components for Ink 5 terminal apps',
      social: {
        github: 'https://github.com/wrxck/ink',
      },
      editLink: {
        baseUrl: 'https://github.com/wrxck/ink/edit/develop/docs-site/',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'getting-started/introduction' },
            { label: 'Installation', slug: 'getting-started/installation' },
          ],
        },
        {
          label: 'Layout',
          items: [
            { label: 'Viewport', slug: 'components/viewport' },
            { label: 'Split Pane', slug: 'components/split-pane' },
            { label: 'Modal', slug: 'components/modal' },
            { label: 'Rule', slug: 'components/rule' },
          ],
        },
        {
          label: 'Navigation',
          items: [
            { label: 'Tabs', slug: 'components/tabs' },
            { label: 'Breadcrumb', slug: 'components/breadcrumb' },
            { label: 'Scrollable List', slug: 'components/scrollable-list' },
            { label: 'Pager', slug: 'components/pager' },
            { label: 'Tree', slug: 'components/tree' },
          ],
        },
        {
          label: 'Input',
          items: [
            { label: 'Input Dispatcher', slug: 'components/input-dispatcher' },
            { label: 'Fuzzy Select', slug: 'components/fuzzy-select' },
            { label: 'Checkbox', slug: 'components/checkbox' },
            { label: 'Radio', slug: 'components/radio' },
            { label: 'Switch', slug: 'components/switch' },
            { label: 'Textarea', slug: 'components/textarea' },
            { label: 'Masked Input', slug: 'components/masked-input' },
            { label: 'Form', slug: 'components/form' },
            { label: 'File Picker', slug: 'components/file-picker' },
          ],
        },
        {
          label: 'Data Display',
          items: [
            { label: 'Table', slug: 'components/table' },
            { label: 'Chart', slug: 'components/chart' },
            { label: 'Gauge', slug: 'components/gauge' },
            { label: 'Pipeline', slug: 'components/pipeline' },
            { label: 'Task List', slug: 'components/task-list' },
            { label: 'Timeline', slug: 'components/timeline' },
            { label: 'Diff', slug: 'components/diff' },
            { label: 'Markdown', slug: 'components/markdown' },
            { label: 'Log Viewer', slug: 'components/log-viewer' },
          ],
        },
        {
          label: 'Feedback',
          items: [
            { label: 'Toast', slug: 'components/toast' },
            { label: 'Status Bar', slug: 'components/status-bar' },
            { label: 'Keybinding Help', slug: 'components/keybinding-help' },
          ],
        },
        {
          label: 'Hooks',
          items: [
            { label: 'Stable State', slug: 'components/stable-state' },
          ],
        },
      ],
    }),
  ],
});
