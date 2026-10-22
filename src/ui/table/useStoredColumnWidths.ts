// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useCallback, useState } from 'react';
import { MIN_COLUMN_WIDTH, type ColumnWidths } from '@ui/table/tableColumns.ts';

const STORAGE_PREFIX = 'pathfinder-console:column-widths:';

const EMPTY_WIDTHS: ColumnWidths = {};

// Storage can be missing or throw (a private window, blocked site data): the widths then live until the reload
const readStoredWidths = (tableId: string): ColumnWidths => {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + tableId);
    if (!raw) return EMPTY_WIDTHS;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return EMPTY_WIDTHS;
    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, number] =>
          typeof entry[1] === 'number' && Number.isFinite(entry[1]) && entry[1] >= MIN_COLUMN_WIDTH
      )
    );
  } catch {
    return EMPTY_WIDTHS;
  }
};

const writeStoredWidths = (tableId: string, widths: ColumnWidths) => {
  try {
    if (Object.keys(widths).length === 0) window.localStorage.removeItem(STORAGE_PREFIX + tableId);
    else window.localStorage.setItem(STORAGE_PREFIX + tableId, JSON.stringify(widths));
  } catch {
    // The widths stay for this visit only
  }
};

export interface StoredColumnWidths {
  widths: ColumnWidths;
  /** While dragging: the screen follows, the storage does not; one edge sets the widths of both its columns. */
  previewWidths: (widths: ColumnWidths) => void;
  /** The drag is over: the widths go to the storage. */
  commitWidths: () => void;
  resetWidth: (key: string) => void;
  resetAllWidths: () => void;
}

/**
 * The operator's column widths of one table, remembered in this browser (a per-viewer convenience)
 * under `tableId`; every table of a product has its own id.
 */
export function useStoredColumnWidths(tableId: string): StoredColumnWidths {
  const [stored, setStored] = useState(() => ({
    tableId,
    widths: readStoredWidths(tableId)
  }));

  // The same component can switch tables (the events of another kind): take the other table's widths
  if (stored.tableId !== tableId) {
    setStored({ tableId, widths: readStoredWidths(tableId) });
  }

  const previewWidths = useCallback((changed: ColumnWidths) => {
    setStored(current =>
      Object.entries(changed).every(([key, width]) => current.widths[key] === width)
        ? current
        : { ...current, widths: { ...current.widths, ...changed } }
    );
  }, []);

  // Written from the latest state: the last pointer move may not have rendered yet
  const commitWidths = useCallback(() => {
    setStored(current => {
      writeStoredWidths(current.tableId, current.widths);
      return current;
    });
  }, []);

  const resetWidth = useCallback((key: string) => {
    setStored(current => {
      if (current.widths[key] === undefined) return current;
      const widths = { ...current.widths };
      delete widths[key];
      writeStoredWidths(current.tableId, widths);
      return { ...current, widths };
    });
  }, []);

  const resetAllWidths = useCallback(() => {
    setStored(current => {
      writeStoredWidths(current.tableId, EMPTY_WIDTHS);
      return { ...current, widths: EMPTY_WIDTHS };
    });
  }, []);

  return {
    widths: stored.widths,
    previewWidths,
    commitWidths,
    resetWidth,
    resetAllWidths
  };
}
