// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.

const dateTimeFormat = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

// Safari reads at most milliseconds; the server's LocalDateTime may carry micro- or nanoseconds
const LONG_FRACTION = /(\.\d{3})\d+/;

/**
 * The moment of a pathfinder-server timestamp. The server keeps LocalDateTime in its own zone (PF_TZ of the
 * deployment, UTC by default) and sends it without an offset, so a zone-less value is shown as the server's wall
 * time, unshifted; a value with an offset is a real moment and is shown in the browser's zone.
 */
export const serverMoment = (iso?: string | null): Date | null => {
  if (!iso) return null;
  const trimmed = iso.replace(LONG_FRACTION, '$1');
  // A zone-less ISO date-time is parsed as local time: the wall clock reads the same as on the server
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** `14.10.2026, 15:32`; `–` for nothing. */
export const formatDateTime = (iso?: string | null): string => {
  const date = serverMoment(iso);
  return date ? dateTimeFormat.format(date) : '–';
};
