// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React from 'react';

interface PathfinderMarkProps {
  /** `mono` – the pattern alone in `currentColor` (white on the top bar); `color` – the mark as in public/logo.svg. */
  variant?: 'mono' | 'color';
  className?: string;
}

const CYAN = '#00C3F0';
const CYAN_SOFT = '#A0C8E6';
const NEAR_BLACK = '#0A0A0A';

// Three QR finder patterns and four data cells (public/logo.svg, viewBox 48)
const FINDERS = [
  [9, 9],
  [27, 9],
  [9, 27]
] as const;

/**
 * The Pathfinder mark. On the top bar the pattern goes alone in the bar's ink; on the login card it is the full mark,
 * the cyan pattern on its near-black tile, the same as the favicon and the app icons.
 */
export const PathfinderMark: React.FC<PathfinderMarkProps> = ({ variant = 'mono', className }) => {
  const isColor = variant === 'color';
  const strong = isColor ? CYAN : 'currentColor';
  const soft = isColor ? CYAN_SOFT : 'currentColor';
  // The mono pattern fills the box: without the tile there is nothing to inset it from
  const viewBox = isColor ? '0 0 48 48' : '8 8 32 32';
  return (
    <svg viewBox={viewBox} fill="none" role="img" aria-label="Pathfinder" className={className}>
      {isColor && <rect width="48" height="48" rx="12" fill={NEAR_BLACK} />}
      {FINDERS.map(([x, y]) => (
        <React.Fragment key={`${x}-${y}`}>
          <rect x={x} y={y} width="12" height="12" rx="3" stroke={strong} strokeWidth="2.5" />
          <rect x={x + 4} y={y + 4} width="4" height="4" rx="1" fill={strong} />
        </React.Fragment>
      ))}
      <rect x="27" y="27" width="4" height="4" rx="1" fill={strong} />
      <rect x="35" y="27" width="4" height="4" rx="1" fill={soft} opacity={isColor ? 1 : 0.6} />
      <rect x="27" y="35" width="4" height="4" rx="1" fill={soft} opacity={isColor ? 1 : 0.6} />
      <rect x="35" y="35" width="4" height="4" rx="1" fill={strong} />
    </svg>
  );
};
