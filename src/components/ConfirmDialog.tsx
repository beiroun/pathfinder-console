// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ConfirmOptions } from '../context/FeedbackContext';

interface ConfirmDialogProps {
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Styled Yes/No dialog that replaces window.confirm(). Reuses the app's modal
 * shell; the confirm button switches to the danger tone for destructive actions.
 */
const ConfirmDialog = ({ options, onConfirm, onCancel }: ConfirmDialogProps) => {
  const {
    title = 'Подтверждение',
    message,
    confirmText = 'Да',
    cancelText = 'Нет',
    danger = false
  } = options;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      {/* Stop propagation so clicks inside the dialog don't dismiss it */}
      <div
        className="modal-content card confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        {/* Body wrapped in .modal-scroll so it inherits the modal padding and can scroll —
            without it, .modal-content's padding:0 + overflow:hidden clipped the message. */}
        <div className="modal-scroll">
          <h3 className="confirm-dialog__title">{title}</h3>
          <p className="confirm-dialog__message">{message}</p>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              {cancelText}
            </button>
            <button
              type="button"
              className={danger ? 'btn-danger' : 'btn-success'}
              onClick={onConfirm}
              autoFocus
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
