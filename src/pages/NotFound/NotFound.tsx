// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React from 'react';
import { useLocation } from 'react-router';
import { Code } from '@mantine/core';
import { useDocumentTitle } from '@hooks/useDocumentTitle.ts';
import { PRODUCT_NAME } from '../../utils/product.ts';
import { ErrorPage } from '@ui/ErrorPage/ErrorPage.tsx';
import { HOME_PATH } from '@routes/paths.ts';

/** An address the console does not have: the address that led here and the way out. */
export const NotFound: React.FC = () => {
  const { pathname } = useLocation();
  useDocumentTitle(['Страница не найдена']);

  return (
    <ErrorPage code="404" title="Такой страницы нет" homeTo={HOME_PATH}>
      <p>
        По адресу <Code>{pathname}</Code> в {PRODUCT_NAME} ничего нет. Ссылка устарела, или в ней
        опечатка.
      </p>
    </ErrorPage>
  );
};
