// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React from 'react';
import { useServerVersionQuery } from '../../api/queries.ts';
import { consoleVersion } from '../../utils/appVersion.ts';

interface ShellFooterProps {
  /** `stacked` - three lines at the foot of the side column; `row` - one centred line under the login card. */
  layout?: 'stacked' | 'row';
}

const WEBSITE_URL = 'https://84softworks.com';
const WEBSITE_LABEL = '84softworks.com';

/**
 * The versions of the server and the console and the maker. The server version comes from the public
 * `GET /api/v1/info`; while the server is down the line reads "Сервер –" and nothing else breaks.
 */
export const ShellFooter: React.FC<ShellFooterProps> = ({ layout = 'stacked' }) => {
  const { data: server } = useServerVersionQuery();
  const serverVersion = server?.version || '–';
  const year = new Date().getFullYear();
  const website = (
    <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer">
      {WEBSITE_LABEL}
    </a>
  );

  if (layout === 'row') {
    return (
      <div className="pf-footer pf-footer--row">
        <span>Сервер {serverVersion}</span>
        <span>·</span>
        <span>Консоль {consoleVersion}</span>
        <span>·</span>
        <span>© {year} 84softworks</span>
        <span>·</span>
        {website}
      </div>
    );
  }

  return (
    <div className="pf-footer">
      <div>Сервер {serverVersion}</div>
      <div>Консоль {consoleVersion}</div>
      {/* The maker's name is its domain: one link, so the line fits the 240 px column */}
      <div>
        © {year} · {website}
      </div>
    </div>
  );
};
