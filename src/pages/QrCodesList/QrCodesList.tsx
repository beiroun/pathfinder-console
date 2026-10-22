// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, { useMemo } from 'react';
import { Button, Text } from '@mantine/core';
import { IconPlus, IconQrcode } from '@tabler/icons-react';
import { Link } from 'react-router';
import { ListPage } from '@ui/list/ListPage.tsx';
import { SearchInput } from '@ui/list/SearchInput.tsx';
import type { ListColumn } from '@ui/list/listTypes.ts';
import {
  SORT_DIRECTIONS,
  columnSortOf,
  columnSortPatch,
  urlSortComparator,
  type SortValue
} from '@ui/list/columnSort.ts';
import { LIST_DEFAULT_PAGE_SIZE, LIST_PAGE_SIZES } from '@ui/list/listConstants.ts';
import { DescriptionPage } from '@ui/DescriptionPage/DescriptionPage.tsx';
import { CopyableId } from '@ui/CopyableId/CopyableId.tsx';
import { urlParam, useUrlFilters } from '@hooks/useUrlFilters.ts';
import { useClientList } from '@hooks/useClientList.ts';
import { QR_CREATE_PATH, qrCardPath } from '@routes/paths.ts';
import { useQrCodesQuery } from '../../api/queries.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import type { QrView } from '../../types';
import { formatDateTime, serverMoment } from '../../utils/localTime.ts';
import { formatNumber } from '../../utils/formatNumber.ts';
import { smartSearchDocument } from '../../utils/search/smartQuery.ts';

const momentOf = (iso: string) => serverMoment(iso)?.getTime() ?? null;

// Every column sorts by what its cell shows first
const SORT_VALUE_OF = {
  name: (qr: QrView) => qr.name,
  slug: (qr: QrView) => qr.slug,
  redirect_url: (qr: QrView) => qr.redirect_url,
  scan_count_total: (qr: QrView) => qr.scan_count_total,
  created_at: (qr: QrView) => momentOf(qr.created_at),
  updated_at: (qr: QrView) => momentOf(qr.updated_at)
} satisfies Record<string, (qr: QrView) => SortValue>;

type SortKey = keyof typeof SORT_VALUE_OF;

const SORT_KEYS = Object.keys(SORT_VALUE_OF) as SortKey[];

const FILTERS = {
  query: urlParam.string(),
  sort: urlParam.enumOf(SORT_KEYS),
  direction: urlParam.enumOf(SORT_DIRECTIONS),
  page: urlParam.page(),
  size: urlParam.pageSize(LIST_DEFAULT_PAGE_SIZE, LIST_PAGE_SIZES)
};

// Page size and sorting survive «Сбросить» and do not light it up
const PERSISTENT_KEYS = ['size', 'sort', 'direction'] as const;

// The search finds a code by what an operator remembers of it: its name, its slug, any of its links
const searchDocumentOf = (qr: QrView) =>
  smartSearchDocument(
    qr.name,
    qr.slug,
    qr.redirect_url,
    qr.target_ios_url,
    qr.target_huawei_url,
    qr.target_android_url,
    qr.target_desktop_url
  );

const exactKeysOf = (qr: QrView) => [qr.slug];

const COLUMNS: ListColumn<QrView>[] = [
  {
    key: 'name',
    sortKey: 'name',
    title: 'Название',
    minWidth: 220,
    priority: 1,
    render: qr => (
      <Text size="sm" fw={500}>
        {qr.name}
      </Text>
    )
  },
  {
    key: 'slug',
    sortKey: 'slug',
    title: 'Слаг',
    width: 180,
    priority: 2,
    render: qr => (
      <Text size="xs" ff="monospace">
        {qr.slug}
      </Text>
    )
  },
  {
    key: 'redirect_url',
    sortKey: 'redirect_url',
    title: 'Ссылка в QR',
    minWidth: 240,
    priority: 3,
    // Copying is not an action of the row: the icon stays in the table
    render: qr => <CopyableId value={qr.redirect_url} />
  },
  {
    key: 'scan_count_total',
    sortKey: 'scan_count_total',
    title: 'Сканы',
    width: 110,
    priority: 2,
    align: 'right',
    render: qr => (
      <Text size="sm" ff="monospace">
        {formatNumber(qr.scan_count_total)}
      </Text>
    )
  },
  {
    key: 'updated_at',
    sortKey: 'updated_at',
    title: 'Изменён',
    width: 170,
    priority: 4,
    render: qr => <Text size="sm">{formatDateTime(qr.updated_at)}</Text>
  },
  {
    key: 'created_at',
    sortKey: 'created_at',
    title: 'Создан',
    width: 170,
    priority: 5,
    render: qr => <Text size="sm">{formatDateTime(qr.created_at)}</Text>
  }
];

/**
 * Every QR code at once: the smart search, the sort by any heading and the pages work in memory and live in the URL.
 * A row opens the code's card; the codes are created from the bar of the list (administrators only).
 */
export const QrCodesList: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { values, setValues, reset, isFiltered } = useUrlFilters(FILTERS, {
    persistentKeys: PERSISTENT_KEYS
  });
  const qrCodesQuery = useQrCodesQuery();
  const { sort, direction } = values;

  // No sort – the order of the server
  const compare = useMemo(
    () => urlSortComparator({ sort, direction }, SORT_VALUE_OF),
    [sort, direction]
  );

  const list = useClientList(
    { ...qrCodesQuery, rows: qrCodesQuery.data },
    {
      query: values.query,
      searchDocumentOf,
      exactKeysOf,
      compare,
      page: values.page,
      size: values.size
    }
  );

  return (
    <ListPage
      header={<DescriptionPage icon={IconQrcode} page="QR-коды" title="Все QR-коды" />}
      canResetFilters={isFiltered()}
      onResetFilters={() => reset()}
      toolbarRight={
        isAdmin && (
          <Button
            component={Link}
            to={QR_CREATE_PATH}
            size="xs"
            variant="light"
            leftSection={<IconPlus size={14} />}
          >
            Новый QR-код
          </Button>
        )
      }
      filters={
        <SearchInput
          value={values.query}
          onChange={query => setValues({ query })}
          placeholder="Название, слаг, ссылки – можно частью"
        />
      }
      list={list}
      tableId="qr.list"
      columns={COLUMNS}
      rowKey={qr => qr.slug}
      rowHref={qr => qrCardPath(qr.slug)}
      sort={columnSortOf({ sort, direction })}
      onSort={key => setValues(columnSortPatch({ sort, direction }, key as SortKey))}
      emptyText="QR-кодов пока нет"
      pagination={{
        page: values.page,
        size: values.size,
        onPageChange: page => setValues({ page }),
        onSizeChange: size => setValues({ size })
      }}
    />
  );
};
