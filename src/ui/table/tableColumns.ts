// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ReactNode } from 'react';

/**
 * The order columns leave a table that does not fit its box (a table never scrolls sideways):
 * 1 – what the row is (the name, the number people call it by), never hidden; 2 – what rows are told apart by
 * (status, role, type); 3 – secondary attributes; 4 – technical fields and secondary dates; 5 – goes first.
 * Equal priorities leave from the right.
 */
export type ColumnPriority = 1 | 2 | 3 | 4 | 5;

export const DEFAULT_COLUMN_PRIORITY: ColumnPriority = 3;

/** The narrowest a column gets, by the operator's drag or by the layout. */
export const MIN_COLUMN_WIDTH = 56;

/** Where a growing column without `minWidth` starts. */
export const GROWING_COLUMN_START_WIDTH = 160;

/** One column of a table; the array must be stable (a module constant or `useMemo`): rows are memoized by it. */
export interface TableColumn<Row> {
  key: string;
  title: ReactNode;
  render: (row: Row) => ReactNode;
  /** Makes the heading a sort toggle when the table gets `onSort`. */
  sortKey?: string;
  /** The default width, px. None – a growing column: it starts at `minWidth` and takes the free width. */
  width?: number;
  /** A growing column never gets narrower by itself; the operator may still drag it down to `MIN_COLUMN_WIDTH`. */
  minWidth?: number;
  /** `DEFAULT_COLUMN_PRIORITY` when not given. */
  priority?: ColumnPriority;
  align?: 'left' | 'center' | 'right';
}

/** The operator's widths by column key, px; a column without one has its default width. */
export type ColumnWidths = Readonly<Record<string, number>>;

export interface TableSortState {
  key?: string;
  direction?: 'asc' | 'desc';
}
