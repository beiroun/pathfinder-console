// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { Role } from '@/types';

/**
 * What each console role may do - the same rules the server enforces (SecurityConfig: reads for both roles, changes
 * for ADMIN). The console only hides what would be refused anyway; the server stays the authority.
 */

/** Every role, highest first - the order of the legend. */
export const consoleRoles: ReadonlyArray<Role> = ['ADMIN', 'VIEWER'];

/** Language-invariant short form shown in badges; the full names are in the dictionary. */
export const consoleRoleAbbreviations: Record<Role, string> = {
  ADMIN: 'ADM',
  VIEWER: 'RD'
};

/** Brand palette: administrators in the navy, viewers neutral. */
export const consoleRoleColors: Record<Role, string> = {
  ADMIN: 'brand',
  VIEWER: 'gray'
};

/** Creating, editing and deleting QR codes. */
export function mayChangeQrCodes(role: Role | undefined): boolean {
  return role === 'ADMIN';
}
