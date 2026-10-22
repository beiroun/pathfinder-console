// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React from 'react';
import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconSearchOff } from '@tabler/icons-react';
import { apiErrorStatus, apiErrorText } from '../../utils/apiError.ts';

interface CardLoadErrorProps {
  error: unknown;
  /** «QR-код abc не найден» and why that happens; shown for a 404 instead of the server's text. */
  notFoundTitle: string;
  notFoundHint: string;
  onRetry: () => void;
  isRetrying: boolean;
  onToList: () => void;
}

/**
 * A card that could not load: a 404 explains in human words and leads to the list, without
 * «Повторить»; any other error shows the server's text with «Повторить».
 */
export const CardLoadError: React.FC<CardLoadErrorProps> = ({
  error,
  notFoundTitle,
  notFoundHint,
  onRetry,
  isRetrying,
  onToList
}) => {
  const isNotFound = apiErrorStatus(error) === 404;
  const text = apiErrorText(error);
  if (text?.technical) console.error('Card failed to load:', text.technical);
  return (
    <Alert
      color={isNotFound ? 'gray' : 'red'}
      icon={isNotFound ? <IconSearchOff size={18} /> : <IconAlertCircle size={18} />}
      title={isNotFound ? notFoundTitle : 'Ошибка загрузки'}
    >
      <Stack gap="sm">
        <Text size="sm">{isNotFound ? notFoundHint : text?.message}</Text>
        <Group gap="xs">
          {!isNotFound && (
            <Button size="xs" variant="light" loading={isRetrying} onClick={onRetry}>
              Повторить
            </Button>
          )}
          <Button size="xs" variant="light" color="gray" onClick={onToList}>
            К списку
          </Button>
        </Group>
      </Stack>
    </Alert>
  );
};
