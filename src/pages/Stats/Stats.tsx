// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  Button,
  Loader,
  SegmentedControl,
  Select,
  Table,
  Text,
  TextInput
} from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { IconArrowDownRight, IconArrowUpRight, IconChartBar, IconTable } from '@tabler/icons-react';
import { useSearchParams } from 'react-router';

import { useQrCodesQuery, useScanReportQuery } from '@/api/queries';
import { AdaptiveTable } from '@/components/AdaptiveTable/AdaptiveTable';
import type { TableColumn } from '@/components/AdaptiveTable/tableColumns';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { localeOf, type Copy } from '@/i18n/dict';
import { useLang } from '@/i18n/LangContext';
import { describeApiError } from '@/shared/apiErrors';
import { qrCodePath } from '@/shared/navigation';
import { formatServerTime } from '@/shared/serverTime';
import { useIsPhone } from '@/shared/useIsPhone';
import type { CodeScans, ScanReport } from '@/types';

import {
  addDays,
  calendarDayOrNothing,
  daysBetween,
  defaultPeriod,
  fallbackRoutes,
  formatCount,
  formatLongDay,
  formatShare,
  formatShortDay,
  isPeriodPreset,
  journalCovers,
  maxPeriodDays,
  periodPresets,
  periodRange,
  statsPlatforms,
  topCode,
  totalsByDestination,
  totalsByDevice,
  type PeriodPreset
} from './statsModel';
import './stats.css';

const allCodes = '';

interface StatsFilters {
  period: PeriodPreset;
  from?: string;
  to?: string;
  slug?: string;
}

/**
 * The filters live in the address, so a link to "Android, last 90 days, the flyer" is shareable and F5 keeps them.
 * Defaults are not written; anything invalid in a hand-edited link reads as the default.
 */
function useStatsFilters(): [StatsFilters, (next: Partial<StatsFilters>) => void] {
  const [params, setParams] = useSearchParams();
  const period = params.get('period');
  const filters: StatsFilters = {
    period: isPeriodPreset(period) ? period : defaultPeriod,
    from: calendarDayOrNothing(params.get('from')),
    to: calendarDayOrNothing(params.get('to')),
    slug: params.get('slug') || undefined
  };
  const update = (next: Partial<StatsFilters>) => {
    const merged = { ...filters, ...next };
    const written = new URLSearchParams();
    if (merged.period !== defaultPeriod) written.set('period', merged.period);
    // Own dates matter only for the own period
    if (merged.period === 'custom' && merged.from) written.set('from', merged.from);
    if (merged.period === 'custom' && merged.to) written.set('to', merged.to);
    if (merged.slug) written.set('slug', merged.slug);
    setParams(written, { replace: true });
  };
  return [filters, update];
}

/**
 * The statistics of the scans for marketers: who scanned (the device), where they were sent (the store or the site),
 * from which code and when. One row of filters scopes everything below it. Every chart has its numbers as text too:
 * the share bars carry their values, the daily chart has a table view, the heatmap its tooltips and the busiest hour.
 */
