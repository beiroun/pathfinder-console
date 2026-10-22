// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React from 'react';
import { ActionIcon, Tooltip, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';

/** Sun / moon button of the top bar; the choice is kept by Mantine's colour scheme manager (localStorage). */
export const ThemeModeSwitcher: React.FC = () => {
  const { setColorScheme } = useMantineColorScheme({ keepTransitions: true });
  const computedScheme = useComputedColorScheme('light');
  const isDark = computedScheme === 'dark';
  const label = isDark ? 'Светлая тема' : 'Тёмная тема';
  return (
    <Tooltip label={label}>
      <ActionIcon
        variant="transparent"
        size={36}
        className="pf-topbar-iconbtn"
        aria-label={label}
        onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
      >
        {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
      </ActionIcon>
    </Tooltip>
  );
};
