// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React from 'react';
import { LoadingOverlay } from '@mantine/core';

/**
 * Dims and locks the list area while new data loads (a page, a filter). The colour is the page's own background:
 * the area pales in the light scheme and darkens in the dark one, equally visible in both. The parent must be
 * `position: relative` and must not scroll itself, or the cover would scroll away with the content.
 */
export const TableLoadingOverlay: React.FC<{
  visible: boolean;
  initial?: boolean;
}> = ({ visible, initial = false }) => (
  <LoadingOverlay
    visible={visible}
    zIndex={5}
    overlayProps={{
      color: 'var(--mantine-color-body)',
      backgroundOpacity: initial ? 0.85 : 0.6,
      blur: 1
    }}
    loaderProps={{ type: 'bars', size: 'md' }}
    transitionProps={{ duration: 150 }}
  />
);
