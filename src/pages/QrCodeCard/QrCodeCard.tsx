// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, { useEffect, useState } from 'react';
import {
  Anchor,
  Center,
  Loader,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  UnstyledButton
} from '@mantine/core';
import { IconCopy, IconDownload, IconPencil, IconQrcode, IconTrash } from '@tabler/icons-react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { DescriptionPage } from '@ui/DescriptionPage/DescriptionPage.tsx';
import { EntityCardHeader } from '@ui/EntityCardHeader/EntityCardHeader.tsx';
import { EntityActionsMenu, type EntityAction } from '@ui/EntityActionsMenu/EntityActionsMenu.tsx';
import { ConfirmActionModal } from '@ui/ConfirmActionModal/ConfirmActionModal.tsx';
import { PageField, PageSection } from '@ui/PageSection/PageSection.tsx';
import { ScrollableTabsList } from '@ui/ScrollableTabsList/ScrollableTabsList.tsx';
import { CopyableId } from '@ui/CopyableId/CopyableId.tsx';
import { MetricTile } from '@ui/MetricTile/MetricTile.tsx';
import { CardLoadError } from '@ui/CardLoadError/CardLoadError.tsx';
import { useGoBack } from '@hooks/useGoBack.ts';
import { QR_LIST_PATH, qrEditPath } from '@routes/paths.ts';
import { api } from '../../api/api.ts';
import { useQrCodeQuery } from '../../api/queries.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import type { QrImageFormat, QrView } from '../../types';
import { apiErrorText } from '../../utils/apiError.ts';
import { downloadBlob } from '../../utils/downloadBlob.ts';
import { notifyFailure, notifySuccess } from '../../utils/notify.ts';
import { formatDateTime } from '../../utils/localTime.ts';
import { targetsOf } from '../../utils/qrTargets.ts';

// The preview is modest; a download is a print-friendly raster (SVG ignores the size, it is vector)
const PREVIEW_SIZE = 512;
const DOWNLOAD_SIZE = 1024;

// The card has one tab today; new sections come as tabs, not as more scrolling
const TABS = ['overview'] as const;
type CardTab = (typeof TABS)[number];
const DEFAULT_TAB: CardTab = 'overview';

const isHttpLink = (url: string) => /^https?:\/\//i.test(url);

/**
 * The rendered code, fetched as a blob through the authed client (the image endpoint is Bearer-protected, an <img src>
 * cannot send the header). The blob is kept for «Копировать картинку»: the clipboard write must run inside the click,
 * Safari refuses a write made after an await.
 */
const useQrPreview = (slug: string) => {
  const [preview, setPreview] = useState<{
    slug: string;
    blob: Blob | null;
    url: string | null;
  } | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    api.getQrImage(slug, 'png', PREVIEW_SIZE).then(
      blob => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPreview({ slug, blob, url: objectUrl });
      },
      error => {
        console.error('Failed to load the QR preview', error);
        if (!cancelled) setPreview({ slug, blob: null, url: null });
      }
    );
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [slug]);

  const current = preview?.slug === slug ? preview : null;
  return {
    blob: current?.blob ?? null,
    url: current?.url ?? null,
    isLoading: !current
  };
};

const copyImage = async (blob: Blob | null) => {
  if (!blob) return;
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    notifySuccess('Картинка QR-кода скопирована');
  } catch (error) {
    console.error('Failed to copy the QR image', error);
    notifyFailure('Не удалось скопировать картинку – браузер не дал доступа к буферу обмена');
  }
};

