// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { Role } from '../types';

export interface RolePresentation {
  code: string;
  displayName: string;
  abbreviation?: string;
  /** Mantine colour name of the console palette: accent, brand, teal, yellow, gray, red. */
  color?: string;
}

// The two roles of pathfinder-server. The server sends only the role code in the JWT, so the console keeps their
// abbreviation and colour itself
const ROLE_PRESENTATION: Record<Role, Omit<RolePresentation, 'code'>> = {
  ADMIN: {
    displayName: 'Администратор',
    abbreviation: 'ADM',
    color: 'brand'
  },
  VIEWER: { displayName: 'Наблюдатель', abbreviation: 'RD', color: 'gray' }
};

/** The badge of a role code; an unknown code is shown as its name in plain text. */
export const rolePresentationOf = (code: string | null | undefined): RolePresentation | null => {
  if (!code) return null;
  const known = ROLE_PRESENTATION[code as Role];
  return known ? { code, ...known } : { code, displayName: code };
};
