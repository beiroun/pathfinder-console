// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import axios from 'axios';
import Cookies from 'js-cookie';

// Same-origin by default: the console's nginx (and vite's dev server) proxy /api to the server. An absolute base
// is compiled in only for a console served from another name than its API (see vite-env.d.ts).
const API_URL = import.meta.env.VITE_API_BASE_URL?.trim()
  ? import.meta.env.VITE_API_BASE_URL.trim().replace(/\/+$/, '')
  : '/api/v1';

const COOKIE_OPTIONS = { secure: true, sameSite: 'strict' as const };

/**
 * Configured Axios instance with interceptors for JWT injection and auto-refresh.
 * Uses a queue to prevent parallel refresh requests when multiple 401s arrive at once.
 */
export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// --- Refresh queue to serialize concurrent token renewals ---

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/** Resolves or rejects every queued request once the single refresh attempt settles. */
const processQueue = (token: string | null, error: unknown = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  refreshQueue = [];
};

// The session endpoints answer 401 for wrong credentials or a stale refresh token; that is an answer to show,
// not a session to renew, so the interceptor leaves them alone.
const isSessionEndpoint = (url: string | undefined) =>
  !!url && (url.endsWith('/auth/login') || url.endsWith('/auth/refresh'));

// Request interceptor: attach access token
axiosInstance.interceptors.request.use(
  config => {
    const token = Cookies.get('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor: handle auth errors and attempt refresh (with queue)
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // The server answers an expired, absent or revoked access token with 401 and a genuine role mismatch with
    // 403. Both run refresh-and-retry: a real 403 simply fails again after the retry and rejects via the _retry
    // guard below.
    const status = error.response?.status;
    const isAuthError = status === 401 || status === 403;

    if (!isAuthError || originalRequest._retry || isSessionEndpoint(originalRequest?.url)) {
      return Promise.reject(error);
    }

    // If a refresh is already in flight, queue this request instead of firing another one
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then(newToken => {
        // Mark the retry so a repeated auth failure rejects instead of looping into a second refresh
        originalRequest._retry = true;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = Cookies.get('refreshToken');
    if (!refreshToken) {
      // Reset the flag here: this early return sits outside the try/finally below, so without it a blocked
      // redirect would leave isRefreshing stuck true and every later request queued forever.
      isRefreshing = false;
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      window.location.href = '/auth';
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(`${API_URL}/auth/refresh`, {
        refresh_token: refreshToken
      });

      const newAccess = data.data.access_token;
      const newRefresh = data.data.refresh_token;

      Cookies.set('accessToken', newAccess, {
        ...COOKIE_OPTIONS,
        expires: 1 / 96
      }); // ~15m
      Cookies.set('refreshToken', newRefresh, {
        ...COOKIE_OPTIONS,
        expires: 7
      });

      // Unblock all queued requests with the fresh token
      processQueue(newAccess);

      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Refresh failed - reject every queued request and force re-login
      processQueue(null, refreshError);
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      window.location.href = '/auth';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
