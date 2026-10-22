// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { notifications } from '@mantine/notifications';

/** «Не выполнено» with what failed, for 8 s. */
export const notifyFailure = (message: string) =>
  notifications.show({
    color: 'red',
    title: 'Не выполнено',
    message,
    autoClose: 8000
  });

/** «Готово» with what was done. */
export const notifySuccess = (message: string) =>
  notifications.show({
    color: 'teal',
    title: 'Готово',
    message
  });
