// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
// Token-driven order after Mantine's own layer: fonts → tokens → page blocks → page-local styles
import '@/theme/fonts.css';
import '@/theme/tokens.css';
import '@/theme/console.css';
import '@/index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { MantineProvider } from '@mantine/core';

import { AuthProvider } from '@/context/AuthContext';
import { LangProvider } from '@/i18n/LangContext';
import { router } from '@/routes/routes';
import { themeMantine } from '@/theme/themeMantine';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('index.html has no #root element');
}

// defaultColorScheme "auto" follows the operating system until the operator picks a theme; the same default is
// applied before React mounts by the inline script in index.html, so there is no flash of the wrong scheme
createRoot(rootElement).render(
  <StrictMode>
    <MantineProvider theme={themeMantine} defaultColorScheme="auto">
      <LangProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </LangProvider>
    </MantineProvider>
  </StrictMode>
);
