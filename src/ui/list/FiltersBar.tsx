// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, { useId, type ReactNode } from 'react';
import { Badge, Box, Button, Group, Paper, Pill, Stack, Text } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconChevronDown, IconChevronUp, IconFilter, IconFilterOff } from '@tabler/icons-react';
import { ActiveFilterChips } from '@ui/list/ActiveFilterChips.tsx';
import {
  FilterSummaryContext,
  useFilterSummaryRegistry,
  type FilterSummaryItem
} from '@ui/list/filterSummary.ts';
import type { ActiveFilterChip } from '@ui/list/listTypes.ts';
import {
  FILTERS_COLLAPSED_BY_DEFAULT_QUERY,
  FILTERS_COLLAPSED_STORAGE_KEY
} from '@ui/list/listConstants.ts';

interface FiltersBarProps {
  children: ReactNode;
  canReset: boolean;
  onReset: () => void;
  /** Filters without a field of their own, as removable chips above the fields. */
  chips?: ActiveFilterChip[];
  /** Right edge of the bar's heading: «Обновить», CSV, «Добавить». */
  rightSection?: ReactNode;
}

const CHIP_MAX_WIDTH = 'min(320px, 100%)';

/** What the fields have set, one chip each, for the collapsed bar: the list keeps the screen, the filters stay seen. */
const CollapsedSummary: React.FC<{
  linkedChips: ActiveFilterChip[];
  items: FilterSummaryItem[];
  resetButton: ReactNode;
}> = ({ linkedChips, items, resetButton }) => {
  if (!linkedChips.length && !items.length) return null;

  return (
    <Group gap={6} wrap="wrap" align="center" className="pf-appear">
      {linkedChips.map(chip => (
        <Pill
          key={chip.key}
          size="md"
          maw={CHIP_MAX_WIDTH}
          title={chip.label}
          withRemoveButton
          onRemove={chip.onRemove}
          removeButtonProps={{ 'aria-label': `Убрать фильтр «${chip.label}»` }}
        >
          {chip.label}
        </Pill>
      ))}
      {items.map(item => {
        const label = `${item.label}: ${item.text}`;
        return (
          <Pill
            key={item.id}
            size="md"
            maw={CHIP_MAX_WIDTH}
            title={label}
            withRemoveButton={Boolean(item.clear)}
            onRemove={item.clear}
            removeButtonProps={{ 'aria-label': `Убрать фильтр «${label}»` }}
          >
            {label}
          </Pill>
        );
      })}
      {resetButton}
    </Group>
  );
};

/**
 * The bar of filters over a list: a heading with the list's buttons and the «Скрыть» / «Развернуть» toggle at the
 * top right, the fields in a wrapping row below, «Сбросить» while anything is set. Collapsed, the fields stay
 * mounted (their drafts and their chips live on) and only the chips of what is set are shown. The choice is the
 * operator's and is remembered for every list of the browser; until it is made, a low screen starts collapsed.
 */
export const FiltersBar: React.FC<FiltersBarProps> = ({
  children,
  canReset,
  onReset,
  chips = [],
  rightSection
}) => {
  const [isCollapsed, setIsCollapsed] = useLocalStorage<boolean>({
    key: FILTERS_COLLAPSED_STORAGE_KEY,
    // Open, the fields take a third of a low screen
    defaultValue: window.matchMedia(FILTERS_COLLAPSED_BY_DEFAULT_QUERY).matches,
    getInitialValueInEffect: false
  });
  const { registry, items } = useFilterSummaryRegistry();
  const fieldsId = useId();

  const activeCount = chips.length + items.length;

  const resetButton = canReset && (
    <Button
      size="xs"
      variant="subtle"
      color="gray"
      leftSection={<IconFilterOff size={14} />}
      onClick={onReset}
    >
      Сбросить
    </Button>
  );

  return (
    <Paper withBorder radius="md" p="sm">
      <Stack gap="xs">
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Group gap={6} wrap="nowrap">
            <IconFilter size={16} stroke={1.75} color="var(--pf-ash)" />
            <Text size="sm" fw={500} c="dimmed">
              Фильтры
            </Text>
            {isCollapsed &&
              (activeCount > 0 ? (
                <Badge size="sm" variant="light" circle>
                  {activeCount}
                </Badge>
              ) : (
                <Text size="xs" c="dimmed">
                  не заданы
                </Text>
              ))}
          </Group>
          <Group gap="xs" wrap="wrap" justify="flex-end" ml="auto">
            {rightSection}
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              rightSection={
                isCollapsed ? <IconChevronDown size={14} /> : <IconChevronUp size={14} />
              }
              aria-expanded={!isCollapsed}
              aria-controls={fieldsId}
              onClick={() => setIsCollapsed(collapsed => !collapsed)}
            >
              {isCollapsed ? 'Развернуть' : 'Скрыть'}
            </Button>
          </Group>
        </Group>

        {isCollapsed ? (
          <CollapsedSummary linkedChips={chips} items={items} resetButton={resetButton} />
        ) : (
          <ActiveFilterChips chips={chips} />
        )}

        {/* Hidden, not unmounted: a collapsed field keeps its draft and its chip; unfolded, the fields rise into
            place. Not Mantine's Collapse: under reduced motion Mantine 8 unmounts what it folds, and
            Mantine 9 hides it in an Activity that drops its effects – either way the fields would lose drafts and chips */}
        <FilterSummaryContext.Provider value={registry}>
          <Box id={fieldsId} display={isCollapsed ? 'none' : undefined} className="pf-appear">
            <Group align="flex-end" gap="sm" wrap="wrap">
              {children}
              {resetButton}
            </Group>
          </Box>
        </FilterSummaryContext.Provider>
      </Stack>
    </Paper>
  );
};