export function Stats() {
  const { t, lang } = useLang();
  const locale = localeOf(lang);
  const copy = t.stats;
  const [filters, setFilters] = useStatsFilters();
  const range = periodRange(filters.period, filters.from, filters.to);
  const reportQuery = useScanReportQuery({ ...range, slug: filters.slug });
  const codesQuery = useQrCodesQuery();

  // A new period keeps the previous report on screen, dimmed, until the new one arrives: no flash, no jump
  const [shownReport, setShownReport] = useState<ScanReport>();
  if (reportQuery.data && reportQuery.data !== shownReport) {
    setShownReport(reportQuery.data);
  }
  const report = reportQuery.data ?? shownReport;
  const isStale = !reportQuery.data && Boolean(shownReport);

  const codeOptions = useMemo(
    () => [
      { value: allCodes, label: copy.allCodes },
      ...(codesQuery.data ?? [])
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, locale))
        .map(code => ({ value: code.slug, label: code.name }))
    ],
    [codesQuery.data, copy.allCodes, locale]
  );

  const customProblem =
    filters.period !== 'custom' || !filters.from || !filters.to
      ? null
      : filters.from > filters.to
        ? copy.fromAfterTo
        : daysBetween(filters.from, filters.to) > maxPeriodDays
          ? copy.tooLong(maxPeriodDays)
          : null;

  return (
    <>
      <PageHeader page={t.pages.stats} />

      <div className="pf-toolbar pf-stats__filters">
        <SegmentedControl
          value={filters.period}
          onChange={period =>
            setFilters({
              period: period as PeriodPreset,
              // An own period starts from the range on screen, so the dates do not jump
              ...(period === 'custom' && !filters.from ? range : {})
            })
          }
          data={periodPresets.map(preset => ({ value: preset, label: copy.periods[preset] }))}
        />
        {filters.period === 'custom' && (
          <>
            <TextInput
              type="date"
              aria-label={copy.from}
              leftSection={<span className="pf-stats__date-label">{copy.from}</span>}
              leftSectionWidth={36}
              value={filters.from ?? ''}
              max={filters.to}
              onChange={event => setFilters({ from: event.currentTarget.value || undefined })}
              error={customProblem}
              w={190}
            />
            <TextInput
              type="date"
              aria-label={copy.to}
              leftSection={<span className="pf-stats__date-label">{copy.to}</span>}
              leftSectionWidth={36}
              value={filters.to ?? ''}
              min={filters.from}
              onChange={event => setFilters({ to: event.currentTarget.value || undefined })}
              w={190}
            />
          </>
        )}
        <Select
          aria-label={copy.code}
          w={260}
          searchable
          allowDeselect={false}
          data={codeOptions}
          value={filters.slug ?? allCodes}
          onChange={next => setFilters({ slug: next || undefined })}
        />
        <span className="pf-stats__period">
          {formatLongDay(range.from, locale)} – {formatLongDay(range.to, locale)}
        </span>
      </div>

      {reportQuery.error != null && (
        <Alert color="red" mb="md" title={t.table.loadError}>
          <Text size="sm" mb="sm">
            {describeApiError(reportQuery.error, t.api)}
          </Text>
          <Button
            size="xs"
            variant="default"
            loading={reportQuery.isFetching}
            onClick={reportQuery.refetch}
          >
            {t.common.retry}
          </Button>
        </Alert>
      )}
      {!report && reportQuery.isLoading && <Loader size="sm" aria-label={copy.loading} />}

      {report && (
        <div className={isStale ? 'pf-stats pf-stats--stale' : 'pf-stats'} aria-busy={isStale}>
          <TrackingNotice report={report} />
          <KpiRow report={report} />
          <DailyChart report={report} />
          <div className="pf-stats__pair">
            <DeviceBreakdown report={report} />
            <DestinationBreakdown report={report} />
          </div>
          <CodesTable report={report} />
          <WeekHourHeatmap report={report} />
        </div>
      )}
    </>
  );
}

/** The journal starts with the release that added it: before that only the lifetime counters of the cards exist. */
function TrackingNotice({ report }: { report: ScanReport }) {
  const { t } = useLang();
  if (journalCovers(report, report.from)) return null;
  return (
    <Alert color="gray" mb="md">
      {report.tracking_since
        ? t.stats.trackingSince(formatServerTime(report.tracking_since).slice(0, 16))
        : t.stats.trackingNotStarted}
    </Alert>
  );
}

function Metric({ value, label, note }: { value: ReactNode; label: string; note?: ReactNode }) {
  return (
    <div className="pf-metric">
      <div className="pf-metric__num pf-stats__num">{value}</div>
      <div className="pf-metric__lbl">{label}</div>
      {note && <div className="pf-stats__note">{note}</div>}
    </div>
  );
}

