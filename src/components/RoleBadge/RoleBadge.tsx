// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { Badge, Tooltip } from '@mantine/core';

import { useLang } from '@/i18n/LangContext';
import { consoleRoleAbbreviations, consoleRoleColors } from '@/shared/consoleRoles';
import type { Role } from '@/types';

/** A role as its colour-coded abbreviation (ADM / RD); the full name is in the tooltip. */
export function RoleBadge({ role }: { role: Role }) {
  const { t } = useLang();

  return (
    <Tooltip label={t.roles.titles[role]}>
      <Badge variant="light" color={consoleRoleColors[role]}>
        {consoleRoleAbbreviations[role]}
      </Badge>
    </Tooltip>
  );
}
