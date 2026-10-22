// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, { type ReactNode, useRef } from 'react';
import { Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useFlashOnTextChange } from '@ui/motion/useFlashOnChange.ts';

interface PageSectionProps {
  title: ReactNode;
  /** A line under the title: what the section is for. */
  description?: ReactNode;
  /** Buttons at the right of the title. */
  actions?: ReactNode;
  children: ReactNode;
}

/** A framed section of a card or a form: the title, then its fields. */
export const PageSection: React.FC<PageSectionProps> = ({
  title,
  description,
  actions,
  children
}) => (
  <Paper withBorder radius="lg" p="md">
    <Stack gap="sm">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={2}>
          <Title order={5}>{title}</Title>
          {description && (
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          )}
        </Stack>
        {actions}
      </Group>
      {children}
    </Stack>
  </Paper>
);

/**
 * A label over a read-only value inside a section; a value that changes while the card is open (a refetch, an
 * action) flashes once.
 */
export const PageField: React.FC<{ label: string; children: ReactNode }> = ({
  label,
  children
}) => {
  const valueRef = useRef<HTMLDivElement>(null);
  useFlashOnTextChange(valueRef);
  return (
    <Stack gap={0}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text ref={valueRef} size="sm" component="div">
        {children}
      </Text>
    </Stack>
  );
};
