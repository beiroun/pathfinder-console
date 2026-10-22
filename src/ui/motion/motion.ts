// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
/**
 * Motion played from code: the durations and curves of tokens.css through the Web Animations API, so
 * a replay never re-renders React and never leaves a class behind. Every motion is skipped when the operator asked
 * the system to reduce motion.
 */

export const MOTION_MS = { fast: 120, base: 160, slow: 220 } as const;
export const EASE_OUT = 'cubic-bezier(0.2, 0.7, 0.2, 1)';

const reducedMotionQuery =
  typeof window === 'undefined' ? null : window.matchMedia('(prefers-reduced-motion: reduce)');

export const prefersReducedMotion = () => reducedMotionQuery?.matches ?? false;

const cssToken = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

/** Content arriving in its place (the page in the working area): rises by `--pf-rise` and fades in. */
export const riseIn = (element: Element) => {
  if (prefersReducedMotion()) return;
  element.animate(
    [
      { opacity: 0, transform: `translateY(${cssToken('--pf-rise', '6px')})` },
      { opacity: 1, transform: 'none' }
    ],
    { duration: MOTION_MS.slow, easing: EASE_OUT }
  );
};

/** Data that changed in place (a list row, a card field): one flash of the sky wash, fading out. */
export const flashChanged = (element: Element) => {
  if (prefersReducedMotion()) return;
  element.animate(
    [{ backgroundColor: cssToken('--pf-sky-wash', '#dbf0f5') }, { backgroundColor: 'transparent' }],
    { duration: 1400, easing: EASE_OUT }
  );
};

/** A number that grew (a menu counter): one ring of the accent spreads from it and fades. */
export const ringOut = (element: Element) => {
  if (prefersReducedMotion()) return;
  const accent = cssToken('--pf-accent', '#e66c37');
  element.animate(
    [
      { boxShadow: `0 0 0 0 color-mix(in srgb, ${accent} 60%, transparent)` },
      { boxShadow: `0 0 0 7px color-mix(in srgb, ${accent} 0%, transparent)` }
    ],
    { duration: 700, easing: EASE_OUT }
  );
};

/** A refused submit (a wrong password): a short shake of the form's card. */
export const shake = (element: Element) => {
  if (prefersReducedMotion()) return;
  element.animate(
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-6px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(-3px)' },
      { transform: 'translateX(2px)' },
      { transform: 'translateX(0)' }
    ],
    { duration: 340, easing: 'ease-in-out' }
  );
};
