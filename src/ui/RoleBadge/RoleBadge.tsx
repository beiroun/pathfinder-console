// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React from 'react';
import { Badge, Text, Tooltip } from '@mantine/core';
import type { RolePresentation } from '../../utils/rolePresentation.ts';
import { STATUS_BADGE_SIZE } from '@ui/statusBadgeSize.ts';

interface RoleBadgeProps {
  role: RolePresentation | null;
  /** `bar` - on the dark top bar, the fallback text takes the bar's muted colour. */
  surface?: 'page' | 'bar';
}

/**
 * A role as its colour-coded abbreviation with the full name in the tooltip (the ThunderVox console pattern);
 * when the backend sends no abbreviation for the code, the full name is shown as plain text instead.
 */
export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, surface = 'page' }) => {
  if (!role) {
    return null;
  }
  if (!role.abbreviation) {
    return (
      <Text
        span
        size="sm"
        className={surface === 'bar' ? 'pf-operator__role' : undefined}
        c={surface === 'bar' ? undefined : 'dimmed'}
      >
        {role.displayName}
      </Text>
    );
  }
  return (
    <Tooltip label={role.displayName}>
      <Badge
        variant="light"
        color={role.color ?? 'gray'}
        size={surface === 'bar' ? 'sm' : STATUS_BADGE_SIZE}
      >
        {role.abbreviation}
      </Badge>
    </Tooltip>
  );
};
