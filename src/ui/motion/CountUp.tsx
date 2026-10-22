// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, { useLayoutEffect, useRef } from 'react';
import { prefersReducedMotion } from '@ui/motion/motion.ts';

const COUNT_UP_MS = 700;

const formatRu = (value: number) => value.toLocaleString('ru-RU');

interface CountUpProps {
  value: number | null | undefined;
  /** Text of a number; the default is the Russian grouping (12 345). Called on every frame of the count. */
  format?: (value: number) => string;
}

/**
 * A number that counts up from zero the first time it is shown (a summary tile, a metric) and shows every later value
 * at once: the count greets the screen, it does not replay on each refetch. The frames write the text directly, so
 * React renders the number once.
 */
export const CountUp: React.FC<CountUpProps> = ({ value, format = formatRu }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);
  // The format is read per frame: a parent passing a new function on each render must not restart the count
  const formatRef = useRef(format);
  useLayoutEffect(() => {
    formatRef.current = format;
  });

  // Before the paint: the first frame already reads zero, never the final number for a blink
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || value == null || !Number.isFinite(value)) return;
    const formatValue = (number: number) => formatRef.current(number);
    if (counted.current || value === 0 || prefersReducedMotion()) {
      counted.current = true;
      element.textContent = formatValue(value);
      return;
    }
    counted.current = true;
    const startedAt = performance.now();
    const isWhole = Number.isInteger(value);
    let finished = false;
    let frame = 0;
    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / COUNT_UP_MS);
      const current = value * (1 - Math.pow(1 - progress, 3));
      element.textContent = formatValue(isWhole ? Math.round(current) : current);
      if (progress < 1) frame = requestAnimationFrame(step);
      else finished = true;
    };
    element.textContent = formatValue(0);
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      element.textContent = formatValue(value);
      // An interrupted count (a remount in development, a new value mid-way) starts again instead of jumping
      if (!finished) counted.current = false;
    };
  }, [value]);

  return <span ref={ref}>{value == null ? '–' : format(value)}</span>;
};
