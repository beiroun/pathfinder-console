// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useEffect, useState } from 'react';
import { api } from '../api/api';

const consoleVersion = import.meta.env.VITE_APP_VERSION || 'dev';

/** Running versions of the console and the server, and the maker. The server version is best-effort. */
const AppFooter = () => {
  const [serverVersion, setServerVersion] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .serverInfo()
      .then(info => {
        if (!cancelled) setServerVersion(info.version);
      })
      .catch(() => {
        // The footer is informational: a server that does not answer /info is not an error for the operator
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="app-footer">
      <span>
        Pathfinder Console {consoleVersion}
        {serverVersion ? ` · Server ${serverVersion}` : ''}
      </span>
      <span>
        <a href="https://github.com/beiroun/pathfinder" target="_blank" rel="noreferrer">
          Pathfinder
        </a>{' '}
        by{' '}
        <a href="https://84softworks.com" target="_blank" rel="noreferrer">
          84softworks
        </a>
      </span>
    </footer>
  );
};

export default AppFooter;
