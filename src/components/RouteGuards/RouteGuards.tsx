// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, { Fragment, type ReactNode } from 'react';
import { Navigate, useLocation, useParams } from 'react-router';
import { Forbidden } from '@pages/Forbidden/Forbidden.tsx';
import { AUTH_PATH, HOME_PATH } from '@routes/paths.ts';
import { useAuth } from '../../context/AuthContext.tsx';

/** The console behind the login: without a session every address, an unknown one too, leads to the login. */
export const RequireSession: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to={AUTH_PATH} replace state={{ from: location }} />;
  return children;
};

/** The login page of a signed-in operator leads home. */
export const PublicOnly: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to={HOME_PATH} replace /> : children;
};

/**
 * Changing pages are for administrators: a viewer who opens one by its address reads «Недостаточно прав» on the same
 * address, the menu stays.
 */
export const RequireAdmin: React.FC<{
  sectionLabel: string;
  children: ReactNode;
}> = ({ sectionLabel, children }) => {
  const { user } = useAuth();
  return user?.role === 'ADMIN' ? children : <Forbidden sectionLabel={sectionLabel} />;
};

/**
 * A card or a form mounts afresh when only its `:slug` changes: the router keeps the component, and the state of the
 * previous code (its preview, an open confirmation, the fields of the form) would stay on screen.
 */
export const RemountOnSlug: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { slug } = useParams();
  return <Fragment key={slug}>{children}</Fragment>;
};
