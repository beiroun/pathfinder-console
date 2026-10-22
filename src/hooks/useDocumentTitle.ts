// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useEffect } from 'react';
import { PRODUCT_NAME } from '../utils/product.ts';

/** «Pathfinder QR · QR-коды / Все QR-коды»: the product, then the page path as its breadcrumb reads it. */
export const documentTitleOf = (segments: ReadonlyArray<string | null | undefined>): string => {
  const path = segments
    .map(segment => segment?.trim())
    .filter(Boolean)
    .join(' / ');
  return path ? `${PRODUCT_NAME} · ${path}` : PRODUCT_NAME;
};

/**
 * Names the browser tab after the page: «<product> · <section> / <page>», so open tabs,
 * history entries and bookmarks tell the pages apart in a single-page application that never reloads.
 *
 * Called by the page itself (through `DescriptionPage`), never by the shell: a child's effect runs before its
 * parent's, so a title set by the layout would overwrite the page's. On unmount the tab falls back to the product
 * name; on a route change React runs the old page's cleanup before the new page's effect, so nothing flickers.
 */
export const useDocumentTitle = (segments: ReadonlyArray<string | null | undefined>): void => {
  const title = documentTitleOf(segments);

  useEffect(() => {
    document.title = title;
    return () => {
      document.title = PRODUCT_NAME;
    };
  }, [title]);
};
