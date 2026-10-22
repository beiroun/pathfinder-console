// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
/**
 * Application domain types and API contract (mirrors the DTOs of pathfinder-server, /api/v1).
 */

export type Role = 'ADMIN' | 'VIEWER';

export interface User {
  username: string;
  name: string | null;
  role: Role;
}

// === API wrapper (BaseApiResponse on the backend) ===

/** Structured error payload: technical message + user-facing localized message. */
export interface FieldError {
  message: string;
  localizedMessage: string;
}

export interface BaseResponse<T> {
  data: T;
  message: string;
  error?: FieldError;
}

// === Auth ===

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

// === QR ===

/** The four target platforms a single QR resolves to (order = backend resolve priority). */
export type Platform = 'ios' | 'huawei' | 'android' | 'desktop';

/** Management-API view of a QR target — the public redirect URL plus per-platform scan stats. */
export interface QrView {
  slug: string;
  name: string;
  redirect_url: string;
  target_android_url: string;
  target_ios_url: string;
  target_huawei_url: string;
  target_desktop_url: string;
  scan_count_android: number;
  scan_count_ios: number;
  scan_count_huawei: number;
  scan_count_desktop: number;
  scan_count_total: number;
  created_at: string; // ISO local date-time
  updated_at: string;
}

/** Create payload. `slug` is optional — the backend generates a unique one when omitted. */
export interface CreateQrRequest {
  name: string;
  slug?: string;
  target_android_url: string;
  target_ios_url: string;
  target_huawei_url: string;
  target_desktop_url: string;
}

/** Update payload. The slug is immutable (baked into printed QR codes), so it is not sent. */
export interface UpdateQrRequest {
  name: string;
  target_android_url: string;
  target_ios_url: string;
  target_huawei_url: string;
  target_desktop_url: string;
}

/** Output format for the rendered QR image. */
export type QrImageFormat = 'png' | 'svg';

/** What the public `GET /api/v1/info` returns: the footer shows the version («Сервер <version>»). */
export interface ServerInfo {
  name: string;
  version: string;
  license: string;
}
