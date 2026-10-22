// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { CodeScans, RouteScans, ScanPlatform, ScanReport } from '@/types';

/**
 * The four platforms in the order the server resolves them, which is also the order of every stack and legend.
 * A platform keeps its colour on every chart (the series tokens in stats.css, validated as a categorical palette in
 * both schemes): a marketer who learned "Android is green" reads every chart the same way.
 */
export const statsPlatforms: readonly { key: ScanPlatform; color: string }[] = [
  { key: 'ios', color: 'var(--pf-series-ios)' },
  { key: 'huawei', color: 'var(--pf-series-huawei)' },
  { key: 'android', color: 'var(--pf-series-android)' },
  { key: 'desktop', color: 'var(--pf-series-desktop)' }
];

export const periodPresets = ['7', '30', '90', '365', 'custom'] as const;
export type PeriodPreset = (typeof periodPresets)[number];
export const defaultPeriod: PeriodPreset = '30';

export const isPeriodPreset = (value: string | null): value is PeriodPreset =>
  (periodPresets as readonly (string | null)[]).includes(value);

/** The server's limit on one report: a whole year with a leap day still fits. */
export const maxPeriodDays = 366;

const calendarDayPattern = /^\d{4}-\d{2}-\d{2}$/;

/** A YYYY-MM-DD from the address, or nothing when a hand-edited link holds something else. */
export const calendarDayOrNothing = (value: string | null) =>
  value && calendarDayPattern.test(value) ? value : undefined;

// Calendar arithmetic on YYYY-MM-DD in UTC: no zone, no daylight saving can shift a day
const toUtc = (day: string) => {
  const [year, month, date] = day.split('-').map(Number);
  return Date.UTC(year, month - 1, date);
};
const fromUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export const addDays = (day: string, days: number) => fromUtc(toUtc(day) + days * 86_400_000);

export const daysBetween = (from: string, to: string) =>
  Math.round((toUtc(to) - toUtc(from)) / 86_400_000) + 1;

/**
 * Today on the browser's calendar. The server counts days on its own clock; around midnight the two can differ by
 * a day, which only adds or drops an empty day at the edge of a preset.
 */
const browserToday = () => {
  const now = new Date();
  return fromUtc(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};

/** The calendar days of a preset ending today, or the operator's own range. */
export const periodRange = (
  preset: PeriodPreset,
  customFrom: string | undefined,
  customTo: string | undefined
): { from: string; to: string } => {
  if (preset === 'custom' && customFrom && customTo && customFrom <= customTo) {
    return { from: customFrom, to: customTo };
  }
  const today = browserToday();
  const days = preset === 'custom' ? Number(defaultPeriod) : Number(preset);
  return { from: addDays(today, -(days - 1)), to: today };
};

/** 01.10 under an axis tick (10/01 in English). */
export const formatShortDay = (day: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(
    new Date(toUtc(day))
  );

/** "Wed, 1 October 2026" in a tooltip, a table and the period line. */
export const formatLongDay = (day: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(toUtc(day)));

export const formatCount = (value: number, locale: string) => value.toLocaleString(locale);

export const formatShare = (part: number, whole: number, locale: string) =>
  whole
    ? `${((part / whole) * 100).toLocaleString(locale, { maximumFractionDigits: 1 })} %`
    : '0 %';

/** Scans per platform over the period: who scanned. */
export const totalsByDevice = (report: ScanReport) =>
  statsPlatforms.map(platform => ({
    ...platform,
    scans: report.by_day.reduce((sum, day) => sum + day[platform.key], 0)
  }));

/** Scans per destination over the period: whose link they were sent to. */
export const totalsByDestination = (report: ScanReport) =>
  statsPlatforms.map(platform => ({
    ...platform,
    scans: report.by_route
      .filter(route => route.destination === platform.key)
      .reduce((sum, route) => sum + route.scans, 0)
  }));

/** Routes where the scanner's platform had no link of its own and went to the site instead. */
export const fallbackRoutes = (report: ScanReport): RouteScans[] =>
  report.by_route.filter(route => route.platform !== route.destination);

/** The code with the most scans of the period, if anything was scanned (the server sorts the busiest first). */
export const topCode = (report: ScanReport): CodeScans | undefined =>
  report.by_code.find(code => code.scans > 0);

/** The journal covers the whole period, so the "tracking since" notice is not needed. */
export const journalCovers = (report: ScanReport, day: string) =>
  Boolean(report.tracking_since && report.tracking_since.slice(0, 10) <= day);
