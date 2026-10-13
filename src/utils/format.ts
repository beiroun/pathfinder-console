// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
/**
 * Small presentation helpers shared across the QR screens.
 */

/** Formats an ISO local date-time (no timezone, e.g. "2026-08-03T12:30:00") for ru-RU display. */
export const formatDateTime = (iso: string | null | undefined): string => {
  if (!iso) return '–';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('ru-RU');
};

/**
 * Copies text to the clipboard, resolving to whether it succeeded so the caller
 * can toast accordingly. Falls back silently on browsers without the async API.
 */
export const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * Pulls the backend's user-facing error text (BaseApiResponse.error.localizedMessage) out of a
 * rejected axios error, without leaking `any`. Returns undefined when the shape doesn't match,
 * so callers can fall back to a generic message.
 */
export const apiErrorMessage = (error: unknown): string | undefined => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (
      error as {
        response?: { data?: { error?: { localizedMessage?: string } } };
      }
    ).response;
    return response?.data?.error?.localizedMessage;
  }
  return undefined;
};

/**
 * Triggers a browser download for an in-memory Blob (used for the rendered QR image,
 * which is fetched as bytes through the authed axios instance – there is no public URL).
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Release the object URL on the next tick so the download has time to start
  setTimeout(() => URL.revokeObjectURL(url), 0);
};
