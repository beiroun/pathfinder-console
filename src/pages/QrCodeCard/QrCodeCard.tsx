// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useEffect, useState } from 'react';
import { Alert, Button, Group, Loader, Menu, Text, UnstyledButton } from '@mantine/core';
import { IconArrowRight, IconCopy, IconDownload, IconPencil, IconTrash } from '@tabler/icons-react';
import { Link, useNavigate, useParams } from 'react-router';

import { api } from '@/api/api';
import { useQrCodeQuery } from '@/api/queries';
import { ConfirmActionModal } from '@/components/ConfirmActionModal/ConfirmActionModal';
import { CopyableLink } from '@/components/CopyableLink/CopyableLink';
import { CardField, CardFields, CopyableValue } from '@/components/EntityCard/CardFields';
import { EntityActionsMenu } from '@/components/EntityCard/EntityActionsMenu';
import { EntityCardHeader } from '@/components/EntityCard/EntityCardHeader';
import { useAuth } from '@/context/AuthContext';
import { localeOf } from '@/i18n/dict';
import { useLang } from '@/i18n/LangContext';
import { QrCodeFormModal } from '@/pages/QrCodes/QrCodeFormModal';
import { describeApiError, isNotFound } from '@/shared/apiErrors';
import { mayChangeQrCodes } from '@/shared/consoleRoles';
import { downloadBlob } from '@/shared/downloadBlob';
import { codeStatsPath, routePaths } from '@/shared/navigation';
import { qrTargets, targetUrlOf } from '@/shared/qrTargets';
import { formatServerTime } from '@/shared/serverTime';
import { useGoBack } from '@/shared/useGoBack';
import type { QrImageFormat, QrView } from '@/types';

// The preview is modest; a download is a print-friendly raster (SVG ignores the size, it is vector)
const previewSize = 512;
const downloadSize = 1024;

type OpenDialog = 'edit' | 'delete' | null;

const isHttpLink = (url: string) => /^https?:\/\//i.test(url);

/**
 * The rendered code, fetched as a blob through the authed client: the image endpoint is Bearer-protected and an
 * <img src> cannot send the header. The blob is kept for "copy the image": the clipboard write must run inside the
 * click, Safari refuses a write made after an await.
 */
