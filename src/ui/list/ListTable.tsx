// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { Box } from '@mantine/core';
import { TableLoadingOverlay } from '@ui/list/TableLoadingOverlay.tsx';
import { EmptyState } from '@ui/list/EmptyState.tsx';
import { AdaptiveTable } from '@ui/table/AdaptiveTable.tsx';
import type { ListColumn, ListSortState } from '@ui/list/listTypes.ts';

export interface ListTableProps<Row> {
  /** Where the operator's column widths are remembered: `<section>.<table>`, unique in the console. */
  tableId: string;
  rows: Row[];
  /** Stable (a module constant or `useMemo`): rows are memoized by this reference. */
  columns: ListColumn<Row>[];
  rowKey: (row: Row) => string | number;
  isLoading: boolean;
  /** A new page or filter is loading: a light cover over the old rows. */
  isFetching?: boolean;
  /** Empty because of the filters: the empty state offers «Сбросить фильтры» instead of `emptyText`. */
  isFiltered?: boolean;
  onResetFilters?: () => void;
  emptyText?: string;
  /** The card of the row: click opens it, Ctrl/⌘/Shift-click and the middle button open a new tab. */
  rowHref?: (row: Row) => string | null;
  /** A row whose card is a dialog of the screen opens it in place; stable, like the columns. */
  onRowClick?: (row: Row) => void;
  sort?: ListSortState;
  onSort?: (sortKey: string) => void;
}

const TABLE_PROPS = {
  striped: true,
  highlightOnHover: true,
  withTableBorder: true,
  stickyHeader: true,
  verticalSpacing: 'var(--pf-list-row-py)',
  fz: 'xs'
} as const;

/**
 * The table of a list screen: sticky header, sort by a click on a heading, a cover without blinking on polling,
 * the row as a link to its card, the empty states. No checkboxes and no actions: they live in the card (R15).
 * The columns fit the width by priority and resize (`AdaptiveTable`), the table scrolls only down.
 */
export function ListTable<Row>({
  tableId,
  rows,
  columns,
  rowKey,
  isLoading,
  isFetching = false,
  isFiltered = false,
  onResetFilters,
  emptyText,
  rowHref,
  onRowClick,
  sort,
  onSort
}: ListTableProps<Row>) {
  const showEmpty = !isLoading && rows.length === 0;

  return (
    // The cover sits in the outer block that does not scroll: it always hides the visible part instead of
    // scrolling away with the table
    <Box
      pos="relative"
      style={{
        flex: 1,
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* The first load shimmers in the rows (AdaptiveTable); the cover is for the next page or filter over the
          old rows */}
      <TableLoadingOverlay visible={!isLoading && isFetching} />
      {/* The gutter stays: a scrollbar coming and going would hide and show columns in turn */}
      <Box
        style={{
          flex: 1,
          minHeight: 0,
          overflowX: 'hidden',
          overflowY: 'auto',
          scrollbarGutter: 'stable'
        }}
        aria-busy={isLoading || isFetching}
      >
        <AdaptiveTable
          tableId={tableId}
          rows={rows}
          columns={columns}
          rowKey={rowKey}
          sort={sort}
          onSort={onSort}
          rowHref={rowHref}
          onRowClick={onRowClick}
          tableProps={TABLE_PROPS}
          isLoading={isLoading}
        >
          {showEmpty && (
            <EmptyState
              isFiltered={isFiltered}
              onResetFilters={onResetFilters}
              emptyText={emptyText}
            />
          )}
        </AdaptiveTable>
      </Box>
    </Box>
  );
}
