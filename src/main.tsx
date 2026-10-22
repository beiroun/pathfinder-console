// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
// The console's skin after Mantine's own layer: fonts → tokens → shell blocks → motion → page-local styles
import './theme/fonts.css';
import './theme/tokens.css';
import './theme/shell.css';
import './theme/motion.css';
import './index.css';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { appTheme } from './theme/themeMantine';
import App from './App';

// defaultColorScheme "auto" follows the operating system until the operator picks a theme; the same default is
// applied before React mounts by the inline script in index.html, so a dark console never flashes white
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={appTheme} defaultColorScheme="auto">
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  </StrictMode>
);
