// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createContext, useState, type ReactNode, useContext, useEffect } from 'react';
import { Center, Loader } from '@mantine/core';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import type { User, Role, AuthResponse } from '../types';
import { api } from '../api/api';
import { AUTH_PATH } from '../routes/paths';

interface JwtPayload {
  sub: string; // username
  role: Role;
  name: string;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  login: (tokens: AuthResponse) => void;
  logout: () => void;
  isLoading: boolean;
}

const COOKIE_OPTIONS = { secure: true, sameSite: 'strict' as const };

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

/**
 * Provider component managing authentication state and token cookies.
 * The user identity (username / role / name) is read from the JWT claims.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user from token on mount
  useEffect(() => {
    const accessToken = Cookies.get('accessToken');
    const refreshToken = Cookies.get('refreshToken');

    /**
     * Restores the user from whichever token is still valid. The access token lives ~15m and
     * the browser drops its cookie once expired; if only the 7-day refresh token survives we
     * still keep the session (both tokens carry the same sub/role/name claims) and let the
     * axios interceptor renew the access token on the first request – instead of forcing a
     * needless re-login on every tab reopen after the access token lapses.
     */
    const resolveUserFromTokens = (): boolean => {
      for (const token of [accessToken, refreshToken]) {
        if (!token) continue;
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          if (decoded.exp * 1000 > Date.now()) {
            setUser({
              username: decoded.sub,
              role: decoded.role,
              name: decoded.name
            });
            return true;
          }
        } catch (e) {
          console.error('Failed to decode token', e);
        }
      }
      return false;
    };

    // No valid token at all – clear any stale cookies so route guards redirect to /auth
    if (!resolveUserFromTokens()) {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
    }
    setIsLoading(false);
  }, []);

  const login = (tokens: AuthResponse) => {
    Cookies.set('accessToken', tokens.access_token, {
      ...COOKIE_OPTIONS,
      expires: 1 / 96
    }); // ~15m
    Cookies.set('refreshToken', tokens.refresh_token, {
      ...COOKIE_OPTIONS,
      expires: 7
    });

    const decoded = jwtDecode<JwtPayload>(tokens.access_token);
    setUser({
      username: decoded.sub,
      role: decoded.role,
      name: decoded.name
    });
  };

  /**
   * Clears tokens and resets user state.
   * Performs a hard redirect to /auth so the entire React tree remounts cleanly.
   * Because of the hard redirect, any `navigate('/auth')` after `logout()` in
   * components is dead code – remove it to avoid confusion.
   */
  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('Logout request failed', e);
    } finally {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      setUser(null);
      window.location.href = AUTH_PATH;
    }
  };

  if (isLoading) {
    return (
      <Center h="100dvh">
        <Loader />
      </Center>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
