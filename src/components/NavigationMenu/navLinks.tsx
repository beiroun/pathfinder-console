// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ReactNode } from 'react';
import { IconQrcode } from '@tabler/icons-react';
import { QR_CREATE_PATH, QR_LIST_PATH } from '@routes/paths.ts';

export interface NavItemLink {
  label: string;
  /** Where the item leads: the list of the section. */
  to: string;
  icon: ReactNode;
  /**
   * Other paths of the same section (its create pages, its cards): the item stays lit on them. The lists and their
   * create pages do not share a prefix (`/banners` and `/create-banner`), so the prefix alone is not enough.
   */
  alsoActiveOn?: string[];
  /** Only for administrators: the item, its page and the whole group without other items disappear for the rest. */
  adminOnly?: boolean;
}

export interface NavGroupLink {
  label: string;
  icon: ReactNode;
  children: NavItemLink[];
}

// A group only unfolds and leads nowhere; an item at the root is a link
export type NavEntry = NavGroupLink | NavItemLink;

export const isNavGroup = (entry: NavEntry): entry is NavGroupLink => 'children' in entry;

const ITEM_ICON_SIZE = 20;

/** The menu filtered by the operator's role: hidden items are not rendered, an emptied group disappears. */
export const visibleNavEntries = (entries: NavEntry[], isAdmin: boolean): NavEntry[] => {
  const isVisible = (item: NavItemLink) => !item.adminOnly || isAdmin;

  return entries.flatMap<NavEntry>(entry => {
    if (!isNavGroup(entry)) return isVisible(entry) ? [entry] : [];
    const children = entry.children.filter(isVisible);
    return children.length ? [{ ...entry, children }] : [];
  });
};

/** The menu of Pathfinder QR: one section, the QR codes; their cards and forms keep the item lit. */
export const NAV_LINKS: NavEntry[] = [
  {
    label: 'QR-коды',
    to: QR_LIST_PATH,
    alsoActiveOn: [QR_CREATE_PATH],
    icon: <IconQrcode size={ITEM_ICON_SIZE} />
  }
];
