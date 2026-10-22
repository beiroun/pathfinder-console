// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React from 'react';
import { Button, Center, Stack, Text } from '@mantine/core';
import { IconFilterOff } from '@tabler/icons-react';

interface EmptyStateProps {
  isFiltered?: boolean;
  onResetFilters?: () => void;
  emptyText?: string;
}

/** «Нет данных» without filters, «Ничего не найдено» with a reset when filters are set. */
export const EmptyState: React.FC<EmptyStateProps> = ({
  isFiltered = false,
  onResetFilters,
  emptyText = 'Данных пока нет'
}) => (
  <Center py="xl">
    {isFiltered ? (
      <Stack align="center" gap="xs">
        <Text c="dimmed">Ничего не найдено по выбранным фильтрам</Text>
        {onResetFilters && (
          <Button
            size="xs"
            variant="light"
            leftSection={<IconFilterOff size={14} />}
            onClick={onResetFilters}
          >
            Сбросить фильтры
          </Button>
        )}
      </Stack>
    ) : (
      <Text c="dimmed">{emptyText}</Text>
    )}
  </Center>
);
