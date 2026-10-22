// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, { type ReactNode, useState } from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { Link } from 'react-router';
import { PathfinderMark } from '@components/PathfinderMark/PathfinderMark.tsx';
import { ThemeModeSwitcher } from '@components/ThemeModeSwitcher/ThemeModeSwitcher.tsx';
import { UserInfo } from '@components/UserInfo/UserInfo.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { HOME_PATH } from '@routes/paths.ts';
import { PRODUCT_NAME } from '../../utils/product.ts';

interface HeaderProps {
  /** Opens the navigation drawer on a phone; the login page has none. */
  burger?: ReactNode;
  /** The login page shows the bar without the operator and the log-out. */
  withSession?: boolean;
}

/**
 * The top bar of every page, full width above the side column: the white sign and the product name at the left
 * edge; theme, the operator and, last, the log-out at the right edge. The navigation lives in the column.
 */
export const Header: React.FC<HeaderProps> = ({ burger, withSession = true }) => {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // The session is dropped locally whatever the server answered, then the page reloads on the login (AuthContext)
  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
  };

  const brand = (
    <>
      <PathfinderMark className="pf-brandmark__sign" />
      <span className="pf-brandmark__product">{PRODUCT_NAME}</span>
    </>
  );

  return (
    <div className="pf-topbar">
      <div className="pf-topbar__left">
        {burger}
        {withSession ? (
          <Link to={HOME_PATH} className="pf-brandmark" aria-label={PRODUCT_NAME}>
            {brand}
          </Link>
        ) : (
          <span className="pf-brandmark">{brand}</span>
        )}
      </div>
      <div className="pf-topbar__actions">
        <ThemeModeSwitcher />
        {withSession && (
          <>
            <UserInfo />
            <Tooltip label="Выйти">
              <ActionIcon
                variant="transparent"
                size={36}
                className="pf-topbar-iconbtn"
                aria-label="Выйти"
                loading={isLoggingOut}
                onClick={handleLogout}
              >
                <IconLogout size={18} />
              </ActionIcon>
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );
};
