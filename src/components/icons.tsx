// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { SVGProps } from 'react';

/**
 * Thin-stroke geometric icons (Lucide-derived) matching the design system.
 * Stroke uses currentColor so buttons control the color.
 */
const iconBase = (size: number): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false
});

interface IconProps {
  size?: number;
}

/** Pencil — edit action. */
export const EditIcon = ({ size = 16 }: IconProps) => (
  <svg {...iconBase(size)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

/** Plus — add / create action. */
export const PlusIcon = ({ size = 16 }: IconProps) => (
  <svg {...iconBase(size)}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

/** Trash — delete action. */
export const TrashIcon = ({ size = 16 }: IconProps) => (
  <svg {...iconBase(size)}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

/** Eye — view / open details. */
export const EyeIcon = ({ size = 16 }: IconProps) => (
  <svg {...iconBase(size)}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/** Copy — copy to clipboard. */
export const CopyIcon = ({ size = 16 }: IconProps) => (
  <svg {...iconBase(size)}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

/** Sparkle — 4-point star used for the "magic link" copy burst. Filled (not stroked). */
export const SparkleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
    aria-hidden
    focusable={false}
  >
    <path d="M12 1.5 L14.1 9.9 L22.5 12 L14.1 14.1 L12 22.5 L9.9 14.1 L1.5 12 L9.9 9.9 Z" />
  </svg>
);

/** Download — save the rendered QR image. */
export const DownloadIcon = ({ size = 16 }: IconProps) => (
  <svg {...iconBase(size)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </svg>
);

/** X — close / dismiss a modal. */
export const CloseIcon = ({ size = 20 }: IconProps) => (
  <svg {...iconBase(size)}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

/** QR — generic scan mark used in empty states / headers. */
export const QrIcon = ({ size = 16 }: IconProps) => (
  <svg {...iconBase(size)}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h3v3" />
    <path d="M21 14v.01" />
    <path d="M14 21h.01" />
    <path d="M17 21h4v-4" />
  </svg>
);
