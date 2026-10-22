// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, { useState } from 'react';
import { Box, CloseButton, TextInput, Tooltip } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { LIST_SEARCH_DEBOUNCE_MS } from '@ui/list/listConstants.ts';
import { useFilterSummaryEntry } from '@ui/list/filterSummary.ts';
import {
  SMART_QUERY_MAX_LENGTH,
  SMART_QUERY_MIN_WORD_LENGTH,
  sendableSearchQuery,
  smartQueryHint
} from '../../utils/search/smartQuery.ts';

interface SearchInputProps {
  /** The applied query (from the URL). */
  value?: string;
  /** The trimmed query, or `undefined` when the field is empty or the query is too short to send. */
  onChange: (value: string | undefined) => void;
  label?: string;
  placeholder?: string;
  w?: number | string;
  /**
   * A query applies only when one of its words is at least this long (3); below it the list
   * is unfiltered and a hint shows under the field. 1 – an exact key of any length.
   */
  minLength?: number;
  /**
   * `pause` – after a pause in typing (the smart search of a list). `enter` – only on Enter, the cross and Esc:
   * for keys the server compares whole (an operator, an object key), where a half-typed key would flash an empty
   * list on every pause.
   */
  applyOn?: 'pause' | 'enter';
}

const PRESS_ENTER_HINT = 'Нажмите Enter, чтобы применить';

/**
 * Search field of a list: applies the query after a pause in typing (or only on Enter, see `applyOn`), at once on
 * Enter, clears on Esc and on the cross. The draft lives here, the URL holds only what was applied.
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  label = 'Поиск',
  placeholder,
  w = 280,
  minLength = SMART_QUERY_MIN_WORD_LENGTH,
  applyOn = 'pause'
}) => {
  const [draft, setDraft] = useState(value ?? '');
  const [syncedValue, setSyncedValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const appliedOf = (text: string) => sendableSearchQuery(text, minLength);

  // The draft is overwritten only by an external change (reset, a link): otherwise the trimmed debounce would eat
  // a typed space, and a too-short draft (applied as no query) would be wiped
  if (value !== syncedValue) {
    setSyncedValue(value);
    if ((value ?? '') !== (appliedOf(draft) ?? '')) setDraft(value ?? '');
  }

  const commit = useDebouncedCallback(
    (next: string) => onChange(appliedOf(next)),
    LIST_SEARCH_DEBOUNCE_MS
  );

  const applyNow = (next: string) => {
    commit.cancel();
    onChange(appliedOf(next));
  };

  const clear = () => {
    setDraft('');
    applyNow('');
  };

  useFilterSummaryEntry({
    label,
    text: value ? `«${value}»` : null,
    onClear: clear
  });

  const isPendingEnter = applyOn === 'enter' && (appliedOf(draft) ?? '') !== (value ?? '');
  const hint = smartQueryHint(draft, minLength) ?? (isPendingEnter ? PRESS_ENTER_HINT : null);

  return (
    <Box onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Tooltip
        label={hint}
        opened={hint !== null && (isFocused || isHovered)}
        position="bottom-start"
        fz="xs"
      >
        <TextInput
          size="xs"
          w={w}
          enterKeyHint="search"
          label={label}
          placeholder={placeholder}
          maxLength={SMART_QUERY_MAX_LENGTH}
          leftSection={<IconSearch size={14} />}
          value={draft}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={event => {
            setDraft(event.currentTarget.value);
            if (applyOn === 'pause') commit(event.currentTarget.value);
          }}
          onKeyDown={event => {
            if (event.key === 'Enter') applyNow(draft);
            else if (event.key === 'Escape' && draft) clear();
          }}
          rightSection={
            draft ? <CloseButton size="sm" aria-label="Очистить" onClick={clear} /> : null
          }
        />
      </Tooltip>
    </Box>
  );
};
