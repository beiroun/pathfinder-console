// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useEffect, useMemo, useState } from 'react';
import type { QrView } from '../../types';
import { api } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import QrFormModal from '../../components/QrFormModal';
import QrDetailModal from '../../components/QrDetailModal';
import CopyableLink from '../../components/CopyableLink';
import AppFooter from '../../components/AppFooter';
import {
  EditIcon,
  EyeIcon,
  PlusIcon,
  QrIcon,
  TrashIcon
} from '../../components/icons';

/**
 * Single admin dashboard for both roles. Lists every QR target with its public redirect URL
 * and total scans; ADMIN can create/edit/delete, VIEWER gets read-only access plus the detail
 * view (image + per-platform stats + download).
 */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const { showAlert, confirm } = useFeedback();
  const isAdmin = user?.role === 'ADMIN';

  const [qrCodes, setQrCodes] = useState<QrView[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Create/edit modal: null editing = create mode, a QrView = edit mode
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQr, setEditingQr] = useState<QrView | null>(null);

  // Detail (view) modal
  const [detailQr, setDetailQr] = useState<QrView | null>(null);

  /**
   * Loads the QR list. Blocks the screen on first mount; later reloads keep the current
   * list on screen and only show a lightweight "refreshing" pill so the page never blanks.
   */
  const fetchData = async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      setQrCodes(await api.getQrCodes());
    } catch (error) {
      console.error('Failed to fetch QR codes', error);
      showAlert('error', 'Ошибка при загрузке списка QR-кодов.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return qrCodes;
    return qrCodes.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q)
    );
  }, [qrCodes, search]);

  const openCreate = () => {
    setEditingQr(null);
    setIsFormOpen(true);
  };

  const openEdit = (qr: QrView) => {
    setEditingQr(qr);
    setIsFormOpen(true);
  };

  const handleSaved = async (saved: QrView, wasCreated: boolean) => {
    setIsFormOpen(false);
    setEditingQr(null);
    await fetchData();
    showAlert('success', 'QR-код сохранён');
    // Open the detail popup for a freshly created code so users immediately see its QR/link
    // and don't get stuck looking for it in the list.
    if (wasCreated) setDetailQr(saved);
  };

  const handleDelete = async (qr: QrView) => {
    const confirmed = await confirm({
      title: 'Удаление QR-кода',
      message: `Удалить QR-код «${qr.name}» (${qr.slug})? Напечатанные коды перестанут работать.`,
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      danger: true
    });
    if (!confirmed) return;

    try {
      await api.deleteQrCode(qr.slug);
      await fetchData();
      showAlert('success', 'QR-код удалён');
    } catch (error) {
      console.error('Failed to delete QR code', error);
      showAlert('error', 'Ошибка при удалении QR-кода.');
    }
  };

  // Full-screen loader on the very first load to avoid flashing an empty table
  if (isLoading) {
    return (
      <div className="loader-screen">
        <div className="spinner" />
        <p className="loader-text">Загрузка QR-кодов...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Non-blocking indicator shown while data reloads in the background */}
      {isRefreshing && (
        <div className="refresh-bar">
          <div className="spinner spinner-sm" />
          <span>Обновление...</span>
        </div>
      )}

      <header className="header">
        <h1 style={{ margin: 0 }}>Pathfinder</h1>
        <div className="user-card">
          {user && (
            <div>
              <div className="user-card__name">{user.name || 'Пользователь'}</div>
              <div className="user-card__login">@{user.username}</div>
            </div>
          )}
          <div className="user-card__actions">
            <span
              className={`role-badge ${
                isAdmin ? 'role-badge--admin' : 'role-badge--viewer'
              }`}
            >
              {isAdmin ? 'Администратор' : 'Наблюдатель'}
            </span>
            <button onClick={logout} className="btn-logout">
              Выход
            </button>
          </div>
        </div>
      </header>

      <div className="card">
        <div className="qr-toolbar">
          <h3 style={{ margin: 0 }}>QR-коды</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-16)' }}>
            <span className="qr-toolbar__count">Всего: {qrCodes.length}</span>
            {isAdmin && (
              <button onClick={openCreate} className="btn-success">
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--sp-8)'
                  }}
                >
                  <PlusIcon size={16} />
                  Новый QR-код
                </span>
              </button>
            )}
          </div>
        </div>

        <input
          type="text"
          placeholder="Поиск по названию или слагу"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />

        {/* Table header */}
        <div className="qr-table-head">
          <span>Название / слаг</span>
          <span>Публичная ссылка</span>
          <span>Сканы</span>
          <span style={{ textAlign: 'right' }}>Действия</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <QrIcon size={28} />
            <p className="mt-2">
              {qrCodes.length === 0
                ? 'QR-кодов пока нет.'
                : 'Ничего не найдено по запросу.'}
            </p>
          </div>
        ) : (
          <ul className="list scroll-list" style={{ maxHeight: '640px' }}>
            {filtered.map(qr => (
              <li key={qr.slug} className="qr-row">
                <div className="qr-row__name">
                  <strong>{qr.name}</strong>
                  <span className="slug-chip">{qr.slug}</span>
                </div>

                <CopyableLink url={qr.redirect_url} />

                <div className="qr-row__scans">
                  <span className="scan-total">{qr.scan_count_total}</span>
                  <span className="scan-total__label">скан.</span>
                </div>

                <div className="qr-row__actions">
                  <button
                    onClick={() => setDetailQr(qr)}
                    className="icon-btn"
                    title="Просмотр"
                    aria-label="Просмотр QR-кода"
                  >
                    <EyeIcon />
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => openEdit(qr)}
                        className="icon-btn"
                        title="Редактировать"
                        aria-label="Редактировать QR-код"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDelete(qr)}
                        className="icon-btn icon-btn--danger"
                        title="Удалить"
                        aria-label="Удалить QR-код"
                      >
                        <TrashIcon />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- Modals --- */}
      {isFormOpen && (
        <QrFormModal
          editing={editingQr}
          onClose={() => {
            setIsFormOpen(false);
            setEditingQr(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {detailQr && (
        <QrDetailModal qr={detailQr} onClose={() => setDetailQr(null)} />
      )}

      <AppFooter />
    </div>
  );
};

export default Dashboard;
