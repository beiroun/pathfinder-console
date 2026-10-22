// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, { type ReactNode, useRef } from 'react';
import { ActionIcon, Button, Group, Paper, Stack, Text, Title, Tooltip } from '@mantine/core';
import { IconArrowLeft, IconChevronLeft, IconChevronRight, IconRefresh } from '@tabler/icons-react';
import { Link } from 'react-router';
import { useFlashOnTextChange } from '@ui/motion/useFlashOnChange.ts';

export interface NeighbourLinks {
  /** The previous (older) and the next (newer) item, by the time it came in; none – the edge of the list. */
  previous?: string | null;
  next?: string | null;
  /** «Предыдущий звонок», «Следующий чат». */
  previousLabel: string;
  nextLabel: string;
}

interface EntityCardHeaderProps {
  title: ReactNode;
  /** The key next to the title (an id to copy). */
  entityKey?: ReactNode;
  /** Status badges next to the title, the same as in the list. */
  status?: ReactNode;
  /** The line under the title: « · »-separated facts. */
  subtitle?: ReactNode;
  /** «Действия» of the item; never in the list. */
  actions?: ReactNode;
  neighbours?: NeighbourLinks;
  onBack: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const NeighbourButton: React.FC<{
  to?: string | null;
  label: string;
  previous: boolean;
}> = ({ to, label, previous }) => {
  const icon = previous ? <IconChevronLeft size={18} /> : <IconChevronRight size={18} />;
  return (
    <Tooltip label={to ? label : `${label}: нет`}>
      {to ? (
        // `replace`: stepping through neighbours does not pile up history, «Назад» still leads to the list
        <ActionIcon component={Link} to={to} replace variant="subtle" size={30} aria-label={label}>
          {icon}
        </ActionIcon>
      ) : (
        <ActionIcon variant="subtle" size={30} aria-label={label} disabled>
          {icon}
        </ActionIcon>
      )}
    </Tooltip>
  );
};

const STATUS_BOX_STYLE = {
  display: 'inline-flex',
  borderRadius: 'var(--pf-r-md)'
} as const;

/**
 * The header card of an item: the title with the key and the status badges, the subtitle,
 * and at the right the actions, the step to the neighbouring item, «Назад» and «Обновить». Badges that change while the
 * card is open (a processing stage done) flash once.
 */
export const EntityCardHeader: React.FC<EntityCardHeaderProps> = ({
  title,
  entityKey,
  status,
  subtitle,
  actions,
  neighbours,
  onBack,
  onRefresh,
  isRefreshing
}) => {
  const statusRef = useRef<HTMLSpanElement>(null);
  useFlashOnTextChange(statusRef);
  return (
    <Paper withBorder p="md">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
        <Stack gap={6} style={{ minWidth: 0, flex: '1 1 320px' }}>
          <Group gap="sm" wrap="wrap">
            <Title order={3}>{title}</Title>
            {status && (
              // The badges keep their own row; the box only gives the flash its rounded edge
              <span ref={statusRef} style={STATUS_BOX_STYLE}>
                {status}
              </span>
            )}
          </Group>
          {entityKey}
          {subtitle && (
            <Text size="sm" c="dimmed">
              {subtitle}
            </Text>
          )}
        </Stack>
        <Group gap="xs" wrap="wrap">
          {actions}
          {neighbours && (
            <Group gap={2} wrap="nowrap">
              <NeighbourButton to={neighbours.previous} label={neighbours.previousLabel} previous />
              <NeighbourButton to={neighbours.next} label={neighbours.nextLabel} previous={false} />
            </Group>
          )}
          <Button
            size="xs"
            variant="subtle"
            leftSection={<IconArrowLeft size={14} />}
            onClick={onBack}
          >
            Назад
          </Button>
          <Button
            size="xs"
            variant="light"
            leftSection={<IconRefresh size={14} />}
            loading={isRefreshing}
            onClick={onRefresh}
          >
            Обновить
          </Button>
        </Group>
      </Group>
    </Paper>
  );
};
