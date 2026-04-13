import React, { useMemo, useRef, useCallback, memo } from 'react';

import { Box, Text } from 'ink';

export interface ScrollableListProps<T> {
  items: T[];
  selectedIndex: number;
  maxVisible: number;
  renderItem: (item: T, selected: boolean, index: number) => React.ReactNode;
  emptyText?: string;
}

interface MemoRowProps<T> {
  item: T;
  selected: boolean;
  index: number;
  renderItem: (item: T, selected: boolean, index: number) => React.ReactNode;
}

const MemoRow = memo(function MemoRow<T>({ item, selected, index, renderItem }: MemoRowProps<T>) {
  return <Box>{renderItem(item, selected, index)}</Box>;
}) as <T>(props: MemoRowProps<T>) => React.JSX.Element;

export function ScrollableList<T>({
  items,
  selectedIndex,
  maxVisible,
  renderItem,
  emptyText = 'No items',
}: ScrollableListProps<T>): React.JSX.Element {
  const prevOffsetRef = useRef(0);

  const { visibleItems, scrollOffset, hasAbove, hasBelow } = useMemo(() => {
    if (items.length === 0) {
      return { visibleItems: [] as T[], scrollOffset: 0, hasAbove: false, hasBelow: false };
    }

    const clampedIndex = Math.min(selectedIndex, items.length - 1);
    const displayRows = Math.min(maxVisible, items.length);

    let offset = prevOffsetRef.current;

    if (clampedIndex >= offset + displayRows) {
      offset = clampedIndex - displayRows + 1;
    }
    if (clampedIndex < offset) {
      offset = clampedIndex;
    }

    offset = Math.max(0, Math.min(offset, items.length - displayRows));

    return {
      visibleItems: items.slice(offset, offset + displayRows),
      scrollOffset: offset,
      hasAbove: offset > 0,
      hasBelow: offset + displayRows < items.length,
    };
  }, [items, selectedIndex, maxVisible]);

  // Update ref outside useMemo to avoid mutation during render
  prevOffsetRef.current = scrollOffset;

  // Stable renderItem reference for memo comparison
  const stableRenderItem = useCallback(renderItem, [renderItem]);

  if (items.length === 0) {
    return <Text dimColor>{emptyText}</Text>;
  }

  return (
    <Box flexDirection="column">
      {hasAbove && (
        <Text dimColor>  {'\u2191'} {scrollOffset} more above</Text>
      )}
      {visibleItems.map((item, i) => {
        const actualIndex = scrollOffset + i;
        return (
          <MemoRow
            key={actualIndex}
            item={item}
            selected={actualIndex === selectedIndex}
            index={actualIndex}
            renderItem={stableRenderItem}
          />
        );
      })}
      {hasBelow && (
        <Text dimColor>  {'\u2193'} {items.length - scrollOffset - visibleItems.length} more below</Text>
      )}
    </Box>
  );
}
