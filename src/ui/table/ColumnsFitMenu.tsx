// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, { type ReactNode } from 'react';
import { ActionIcon, Menu, Stack, Text } from '@mantine/core';
import { IconArrowBackUp, IconLayoutColumns } from '@tabler/icons-react';

interface ColumnsFitMenuProps {
  hiddenTitles: { key: string; title: ReactNode }[];
  hasOperatorWidths: boolean;
  onResetWidths: () => void;
}

/**
 * The corner of the last heading, shown only when it has something to say: which columns did not fit, and
 * «Вернуть ширину по умолчанию» once the operator has dragged any column.
 */
export const ColumnsFitMenu: React.FC<ColumnsFitMenuProps> = ({
  hiddenTitles,
  hasOperatorWidths,
  onResetWidths
}) => {
  const hint =
    hiddenTitles.length > 0 ? `Не поместились колонки: ${hiddenTitles.length}` : 'Ширина колонок';

  return (
    <Menu position="bottom-end" withinPortal shadow="md" width={280}>
      <Menu.Target>
        <ActionIcon
          size="sm"
          variant="subtle"
          color={hiddenTitles.length > 0 ? 'blue' : 'gray'}
          aria-label={hint}
          title={hint}
          className="pf-table__columns-control"
        >
          <IconLayoutColumns size={14} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {hiddenTitles.length > 0 && (
          <>
            <Menu.Label>Не поместились</Menu.Label>
            <Stack gap={2} px="sm" pb="xs">
              {hiddenTitles.map(({ key, title }) => (
                <Text key={key} size="sm">
                  {title}
                </Text>
              ))}
              <Text size="xs" c="dimmed" mt={4}>
                Расширьте окно или сузьте другие колонки – они вернутся
              </Text>
            </Stack>
            <Menu.Divider />
          </>
        )}
        <Menu.Item
          leftSection={<IconArrowBackUp size={14} />}
          disabled={!hasOperatorWidths}
          onClick={onResetWidths}
        >
          Вернуть ширину по умолчанию
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
