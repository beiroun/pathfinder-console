// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

// Methods, not function-valued properties: method parameters are checked bivariantly,
// otherwise UrlParam<'CAMERA'> would not be assignable to UrlParam<unknown> in UrlSchema
export interface UrlParam<T> {
  parse(raw: string | null): T;
  serialize(value: T): string | null;
}

export type UrlSchema = Record<string, UrlParam<unknown>>;

export type UrlValues<S extends UrlSchema> = {
  [K in keyof S]: ReturnType<S[K]['parse']>;
};

const isEmpty = (value: unknown) => value === undefined || value === null || value === '';

function optional<T>(
  parse: (raw: string) => T | undefined,
  serialize: (value: T) => string
): UrlParam<T | undefined> {
  return {
    parse: raw => (raw === null || raw === '' ? undefined : parse(raw)),
    // An empty serialized form (an empty list) removes the key instead of leaving `key=`
    serialize: value => (isEmpty(value) ? null : serialize(value as T) || null)
  };
}

function withDefault<T>(
  parse: (raw: string) => T | undefined,
  serialize: (value: T) => string,
  defaultValue: T
): UrlParam<T> {
  return {
    parse: raw => {
      if (raw === null || raw === '') return defaultValue;
      return parse(raw) ?? defaultValue;
    },
    // The default is not written to the URL: links stay short
    serialize: value => (isEmpty(value) || value === defaultValue ? null : serialize(value))
  };
}

const parseNumber = (raw: string) => {
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
};

const parseBoolean = (raw: string) => (raw === 'true' ? true : raw === 'false' ? false : undefined);

const parseList = (raw: string) => {
  const items = raw
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
};

const CALENDAR_DAY = /^\d{4}-\d{2}-\d{2}$/;

const parseCalendarDay = (raw: string) => {
  if (!CALENDAR_DAY.test(raw)) return undefined;
  const [year, month, day] = raw.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  // 2026-02-31 rolls over to March: such a day does not exist
  return date.getMonth() === month - 1 && date.getDate() === day ? raw : undefined;
};

const parsePage = (raw: string) => {
  const n = parseNumber(raw);
  return n !== undefined && Number.isInteger(n) && n >= 0 ? n : undefined;
};

export const urlParam = {
  string: () => optional<string>(raw => raw, String),
  number: () => optional<number>(parseNumber, String),
  boolean: () => optional<boolean>(parseBoolean, String),
  enumOf: <T extends string>(allowed: readonly T[]) =>
    optional<T>(raw => (allowed.includes(raw as T) ? (raw as T) : undefined), String),
  stringDefault: (def: string) => withDefault<string>(raw => raw, String, def),
  numberDefault: (def: number) => withDefault<number>(parseNumber, String, def),
  booleanDefault: (def: boolean) => withDefault<boolean>(parseBoolean, String, def),
  enumDefault: <T extends string>(allowed: readonly T[], def: T) =>
    withDefault<T>(raw => (allowed.includes(raw as T) ? (raw as T) : undefined), String, def),
  /** `a,b,c` ↔ `['a', 'b', 'c']`; an empty list is no key at all. */
  list: () => optional<string[]>(parseList, items => items.join(',')),
  /** `YYYY-MM-DD` of a calendar day that exists; anything else reads as no value. */
  calendarDay: () => optional<string>(parseCalendarDay, String),
  /** Zero-based page; a negative or fractional value reads as the first page. */
  page: () => withDefault<number>(parsePage, String, 0),
  /** Rows per page from the allowed set; anything else (a hand-edited `size=100000`) reads as the default. */
  pageSize: (def: number, allowed: readonly number[]) =>
    withDefault<number>(
      raw => {
        const n = parseNumber(raw);
        return n !== undefined && allowed.includes(n) ? n : undefined;
      },
      String,
      def
    )
};

interface UseUrlFiltersOptions {
  // Page key: a change of any other filter resets the page
  pageKey?: string;
  /**
   * Keys that survive «Сбросить» and do not light it up (size, sort): declared once here, then `reset()` and
   * `isFiltered()` take them by default. An explicit argument of either call still wins.
   */
  persistentKeys?: readonly string[];
}

const NO_KEYS: readonly string[] = [];

// The schema must be stable (declared outside the component)
export const useUrlFilters = <S extends UrlSchema>(
  schema: S,
  { pageKey = 'page', persistentKeys = NO_KEYS }: UseUrlFiltersOptions = {}
) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const values = useMemo(() => {
    const result = {} as UrlValues<S>;
    for (const key of Object.keys(schema) as (keyof S)[]) {
      result[key] = schema[key].parse(searchParams.get(key as string)) as UrlValues<S>[typeof key];
    }
    return result;
  }, [schema, searchParams]);

  const setValues = useCallback(
    (patch: Partial<UrlValues<S>>) => {
      setSearchParams(
        prev => {
          const next = new URLSearchParams(prev);
          const entries = Object.entries(patch) as [keyof S & string, unknown][];
          for (const [key, value] of entries) {
            const serialized = schema[key]?.serialize(value);
            if (serialized === null || serialized === undefined) next.delete(key);
            else next.set(key, serialized);
          }
          if (!(pageKey in patch)) next.delete(pageKey);
          return next;
        },
        { replace: true, preventScrollReset: true }
      );
    },
    [schema, pageKey, setSearchParams]
  );

  const reset = useCallback(
    (keep: readonly string[] = persistentKeys) => {
      setSearchParams(
        prev => {
          const next = new URLSearchParams(prev);
          for (const key of Object.keys(schema)) {
            if (!keep.includes(key)) next.delete(key);
          }
          return next;
        },
        { replace: true, preventScrollReset: true }
      );
    },
    [schema, persistentKeys, setSearchParams]
  );

  const isFiltered = useCallback(
    (ignore: readonly string[] = persistentKeys) =>
      Object.keys(schema).some(
        key => !ignore.includes(key) && key !== pageKey && searchParams.has(key)
      ),
    [schema, pageKey, persistentKeys, searchParams]
  );

  return { values, setValues, reset, isFiltered };
};
