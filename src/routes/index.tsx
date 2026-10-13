// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createBrowserRouter, Navigate } from 'react-router';
import type { JSX } from 'react';
import Auth from '../pages/Auth/Auth';
import Dashboard from '../pages/Dashboard/Dashboard';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

/**
 * Route guard: requires a logged-in user whose role is in [allowedRoles].
 * Both ADMIN and VIEWER share the dashboard; write actions inside it are gated separately.
 */
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element; allowedRoles: Role[] }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// Created once outside the React tree, as React Router expects
export const router = createBrowserRouter([
  { path: '/auth', element: <Auth /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'VIEWER']}>
        <Dashboard />
      </ProtectedRoute>
    )
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> }
]);
