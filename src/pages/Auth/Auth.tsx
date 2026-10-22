// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React from 'react';
import { Header } from '@components/Header/Header.tsx';
import { PathfinderMark } from '@components/PathfinderMark/PathfinderMark.tsx';
import { AuthForm } from '@components/AuthForm/AuthForm.tsx';
import { ShellFooter } from '@components/ShellFooter/ShellFooter.tsx';
import { useDocumentTitle } from '@hooks/useDocumentTitle.ts';
import { PRODUCT_NAME } from '../../utils/product.ts';

/**
 * Login: the top bar without navigation or operator, the card centred on the canvas with the full mark at its top
 * (the cyan pattern on its own dark tile reads on both schemes), the versions and the maker under the card.
 */
export const Auth: React.FC = () => {
  useDocumentTitle(['Вход']);

  return (
    <>
      <Header withSession={false} />
      <main className="pf-login">
        <div className="pf-login__card">
          <PathfinderMark variant="color" className="pf-login__sign" />
          <h1 className="pf-login__title">{PRODUCT_NAME}</h1>
          <div className="pf-login__lede">Вход в консоль</div>
          <AuthForm />
        </div>
        <ShellFooter layout="row" />
      </main>
    </>
  );
};
