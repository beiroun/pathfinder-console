// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useServerVersionQuery } from '@/api/queries';
import { useLang } from '@/i18n/LangContext';
import { brand, consoleVersion } from '@/shared/brand';

interface ConsoleFooterProps {
  /**
   * Three lines one under another for the foot of the side column; the default is one row under a hairline
   * (the login page, which has no column).
   */
  stacked?: boolean;
}

/**
 * The running versions (server from GET /info, which is public, so the login page shows it too) and the
 * copyright line, which names the website rather than an organization - there is none yet.
 */
export function ConsoleFooter({ stacked = false }: ConsoleFooterProps) {
  const { t } = useLang();
  const { data: platformInfo } = useServerVersionQuery();

  return (
    <footer className={stacked ? 'pf-footer pf-footer--stacked' : 'pf-footer'}>
      <span className="pf-footer__server">
        {t.footer.server} {platformInfo?.version ?? t.common.none}
      </span>
      <span className="pf-footer__console">
        {t.footer.console} {consoleVersion}
      </span>
      <span className="pf-footer__rights">
        {t.footer.copyright}{' '}
        <a href={brand.website} target="_blank" rel="noreferrer">
          {brand.websiteLabel}
        </a>
      </span>
    </footer>
  );
}
