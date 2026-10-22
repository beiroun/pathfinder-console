// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { IconInfoCircle, IconQrcode, type TablerIcon } from '@tabler/icons-react';

import type { Copy } from '@/i18n/dict';

/** Route paths of the console, one place for links and the router. */
export const routePaths = {
  login: '/login',
  home: '/',
  qrCodes: '/qr-codes',
  about: '/about'
} as const;

/** The card page of one QR code, by its slug. */
export const qrCodePath = (slug: string) => `${routePaths.qrCodes}/${encodeURIComponent(slug)}`;

interface NavigationItem {
  path: string;
  /** Key of the label in the dictionary's `nav` block. */
  labelKey: Exclude<keyof Copy['nav'], 'menu'>;
  /**
   * Drawn before the label. The icon, not a dot, marks the active item; the choice per kind of page is the
   * 84softworks vocabulary, the same in every product console.
   */
  icon: TablerIcon;
}

/** Navigation entries in the order they appear in the side column (and the sheet on a phone). */
export const navigationItems: ReadonlyArray<NavigationItem> = [
  { path: routePaths.qrCodes, labelKey: 'qrCodes', icon: IconQrcode },
  { path: routePaths.about, labelKey: 'about', icon: IconInfoCircle }
];
