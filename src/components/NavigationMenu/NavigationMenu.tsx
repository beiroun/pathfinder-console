// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React from 'react';
import { NavLink, ScrollArea } from '@mantine/core';
import { Link, useLocation } from 'react-router';
import { ShellFooter } from '@components/ShellFooter/ShellFooter.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { isNavGroup, NAV_LINKS, visibleNavEntries, type NavItemLink } from './navLinks.tsx';

interface NavigationMenuProps {
  /** Closes the drawer on a phone after a pick. */
  onNavigate?: () => void;
}

/**
 * Primary navigation in the side column: groups as small caps (not clickable), items with an icon, the active one
 * in the accent; the versions and the copyright at the foot. Items the operator's role may not open are not
 * rendered at all.
 */
export const NavigationMenu: React.FC<NavigationMenuProps> = ({ onNavigate }) => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const isUnder = (prefix: string) =>
    location.pathname === prefix || location.pathname.startsWith(`${prefix}/`);

  const isActive = (item: NavItemLink) => [item.to, ...(item.alsoActiveOn ?? [])].some(isUnder);

  const renderItem = (item: NavItemLink, root = false) => (
    <NavLink
      key={item.to}
      label={item.label}
      active={isActive(item)}
      leftSection={item.icon}
      component={Link}
      to={item.to}
      onClick={onNavigate}
      classNames={{
        root: root ? 'pf-nav__item pf-nav__item--root' : 'pf-nav__item'
      }}
    />
  );

  return (
    <>
      <ScrollArea className="pf-nav" scrollbars="y" type="auto">
        {visibleNavEntries(NAV_LINKS, isAdmin).map(entry =>
          isNavGroup(entry) ? (
            <NavLink
              key={entry.label}
              label={entry.label}
              defaultOpened
              classNames={{ root: 'pf-nav__group', chevron: 'pf-nav__chevron' }}
            >
              {entry.children.map(child => renderItem(child))}
            </NavLink>
          ) : (
            renderItem(entry, true)
          )
        )}
      </ScrollArea>
      <ShellFooter />
    </>
  );
};
