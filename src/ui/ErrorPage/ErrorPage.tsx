// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button, Group } from '@mantine/core';
import { IconArrowBackUp, IconHome } from '@tabler/icons-react';
import { ErrorCodeArt } from '@ui/ErrorPage/ErrorCodeArt.tsx';
import './ErrorPage.css';

interface ErrorPageProps {
  /** Three digits with a 0 in the middle (404, 403). */
  code: string;
  title: string;
  /** What happened and what to do: a paragraph or two under the title. */
  children: ReactNode;
  /** Where «На главную» leads. */
  homeTo: string;
}

/**
 * The page of an error in the working area, instead of the screen that could not open: the code
 * large, «Ошибка <code>», the title, the explanation, the way home and – when the operator came from
 * inside the console – the way back. The shell stays around it, so the menu is at hand.
 */
export const ErrorPage: React.FC<ErrorPageProps> = ({ code, title, children, homeTo }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // Opened from outside (a link from a messenger): a step back would leave the console, so there is none
  const cameFromConsole = location.key !== 'default';

  return (
    <div className="pf-error-page">
      <ErrorCodeArt code={code} />
      <div className="pf-kicker">Ошибка {code}</div>
      <h1 className="pf-title">{title}</h1>
      <div className="pf-lede pf-error-page__lede">{children}</div>
      <Group justify="center" gap="sm">
        <Button component={Link} to={homeTo} leftSection={<IconHome size={16} />}>
          На главную
        </Button>
        {cameFromConsole && (
          <Button
            variant="default"
            leftSection={<IconArrowBackUp size={16} />}
            onClick={() => navigate(-1)}
          >
            Назад
          </Button>
        )}
      </Group>
    </div>
  );
};
