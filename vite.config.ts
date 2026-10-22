// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // The same alias as tsconfig.json
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    // Local development against a pathfinder-server on 127.0.0.1:8080 (the same path nginx proxies in the image),
    // so the browser stays same-origin and the server needs no CORS. PATHFINDER_DEV_API points it elsewhere.
    proxy: {
      '/api': process.env.PATHFINDER_DEV_API ?? 'http://127.0.0.1:8080'
    }
  }
});
