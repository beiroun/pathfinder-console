// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React from 'react';
import { Flex, Text } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import { useDocumentTitle } from '@hooks/useDocumentTitle.ts';

interface DescriptionPageProps {
  icon: Icon;
  title: string;
  page: string;
  /**
   * The heading of a card or form under the breadcrumb («Баннер «Осенняя акция»», «Новое событие»): not drawn here,
   * it ends the tab title so several open cards of one list tell apart.
   */
  entity?: string;
}

/**
 * Breadcrumb line of the classic pages («Раздел / Страница»); replaced by PageHeader in handoff F1. Every list, card
 * and form renders it, so it also names the browser tab after the same segments (and the card's heading).
 */
export const DescriptionPage: React.FC<DescriptionPageProps> = ({
  icon: IconComponent,
  title,
  page,
  entity
}) => {
  useDocumentTitle([page, title, entity]);

  return (
    <Flex
      direction={'row'}
      style={{
        borderBottom: '1px solid var(--pf-hairline)',
        minHeight: '40px',
        alignItems: 'center'
      }}
      w={'100%'}
      gap={'0.5rem'}
      p={'6px 0.5rem'}
    >
      {IconComponent && <IconComponent color={'var(--pf-ash)'} size={20} stroke={1.75} />}
      <Text c={'dimmed'} size="16px" fw={500}>
        {page}
        {` / `}
        {title}
      </Text>
    </Flex>
  );
};
