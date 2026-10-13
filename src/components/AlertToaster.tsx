// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { AlertType, ToastItem } from '../context/FeedbackContext';

interface AlertToasterProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

// Shared thin-stroke SVG props, matching the app's Lucide-style icons
const iconBase = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true
};

/** Glyph per toast type: check (success), warning triangle (error), info (info). */
const TypeIcon = ({ type }: { type: AlertType }) => {
  if (type === 'success') {
    return (
      <svg {...iconBase}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }
  if (type === 'error') {
    return (
      <svg {...iconBase}>
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    );
  }
  return (
    <svg {...iconBase}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
};

/**
 * Fixed, auto-dismissing toast stack that replaces native alert() calls.
 * Rendered once by the FeedbackProvider; each toast carries a type accent
 * (danger / brand / side) and a manual close control.
 */
const AlertToaster = ({ toasts, onDismiss }: AlertToasterProps) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" role="region" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`} role="alert">
          <span className="toast__icon">
            <TypeIcon type={t.type} />
          </span>
          <span className="toast__text">{t.text}</span>
          <button
            type="button"
            className="toast__close"
            onClick={() => onDismiss(t.id)}
            aria-label="Закрыть"
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertToaster;
