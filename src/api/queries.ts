// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { api } from './api';
import { useApiQuery } from './useApiQuery';
import type { ServerInfo } from '../types';

const loadQrCodes = () => api.getQrCodes();

// One request per page load: the footer of the column and the one under the login card share it; a failure is not
// cached, so the next mount asks again
let serverVersionRequest: Promise<ServerInfo> | null = null;
const loadServerVersion = () => {
  serverVersionRequest ??= api.serverInfo().catch(error => {
    serverVersionRequest = null;
    throw error;
  });
  return serverVersionRequest;
};

const ALL_QR_CODES = 'all';
const SERVER_VERSION = 'version';

/** Every QR code at once: the list searches, sorts and pages in memory. */
export const useQrCodesQuery = () => useApiQuery(ALL_QR_CODES, loadQrCodes);

/** One QR code by its slug; none – nothing is requested. */
export const useQrCodeQuery = (slug: string | undefined) =>
  useApiQuery(slug ?? null, api.getQrCode);

export const useServerVersionQuery = () => useApiQuery(SERVER_VERSION, loadServerVersion);