const QrImageSection: React.FC<{
  qr: QrView;
  blob: Blob | null;
  url: string | null;
  isLoading: boolean;
}> = ({ qr, blob, url, isLoading }) => (
  <PageSection title="QR-код" description="Нажмите на картинку, чтобы скопировать её в PNG">
    <Center className="qr-preview">
      {isLoading ? (
        <Loader type="bars" />
      ) : url ? (
        <UnstyledButton
          onClick={() => copyImage(blob)}
          aria-label={`Скопировать картинку QR-кода ${qr.slug}`}
          title="Скопировать PNG"
        >
          <img src={url} alt={`QR-код ${qr.slug}`} className="qr-preview__image" />
        </UnstyledButton>
      ) : (
        <Text size="sm" c="dimmed">
          Картинка не загрузилась – обновите карточку
        </Text>
      )}
    </Center>
  </PageSection>
);

const ScansSection: React.FC<{ qr: QrView }> = ({ qr }) => {
  const total = qr.scan_count_total;
  return (
    <PageSection
      title="Сканы"
      description="Платформа определяется по устройству, с которого отсканировали код"
    >
      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
        <MetricTile label="Всего сканов" value={total} />
        {targetsOf(qr).map(({ target }) => (
          <MetricTile
            key={target.field}
            label={`${target.label} – ${target.devices}`}
            value={qr[target.scans]}
            percent={total ? (qr[target.scans] / total) * 100 : 0}
          />
        ))}
      </SimpleGrid>
    </PageSection>
  );
};

const LinksSection: React.FC<{ qr: QrView }> = ({ qr }) => (
  <PageSection
    title="Ссылки"
    description="Порядок определения платформы: iOS → Huawei → Android → Desktop. Пустая ссылка платформы ведёт на ссылку Desktop"
  >
    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" verticalSpacing="sm">
      <PageField label="Ссылка в QR-коде">
        <CopyableId value={qr.redirect_url} />
      </PageField>
      {targetsOf(qr).map(({ target, url }) => (
        <PageField key={target.field} label={`${target.label} – ${target.devices}`}>
          {!url ? (
            <Text span size="sm" c="dimmed">
              Не задана – ведёт на ссылку Desktop
            </Text>
          ) : isHttpLink(url) ? (
            <Anchor
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              style={{ overflowWrap: 'anywhere' }}
            >
              {url}
            </Anchor>
          ) : (
            <Text span size="sm" style={{ overflowWrap: 'anywhere' }}>
              {url}
            </Text>
          )}
        </PageField>
      ))}
    </SimpleGrid>
  </PageSection>
);

/**
 * The card of a QR code: the rendered code, the scans by platform and the links. «Действия» download and copy the
 * image for every role; administrators also edit and delete the code.
 */
