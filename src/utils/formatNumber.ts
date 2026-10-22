// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
/** `12 345` with the Russian digit grouping; `–` for nothing. */
export const formatNumber = (value?: number | null): string =>
  value == null ? '–' : value.toLocaleString('ru-RU');
