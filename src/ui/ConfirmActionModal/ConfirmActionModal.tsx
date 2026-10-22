// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, { type ReactNode } from 'react';
import { Button, Group, Modal, Stack, type MantineColor } from '@mantine/core';

interface ConfirmActionModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  /** The primary colour by default; red for a destructive action. */
  color?: MantineColor;
  loading?: boolean;
  onConfirm: () => void;
}

/**
 * The confirmation of a changing action: «Отмена» and the action on the right; while the
 * request runs the modal cannot be closed, neither by the cross nor by a click outside.
 */
export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  opened,
  onClose,
  title,
  children,
  confirmLabel,
  color,
  loading = false,
  onConfirm
}) => (
  <Modal
    opened={opened}
    onClose={loading ? () => undefined : onClose}
    title={title}
    closeOnClickOutside={!loading}
  >
    <Stack gap="md">
      <Stack gap={6} fz="sm">
        {children}
      </Stack>
      <Group justify="flex-end" gap="xs">
        <Button variant="default" onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button color={color} loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </Group>
    </Stack>
  </Modal>
);
