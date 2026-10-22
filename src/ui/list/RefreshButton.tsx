// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React from 'react';
import { Button } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';

interface RefreshButtonProps {
  /** Spins while any request of the list is in flight, polling included; the table itself is not covered. */
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({ isRefreshing, onRefresh }) => (
  <Button
    size="xs"
    variant="light"
    leftSection={<IconRefresh size={14} />}
    loading={isRefreshing}
    onClick={onRefresh}
  >
    Обновить
  </Button>
);
