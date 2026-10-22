// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useMemo } from 'react';
import type { ListError, ListState } from '@ui/list/listTypes.ts';
import {
  isExactSmartMatch,
  matchesSmartQuery,
  parseSmartQuery
} from '../utils/search/smartQuery.ts';

/** A full directory the backend returns at once (the QR codes). */
export interface ClientListSource<Row> {
  rows?: Row[];
  isLoading: boolean;
  isFetching: boolean;
  error?: ListError;
  refetch: () => unknown;
}

export interface ClientListOptions<Row> {
  /** The raw search text from the URL; the smart-search rule is applied here instead of on a server. */
  query?: string;
  /** The searchable fields of a row glued by `smartSearchDocument(...)`; keep the function stable. */
  searchDocumentOf: (row: Row) => string;
  /** Keys a one-word query must equal to put the row first (a slug, an id, a login). */
  exactKeysOf?: (row: Row) => (string | number | null | undefined)[];
  /** The other filters of the screen. */
  matches?: (row: Row) => boolean;
  compare?: (a: Row, b: Row) => number;
  /** Zero-based page and its size; without them the whole filtered list is one page. */
  page?: number;
  size?: number;
}

/**
 * Search, filters, sorting and pages over a list held in memory, returning the same state as a server list, so
 * `ListPage` cannot tell them apart. Only for endpoints that return everything: filtering one server page on the
 * client would silently hide rows.
 */
export function useClientList<Row>(
  source: ClientListSource<Row>,
  { query, searchDocumentOf, exactKeysOf, matches, compare, page = 0, size }: ClientListOptions<Row>
): ListState<Row> {
  const { rows, isLoading, isFetching, error, refetch } = source;

  const documents = useMemo(
    () => (rows ?? []).map(row => searchDocumentOf(row)),
    [rows, searchDocumentOf]
  );

  const filtered = useMemo(() => {
    const all = rows ?? [];
    const smartQuery = parseSmartQuery(query);
    const found = all.filter(
      (row, index) =>
        (!smartQuery || matchesSmartQuery(smartQuery, documents[index])) &&
        (!matches || matches(row))
    );
    const sorted = compare ? [...found].sort(compare) : found;
    if (!smartQuery?.exactCandidate || !exactKeysOf) return sorted;

    // Exact hits first, the order inside both groups is kept
    const exact = sorted.filter(row => isExactSmartMatch(smartQuery, exactKeysOf(row)));
    if (!exact.length) return sorted;
    const exactSet = new Set(exact);
    return [...exact, ...sorted.filter(row => !exactSet.has(row))];
  }, [rows, documents, query, matches, compare, exactKeysOf]);

  const pageRows = useMemo(
    () => (size ? filtered.slice(page * size, (page + 1) * size) : filtered),
    [filtered, page, size]
  );

  return {
    rows: pageRows,
    total: filtered.length,
    isInitialLoading: isLoading,
    // Filtering is local and instant: nothing to cover while a filter changes
    isLoadingNewArgs: false,
    isRefreshing: isFetching,
    error,
    refetch: () => {
      refetch();
    }
  };
}