export const QrCodeCard: React.FC = () => {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const goBack = useGoBack(QR_LIST_PATH);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const qrQuery = useQrCodeQuery(slug);
  const qr = qrQuery.data;
  const preview = useQrPreview(slug);
  const [downloading, setDownloading] = useState<QrImageFormat | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const requestedTab = searchParams.get('tab');
  const tab: CardTab = TABS.includes(requestedTab as CardTab)
    ? (requestedTab as CardTab)
    : DEFAULT_TAB;
  const changeTab = (next: string | null) =>
    setSearchParams(
      previous => {
        const params = new URLSearchParams(previous);
        if (!next || next === DEFAULT_TAB) params.delete('tab');
        else params.set('tab', next);
        return params;
      },
      { replace: true, preventScrollReset: true }
    );

  const breadcrumb = (
    <DescriptionPage
      icon={IconQrcode}
      page="QR-коды"
      title="Все QR-коды"
      entity={qr?.name ?? slug}
    />
  );

  if (qrQuery.isLoading) {
    return (
      <Stack gap="md">
        {breadcrumb}
        <Center py="xl">
          <Loader type="bars" />
        </Center>
      </Stack>
    );
  }

  if (!qr) {
    return (
      <Stack gap="md">
        {breadcrumb}
        {qrQuery.error != null && (
          <CardLoadError
            error={qrQuery.error}
            notFoundTitle={`QR-код ${slug} не найден`}
            notFoundHint="Кода с таким слагом нет – его удалили, или в ссылке опечатка. Слаг виден в списке QR-кодов."
            onRetry={qrQuery.refetch}
            isRetrying={qrQuery.isFetching}
            onToList={() => navigate(QR_LIST_PATH)}
          />
        )}
      </Stack>
    );
  }

  const download = async (format: QrImageFormat) => {
    setDownloading(format);
    try {
      const blob = await api.getQrImage(qr.slug, format, DOWNLOAD_SIZE);
      downloadBlob(blob, `qr-${qr.slug}.${format}`);
    } catch (error) {
      console.error('Failed to download the QR image', error);
      notifyFailure(apiErrorText(error)?.message ?? 'Не удалось скачать картинку');
    } finally {
      setDownloading(null);
    }
  };

  const deleteCode = async () => {
    setIsDeleting(true);
    try {
      await api.deleteQrCode(qr.slug);
      notifySuccess(`QR-код «${qr.name}» удалён`);
      navigate(QR_LIST_PATH, { replace: true });
    } catch (error) {
      notifyFailure(apiErrorText(error)?.message ?? 'Не удалось удалить QR-код');
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  // Copying needs the preview blob in hand (see useQrPreview); downloads ask the server themselves
  const copyUnavailableReason = preview.isLoading
    ? 'Картинка ещё загружается'
    : preview.blob
      ? undefined
      : 'Картинка не загрузилась – обновите карточку';
  const actions: EntityAction[] = [
    {
      key: 'download-png',
      label: 'Скачать PNG',
      icon: <IconDownload size={16} />,
      onClick: () => download('png')
    },
    {
      key: 'download-svg',
      label: 'Скачать SVG',
      icon: <IconDownload size={16} />,
      onClick: () => download('svg')
    },
    {
      key: 'copy-image',
      label: 'Копировать картинку',
      icon: <IconCopy size={16} />,
      onClick: () => copyImage(preview.blob),
      disabledReason: copyUnavailableReason
    },
    ...(isAdmin
      ? [
          {
            key: 'edit',
            label: 'Изменить',
            icon: <IconPencil size={16} />,
            dividerBefore: true,
            onClick: () => navigate(qrEditPath(qr.slug))
          },
          {
            key: 'delete',
            label: 'Удалить',
            icon: <IconTrash size={16} />,
            color: 'red',
            dividerBefore: true,
            onClick: () => setIsDeleteOpen(true)
          }
        ]
      : [])
  ];

  return (
    <Stack gap="md">
      {breadcrumb}
      <EntityCardHeader
        title={qr.name}
        entityKey={<CopyableId label="слаг" value={qr.slug} />}
        subtitle={`Создан ${formatDateTime(qr.created_at)} · изменён ${formatDateTime(qr.updated_at)}`}
        actions={
          <EntityActionsMenu actions={actions} loading={downloading !== null || isDeleting} />
        }
        onBack={goBack}
        onRefresh={qrQuery.refetch}
        isRefreshing={qrQuery.isFetching}
      />

      <Tabs value={tab} onChange={changeTab} keepMounted={false}>
        <ScrollableTabsList>
          <Tabs.Tab value="overview">Обзор</Tabs.Tab>
        </ScrollableTabsList>
        <Tabs.Panel value="overview" pt="md">
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
              <QrImageSection qr={qr} {...preview} />
              <ScansSection qr={qr} />
            </SimpleGrid>
            <LinksSection qr={qr} />
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <ConfirmActionModal
        opened={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Удаление QR-кода"
        confirmLabel="Удалить"
        color="red"
        loading={isDeleting}
        onConfirm={deleteCode}
      >
        <Text size="sm">
          Удалить QR-код «{qr.name}» ({qr.slug})?
        </Text>
        <Text size="sm">
          Напечатанные коды со ссылкой {qr.redirect_url} перестанут работать. Отменить удаление
          нельзя.
        </Text>
      </ConfirmActionModal>
    </Stack>
  );
};
