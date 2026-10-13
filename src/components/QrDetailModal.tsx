// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useEffect, useState } from 'react';
import type { QrView } from '../types';
import { api } from '../api/api';
import { useFeedback } from '../context/FeedbackContext';
import { downloadBlob, formatDateTime } from '../utils/format';
import { DownloadIcon, CloseIcon } from './icons';
import CopyableLink from './CopyableLink';

interface QrDetailModalProps {
  qr: QrView;
  onClose: () => void;
}

// Preview is rendered at a modest size; downloads pull a larger, print-friendly raster.
const PREVIEW_SIZE = 512;
const DOWNLOAD_SIZE = 1024;

/**
 * Read-only detail view for a QR target: the rendered code (fetched as a blob through the
 * authed axios instance, since the image endpoint is Bearer-protected), the public redirect
 * URL, all four platform links and per-platform scan stats. Available to both roles.
 */
const QrDetailModal = ({ qr, onClose }: QrDetailModalProps) => {
  const { showAlert } = useFeedback();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Keep the raw PNG blob (not just its object URL) so a click can copy it to the clipboard.
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [downloading, setDownloading] = useState<'png' | 'svg' | null>(null);

  // Fetch the preview once on open; revoke the object URL on unmount to avoid a leak.
  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    const loadPreview = async () => {
      setIsImageLoading(true);
      try {
        const blob = await api.getQrImage(qr.slug, 'png', PREVIEW_SIZE);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
        setPreviewBlob(blob);
      } catch (error) {
        console.error('Failed to load QR preview', error);
        if (!cancelled) {
          showAlert('error', 'Не удалось загрузить изображение QR-кода.');
        }
      } finally {
        if (!cancelled) setIsImageLoading(false);
      }
    };

    loadPreview();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qr.slug]);

  // Copy the rendered PNG to the clipboard. Uses the already-fetched preview blob so the
  // write runs synchronously inside the click gesture (Safari rejects writes made post-await).
  const handleCopyImage = async () => {
    if (!previewBlob) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': previewBlob })
      ]);
      showAlert('success', 'QR-код скопирован');
    } catch (error) {
      console.error('Failed to copy QR image', error);
      showAlert('error', 'Не удалось скопировать QR-код.');
    }
  };

  const handleDownload = async (format: 'png' | 'svg') => {
    if (downloading) return;
    setDownloading(format);
    showAlert('info', 'Скачивание QR-кода');
    try {
      // SVG is vector, so the size param is irrelevant there; PNG gets the print-friendly raster.
      const blob = await api.getQrImage(qr.slug, format, DOWNLOAD_SIZE);
      downloadBlob(blob, `qr-${qr.slug}.${format}`);
    } catch (error) {
      console.error('Failed to download QR image', error);
      showAlert('error', 'Не удалось скачать изображение.');
    } finally {
      setDownloading(null);
    }
  };

  const stats: Array<{ label: string; value: number; total?: boolean }> = [
    { label: 'Всего сканов', value: qr.scan_count_total, total: true },
    { label: 'iOS', value: qr.scan_count_ios },
    { label: 'Huawei', value: qr.scan_count_huawei },
    { label: 'Android', value: qr.scan_count_android },
    { label: 'Desktop', value: qr.scan_count_desktop }
  ];

  const targets: Array<{ label: string; value: string }> = [
    { label: 'iOS', value: qr.target_ios_url },
    { label: 'Huawei / Honor', value: qr.target_huawei_url },
    { label: 'Android', value: qr.target_android_url },
    { label: 'Desktop / fallback', value: qr.target_desktop_url }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content card modal-content--wide"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <CloseIcon />
        </button>
        <div className="modal-scroll">
        <h3>{qr.name}</h3>
        <span className="slug-chip">/r/{qr.slug}</span>

        {/* Rendered QR + downloads */}
        <div className="qr-preview mt-2">
          <div className="qr-preview__frame">
            {isImageLoading ? (
              <div className="spinner" />
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt={`QR-код ${qr.slug}`}
                onClick={handleCopyImage}
                role="button"
                title="Нажмите, чтобы скопировать PNG"
              />
            ) : (
              <span className="text-muted text-sm">Нет изображения</span>
            )}
          </div>
          <div className="qr-preview__downloads">
            <button
              type="button"
              className="btn-outline btn-sm"
              onClick={() => handleDownload('png')}
              disabled={downloading !== null}
            >
              <DownloadIcon size={14} />
              &nbsp;{downloading === 'png' ? 'Скачивание…' : 'PNG'}
            </button>
            <button
              type="button"
              className="btn-outline btn-sm"
              onClick={() => handleDownload('svg')}
              disabled={downloading !== null}
            >
              <DownloadIcon size={14} />
              &nbsp;{downloading === 'svg' ? 'Скачивание…' : 'SVG'}
            </button>
          </div>
        </div>

        {/* Public redirect URL */}
        <div className="detail-row mt-2">
          <span className="detail-row__label">Публичная ссылка (в QR)</span>
          <CopyableLink url={qr.redirect_url} multiline />
        </div>

        {/* Scan stats */}
        <h4 className="mt-2">Статистика сканов</h4>
        <div className="stat-grid">
          {stats.map(s => (
            <div
              key={s.label}
              className={`stat-block${s.total ? ' stat-block--total' : ''}`}
            >
              <div className="stat-block__label">{s.label}</div>
              <div className="stat-block__value">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Target URLs */}
        <h4 className="mt-2">Целевые ссылки</h4>
        <div>
          {targets.map(t => (
            <div key={t.label} className="detail-row">
              <span className="detail-row__label">{t.label}</span>
              <span
                className={`detail-row__value${
                  t.value ? '' : ' detail-row__value--empty'
                }`}
              >
                {t.value || '— (ведёт на Desktop)'}
              </span>
            </div>
          ))}
        </div>

        <div
          className="mt-2 text-xs text-muted"
          style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-8)' }}
        >
          <span>Создан: {formatDateTime(qr.created_at)}</span>
          <span>Изменён: {formatDateTime(qr.updated_at)}</span>
        </div>
        </div>
      </div>
    </div>
  );
};

export default QrDetailModal;
