// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, {
  memo,
  useCallback,
  useMemo,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode
} from 'react';
import { useNavigate } from 'react-router';
import { Box, Table, UnstyledButton, type TableProps, type TableTrProps } from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconArrowsSort } from '@tabler/icons-react';
import { ColumnResizeHandle } from '@ui/table/ColumnResizeHandle.tsx';
import { ColumnsFitMenu } from '@ui/table/ColumnsFitMenu.tsx';
import { fitColumns, type FittedColumn } from '@ui/table/fitColumns.ts';
import { useElementWidth } from '@ui/table/useElementWidth.ts';
import { useStoredColumnWidths } from '@ui/table/useStoredColumnWidths.ts';
import { useFlashOnChange } from '@ui/motion/useFlashOnChange.ts';
import type { ColumnWidths, TableColumn, TableSortState } from '@ui/table/tableColumns.ts';
import './adaptiveTable.css';

// The outer border of `withTableBorder` is not part of the columns
const TABLE_BORDER_ALLOWANCE = 2;

export interface AdaptiveTableProps<Row> {
  /**
   * Where the operator's widths are remembered: `<section>.<table>` (`users.list`, `event-card.selected-addresses`),
   * unique in the product.
   */
  tableId: string;
  rows: Row[];
  /** Stable (a module constant or `useMemo`): rows are memoized by this reference. */
  columns: TableColumn<Row>[];
  rowKey: (row: Row, index: number) => string | number;
  sort?: TableSortState;
  onSort?: (sortKey: string) => void;
  /** The card of the row: click opens it, Ctrl/⌘/Shift-click and the middle button open a new tab. */
  rowHref?: (row: Row) => string | null;
  /** A row that acts in place instead of opening a card (picks it on a map); `rowHref` wins when both are given. */
  onRowClick?: (row: Row) => void;
  /** More props of a row (a dimmed idle row); stable, like the columns. */
  rowProps?: (row: Row) => TableTrProps;
  /** Mantine's look: striped, borders, spacing, font size, sticky header. */
  tableProps?: Omit<TableProps, 'children' | 'layout'>;
  /** Below the table inside the measured box (the empty state of a list). */
  children?: ReactNode;
  /** The first load of an empty table: shimmering rows stand in for the data. */
  isLoading?: boolean;
}

const SortIcon: React.FC<{ active: boolean; direction?: 'asc' | 'desc' }> = ({
  active,
  direction
}) => {
  if (!active) return <IconArrowsSort size={14} opacity={0.4} />;
  return direction === 'asc' ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />;
};

// What the next click does: the heading cycles descending → ascending → the list's default order
const nextSortHint = (active: boolean, direction?: 'asc' | 'desc') => {
  if (!active) return 'Сортировать по убыванию';
  return direction === 'asc' ? 'Вернуть порядок по умолчанию' : 'Сортировать по возрастанию';
};

// The heading button keeps the look of a plain heading (the theme's size, weight, case and colour)
const SORT_BUTTON_STYLE = {
  font: 'inherit',
  letterSpacing: 'inherit',
  textTransform: 'inherit',
  color: 'inherit',
  maxWidth: '100%'
} as const;

// A heading without text (a checkbox, a column of buttons) gives the edge no name
const labelOf = <Row,>(column: TableColumn<Row>) =>
  typeof column.title === 'string' ? column.title.trim() : '';

// Links, buttons, fields and menus inside a row handle their own clicks
const isInteractive = (event: MouseEvent) =>
  (event.target as HTMLElement).closest(
    'a, button, input, label, [role="menu"], [data-row-click="ignore"]'
  ) !== null;

interface TableRowProps<Row> {
  row: Row;
  columns: TableColumn<Row>[];
  href: string | null;
  onNavigate: (href: string, newTab: boolean) => void;
  onRowClick?: (row: Row) => void;
  rowProps?: (row: Row) => TableTrProps;
}

