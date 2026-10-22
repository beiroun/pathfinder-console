// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ListColumn } from '@ui/list/listTypes.ts';

export const SORT_DIRECTIONS = ['asc', 'desc'] as const;

export type SortDirection = (typeof SORT_DIRECTIONS)[number];

export interface ColumnSort<Key extends string> {
  key: Key;
  direction: SortDirection;
}

/**
 * The sort after a click on a column heading, three states in a circle: a new column starts descending, a second
 * click turns it ascending, a third drops the sort – the list goes back to its default order (no sort in the URL).
 */
export const nextColumnSort = <Key extends string>(
  current: ColumnSort<Key> | undefined,
  clickedKey: Key
): ColumnSort<Key> | undefined => {
  if (current?.key !== clickedKey) return { key: clickedKey, direction: 'desc' };
  return current.direction === 'desc' ? { key: clickedKey, direction: 'asc' } : undefined;
};

/** The sort of a list kept in the URL as two optional keys; a link with a column but no direction reads descending. */
export interface UrlColumnSort<Key extends string> {
  sort?: Key;
  direction?: SortDirection;
}

export const columnSortOf = <Key extends string>({
  sort,
  direction
}: UrlColumnSort<Key>): ColumnSort<Key> | undefined =>
  sort ? { key: sort, direction: direction ?? 'desc' } : undefined;

/** The URL patch of a click on a heading: both keys set, or both removed when the sort goes back to the default. */
export const columnSortPatch = <Key extends string>(
  current: UrlColumnSort<Key>,
  clickedKey: Key
): UrlColumnSort<Key> => {
  const next = nextColumnSort(columnSortOf(current), clickedKey);
  return { sort: next?.key, direction: next?.direction };
};

export type SortValue = string | number | null | undefined;

const isBlank = (value: SortValue) => value === null || value === undefined || value === '';

const compareSortValues = (left: SortValue, right: SortValue) =>
  typeof left === 'number' && typeof right === 'number'
    ? left - right
    : String(left).localeCompare(String(right), 'ru', {
        numeric: true,
        sensitivity: 'base'
      });

/**
 * A comparator for `useClientList` from the value a row is sorted by. Empty values go last in both directions, as
 * the servers sort (`nulls last`): a column sorted either way starts with the rows that have something to show.
 */
export const rowComparator =
  <Row>(valueOf: (row: Row) => SortValue, direction: SortDirection) =>
  (left: Row, right: Row) => {
    const leftValue = valueOf(left);
    const rightValue = valueOf(right);
    const leftBlank = isBlank(leftValue);
    const rightBlank = isBlank(rightValue);
    if (leftBlank || rightBlank) return leftBlank === rightBlank ? 0 : leftBlank ? 1 : -1;
    const order = compareSortValues(leftValue, rightValue);
    return direction === 'asc' ? order : -order;
  };

/** The comparator of the URL sort of a client list; none – the list keeps the order it came in. */
export const urlSortComparator = <Row, Key extends string>(
  sort: UrlColumnSort<Key>,
  valueOf: Record<Key, (row: Row) => SortValue>
) => {
  const current = columnSortOf(sort);
  return current ? rowComparator(valueOf[current.key], current.direction) : undefined;
};

/**
 * The headings a list can sort by: a column becomes a sort toggle when its key is in `sortable` (the server's map of
 * a list sorted by the server, the value map of a list sorted in memory). Call it where the columns are made stable.
 */
export const withColumnSort = <Row>(
  columns: ListColumn<Row>[],
  sortable: Readonly<Record<string, unknown>>
): ListColumn<Row>[] =>
  columns.map(column =>
    Object.prototype.hasOwnProperty.call(sortable, column.key)
      ? { ...column, sortKey: column.key }
      : column
  );

/**
 * How a service sorts a column: its key, or a moment field behind a duration the cell shows («Лежит 3 ч» is sorted by
 * `offline_since`), where the direction flips so that «descending» still means «the longest first».
 */
export type ServerSortField = string | { field: string; reversed: true };

/** A duration column sorted by the moment it counts from (see `ServerSortField`). */
export const durationOf = (field: string) => ({ field, reversed: true }) as const;

const OPPOSITE_DIRECTION: Record<SortDirection, SortDirection> = {
  asc: 'desc',
  desc: 'asc'
};

/** The URL sort of a server list in the service's terms; none – the service keeps its default order. */
export const serverColumnSort = <Key extends string>(
  sort: UrlColumnSort<Key>,
  serverFieldOf: Readonly<Record<Key, ServerSortField>>
): { field: string; direction: SortDirection } | undefined => {
  const current = columnSortOf(sort);
  if (!current) return undefined;
  const target = serverFieldOf[current.key];
  return typeof target === 'string'
    ? { field: target, direction: current.direction }
    : { field: target.field, direction: OPPOSITE_DIRECTION[current.direction] };
};

/** `sort` and `direction` as two query parameters, the way a list server takes them. */
export const serverSortParams = <Key extends string>(
  sort: UrlColumnSort<Key>,
  serverFieldOf: Readonly<Record<Key, ServerSortField>>
) => {
  const target = serverColumnSort(sort, serverFieldOf);
  return { sort: target?.field, direction: target?.direction };
};
