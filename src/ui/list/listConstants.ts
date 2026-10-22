// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
/** Rows per page of every server list; the default is the middle of the set. */
export const LIST_PAGE_SIZES = [25, 50, 100, 200] as const;
export const LIST_DEFAULT_PAGE_SIZE = 50;

/** How long the search waits after the last key before it changes the URL. */
export const LIST_SEARCH_DEBOUNCE_MS = 400;

/** One choice for every list of the browser: an operator who hid the filters on a phone does not hide them again. */
export const FILTERS_COLLAPSED_STORAGE_KEY = 'pathfinder-console:filters-collapsed';

/** A viewport this low (a 1280×720 laptop) or this narrow (any phone, a tall one too: open, five fields stack into
 * five rows and push the table down to its floor) starts with the filters collapsed until the operator chooses. */
export const FILTERS_COLLAPSED_BY_DEFAULT_QUERY = '(max-height: 47.99em), (max-width: 47.99em)';
