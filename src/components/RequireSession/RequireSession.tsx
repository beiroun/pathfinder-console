// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { useAuth } from '@/context/AuthContext';
import { routePaths } from '@/shared/navigation';

/** Where the login page sends the operator back to after a successful login. */
export interface LoginRedirectState {
  from?: string;
}

/** Lets only a logged-in operator through; everyone else lands on the login page and comes back afterwards. */
export function RequireSession({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const redirectState: LoginRedirectState = { from: location.pathname + location.search };
    return <Navigate to={routePaths.login} replace state={redirectState} />;
  }
  return children;
}
