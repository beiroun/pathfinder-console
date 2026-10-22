// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, { useLayoutEffect, useRef } from 'react';
import { Tabs, type TabsListProps } from '@mantine/core';

/** Scrolls the row, never the page, so that the active tab stands whole in it. */
const revealActiveTab = (list: HTMLElement) => {
  const tab = list.querySelector<HTMLElement>('[role="tab"][data-active]');
  if (!tab || list.scrollWidth <= list.clientWidth) return;
  const listBox = list.getBoundingClientRect();
  const tabBox = tab.getBoundingClientRect();
  // Already whole in the row: the row stays where the operator scrolled it
  if (tabBox.left >= listBox.left && tabBox.right <= listBox.right) return;
  list.scrollLeft += tabBox.left - listBox.left - (listBox.width - tabBox.width) / 2;
};

/**
 * `Tabs.List` of a card: the tabs stay one row and scroll sideways (`shell.css`, «Tabs»), the active tab is brought
 * into the row – a link to the last of eight tabs opens on a phone with that tab visible, not behind the edge.
 */
export const ScrollableTabsList: React.FC<TabsListProps> = props => {
  const listRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    revealActiveTab(list);
    // The active value lives in the Tabs context Mantine does not export: the row follows the `data-active` of its
    // tabs instead, and the tabs that appear later (grants, a counter) come in as children
    const observer = new MutationObserver(() => revealActiveTab(list));
    observer.observe(list, {
      subtree: true,
      childList: true,
      attributeFilter: ['data-active']
    });
    return () => observer.disconnect();
  }, []);

  return <Tabs.List ref={listRef} {...props} />;
};
