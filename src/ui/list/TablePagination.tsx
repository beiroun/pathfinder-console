// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, { type ReactNode } from 'react';
import { Group, Pagination, Select, Text } from '@mantine/core';
import { LIST_PAGE_SIZES } from '@ui/list/listConstants.ts';
import { useIsPhone } from '@hooks/useIsPhone.ts';
import { formatNumber } from '../../utils/formatNumber.ts';

export interface TablePaginationProps {
  total: number;
  /** Zero-based, as the server counts pages. */
  page: number;
  size: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  /** «Найдено» by default. */
  totalLabel?: string;
  /** Replaces the whole counter line. */
  summary?: ReactNode;
  /** Locked while the next page loads, so clicks do not queue requests. */
  disabled?: boolean;
}

const PAGE_SIZE_OPTIONS = LIST_PAGE_SIZES.map(String);

/** Pagination under a table: «Найдено N» on the left, pages and the page size (25/50/100/200) on the right. */
export const TablePagination: React.FC<TablePaginationProps> = ({
  total,
  page,
  size,
  onPageChange,
  onSizeChange,
  totalLabel = 'Найдено',
  summary,
  disabled = false
}) => {
  const pages = Math.max(1, Math.ceil(total / size));
  // A phone fits seven 32 px controls (‹ 1 … 5 … 40 ›), not eleven of 26 px with the edges and the siblings
  const isPhone = useIsPhone();

  return (
    <Group justify="space-between" wrap="wrap" gap="sm">
      {summary ?? (
        <Text size="sm" c="dimmed">
          {totalLabel}: <b>{formatNumber(total)}</b>
        </Text>
      )}
      <Group gap="sm" wrap="wrap">
        <Pagination
          size={isPhone ? 'md' : 'sm'}
          total={pages}
          // Mantine counts pages from one
          value={Math.min(page + 1, pages)}
          onChange={value => onPageChange(value - 1)}
          withEdges={!isPhone}
          siblings={isPhone ? 0 : 1}
          disabled={disabled}
        />
        <Select
          size="xs"
          w={90}
          disabled={disabled}
          data={PAGE_SIZE_OPTIONS}
          value={String(size)}
          onChange={value => value && onSizeChange(Number(value))}
          allowDeselect={false}
          aria-label="Строк на странице"
        />
      </Group>
    </Group>
  );
};
