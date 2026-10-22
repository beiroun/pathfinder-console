// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { type ReactNode } from 'react';
import { Flex, Group } from '@mantine/core';
import { FiltersBar } from '@ui/list/FiltersBar.tsx';
import { RefreshButton } from '@ui/list/RefreshButton.tsx';
import { ErrorAlert } from '@ui/list/ErrorAlert.tsx';
import { ListTable } from '@ui/list/ListTable.tsx';
import { TablePagination } from '@ui/list/TablePagination.tsx';
import type { ActiveFilterChip, ListColumn, ListSortState, ListState } from '@ui/list/listTypes.ts';

export interface ListPagination {
  page: number;
  size: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  /** «Найдено» by default. */
  totalLabel?: string;
  /** Replaces the whole counter line. */
  summary?: ReactNode;
}

export interface ListPageProps<Row> {
  /** The page heading (`DescriptionPage`); none – the list lives inside another page (a tab, a journal). */
  header?: ReactNode;
  /** Inside a tab: take the parent's height instead of the viewport's. */
  fillParent?: boolean;
  /** The fields of the filters bar. */
  filters: ReactNode;
  /** Filters that came with a link and have no field: removable chips. */
  filterChips?: ActiveFilterChip[];
  canResetFilters: boolean;
  onResetFilters: () => void;
  /** «Обновить» at the right of the bar's heading; on by default. */
  withRefresh?: boolean;
  /** More buttons left of «Обновить» (CSV, «Добавить»). */
  toolbarRight?: ReactNode;
  list: ListState<Row>;
  /** Where the operator's column widths are remembered: `<section>.<table>`, unique in the console. */
  tableId: string;
  /** Stable (a module constant or `useMemo`). */
  columns: ListColumn<Row>[];
  rowKey: (row: Row) => string | number;
  rowHref?: (row: Row) => string | null;
  /** A row whose card is a dialog of the screen opens it in place; stable, like the columns. */
  onRowClick?: (row: Row) => void;
  sort?: ListSortState;
  onSort?: (sortKey: string) => void;
  /** Between the filters and the table: a notice that belongs to the list (a warning about what it does). */
  notice?: ReactNode;
  /** Empty without filters («Учётных записей нет»); with filters the table offers to reset them. */
  emptyText: string;
  /**
   * Another view of the same rows drawn in place of the table (the wall of camera previews). It owns its loading
   * cover and its empty state; the filters, the error and the pagination stay the list's.
   */
  alternateView?: ReactNode;
  /** None – the whole list on one page (short directories). */
  pagination?: ListPagination;
  /** Modals and lightboxes of the screen. */
  children?: ReactNode;
}

// The viewport less the shell's bar and gutters (a design token): the table scrolls inside, the pagination stays at
// the bottom
const VIEWPORT_LIST_HEIGHT = 'var(--pf-page-h)';

/**
 * A list screen in the order every list of the admin follows: heading, filters bar with «Сбросить» and «Обновить»,
 * the error over the table (old rows stay visible), the table, the pagination. The state comes from
 * `useServerList` or `useClientList`, the filters from `useUrlFilters`.
 */
export function ListPage<Row>({
  header,
  fillParent = false,
  filters,
  filterChips,
  canResetFilters,
  onResetFilters,
  withRefresh = true,
  toolbarRight,
  list,
  tableId,
  columns,
  rowKey,
  rowHref,
  onRowClick,
  sort,
  onSort,
  notice,
  emptyText,
  alternateView,
  pagination,
  children
}: ListPageProps<Row>) {
  const rightSection =
    withRefresh || toolbarRight ? (
      <Group gap="xs" wrap="wrap">
        {toolbarRight}
        {withRefresh && <RefreshButton isRefreshing={list.isRefreshing} onRefresh={list.refetch} />}
      </Group>
    ) : undefined;

  return (
    <Flex
      direction="column"
      gap="sm"
      style={fillParent ? { flex: 1, minHeight: 0 } : { height: VIEWPORT_LIST_HEIGHT }}
    >
      {header}

      <FiltersBar
        canReset={canResetFilters}
        onReset={onResetFilters}
        chips={filterChips}
        rightSection={rightSection}
      >
        {filters}
      </FiltersBar>

      {notice}

      {list.error != null && (
        <ErrorAlert error={list.error} onRetry={list.refetch} isRetrying={list.isRefreshing} />
      )}

      {alternateView ?? (
        <ListTable
          tableId={tableId}
          rows={list.rows}
          columns={columns}
          rowKey={rowKey}
          isLoading={list.isInitialLoading}
          isFetching={list.isLoadingNewArgs}
          isFiltered={canResetFilters}
          onResetFilters={onResetFilters}
          emptyText={emptyText}
          rowHref={rowHref}
          onRowClick={onRowClick}
          sort={sort}
          onSort={onSort}
        />
      )}

      {pagination && (
        <TablePagination
          total={list.total}
          page={pagination.page}
          size={pagination.size}
          onPageChange={pagination.onPageChange}
          onSizeChange={pagination.onSizeChange}
          totalLabel={pagination.totalLabel}
          summary={pagination.summary}
          disabled={list.isLoadingNewArgs}
        />
      )}

      {children}
    </Flex>
  );
}
