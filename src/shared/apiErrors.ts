// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import axios from 'axios';

import type { Copy } from '@/i18n/dict';

interface ErrorEnvelope {
  error?: { message?: string; localizedMessage?: string } | null;
}

/** A card of a deleted or never existing record explains itself instead of offering "retry". */
export function isNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

/**
 * Operator-facing text of a failed request: the envelope's localized message when the server sent one, otherwise a
 * generic line from the dictionary (`copy` is the active language's `api` block).
 */
export function describeApiError(error: unknown, copy: Copy['api']): string {
  if (!axios.isAxiosError(error)) {
    return copy.unknownError;
  }
  if (!error.response) {
    return error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
      ? copy.timeout
      : copy.unreachable;
  }
  const envelope = error.response.data as ErrorEnvelope | undefined;
  return envelope?.error?.localizedMessage ?? copy.requestFailed(String(error.response.status));
}
