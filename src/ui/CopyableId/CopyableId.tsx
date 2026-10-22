// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React from 'react';
import { ActionIcon, CopyButton, Group, Text, Tooltip } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';

interface CopyableIdProps {
  /** A short name before the value («звонок», «коммутация»); none – the value alone. */
  label?: string;
  value: string | null | undefined;
}

/**
 * An identifier in monospace with the copy icon; «Скопировано» for 2 s. Empty – «–» without the icon.
 */
export const CopyableId: React.FC<CopyableIdProps> = ({ label, value }) => (
  <Group gap={4} wrap="nowrap" style={{ minWidth: 0 }}>
    {label && (
      <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
        {label}:
      </Text>
    )}
    <Text size="xs" ff="monospace" truncate title={value ?? undefined}>
      {value || '–'}
    </Text>
    {value && (
      <CopyButton value={value} timeout={2000}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? 'Скопировано' : 'Копировать'}>
            <ActionIcon
              size="xs"
              variant="subtle"
              color={copied ? 'teal' : 'gray'}
              onClick={copy}
              aria-label={label ? `Копировать: ${label}` : 'Копировать'}
              style={{ flexShrink: 0 }}
            >
              {copied ? (
                <IconCheck size={12} className="pf-swap-in" />
              ) : (
                <IconCopy size={12} className="pf-swap-in" />
              )}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    )}
  </Group>
);