function KpiRow({ report }: { report: ScanReport }) {
  const { t, lang } = useLang();
  const locale = localeOf(lang);
  const copy = t.stats.kpi;
  const days = daysBetween(report.from, report.to);
  // A change is honest only when the journal covers the whole previous period
  const canCompare = journalCovers(report, addDays(report.from, -days));
  const change = report.previous_total
    ? (report.total - report.previous_total) / report.previous_total
    : null;
  const toStores = totalsByDestination(report)
    .filter(destination => destination.key !== 'desktop')
    .reduce((sum, destination) => sum + destination.scans, 0);
  const best = topCode(report);

  return (
    <div className="pf-metrics pf-stats__kpis">
      <Metric
        value={formatCount(report.total, locale)}
        label={copy.total}
        note={
          !canCompare ? (
            copy.noCompare
          ) : change === null ? (
            copy.noPrevious(days)
          ) : (
            <span
              className={
                change >= 0
                  ? 'pf-stats__delta pf-stats__delta--up'
                  : 'pf-stats__delta pf-stats__delta--down'
              }
            >
              {change >= 0 ? <IconArrowUpRight size={14} /> : <IconArrowDownRight size={14} />}
              {copy.change(
                `${change >= 0 ? '+' : '−'}${Math.abs(change * 100).toLocaleString(locale, { maximumFractionDigits: 0 })} %`,
                days,
                formatCount(report.previous_total, locale)
              )}
            </span>
          )
        }
      />
      <Metric
        value={(report.total / days).toLocaleString(locale, { maximumFractionDigits: 1 })}
        label={copy.perDay}
        note={copy.perDayNote(days)}
      />
      <Metric
        value={formatShare(toStores, report.total, locale)}
        label={copy.toStores}
        note={copy.toStoresNote(formatCount(toStores, locale), formatCount(report.total, locale))}
      />
      <Metric
        value={best ? formatCount(best.scans, locale) : t.common.none}
        label={copy.topCode}
        note={best ? best.name : t.stats.noScans}
      />
    </div>
  );
}

