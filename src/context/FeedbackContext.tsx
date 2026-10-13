// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react';
import type { ReactNode } from 'react';
import AlertToaster from '../components/AlertToaster';
import ConfirmDialog from '../components/ConfirmDialog';

/** Kind of a transient toast; drives its accent color and icon. */
export type AlertType = 'error' | 'success' | 'info';

/** A single live toast rendered by the AlertToaster. */
export interface ToastItem {
  id: number;
  type: AlertType;
  text: string;
}

/** Options for a confirmation dialog. */
export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  // Renders the confirm button in the danger tone (destructive actions)
  danger?: boolean;
}

interface FeedbackContextValue {
  /** Shows a styled toast; the in-site replacement for the native alert(). */
  showAlert: (type: AlertType, text: string) => void;
  /** Opens a styled Yes/No dialog; resolves true on confirm, false otherwise. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

// Auto-dismiss window for a toast (ms) so the stack never grows unbounded
const TOAST_TTL_MS = 5000;

interface ConfirmRequest {
  options: ConfirmOptions;
  resolve: (result: boolean) => void;
}

/**
 * App-wide feedback layer: transient toasts and a promise-based confirm dialog.
 * Mounted once near the root so any screen can surface errors or ask for
 * confirmation in the site's own style instead of native browser popups.
 */
export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(
    null
  );

  // Monotonic id source for toast keys
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showAlert = useCallback(
    (type: AlertType, text: string) => {
      const id = nextId.current++;
      setToasts(prev => [...prev, { id, type, text }]);
      setTimeout(() => dismiss(id), TOAST_TTL_MS);
    },
    [dismiss]
  );

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>(resolve => {
      setConfirmRequest({ options, resolve });
    });
  }, []);

  const value = useMemo<FeedbackContextValue>(
    () => ({ showAlert, confirm }),
    [showAlert, confirm]
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <AlertToaster toasts={toasts} onDismiss={dismiss} />
      {confirmRequest && (
        <ConfirmDialog
          options={confirmRequest.options}
          onConfirm={() => {
            confirmRequest.resolve(true);
            setConfirmRequest(null);
          }}
          onCancel={() => {
            confirmRequest.resolve(false);
            setConfirmRequest(null);
          }}
        />
      )}
    </FeedbackContext.Provider>
  );
};

/** Access the app-wide toast + confirm helpers. Must run under FeedbackProvider. */
export const useFeedback = (): FeedbackContextValue => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
};
