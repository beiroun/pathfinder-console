// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
// Set by the image build from appVersion of k8s/Chart.yaml (Dockerfile ARG APP_VERSION → VITE_APP_VERSION); a dev
// server or an image built without it reads "dev". Shown at the foot of the side column next to the server version.
export const consoleVersion: string = import.meta.env.VITE_APP_VERSION || 'dev';
