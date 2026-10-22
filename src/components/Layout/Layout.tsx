// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, { useRef, useState } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { AppShell, Burger, getDefaultZIndex } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { Header } from '@components/Header/Header.tsx';
import { NavigationMenu } from '@components/NavigationMenu/NavigationMenu.tsx';
import { usePageEnterMotion } from '@ui/motion/usePageEnterMotion.ts';

/**
 * Shell of every page behind the login: the top bar above the side column (a sheet under the bar on a phone),
 * the page in the working area. Sizes are the console's (56 px bar, 240 px column, the fluid gutter
 * `--pf-gutter`: 16 px on a small laptop and a phone, growing to 32 px on full HD).
 */
export const Layout: React.FC = () => {
  const { pathname } = useLocation();
  const [navOpened, setNavOpened] = useState(false);
  const [navOpenedOn, setNavOpenedOn] = useState(pathname);
  // Any navigation closes the phone menu: a menu item, the brand link, Back. Adjusted during render, not in an
  // effect, so the new page never paints under the open sheet
  if (navOpenedOn !== pathname) {
    setNavOpenedOn(pathname);
    setNavOpened(false);
  }
  const closeNav = () => setNavOpened(false);
  const mainRef = useRef<HTMLElement>(null);
  usePageEnterMotion(mainRef);
  useHotkeys([['Escape', closeNav]]);
  // Above the sticky blocks of pages (100), below Mantine's modals (200), popovers and tooltips (300). Mantine puts
  // the column one step above the shell; the phone scrim sits at the shell's level, under the column, and the bar
  // one more step up, so its bottom line runs over the column's edge at a fractional browser zoom
  const shellZIndex = getDefaultZIndex('modal') - 3;
  return (
    <AppShell
      padding="var(--pf-gutter)"
      header={{ height: 56 }}
      navbar={{
        width: 240,
        breakpoint: 'sm',
        collapsed: { mobile: !navOpened }
      }}
      zIndex={shellZIndex}
    >
      <AppShell.Header withBorder={false} zIndex={shellZIndex + 2}>
        <Header
          burger={
            <Burger
              opened={navOpened}
              onClick={() => setNavOpened(opened => !opened)}
              hiddenFrom="sm"
              size="sm"
              color="var(--pf-topbar-fg)"
              aria-label="Меню"
              aria-expanded={navOpened}
            />
          }
        />
      </AppShell.Header>

      <AppShell.Navbar withBorder={false} className="pf-sidenav" mod={{ opened: navOpened }}>
        <NavigationMenu onNavigate={closeNav} />
      </AppShell.Navbar>

      <AppShell.Main ref={mainRef}>
        <Outlet />
      </AppShell.Main>

      {/* The page dimmed under the phone menu: a tap on it closes the menu (shell.css, phone only) */}
      {navOpened && (
        <div
          className="pf-sidenav-scrim"
          style={{ zIndex: shellZIndex }}
          onClick={closeNav}
          aria-hidden="true"
        />
      )}

      {/* A new page starts at its top, Back returns to where the reader was: a card opened from the bottom of a
          long card (a cross link, the next record) opened scrolled down. Filters, tabs and journals written to the
          address keep the scroll (`preventScrollReset`) */}
      <ScrollRestoration />
    </AppShell>
  );
};
