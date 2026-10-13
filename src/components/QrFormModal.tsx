// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState } from 'react';
import type { QrView } from '../types';
import { api } from '../api/api';
import { useFeedback } from '../context/FeedbackContext';
import { apiErrorMessage } from '../utils/format';
import { CloseIcon } from './icons';

interface QrFormModalProps {
  // null = create mode; a QrView = edit mode (slug is immutable and shown read-only)
  editing: QrView | null;
  onClose: () => void;
  // Returns the saved code and whether it was just created, so the caller can open its detail popup.
  onSaved: (saved: QrView, wasCreated: boolean) => void;
}

/**
 * Create/edit form for a QR target: a name, an optional slug (create only – it is baked into
 * printed codes and cannot change afterwards) and the four platform URLs. The URL fields are
 * ordered by the backend's resolve priority (iOS → Huawei → Android → Desktop); the desktop
 * link doubles as the fallback for any platform whose own link is left blank.
 */
const QrFormModal = ({ editing, onClose, onSaved }: QrFormModalProps) => {
  const isEdit = editing !== null;
  const { showAlert } = useFeedback();

  const [name, setName] = useState(editing?.name ?? '');
  const [slug, setSlug] = useState(editing?.slug ?? '');
  const [iosUrl, setIosUrl] = useState(editing?.target_ios_url ?? '');
  const [huaweiUrl, setHuaweiUrl] = useState(editing?.target_huawei_url ?? '');
  const [androidUrl, setAndroidUrl] = useState(
    editing?.target_android_url ?? ''
  );
  const [desktopUrl, setDesktopUrl] = useState(
    editing?.target_desktop_url ?? ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const targets = {
        target_ios_url: iosUrl.trim(),
        target_huawei_url: huaweiUrl.trim(),
        target_android_url: androidUrl.trim(),
        target_desktop_url: desktopUrl.trim()
      };

      const saved = isEdit
        ? await api.updateQrCode(editing.slug, { name: name.trim(), ...targets })
        : await api.createQrCode({
            name: name.trim(),
            // Omit the slug entirely when blank so the backend auto-generates a unique one
            slug: slug.trim() || undefined,
            ...targets
          });
      onSaved(saved, !isEdit);
    } catch (error) {
      showAlert(
        'error',
        apiErrorMessage(error) ||
          'Не удалось сохранить QR-код. Попробуйте ещё раз.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
          disabled={isSubmitting}
          aria-label="Закрыть"
        >
          <CloseIcon />
        </button>
        <div className="modal-scroll">
        <h3>{isEdit ? 'Редактирование QR-кода' : 'Новый QR-код'}</h3>

        <form onSubmit={handleSubmit} className="form-group">
          <div>
            <label>Название</label>
            <input
              type="text"
              placeholder="Например: Мобильное приложение"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ marginTop: 'var(--sp-12)' }}>
            <label>Слаг (slug)</label>
            <input
              type="text"
              placeholder={
                isEdit ? '' : 'Оставьте пустым для автогенерации'
              }
              value={slug}
              onChange={e => setSlug(e.target.value)}
              disabled={isEdit}
              readOnly={isEdit}
            />
            <div className="field-hint">
              {isEdit
                ? 'Слаг зашит в напечатанные QR-коды и не меняется.'
                : 'Часть публичной ссылки /r/{slug}. Пусто — сгенерируется автоматически.'}
            </div>
          </div>

          <div style={{ marginTop: 'var(--sp-16)' }}>
            <h4>Целевые ссылки</h4>
            <div className="field-hint" style={{ marginBottom: 'var(--sp-8)' }}>
              Порядок определения платформы: iOS → Huawei → Android → Desktop.
              Пустая ссылка платформы ведёт на Desktop-ссылку.
            </div>
          </div>

          <div>
            <label>iOS (iPhone / iPad)</label>
            <input
              type="url"
              placeholder="https://apps.apple.com/..."
              value={iosUrl}
              onChange={e => setIosUrl(e.target.value)}
            />
          </div>

          <div style={{ marginTop: 'var(--sp-12)' }}>
            <label>Huawei / Honor / HarmonyOS</label>
            <input
              type="url"
              placeholder="https://appgallery.huawei.com/..."
              value={huaweiUrl}
              onChange={e => setHuaweiUrl(e.target.value)}
            />
          </div>

          <div style={{ marginTop: 'var(--sp-12)' }}>
            <label>Android (Google Play и пр.)</label>
            <input
              type="url"
              placeholder="https://play.google.com/..."
              value={androidUrl}
              onChange={e => setAndroidUrl(e.target.value)}
            />
          </div>

          <div style={{ marginTop: 'var(--sp-12)' }}>
            <label>Desktop / прочее (fallback)</label>
            <input
              type="url"
              placeholder="https://example.com/"
              value={desktopUrl}
              onChange={e => setDesktopUrl(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions mt-2">
            <button
              type="submit"
              className="btn-success"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Сохранение…' : 'Сохранить'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default QrFormModal;
