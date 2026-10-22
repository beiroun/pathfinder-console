// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
/** The list of QR codes: the only section and the home of the console. */
export const QR_LIST_PATH = '/qr';
export const HOME_PATH = QR_LIST_PATH;
export const AUTH_PATH = '/auth';

// Creation lives outside /qr/…: «new» is a valid slug, a /qr/new route would shadow such a code's card
export const QR_CREATE_PATH = '/create-qr';

export const qrCardPath = (slug: string) => `${QR_LIST_PATH}/${encodeURIComponent(slug)}`;

export const qrEditPath = (slug: string) => `${qrCardPath(slug)}/edit`;
