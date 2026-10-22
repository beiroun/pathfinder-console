// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useMediaQuery } from '@mantine/hooks';

/** Below Mantine's `sm` (48em): the width the shell turns the side column into a sheet at (shell.css). */
export const PHONE_MEDIA_QUERY = '(max-width: 47.99em)';

/** A phone-width viewport. Read on the first render, so a phone never paints the desktop controls first. */
export const useIsPhone = () =>
  useMediaQuery(PHONE_MEDIA_QUERY, window.matchMedia(PHONE_MEDIA_QUERY).matches, {
    getInitialValueInEffect: false
  });