function Section({
  title,
  lede,
  aside,
  children
}: {
  title: string;
  lede: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="pf-section">
      <div className="pf-stats__head">
        <div>
          <h2 className="pf-section__title">{title}</h2>
          <p className="pf-section__note">{lede}</p>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

function DailyChart({ report }: { report: ScanReport }) {
  const { t, lang } = useLang();
  const locale = localeOf(lang);
  const copy = t.stats;
  const [asTable, setAsTable] = useState(false);
  const isPhone = useIsPhone();
  // The tooltip shows the category as it is, so the category is the long day; the axis shortens it to 01.10
  const { data, shortOf } = useMemo(() => {
    const rows = report.by_day.map(day => ({ ...day, longLabel: formatLongDay(day.day, locale) }));
    const short = new Map(rows.map(row => [row.longLabel, formatShortDay(row.day, locale)]));
    return { data: rows, shortOf: (label: string) => short.get(label) ?? label };
  }, [report.by_day, locale]);
  const series = statsPlatforms.map(platform => ({
    name: platform.key,
    label: copy.devices[platform.key],
    color: platform.color
  }));

  return (
    <Section
      title={copy.daily.title}
      lede={copy.daily.lede}
      aside={
        report.total > 0 && (
          <Button
            variant="subtle"
            color="gray"
            leftSection={asTable ? <IconChartBar size={16} /> : <IconTable size={16} />}
            onClick={() => setAsTable(value => !value)}
          >
            {asTable ? copy.daily.asChart : copy.daily.asTable}
          </Button>
        )
      }
    >
      {report.total === 0 ? (
        <p className="pf-stats__empty">{copy.noScans}</p>
      ) : asTable ? (
        <div className="pf-stats__table-scroll">
          <Table highlightOnHover stickyHeader>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{copy.daily.day}</Table.Th>
                {statsPlatforms.map(platform => (
                  <Table.Th key={platform.key} ta="right">
                    {copy.devices[platform.key]}
                  </Table.Th>
                ))}
                <Table.Th ta="right">{copy.daily.total}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {report.by_day.map(day => (
                <Table.Tr key={day.day}>
                  <Table.Td>{formatLongDay(day.day, locale)}</Table.Td>
                  {statsPlatforms.map(platform => (
                    <Table.Td key={platform.key} ta="right" className="pf-stats__num">
                      {formatCount(day[platform.key], locale)}
                    </Table.Td>
                  ))}
                  <Table.Td ta="right" className="pf-stats__num">
                    {formatCount(day.total, locale)}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      ) : (
        <BarChart
          h={isPhone ? 240 : 300}
          data={data}
          dataKey="longLabel"
          type="stacked"
          series={series}
          withLegend
          legendProps={{
            verticalAlign: 'top',
            // Four entries wrap to two lines on a phone: the legend box grows instead of covering the bars
            height: isPhone ? 64 : 40,
            // The order of the stack, not the alphabet (Recharts sorts legend items unless told)
            itemSorter: item => series.findIndex(entry => entry.name === item.dataKey)
          }}
          tickLine="none"
          // Horizontal gridlines only: Mantine names the axis the lines run along
          gridAxis="x"
          strokeDasharray="0"
          maxBarWidth={24}
          valueFormatter={value => formatCount(value, locale)}
          tooltipAnimationDuration={120}
          // A thin canvas-coloured gap between stacked segments
          barProps={{ stroke: 'var(--pf-canvas)', strokeWidth: 1 }}
          xAxisProps={{ interval: 'preserveStartEnd', minTickGap: 16, tickFormatter: shortOf }}
          yAxisProps={{ allowDecimals: false, width: 40 }}
        />
      )}
    </Section>
  );
}

/** One horizontal bar per platform with its value and share written out: a part-to-whole read in one glance. */
function ShareBars({
  rows,
  total
}: {
  rows: { key: string; label: string; color: string; scans: number }[];
  total: number;
}) {
  const { lang } = useLang();
  const locale = localeOf(lang);
  const max = Math.max(1, ...rows.map(row => row.scans));
  return (
    <div className="pf-share-list">
      {rows.map(row => (
        <div key={row.key} className="pf-share">
          <div className="pf-share__head">
            <span className="pf-share__swatch" style={{ background: row.color }} />
            <span className="pf-share__label">{row.label}</span>
            <span className="pf-share__value pf-stats__num">{formatCount(row.scans, locale)}</span>
            <span className="pf-share__percent pf-stats__num">
              {formatShare(row.scans, total, locale)}
            </span>
          </div>
          <div className="pf-share__track">
            <div
              className="pf-share__fill"
              style={{ width: `${(row.scans / max) * 100}%`, background: row.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DeviceBreakdown({ report }: { report: ScanReport }) {
  const { t } = useLang();
  return (
    <Section title={t.stats.whoScans.title} lede={t.stats.whoScans.lede}>
      <ShareBars
        rows={totalsByDevice(report).map(platform => ({
          key: platform.key,
          label: t.stats.devices[platform.key],
          color: platform.color,
          scans: platform.scans
        }))}
        total={report.total}
      />
    </Section>
  );
}

function DestinationBreakdown({ report }: { report: ScanReport }) {
  const { t, lang } = useLang();
  const copy = t.stats;
  const fallbacks = fallbackRoutes(report);
  return (
    <Section title={copy.whereTo.title} lede={copy.whereTo.lede}>
      <ShareBars
        rows={totalsByDestination(report).map(platform => ({
          key: platform.key,
          label: copy.destinations[platform.key],
          color: platform.color,
          scans: platform.scans
        }))}
        total={report.total}
      />
      {fallbacks.length > 0 && (
        <p className="pf-stats__fallback">
          {fallbacks
            .map(route =>
              copy.whereTo.fallback(
                copy.devices[route.platform],
                formatCount(route.scans, localeOf(lang)),
                copy.destinations[route.platform]
              )
            )
            .join(' ')}
        </p>
      )}
    </Section>
  );
}

/** A code's scans split by device as one thin stacked bar, as long as the code's share of the busiest code. */
function PlatformMiniBar({
  code,
  max,
  copy,
  locale
}: {
  code: CodeScans;
  max: number;
  copy: Copy['stats'];
  locale: string;
}) {
  return (
    <div
      className="pf-minibar"
      style={{ width: `${max ? (code.scans / max) * 100 : 0}%` }}
      title={statsPlatforms
        .map(
          platform => `${copy.devices[platform.key]}: ${formatCount(code[platform.key], locale)}`
        )
        .join(' · ')}
    >
      {statsPlatforms
        .filter(platform => code[platform.key] > 0)
        .map(platform => (
          <span
            key={platform.key}
            className="pf-minibar__part"
            style={{ flexGrow: code[platform.key], background: platform.color }}
          />
        ))}
    </div>
  );
}

function CodesTable({ report }: { report: ScanReport }) {
  const { t, lang } = useLang();
  const locale = localeOf(lang);
  const copy = t.stats;
  const max = Math.max(0, ...report.by_code.map(code => code.scans));
  const columns = useMemo<TableColumn<CodeScans>[]>(
    () => [
      {
        key: 'name',
        title: copy.codes.code,
        minWidth: 200,
        priority: 1,
        render: code => (
          <div>
            <div>{code.name}</div>
            <div className="pf-stats__slug">{code.slug}</div>
          </div>
        )
      },
      {
        key: 'scans',
        title: copy.codes.scans,
        width: 100,
        priority: 1,
        align: 'right',
        render: code => (
          <span className="pf-stats__num pf-stats__strong">{formatCount(code.scans, locale)}</span>
        )
      },
      {
        key: 'share',
        title: copy.codes.share,
        width: 90,
        priority: 3,
        align: 'right',
        render: code => (
          <span className="pf-stats__num pf-muted">
            {formatShare(code.scans, report.total, locale)}
          </span>
        )
      },
      {
        key: 'devices',
        title: copy.codes.devices,
        minWidth: 180,
        priority: 2,
        render: code =>
          code.scans ? (
            <PlatformMiniBar code={code} max={max} copy={copy} locale={locale} />
          ) : (
            <span className="pf-muted">{t.common.none}</span>
          )
      }
    ],
    [copy, locale, max, report.total, t.common.none]
  );

  return (
    <Section title={copy.codes.title} lede={copy.codes.lede}>
      <AdaptiveTable
        tableId="stats.codes"
        rows={report.by_code}
        columns={columns}
        rowKey={code => code.slug}
        rowHref={code => qrCodePath(code.slug)}
      />
    </Section>
  );
}

/** "9:00–10:00" for the hour 9. */
const hourSpan = (hour: number) => `${hour}:00–${hour + 1}:00`;

/** When people scan: weekday by hour, one hue from light to dark - the darker the cell, the more scans. */
function WeekHourHeatmap({ report }: { report: ScanReport }) {
  const { t, lang } = useLang();
  const locale = localeOf(lang);
  const copy = t.stats;
  const cells = useMemo(() => {
    const grid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
    for (const cell of report.by_weekday_hour) grid[cell.weekday - 1][cell.hour] = cell.scans;
    return grid;
  }, [report.by_weekday_hour]);
  const max = Math.max(0, ...cells.flat());
  const busiest = useMemo(() => {
    let best = { weekday: 0, hour: 0, scans: 0 };
    cells.forEach((row, weekday) =>
      row.forEach((scans, hour) => {
        if (scans > best.scans) best = { weekday, hour, scans };
      })
    );
    return best;
  }, [cells]);

  // 15 % of the hue for a single scan, the full hue for the busiest cell; an empty cell keeps the track colour
  const shadeOf = (share: number) =>
    `color-mix(in srgb, var(--pf-heat) ${Math.round(15 + 85 * share)}%, var(--pf-canvas))`;

  return (
    <Section
      title={copy.heatmap.title}
      lede={
        busiest.scans
          ? `${copy.heatmap.busiest(copy.weekdays[busiest.weekday], hourSpan(busiest.hour), formatCount(busiest.scans, locale))}. ${copy.heatmap.zoneNote}`
          : copy.noScans
      }
    >
      <div className="pf-heat" role="table" aria-label={copy.heatmap.label}>
        <div className="pf-heat__row" role="row">
          <span className="pf-heat__corner" />
          {Array.from({ length: 24 }, (_, hour) => (
            <span key={hour} className="pf-heat__hour" role="columnheader">
              {hour % 3 === 0 ? hour : ''}
            </span>
          ))}
        </div>
        {cells.map((row, weekday) => (
          <div key={weekday} className="pf-heat__row" role="row">
            <span className="pf-heat__day" role="rowheader">
              {copy.weekdays[weekday]}
            </span>
            {row.map((scans, hour) => {
              const label = `${copy.weekdays[weekday]}, ${hourSpan(hour)} – ${formatCount(scans, locale)}`;
              return (
                <span
                  key={hour}
                  role="cell"
                  tabIndex={0}
                  className="pf-heat__cell"
                  style={scans ? { background: shadeOf(scans / max) } : undefined}
                  title={label}
                  aria-label={label}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="pf-heat__legend">
        <span>{copy.heatmap.less}</span>
        {[0, 0.25, 0.5, 0.75, 1].map(step => (
          <span
            key={step}
            className="pf-heat__swatch"
            style={step ? { background: shadeOf(step) } : undefined}
          />
        ))}
        <span>{copy.heatmap.more}</span>
      </div>
    </Section>
  );
}
