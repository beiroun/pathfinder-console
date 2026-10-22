// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, { type ReactNode } from 'react';
import { Button, Menu, Stack, Text } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

export interface EntityAction {
  key: string;
  label: string;
  icon: ReactNode;
  /** `red` for a destructive action; the primary colour otherwise. */
  color?: string;
  onClick: () => void;
  /** Why the action is unavailable right now: the item stays visible, disabled, with this reason under its label. */
  disabledReason?: string;
  /** A divider above the item: management, then copy, then deletion. */
  dividerBefore?: boolean;
}

interface EntityActionsMenuProps {
  actions: EntityAction[];
  /** Spins while an action of the item is running. */
  loading?: boolean;
}

/**
 * «Действия» in the header card of an item: every action of the item lives here, the list
 * table has none. A changing action confirms itself (a modal of the
 * caller) before it runs.
 */
export const EntityActionsMenu: React.FC<EntityActionsMenuProps> = ({
  actions,
  loading = false
}) => (
  <Menu position="bottom-end" width={260}>
    <Menu.Target>
      <Button
        size="xs"
        variant="light"
        loading={loading}
        rightSection={<IconChevronDown size={14} />}
      >
        Действия
      </Button>
    </Menu.Target>
    <Menu.Dropdown>
      {actions.map(action => (
        <React.Fragment key={action.key}>
          {action.dividerBefore && <Menu.Divider />}
          {/* The reason is a line of the item, not a tooltip: a phone has no hover to show one */}
          <Menu.Item
            leftSection={action.icon}
            color={action.color}
            disabled={Boolean(action.disabledReason)}
            onClick={action.onClick}
          >
            {action.disabledReason ? (
              <Stack gap={0}>
                {action.label}
                <Text size="xs" c="dimmed">
                  {action.disabledReason}
                </Text>
              </Stack>
            ) : (
              action.label
            )}
          </Menu.Item>
        </React.Fragment>
      ))}
    </Menu.Dropdown>
  </Menu>
);
