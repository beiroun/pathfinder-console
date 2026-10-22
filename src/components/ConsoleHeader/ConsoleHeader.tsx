// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ReactNode } from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { Link } from 'react-router';

import { BrandMark } from '@/components/BrandMark/BrandMark';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle/LanguageToggle';
import { RoleBadge } from '@/components/RoleBadge/RoleBadge';
import { useLang } from '@/i18n/LangContext';
import { brand } from '@/shared/brand';
import { routePaths } from '@/shared/navigation';
import { useAuth } from '@/context/AuthContext';

interface ConsoleHeaderProps {
  /** Opens the navigation drawer on a phone; the login page has none. */
  burger?: ReactNode;
}

/**
 * The top bar of every page, spanning the full width above the side column: the mark with the wordmark and the
 * byline at the left edge; at the right edge theme, language, then the operator (login, role) and, last, the
 * log-out. Without a session (the login page) the right edge holds only the switches. The navigation lives in
 * the side column (AppLayout), not here.
 */
export function ConsoleHeader({ burger }: ConsoleHeaderProps) {
  const { t } = useLang();
  const { user, logout } = useAuth();

  return (
    <div className="pf-topbar">
      <div className="pf-header">
        <div className="pf-header__left">
          {burger}
          <Link to={routePaths.home} className="pf-brandmark" aria-label={brand.product}>
            <BrandMark className="pf-brandmark__icon" />
            <span className="pf-wordmark">{brand.product}</span>
            <span className="pf-byline">{t.byline}</span>
          </Link>
        </div>
        <div className="pf-header__actions">
          <ColorSchemeToggle />
          <LanguageToggle />
          {user && (
            <>
              <div className="pf-header__operator">
                <span className="pf-header__operator-login" title={user.username}>
                  {user.username}
                </span>
                <RoleBadge role={user.role} />
              </div>
              <Tooltip label={t.header.logOut}>
                <ActionIcon
                  variant="transparent"
                  className="pf-topbar-iconbtn"
                  aria-label={t.header.logOut}
                  onClick={logout}
                >
                  <IconLogout size={18} />
                </ActionIcon>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
