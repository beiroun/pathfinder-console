// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React from 'react';
import { RoleBadge } from '@ui/RoleBadge/RoleBadge.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { rolePresentationOf } from '../../utils/rolePresentation.ts';

/** The operator in the top bar: the login and the role badge; no avatar, no full name (hidden on a phone). */
export const UserInfo: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="pf-operator">
      <span className="pf-operator__name" title={user.username}>
        {user.username}
      </span>
      <RoleBadge role={rolePresentationOf(user.role)} surface="bar" />
    </div>
  );
};
