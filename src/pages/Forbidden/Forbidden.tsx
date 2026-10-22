// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React from 'react';
import { useDocumentTitle } from '@hooks/useDocumentTitle.ts';
import { ErrorPage } from '@ui/ErrorPage/ErrorPage.tsx';
import { HOME_PATH } from '@routes/paths.ts';

interface ForbiddenProps {
  /** The section the page belongs to, as the menu names it. */
  sectionLabel?: string;
}

/** «Недостаточно прав» on the address the operator opened; the menu stays. */
export const Forbidden: React.FC<ForbiddenProps> = ({ sectionLabel }) => {
  useDocumentTitle(['Недостаточно прав']);

  return (
    <ErrorPage code="403" title="Недостаточно прав" homeTo={HOME_PATH}>
      <p>
        {sectionLabel
          ? `У вашей роли нет доступа к разделу «${sectionLabel}».`
          : 'У вашей роли нет доступа к этой странице.'}{' '}
        Чтобы получить доступ, обратитесь к администратору.
      </p>
    </ErrorPage>
  );
};
