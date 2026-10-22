// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from '@components/Layout/Layout.tsx';
import {
  PublicOnly,
  RemountOnSlug,
  RequireAdmin,
  RequireSession
} from '@components/RouteGuards/RouteGuards.tsx';
import { Auth } from '@pages/Auth/Auth.tsx';
import { NotFound } from '@pages/NotFound/NotFound.tsx';
import { QrCodesList } from '@pages/QrCodesList/QrCodesList.tsx';
import { QrCodeCard } from '@pages/QrCodeCard/QrCodeCard.tsx';
import { QrCodeCreate, QrCodeEdit } from '@pages/QrCodeForm/QrCodeForm.tsx';
import { AUTH_PATH, HOME_PATH, QR_CREATE_PATH, QR_LIST_PATH } from './paths.ts';

const EDIT_SECTION_LABEL = 'Изменение QR-кодов';

const router = createBrowserRouter([
  {
    path: AUTH_PATH,
    element: (
      <PublicOnly>
        <Auth />
      </PublicOnly>
    )
  },
  {
    element: (
      <RequireSession>
        <Layout />
      </RequireSession>
    ),
    children: [
      { index: true, element: <Navigate to={HOME_PATH} replace /> },
      // The former single page: old bookmarks land on the list
      { path: '/dashboard', element: <Navigate to={HOME_PATH} replace /> },
      { path: QR_LIST_PATH, element: <QrCodesList /> },
      {
        path: QR_CREATE_PATH,
        element: (
          <RequireAdmin sectionLabel={EDIT_SECTION_LABEL}>
            <QrCodeCreate />
          </RequireAdmin>
        )
      },
      {
        path: `${QR_LIST_PATH}/:slug`,
        element: (
          <RemountOnSlug>
            <QrCodeCard />
          </RemountOnSlug>
        )
      },
      {
        path: `${QR_LIST_PATH}/:slug/edit`,
        element: (
          <RequireAdmin sectionLabel={EDIT_SECTION_LABEL}>
            <RemountOnSlug>
              <QrCodeEdit />
            </RemountOnSlug>
          </RequireAdmin>
        )
      },
      // Inside the shell: the menu and the footer stay under hand on a wrong address
      { path: '*', element: <NotFound /> }
    ]
  }
]);

export default router;
