// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createBrowserRouter, Navigate } from 'react-router';

import { AppLayout } from '@/components/AppLayout/AppLayout';
import { RequireSession } from '@/components/RequireSession/RequireSession';
import { About } from '@/pages/About/About';
import { Login } from '@/pages/Login/Login';
import { NotFound } from '@/pages/NotFound/NotFound';
import { QrCodeCard } from '@/pages/QrCodeCard/QrCodeCard';
import { QrCodes } from '@/pages/QrCodes/QrCodes';
import { Stats } from '@/pages/Stats/Stats';
import { pageHandle } from '@/shared/documentTitle';
import { routePaths } from '@/shared/navigation';

// Created once outside the React tree, as React Router 8 requires for data routers.
// `handle.page` names the page's copy (title and kicker) in the dictionary: useDocumentTitle() puts the title in
// the browser tab and PageHeader renders the same text as the heading, so the two never drift apart.
export const router = createBrowserRouter([
  { path: routePaths.login, element: <Login />, handle: pageHandle('login') },
  // Addresses of the console before 0.3.0: old bookmarks land where they meant to
  { path: '/auth', element: <Navigate to={routePaths.login} replace /> },
  {
    path: routePaths.home,
    element: (
      <RequireSession>
        <AppLayout />
      </RequireSession>
    ),
    children: [
      { index: true, element: <Navigate to={routePaths.qrCodes} replace /> },
      { path: 'dashboard', element: <Navigate to={routePaths.qrCodes} replace /> },
      { path: routePaths.qrCodes, element: <QrCodes />, handle: pageHandle('qrCodes') },
      // Not qrCodePath(): it encodes the slug, and the pattern's colon must stay a colon
      {
        path: `${routePaths.qrCodes}/:slug`,
        element: <QrCodeCard />,
        handle: pageHandle('qrCode')
      },
      { path: routePaths.stats, element: <Stats />, handle: pageHandle('stats') },
      { path: routePaths.about, element: <About />, handle: pageHandle('about') },
      { path: '*', element: <NotFound />, handle: pageHandle('notFound') }
    ]
  }
]);