function TableRowBase<Row>({
  row,
  columns,
  href,
  onNavigate,
  onRowClick,
  rowProps
}: TableRowProps<Row>) {
  // A <tr> cannot be wrapped in <a>: the middle button and Ctrl/⌘/Shift-click repeat a link by hand
  const handleClick = (event: MouseEvent) => {
    if (isInteractive(event)) return;
    // Selecting text with the mouse is not a click on the row
    if (window.getSelection()?.toString()) return;
    if (href) onNavigate(href, event.ctrlKey || event.metaKey || event.shiftKey);
    else onRowClick?.(row);
  };

  const handleAuxClick = (event: MouseEvent) => {
    if (!href || event.button !== 1 || isInteractive(event)) return;
    onNavigate(href, true);
  };

  // Otherwise the middle button starts autoscroll instead of a click
  const handleMouseDown = (event: MouseEvent) => {
    if (href && event.button === 1 && !isInteractive(event)) event.preventDefault();
  };

  const extraProps = rowProps?.(row);
  // A row whose data changed in place (a refetch after an action, polling) flashes once; a new page mounts new rows
  const rowRef = useRef<HTMLTableRowElement>(null);
  useFlashOnChange(rowRef, row);

  return (
    <Table.Tr
      {...extraProps}
      ref={rowRef}
      onClick={href || onRowClick ? handleClick : undefined}
      onAuxClick={href ? handleAuxClick : undefined}
      onMouseDown={href ? handleMouseDown : undefined}
      style={{
        cursor: href || onRowClick ? 'pointer' : undefined,
        ...extraProps?.style
      }}
    >
      {columns.map(column => (
        <Table.Td key={column.key} ta={column.align}>
          {column.render(row)}
        </Table.Td>
      ))}
    </Table.Tr>
  );
}

// A new page or filter redraws the table with the old rows first, and the request leaves only after that redraw;
// memoized rows (with their menus) keep the redraw cheap, so the request and the cover start right after the click
const TableRow = memo(TableRowBase) as typeof TableRowBase;

const SKELETON_ROWS = 8;
// The bars of a loading row are of different lengths, so the column reads as text, not as a grid
const SKELETON_WIDTHS = ['72%', '54%', '86%', '62%', '44%', '78%'];

/** Loading rows: a shimmering bar per cell; the shimmer runs down the table row after row. */
const SkeletonRows: React.FC<{ columnCount: number }> = ({ columnCount }) =>
  Array.from({ length: SKELETON_ROWS }, (_, row) => (
    <Table.Tr key={row} aria-hidden="true">
      {Array.from({ length: columnCount }, (_, column) => (
        <Table.Td key={column}>
          <span
            className="pf-skeleton"
            style={
              {
                width: SKELETON_WIDTHS[(row + column * 2) % SKELETON_WIDTHS.length],
                '--pf-skeleton-delay': `${row * 70}ms`
              } as CSSProperties
            }
          />
        </Table.Td>
      ))}
    </Table.Tr>
  ));

interface HeaderCellProps<Row> {
  fitted: FittedColumn<Row>;
  /** The column right of this heading's edge; none – the last heading, its edge is the table's. */
  next?: FittedColumn<Row>;
  sort?: TableSortState;
  onSort?: (sortKey: string) => void;
  onPreviewWidths: (widths: ColumnWidths) => void;
  onCommitWidths: () => void;
  onResetWidth: (key: string) => void;
  /** The last heading carries the columns menu in its corner. */
  columnsMenu?: ReactNode;
}

function HeaderCell<Row>({
  fitted,
  next,
  sort,
  onSort,
  onPreviewWidths,
  onCommitWidths,
  onResetWidth,
  columnsMenu
}: HeaderCellProps<Row>) {
  const { column, width } = fitted;
  const sortable = Boolean(column.sortKey && onSort);
  const active = sortable && sort?.key === column.sortKey;
  const heading = (
    <span className="pf-table__heading">
      <span className="pf-table__heading-text">{column.title}</span>
      {sortable && <SortIcon active={active} direction={sort?.direction} />}
    </span>
  );

  return (
    <Table.Th
      ta={column.align}
      data-with-columns-menu={columnsMenu ? true : undefined}
      aria-sort={active ? (sort?.direction === 'asc' ? 'ascending' : 'descending') : undefined}
    >
      {sortable ? (
        <UnstyledButton
          onClick={() => onSort?.(column.sortKey!)}
          style={SORT_BUTTON_STYLE}
          title={nextSortHint(active, sort?.direction)}
        >
          {heading}
        </UnstyledButton>
      ) : (
        heading
      )}
      {columnsMenu}
      {next && (
        <ColumnResizeHandle
          columnKey={column.key}
          columnLabel={labelOf(column)}
          width={width}
          nextColumnKey={next.column.key}
          nextWidth={next.width}
          onPreview={onPreviewWidths}
          onCommit={onCommitWidths}
          onReset={onResetWidth}
        />
      )}
    </Table.Th>
  );
}

