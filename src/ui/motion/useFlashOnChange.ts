// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { type RefObject, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router';
import { flashChanged } from '@ui/motion/motion.ts';

const contentSignature = (value: unknown): string => {
  if (typeof value !== 'object' || value === null) return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    // Not serialisable (a cycle): such a value never flashes rather than flashing on every render
    return '';
  }
};

/**
 * Flashes the element when `value` changes after it was first shown: data that changed under the operator's eyes
 * (a refetch after an action, polling). Compared by content, so a refetch that rebuilt equal objects stays quiet;
 * a new page of a list mounts new rows, which never flash.
 */
export const useFlashOnChange = (ref: RefObject<Element | null>, value: unknown) => {
  const signature = useMemo(() => contentSignature(value), [value]);
  const shownSignature = useRef(signature);
  useEffect(() => {
    if (shownSignature.current === signature) return;
    shownSignature.current = signature;
    if (ref.current) flashChanged(ref.current);
  }, [ref, signature]);
};

/**
 * Flashes the element when its text changes after it was first shown – for a field whose value is markup (a badge,
 * a link), where the text is what the operator reads. Another record opened on the same screen (the neighbour, a
 * cross link) changes the address: that is a new page, not a change in place, and nothing flashes.
 */
export const useFlashOnTextChange = (ref: RefObject<HTMLElement | null>) => {
  const { pathname } = useLocation();
  const shown = useRef<{ text: string | null; pathname: string } | null>(null);
  // After every render: the text is read from the page, there is nothing to list as a dependency
  useEffect(() => {
    const text = ref.current?.textContent ?? null;
    const previous = shown.current;
    if (previous && previous.pathname === pathname && text !== previous.text && ref.current)
      flashChanged(ref.current);
    shown.current = { text, pathname };
  });
};
