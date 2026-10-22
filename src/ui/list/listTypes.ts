// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { TableColumn, TableSortState } from '@ui/table/tableColumns.ts';

/** A failed request as axios rejects it; `apiErrorText` turns it into the operator's words. */
export type ListError = unknown;

/** One column of a list table: `TableColumn` – widths, priority of hiding, sorting. */
export type ListColumn<Row> = TableColumn<Row>;

export type ListSortState = TableSortState;

/** One page of rows as every list screen sees it, whatever shape the backend gave it. */
export interface ListPageData<Row> {
  items: Row[];
  total: number;
}

/**
 * The state `ListPage` draws, the same for a server list (`useServerList`) and a list filtered in memory
 * (`useClientList`).
 */
export interface ListState<Row> {
  rows: Row[];
  total: number;
  /** The first load: the table is covered densely. */
  isInitialLoading: boolean;
  /** A new page or filter is loading: the old rows stay under a light cover, the pagination is locked. */
  isLoadingNewArgs: boolean;
  /** Any request is in flight, polling and «Обновить» included: only the refresh button spins. */
  isRefreshing: boolean;
  error?: ListError;
  refetch: () => void;
}

/** A filter that came with a link (an address, account numbers) shown as a removable chip above the filters. */
export interface ActiveFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}