/**
 * Every table of the console: never scrolls sideways – columns that do not fit leave by
 * priority (`TableColumn.priority`), the free width goes to the growing columns; the edge between two headings
 * moves the width from one column to the other, the widths are remembered per browser under `tableId`. Rows are links when `rowHref` is given.
 * The table fills its parent's width; a scrolling parent gets `scrollbar-gutter: stable`, or the scrollbar coming
 * and going would hide and show columns in turn.
 */
export function AdaptiveTable<Row>({
  tableId,
  rows,
  columns,
  rowKey,
  sort,
  onSort,
  rowHref,
  onRowClick,
  rowProps,
  tableProps,
  children,
  isLoading = false
}: AdaptiveTableProps<Row>) {
  const navigate = useNavigate();
  const [boxRef, boxWidth] = useElementWidth<HTMLDivElement>();
  const { widths, previewWidths, commitWidths, resetWidth, resetAllWidths } =
    useStoredColumnWidths(tableId);

  const fit = useMemo(
    () => fitColumns(columns, widths, Math.max(0, boxWidth - TABLE_BORDER_ALLOWANCE)),
    [columns, widths, boxWidth]
  );

  // Rows redraw only when the set of columns changes, not on every width
  const hiddenKeys = fit.hidden.map(column => column.key).join('\n');
  const visibleColumns = useMemo(() => {
    const hidden = new Set(hiddenKeys.split('\n'));
    return columns.filter(column => !hidden.has(column.key));
  }, [columns, hiddenKeys]);

  const onNavigate = useCallback(
    (href: string, newTab: boolean) => {
      if (newTab) window.open(href, '_blank', 'noopener');
      else navigate(href);
    },
    [navigate]
  );

  const hasOperatorWidths = columns.some(column => widths[column.key] !== undefined);
  const columnsMenu =
    fit.hidden.length > 0 || hasOperatorWidths ? (
      <ColumnsFitMenu
        hiddenTitles={fit.hidden.map(column => ({
          key: column.key,
          title: column.title
        }))}
        hasOperatorWidths={hasOperatorWidths}
        onResetWidths={resetAllWidths}
      />
    ) : undefined;
  const lastIndex = fit.visible.length - 1;

  return (
    <Box ref={boxRef} className="pf-table">
      <Table {...tableProps} layout="fixed">
        <colgroup>
          {fit.visible.map(({ column, width }) => (
            <col key={column.key} style={{ width }} />
          ))}
        </colgroup>
        <Table.Thead>
          <Table.Tr>
            {fit.visible.map((fitted, index) => (
              <HeaderCell
                key={fitted.column.key}
                fitted={fitted}
                next={fit.visible[index + 1]}
                sort={sort}
                onSort={onSort}
                onPreviewWidths={previewWidths}
                onCommitWidths={commitWidths}
                onResetWidth={resetWidth}
                columnsMenu={index === lastIndex ? columnsMenu : undefined}
              />
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {isLoading && rows.length === 0 && <SkeletonRows columnCount={fit.visible.length} />}
          {rows.map((row, index) => (
            <TableRow
              key={rowKey(row, index)}
              row={row}
              columns={visibleColumns}
              href={rowHref?.(row) ?? null}
              onNavigate={onNavigate}
              onRowClick={onRowClick}
              rowProps={rowProps}
            />
          ))}
        </Table.Tbody>
      </Table>
      {children}
    </Box>
  );
}
