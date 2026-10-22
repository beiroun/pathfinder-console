// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ComboboxData } from '@mantine/core';

/** What one field of the filters bar has set, for the collapsed bar to show as a chip. */
export interface FilterSummaryEntryProps {
  /** The field's label: «Роль», «Период». */
  label: string;
  /** The set value as the field shows it; empty – the filter is off and gives no chip. */
  text?: string | null;
  /** Drops the filter from its chip; none – the chip has no cross (a value that cannot be emptied). */
  onClear?: () => void;
}

export interface FilterSummaryItem {
  id: string;
  label: string;
  text: string;
  clear?: () => void;
}

type RegisteredEntry = Omit<FilterSummaryItem, 'id'>;

interface FilterSummaryRegistry {
  upsert: (id: string, entry: RegisteredEntry) => void;
  remove: (id: string) => void;
}

/** Provided by `FiltersBar`; outside a bar the fields register nowhere and work as plain inputs. */
export const FilterSummaryContext = createContext<FilterSummaryRegistry | null>(null);

// The clear callback is a fresh closure on every render: it is not part of the identity, the ref behind it is
const isSameEntry = (a: RegisteredEntry, b: RegisteredEntry) =>
  a.label === b.label && a.text === b.text && Boolean(a.clear) === Boolean(b.clear);

/**
 * The store of the filters bar: every field keeps one entry for its lifetime, so the chips follow the order of the
 * fields (a field registers when it mounts, a changed value keeps its place in the map).
 */
export const useFilterSummaryRegistry = () => {
  const [entries, setEntries] = useState<ReadonlyMap<string, RegisteredEntry>>(() => new Map());

  const registry = useMemo<FilterSummaryRegistry>(
    () => ({
      upsert: (id, entry) =>
        setEntries(previous => {
          const current = previous.get(id);
          if (current && isSameEntry(current, entry)) return previous;
          return new Map(previous).set(id, entry);
        }),
      remove: id =>
        setEntries(previous => {
          if (!previous.has(id)) return previous;
          const next = new Map(previous);
          next.delete(id);
          return next;
        })
    }),
    []
  );

  const items = useMemo<FilterSummaryItem[]>(
    () => [...entries].filter(([, entry]) => entry.text).map(([id, entry]) => ({ id, ...entry })),
    [entries]
  );

  return { registry, items };
};

/**
 * Tells the enclosing filters bar what the field has set. The fields of `shared/ui/list` call it themselves; a page
 * with a control of its own (a segmented control, chips) renders `FilterSummaryEntry` next to it.
 */
export const useFilterSummaryEntry = ({ label, text, onClear }: FilterSummaryEntryProps) => {
  const registry = useContext(FilterSummaryContext);
  const id = useId();
  const clearRef = useRef(onClear);
  useEffect(() => {
    clearRef.current = onClear;
  });

  const isClearable = Boolean(onClear);
  const shownText = text?.trim() ?? '';
  useEffect(() => {
    registry?.upsert(id, {
      label,
      text: shownText,
      clear: isClearable ? () => clearRef.current?.() : undefined
    });
  }, [registry, id, label, shownText, isClearable]);

  useEffect(() => () => registry?.remove(id), [registry, id]);
};

const MAX_LISTED_VALUES = 2;

/** «Новая, В работе +3»: a chip stays one short line whatever was picked. */
export const listedValuesText = (labels: readonly string[]) => {
  if (labels.length <= MAX_LISTED_VALUES) return labels.join(', ');
  const rest = labels.length - MAX_LISTED_VALUES;
  return `${labels.slice(0, MAX_LISTED_VALUES).join(', ')} +${rest}`;
};

/** Value → label of every option, groups flattened: what a select shows for a picked value. */
export const optionLabelsOf = (data: ComboboxData | undefined) => {
  const labels = new Map<string, string>();
  const add = (option: unknown) => {
    if (typeof option === 'string') {
      labels.set(option, option);
      return;
    }
    if (!option || typeof option !== 'object') return;
    if ('items' in option && Array.isArray(option.items)) {
      option.items.forEach(add);
      return;
    }
    if ('value' in option && typeof option.value === 'string') {
      const label =
        'label' in option && typeof option.label === 'string' ? option.label : option.value;
      labels.set(option.value, label);
    }
  };
  (Array.isArray(data) ? data : []).forEach(add);
  return labels;
};