function useQrPreview(slug: string) {
  const [preview, setPreview] = useState<{
    slug: string;
    blob: Blob | null;
    url: string | null;
  } | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    api.getQrImage(slug, 'png', previewSize).then(
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
  return { blob: current?.blob ?? null, url: current?.url ?? null, isLoading: !current };
}

/**
 * One QR code: the rendered image with its downloads under it, the scans by platform and the links. "Actions" copy
 * the image for every role; administrators also edit and delete the code there.
 */
export function QrCodeCard() {
  const { t } = useLang();
  const { slug = '' } = useParams();
  const goBack = useGoBack(routePaths.qrCodes);
  const { data: qr, isLoading, isFetching, error, refetch } = useQrCodeQuery(slug);

  if (error && isNotFound(error)) {
    return (
      <>
        <EntityCardHeader kicker={t.pages.qrCode.kicker} title={slug} onBack={goBack} />
        <Alert color="gray" title={t.qrCard.notFoundTitle}>
          <Text size="sm" mb="sm">
            {t.qrCard.notFoundBody}
          </Text>
          <Button size="xs" variant="default" onClick={goBack}>
            {t.common.toList}
          </Button>
        </Alert>
      </>
    );
  }
  if (isLoading) {
    return <Loader size="sm" />;
  }
  if (!qr) {
    return (
      <>
        <EntityCardHeader kicker={t.pages.qrCode.kicker} title={slug} onBack={goBack} />
        <Alert color="red" title={t.table.loadError}>
          <Text size="sm" mb="sm">
            {describeApiError(error, t.api)}
          </Text>
          <Group gap="sm">
            <Button size="xs" variant="default" loading={isFetching} onClick={refetch}>
              {t.common.retry}
            </Button>
            <Button size="xs" variant="subtle" color="gray" onClick={goBack}>
              {t.common.toList}
            </Button>
          </Group>
        </Alert>
      </>
    );
  }
  // Keyed by slug: another code opened in place starts with its own preview and no dialog left open
  return <QrCodeCardContent key={qr.slug} qr={qr} onBack={goBack} onChanged={refetch} />;
}

function QrCodeCardContent({
  qr,
  onBack,
  onChanged
}: {
  qr: QrView;
  onBack: () => void;
  onChanged: () => void;
}) {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canChange = mayChangeQrCodes(user?.role);
  const preview = useQrPreview(qr.slug);
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Downloads and the clipboard report here, under the header: they run without a dialog
  const [notice, setNotice] = useState<{ color: 'teal' | 'red'; text: string } | null>(null);
  const copy = t.qrCard;
  const locale = localeOf(lang);

  const closeDialog = () => {
    setDeleteError(null);
    setDialog(null);
  };

  const download = async (format: QrImageFormat) => {
    setNotice(null);
    try {
      const blob = await api.getQrImage(qr.slug, format, downloadSize);
      downloadBlob(blob, `qr-${qr.slug}.${format}`);
    } catch (error) {
      setNotice({
        color: 'red',
        text: `${copy.downloadFailed}: ${describeApiError(error, t.api)}`
      });
    }
  };

  const copyImage = async () => {
    if (!preview.blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': preview.blob })]);
      setNotice({ color: 'teal', text: copy.imageCopied });
    } catch (error) {
      console.error('Failed to copy the QR image', error);
      setNotice({ color: 'red', text: copy.imageCopyFailed });
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteQrCode(qr.slug);
      // The card has nothing left to show: back to the list, not to a page that would answer "not found"
      navigate(routePaths.qrCodes, { replace: true });
    } catch (error) {
      setDeleteError(describeApiError(error, t.api));
      setIsDeleting(false);
    }
  };

  const percentOf = (count: number) =>
    qr.scan_count_total
      ? `${((count / qr.scan_count_total) * 100).toLocaleString(locale, { maximumFractionDigits: 1 })} %`
      : '0 %';

  const actions = (
    <EntityActionsMenu>
      <Menu.Item
        leftSection={<IconCopy size={16} />}
        disabled={!preview.blob}
        onClick={() => void copyImage()}
      >
        {copy.copyImage}
      </Menu.Item>
      {canChange && (
        <>
          <Menu.Divider />
          <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => setDialog('edit')}>
            {t.common.edit}
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={() => setDialog('delete')}
          >
            {t.common.delete}
          </Menu.Item>
        </>
      )}
    </EntityActionsMenu>
  );

  return (
    <>
      <EntityCardHeader
        kicker={t.pages.qrCode.kicker}
        title={qr.name}
        subtitle={`${qr.slug} · ${copy.updated.toLowerCase()} ${formatServerTime(qr.updated_at)}`}
        actions={actions}
        onBack={onBack}
      />

      {notice && (
        <Alert color={notice.color} mb="md" withCloseButton onClose={() => setNotice(null)}>
          {notice.text}
        </Alert>
      )}

      <section className="pf-section">
        <h2 className="pf-section__title">{copy.scansSection}</h2>
        <p className="pf-section__note">{copy.scansHint}</p>
        <div className="pf-metrics">
          <div className="pf-metric">
            <div className="pf-metric__num">{qr.scan_count_total.toLocaleString(locale)}</div>
            <div className="pf-metric__lbl">{copy.totalScans}</div>
          </div>
          {qrTargets.map(target => (
            <div className="pf-metric" key={target.platform}>
              <div className="pf-metric__num">{qr[target.scans].toLocaleString(locale)}</div>
              <div className="pf-metric__lbl">
                {t.qrCodes.platforms[target.platform].label} ·{' '}
                {copy.shareOfAll(percentOf(qr[target.scans]))}
              </div>
            </div>
          ))}
        </div>
        <Link to={codeStatsPath(qr.slug)} className="pf-link pf-card__more">
          {copy.statsLink}
          <IconArrowRight size={16} />
        </Link>
      </section>

      <section className="pf-section">
        <h2 className="pf-section__title">{copy.imageSection}</h2>
        <div className="pf-qr">
          {preview.isLoading ? (
            <Loader size="sm" />
          ) : preview.url ? (
            <UnstyledButton
              className="pf-qr__button"
              onClick={() => void copyImage()}
              aria-label={copy.copyImage}
              title={copy.imageHint}
            >
              <img src={preview.url} alt={`QR ${qr.slug}`} className="pf-qr__image" />
            </UnstyledButton>
          ) : (
            <Text size="sm" c="dimmed">
              {copy.imageFailed}
            </Text>
          )}
          <Group gap="sm">
            <Button
              variant="default"
              leftSection={<IconDownload size={16} />}
              onClick={() => void download('png')}
            >
              {copy.downloadPng}
            </Button>
            <Button
              variant="default"
              leftSection={<IconDownload size={16} />}
              onClick={() => void download('svg')}
            >
              {copy.downloadSvg}
            </Button>
          </Group>
          <Text size="sm" c="dimmed">
            {copy.imageHint}
          </Text>
        </div>
      </section>

      <section className="pf-section">
        <h2 className="pf-section__title">{copy.linksSection}</h2>
        <p className="pf-section__note">{t.qrCodes.resolveOrder}</p>
        <CardFields>
          <CardField label={copy.redirectUrl} wide>
            <CopyableLink url={qr.redirect_url} multiline />
          </CardField>
          {qrTargets.map(target => {
            const url = targetUrlOf(qr, target);
            const platform = t.qrCodes.platforms[target.platform];
            return (
              <CardField key={target.field} label={`${platform.label} – ${platform.devices}`} wide>
                {!url ? (
                  <span className="pf-muted">{copy.blankLink}</span>
                ) : isHttpLink(url) ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="pf-link">
                    {url}
                  </a>
                ) : (
                  url
                )}
              </CardField>
            );
          })}
        </CardFields>
      </section>

      <section className="pf-section">
        <h2 className="pf-section__title">{copy.codeSection}</h2>
        <CardFields>
          <CardField label={t.qrCodes.columns.slug}>
            <CopyableValue value={qr.slug} label={t.qrCodes.columns.slug} />
          </CardField>
          <CardField label={copy.created}>{formatServerTime(qr.created_at)}</CardField>
          <CardField label={copy.updated}>{formatServerTime(qr.updated_at)}</CardField>
        </CardFields>
      </section>

      <QrCodeFormModal
        opened={dialog === 'edit'}
        editing={qr}
        onClose={closeDialog}
        onSaved={onChanged}
      />
      <ConfirmActionModal
        opened={dialog === 'delete'}
        title={copy.deleteTitle(qr.name)}
        confirmLabel={t.common.delete}
        loading={isDeleting}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
        onClose={closeDialog}
      >
        {copy.deleteBody(qr.redirect_url)}
      </ConfirmActionModal>
    </>
  );
}
