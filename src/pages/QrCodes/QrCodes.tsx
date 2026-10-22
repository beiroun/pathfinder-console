// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useMemo, useState } from 'react';
import { Button, Code, Text } from '@mantine/core';
import { IconFilterOff, IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router';

import { useQrCodesQuery } from '@/api/queries';
import type { TableColumn } from '@/components/AdaptiveTable/tableColumns';
import { CopyableLink } from '@/components/CopyableLink/CopyableLink';
import { ListTable } from '@/components/ListTable/ListTable';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { ServerTimeCell } from '@/components/ServerTimeCell/ServerTimeCell';
import { TablePagination } from '@/components/TablePagination/TablePagination';
import { useAuth } from '@/context/AuthContext';
import { localeOf } from '@/i18n/dict';
import { useLang } from '@/i18n/LangContext';
import { QrCodeFormModal } from '@/pages/QrCodes/QrCodeFormModal';
import { rowComparator } from '@/shared/columnSort';
import { mayChangeQrCodes } from '@/shared/consoleRoles';
import { qrCodePath } from '@/shared/navigation';
import { smartSearchDocument } from '@/shared/smartQuery';
import { useClientList } from '@/shared/useClientList';
import { useListUrlState } from '@/shared/useListUrlState';
import type { QrView } from '@/types';

// A code is found by what an operator remembers of it: its name, its slug, any of its links
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

/**
 * Every QR code at once: search, sort and pages work in memory and live in the address. A row opens the code's
 * card, where every change lives; creating a code stays on the list.
 */
export function QrCodes() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canChange = mayChangeQrCodes(user?.role);
  const { data: codes, isLoading, isFetching, error, refetch } = useQrCodesQuery();
  const list = useListUrlState();
  const [creating, setCreating] = useState(false);

  const columns = useMemo<TableColumn<QrView>[]>(
    () => [
      {
        key: 'name',
        title: t.qrCodes.columns.name,
        minWidth: 160,
        priority: 1,
        render: qr => qr.name,
        sortValue: qr => qr.name
      },
      {
        key: 'slug',
        title: t.qrCodes.columns.slug,
        width: 180,
        priority: 2,
        render: qr => <Code fz="sm">{qr.slug}</Code>,
        sortValue: qr => qr.slug
      },
      {
        // The link printed into the code, copied by a click on it; the row opens the card everywhere else
        key: 'link',
        title: t.qrCodes.columns.link,
        minWidth: 220,
        priority: 3,
        render: qr => <CopyableLink url={qr.redirect_url} />
      },
      {
        key: 'scans',
        title: t.qrCodes.columns.scans,
        width: 110,
        priority: 1,
        align: 'right',
        render: qr => (
          <Text size="sm" ff="monospace">
            {qr.scan_count_total.toLocaleString(localeOf(lang))}
          </Text>
        ),
        sortValue: qr => qr.scan_count_total
      },
      {
        key: 'updated',
        title: t.qrCodes.columns.updated,
        width: 170,
        priority: 3,
        render: qr => <ServerTimeCell value={qr.updated_at} />,
        sortValue: qr => qr.updated_at
      },
      {
        key: 'created',
        title: t.qrCodes.columns.created,
        width: 170,
        priority: 4,
        render: qr => <ServerTimeCell value={qr.created_at} />,
        sortValue: qr => qr.created_at
      }
    ],
    [t, lang]
  );

  const compare = useMemo(
    () => rowComparator(columns, list.sort, localeOf(lang)),
    [columns, list.sort, lang]
  );
  const shown = useClientList(codes, {
    query: list.query,
    searchDocumentOf,
    exactKeysOf,
    compare,
    page: list.page,
    size: list.size
  });

  return (
    <div className="pf-listpage">
      <PageHeader
        page={t.pages.qrCodes}
        actions={
          canChange && (
            <Button leftSection={<IconPlus size={16} />} onClick={() => setCreating(true)}>
              {t.qrCodes.newCode}
            </Button>
          )
        }
      />

      <div className="pf-toolbar">
        <SearchInput
          value={list.query}
          onChange={list.setQuery}
          placeholder={t.qrCodes.searchPlaceholder}
        />
        {list.isFiltered && (
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconFilterOff size={16} />}
            onClick={list.reset}
          >
            {t.table.reset}
          </Button>
        )}
      </div>

      <ListTable
        fill
        tableId="qr-codes.list"
        columns={columns}
        rows={shown.rows}
        rowKey={qr => qr.slug}
        rowHref={qr => qrCodePath(qr.slug)}
        sort={list.sort}
        onSort={list.toggleSort}
        isInitialLoading={isLoading}
        error={error}
        onRetry={refetch}
        isRetrying={isFetching}
        emptyText={t.qrCodes.noCodesYet}
        isFiltered={list.isFiltered}
        onResetFilters={list.reset}
      />
      <TablePagination
        total={shown.total}
        page={shown.page}
        size={list.size}
        onPage={list.setPage}
        onSize={list.setSize}
      />

      <QrCodeFormModal
        opened={creating}
        editing={null}
        onClose={() => setCreating(false)}
        // The card shows the code to print right away
        onSaved={saved => navigate(qrCodePath(saved.slug))}
      />
    </div>
  );
}
