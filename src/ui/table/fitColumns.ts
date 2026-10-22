// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import {
  DEFAULT_COLUMN_PRIORITY,
  GROWING_COLUMN_START_WIDTH,
  MIN_COLUMN_WIDTH,
  type ColumnWidths,
  type TableColumn
} from '@ui/table/tableColumns.ts';

export interface FittedColumn<Row> {
  column: TableColumn<Row>;
  width: number;
}

export interface ColumnsFit<Row> {
  visible: FittedColumn<Row>[];
  /** In the order of the table, for the «не поместились» hint. */
  hidden: TableColumn<Row>[];
}

const isGrowing = <Row>(column: TableColumn<Row>) => column.width === undefined;

/** The width a column asks for before the free width is shared: the operator's, else the default. */
export const requestedWidthOf = <Row>(column: TableColumn<Row>, widths: ColumnWidths) =>
  Math.max(
    MIN_COLUMN_WIDTH,
    widths[column.key] ?? column.width ?? column.minWidth ?? GROWING_COLUMN_START_WIDTH
  );

// The free width goes to the growing columns the operator has not resized; failing them, to every column not
// resized; failing that, to the last one – the table always fills its box
const receiversOfFreeWidth = <Row>(visible: TableColumn<Row>[], widths: ColumnWidths) => {
  const notResized = visible.filter(column => widths[column.key] === undefined);
  const growing = notResized.filter(isGrowing);
  if (growing.length > 0) return growing;
  if (notResized.length > 0) return notResized;
  return visible.slice(-1);
};

const sumOf = (values: number[]) => values.reduce((total, value) => total + value, 0);

/**
 * Lays the columns out in `boxWidth`: hides columns by priority (the biggest number first, equal ones from the
 * right) until the rest fit, then shares the free width among the growing columns. Strict order: a less important
 * column never stays while a more important one is hidden. Columns of priority 1 are never hidden; when even they
 * do not fit they shrink proportionally (the cells wrap) – the table never scrolls sideways.
 */
export function fitColumns<Row>(
  columns: TableColumn<Row>[],
  widths: ColumnWidths,
  boxWidth: number
): ColumnsFit<Row> {
  const requested = new Map(columns.map(column => [column.key, requestedWidthOf(column, widths)]));
  const widthOf = (column: TableColumn<Row>) => requested.get(column.key)!;

  // Not measured yet: everything as requested, the layout comes before the first paint
  if (boxWidth <= 0) {
    return {
      visible: columns.map(column => ({ column, width: widthOf(column) })),
      hidden: []
    };
  }

  const hidingOrder = columns
    .map((column, index) => ({
      column,
      index,
      priority: column.priority ?? DEFAULT_COLUMN_PRIORITY
    }))
    .filter(entry => entry.priority > 1)
    .sort((a, b) => b.priority - a.priority || b.index - a.index);

  const hiddenKeys = new Set<string>();
  let total = sumOf(columns.map(widthOf));
  for (const { column } of hidingOrder) {
    if (total <= boxWidth) break;
    hiddenKeys.add(column.key);
    total -= widthOf(column);
  }

  const visible = columns.filter(column => !hiddenKeys.has(column.key));
  const hidden = columns.filter(column => hiddenKeys.has(column.key));

  if (total > boxWidth) {
    const scale = boxWidth / total;
    return {
      visible: visible.map(column => ({
        column,
        width: Math.floor(widthOf(column) * scale)
      })),
      hidden
    };
  }

  const receivers = receiversOfFreeWidth(visible, widths);
  const receiversWidth = sumOf(receivers.map(widthOf));
  const freeWidth = boxWidth - total;
  const extraByKey = new Map<string, number>();
  let shared = 0;
  receivers.forEach((column, index) => {
    const isLast = index === receivers.length - 1;
    const extra = isLast
      ? freeWidth - shared
      : Math.floor((freeWidth * widthOf(column)) / receiversWidth);
    extraByKey.set(column.key, extra);
    shared += extra;
  });

  return {
    visible: visible.map(column => ({
      column,
      width: widthOf(column) + (extraByKey.get(column.key) ?? 0)
    })),
    hidden
  };
}
