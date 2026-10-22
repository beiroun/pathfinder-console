// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.

// The Pathfinder symbol (three QR finder patterns and four data cells, public/logo.svg in a 48 grid) placed inside the
// disc: scaled to 0.52 around the centre, so the pattern's corners stay clear of the ring
const patternTransform = 'translate(16 16) scale(0.52) translate(-24 -24)';
const finders = [
  [9, 9],
  [27, 9],
  [9, 27]
] as const;

/**
 * The Pathfinder mark in the 84softworks brand - the same geometry as the favicon set: a navy disc inside the orange
 * ring, the QR pattern in orange (the two lighter cells in the accent's soft tone). Fixed brand colours in both
 * schemes, like the icon on the tab.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="16" fill="#dd5410" />
      <circle cx="16" cy="16" r="13.6" fill="#212842" />
      <g transform={patternTransform}>
        {finders.map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect
              x={x}
              y={y}
              width="12"
              height="12"
              rx="3"
              fill="none"
              stroke="#dd5410"
              strokeWidth="2.5"
            />
            <rect x={x + 4} y={y + 4} width="4" height="4" rx="1" fill="#dd5410" />
          </g>
        ))}
        <rect x="27" y="27" width="4" height="4" rx="1" fill="#dd5410" />
        <rect x="35" y="27" width="4" height="4" rx="1" fill="#eb9c74" />
        <rect x="27" y="35" width="4" height="4" rx="1" fill="#eb9c74" />
        <rect x="35" y="35" width="4" height="4" rx="1" fill="#dd5410" />
      </g>
    </svg>
  );
}
