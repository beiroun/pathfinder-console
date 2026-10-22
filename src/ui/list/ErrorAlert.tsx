// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, { useEffect } from 'react';
import { Alert, Button, Group, Text } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import type { ListError } from '@ui/list/listTypes.ts';
import { apiErrorText } from '../../utils/apiError.ts';

interface ErrorAlertProps {
  error?: ListError;
  onRetry?: () => void;
  isRetrying?: boolean;
  title?: string;
}

/**
 * The human text of the server envelope with «Повторить»; the technical text goes to the console only. Rows loaded
 * before the error stay visible under it.
 */
export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onRetry,
  isRetrying,
  title = 'Ошибка загрузки'
}) => {
  const parsed = apiErrorText(error);

  useEffect(() => {
    if (parsed?.technical) console.error('Request failed:', parsed.status, parsed.technical);
  }, [parsed?.status, parsed?.technical]);

  if (!parsed) return null;

  return (
    <Alert icon={<IconAlertCircle size={16} />} title={title} color="red">
      <Group justify="space-between" wrap="nowrap" gap="md">
        <Text size="sm" style={{ overflowWrap: 'anywhere' }}>
          {parsed.message}
        </Text>
        {onRetry && (
          <Button
            size="xs"
            color="red"
            variant="light"
            leftSection={<IconRefresh size={14} />}
            loading={isRetrying}
            onClick={onRetry}
          >
            Повторить
          </Button>
        )}
      </Group>
    </Alert>
  );
};
