// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { axiosInstance } from './axiosInstance';
import type {
  AuthRequest,
  AuthResponse,
  BaseResponse,
  CreateQrRequest,
  QrImageFormat,
  QrView,
  ServerInfo,
  UpdateQrRequest
} from '../types';

/** The API of pathfinder-server (`/api/v1`). */
export const api = {
  // === AUTH ===
  login: async (credentials: AuthRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<BaseResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  // === PLATFORM ===
  // Public (permitAll on the server): the footer of the login page reads it too
  serverInfo: async (): Promise<ServerInfo> => {
    const response = await axiosInstance.get<BaseResponse<ServerInfo>>('/info');
    return response.data.data;
  },

  // === QR MANAGEMENT ===
  getQrCodes: async (): Promise<QrView[]> => {
    const response = await axiosInstance.get<BaseResponse<QrView[]>>('/qr');
    return response.data.data;
  },

  getQrCode: async (slug: string): Promise<QrView> => {
    const response = await axiosInstance.get<BaseResponse<QrView>>(
      `/qr/${encodeURIComponent(slug)}`
    );
    return response.data.data;
  },

  createQrCode: async (dto: CreateQrRequest): Promise<QrView> => {
    const response = await axiosInstance.post<BaseResponse<QrView>>('/qr', dto);
    return response.data.data;
  },

  updateQrCode: async (slug: string, dto: UpdateQrRequest): Promise<QrView> => {
    const response = await axiosInstance.put<BaseResponse<QrView>>(
      `/qr/${encodeURIComponent(slug)}`,
      dto
    );
    return response.data.data;
  },

  deleteQrCode: async (slug: string): Promise<void> => {
    await axiosInstance.delete(`/qr/${encodeURIComponent(slug)}`);
  },

  // The image endpoint is Bearer-protected, so a plain <img src> cannot reach it (the browser will not attach
  // the Authorization header). The bytes are fetched through the authed axios instance as a Blob; the caller
  // turns it into an object URL for preview and download.
  getQrImage: async (slug: string, format: QrImageFormat = 'png', size = 512): Promise<Blob> => {
    const response = await axiosInstance.get(`/qr/${encodeURIComponent(slug)}/image`, {
      params: { format, size },
      responseType: 'blob'
    });
    return response.data;
  }
};
