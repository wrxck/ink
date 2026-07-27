import React from 'react';

import { Box, Text } from 'ink';

export interface ModalProps {
  visible: boolean;
  title?: string;
  width?: number;
  borderColor?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function isTextContent(node: React.ReactNode): boolean {
  if (node == null || typeof node === 'boolean') return true;
  if (typeof node === 'string' || typeof node === 'number') return true;
  if (Array.isArray(node)) return node.every(isTextContent);
  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: React.ReactNode }>;
    const type = element.type;
    if (type === Text) return true;
    if (type === Box) return false;
    const childProps = element.props;
    if (childProps && 'children' in childProps) {
      return isTextContent(childProps.children);
    }
    return false;
  }
  return false;
}

export function Modal({
  visible,
  title,
  width = 50,
  borderColor = 'cyan',
  children,
  footer,
}: ModalProps): React.JSX.Element | null {
  if (!visible) {
    return null;
  }

  const renderFooter = (): React.ReactNode => {
    if (footer == null) return null;
    const inner = isTextContent(footer) ? <Text dimColor>{footer}</Text> : footer;
    return <Box marginTop={1}>{inner}</Box>;
  };

  return (
    <Box alignItems="center" width="100%">
      <Box
        flexDirection="column"
        width={width}
        borderStyle="round"
        borderColor={borderColor}
        paddingX={1}
      >
        {title != null && (
          <Box marginBottom={1}>
            <Text bold>{title}</Text>
          </Box>
        )}
        <Box flexDirection="column">{children}</Box>
        {renderFooter()}
      </Box>
    </Box>
  );
}
