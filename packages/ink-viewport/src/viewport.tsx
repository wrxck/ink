import React from 'react';
import { Box } from 'ink';

import { useTerminalSize } from './use-terminal-size.js';
import { ViewportContext } from './context.js';

interface ViewportProps {
  chrome?: number;
  children: React.ReactNode;
}

export function Viewport({ chrome = 0, children }: ViewportProps): React.JSX.Element {
  const { rows } = useTerminalSize();
  // Render one row short of the terminal height. Ink falls back to a
  // full-screen clear (ansiEscapes.clearTerminal) — which flickers on every
  // re-render — whenever a frame's height is >= stdout.rows. Staying strictly
  // below the terminal height keeps Ink on its diff-based, flicker-free
  // log-update render path.
  const height = Math.max(1, rows - 1);
  const available = Math.max(1, height - chrome);

  return (
    <ViewportContext.Provider value={available}>
      <Box flexDirection="column" height={height}>
        {children}
      </Box>
    </ViewportContext.Provider>
  );
}
