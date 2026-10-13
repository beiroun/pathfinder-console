// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { RouterProvider } from 'react-router/dom';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { FeedbackProvider } from './context/FeedbackContext';

/** Root application component initializing providers and router. */
const App = () => (
  <FeedbackProvider>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </FeedbackProvider>
);

export default App;
