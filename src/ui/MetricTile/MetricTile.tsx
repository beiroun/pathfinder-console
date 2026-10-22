// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React from 'react';
import { Paper, Progress, Stack, Text } from '@mantine/core';
import { formatNumber } from '../../utils/formatNumber.ts';
import { CountUp } from '@ui/motion/CountUp.tsx';

interface MetricTileProps {
  label: string;
  value: number;
  /** Share of the total, 0–100; none – a total itself, no meter. */
  percent?: number;
  /** A problem count: the number in the accent when it is not zero. */
  attention?: boolean;
}

const percentText = (percent: number) =>
  `${percent.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} %`;

/**
 * A metric card: the number, its share of the total and a meter of the share on a track of the same hue; the label
 * under it. A problem that is there is the accent – the one place the eye should fall. The number counts up the first
 * time the tile is shown.
 */
export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  percent,
  attention = false
}) => {
  const isAlarming = attention && value > 0;
  return (
    <Paper withBorder p="md">
      <Stack gap={6}>
        <Text
          fz={28}
          fw={700}
          lh={1}
          lts="-0.02em"
          c={isAlarming ? 'var(--pf-accent-ink)' : 'var(--pf-brand-ink)'}
        >
          <CountUp value={value} format={formatNumber} />
        </Text>
        {percent !== undefined && (
          <>
            <Text size="xs" c="dimmed">
              {percentText(percent)} от всех
            </Text>
            <Progress
              value={Math.min(100, Math.max(0, percent))}
              size="sm"
              color={isAlarming ? 'accent' : 'brand'}
              aria-label={`${label}: ${percentText(percent)}`}
            />
          </>
        )}
        <Text size="sm" c="var(--pf-ink-soft)">
          {label}
        </Text>
      </Stack>
    </Paper>
  );
};
