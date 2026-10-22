// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
/**
 * Smart search, the one rule of every list of the console. Server lists send the
 * raw text and the backend applies the rule; full directories loaded at once apply it here, so a query finds the
 * same rows whichever side filters.
 */

/** A query without a single word this long is not sent: the backends answer 400 to it. */
export const SMART_QUERY_MIN_WORD_LENGTH = 3;
export const SMART_QUERY_MAX_LENGTH = 100;
const SMART_QUERY_MAX_WORDS = 6;

export const SMART_QUERY_TOO_SHORT_HINT = `Для поиска введите не меньше ${SMART_QUERY_MIN_WORD_LENGTH} символов`;
export const SMART_QUERY_TOO_LONG_HINT = `Запрос длиннее ${SMART_QUERY_MAX_LENGTH} символов`;

export interface SmartQuery {
  /** Normalized words; a row matches when its document contains every one of them. */
  words: string[];
  /** The single word of a one-word query: a row whose id or account number equals it goes first. */
  exactCandidate: string | null;
}

const PHONE_LIKE_QUERY = /^[\d+\-().\s]+$/;
const DIGITS_WITH_PUNCTUATION = /^[\d+\-().]+$/;
const WORD_SEPARATORS = /[\s,;]+/;
const NON_DIGITS = /\D/g;

/** Lower case and `ё → е`, the same normalization the backends apply to the query and to the documents. */
export const normalizeSearchText = (text: string): string => text.toLowerCase().replace(/ё/g, 'е');

const wordsOf = (normalized: string): string[] => {
  // A phone typed with spaces and brackets is one number, not five words
  if (PHONE_LIKE_QUERY.test(normalized))
    return [normalized.replace(NON_DIGITS, '')].filter(Boolean);

  const words = normalized
    .split(WORD_SEPARATORS)
    .map(word => (DIGITS_WITH_PUNCTUATION.test(word) ? word.replace(NON_DIGITS, '') : word))
    .filter(Boolean);
  return [...new Set(words)].slice(0, SMART_QUERY_MAX_WORDS);
};

/**
 * The parsed query, or `null` when there is nothing to search by (empty, too long, every word too short).
 * `minWordLength` is 3 by the contract; a smaller one serves exact-key fields that take any length.
 */
export const parseSmartQuery = (
  raw?: string | null,
  minWordLength = SMART_QUERY_MIN_WORD_LENGTH
): SmartQuery | null => {
  const trimmed = (raw ?? '').trim();
  if (!trimmed || trimmed.length > SMART_QUERY_MAX_LENGTH) return null;

  const words = wordsOf(normalizeSearchText(trimmed));
  if (!words.some(word => word.length >= minWordLength)) return null;
  return { words, exactCandidate: words.length === 1 ? words[0] : null };
};

const tooShortHint = (minWordLength: number) =>
  minWordLength === SMART_QUERY_MIN_WORD_LENGTH
    ? SMART_QUERY_TOO_SHORT_HINT
    : 'Слишком короткий запрос';

/** What to tell the operator under the search field, or `null` when the query is fine or empty. */
export const smartQueryHint = (
  raw?: string | null,
  minWordLength = SMART_QUERY_MIN_WORD_LENGTH
): string | null => {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return null;
  if (trimmed.length > SMART_QUERY_MAX_LENGTH) return SMART_QUERY_TOO_LONG_HINT;
  return parseSmartQuery(trimmed, minWordLength) ? null : tooShortHint(minWordLength);
};

/** The query a server list may send: the trimmed text, or nothing when the backend would reject it. */
export const sendableSearchQuery = (
  raw?: string | null,
  minWordLength = SMART_QUERY_MIN_WORD_LENGTH
): string | undefined => (parseSmartQuery(raw, minWordLength) ? (raw ?? '').trim() : undefined);

type SearchField = string | number | null | undefined;

/** The normalized document of a row: every searchable field glued, as the backends build theirs. */
export const smartSearchDocument = (...fields: SearchField[]): string =>
  normalizeSearchText(fields.filter(field => field != null && field !== '').join(' '));

export const matchesSmartQuery = (query: SmartQuery, document: string) =>
  query.words.every(word => document.includes(word));

/** True when the one-word query equals one of the row's keys (id, account number) – such rows go first. */
export const isExactSmartMatch = (query: SmartQuery, keys: SearchField[]) =>
  query.exactCandidate !== null &&
  keys.some(key => key != null && normalizeSearchText(String(key).trim()) === query.exactCandidate);
