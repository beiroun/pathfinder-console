// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React from 'react';
import { Group, Pill } from '@mantine/core';
import type { ActiveFilterChip } from '@ui/list/listTypes.ts';

/**
 * Filters that came with a link from another screen («Слаг: …»): they have no field of their own, so
 * the chip is the only place to see and drop them.
 */
export const ActiveFilterChips: React.FC<{ chips: ActiveFilterChip[] }> = ({ chips }) =>
  chips.length ? (
    <Group gap="xs" wrap="wrap">
      {chips.map(chip => (
        <Pill
          key={chip.key}
          size="md"
          withRemoveButton
          onRemove={chip.onRemove}
          removeButtonProps={{ 'aria-label': `Убрать фильтр «${chip.label}»` }}
        >
          {chip.label}
        </Pill>
      ))}
    </Group>
  ) : null;
