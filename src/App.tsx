// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { RouterProvider } from 'react-router';
import router from './routes';
import { AuthProvider } from './context/AuthContext';

/**
 * Root application component initializing providers and router.
 */
const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
