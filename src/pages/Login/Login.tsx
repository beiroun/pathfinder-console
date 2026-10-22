// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState, type FormEvent } from 'react';
import { Alert, Button, PasswordInput, Stack, TextInput } from '@mantine/core';
import axios from 'axios';
import { Navigate, useLocation, useNavigate } from 'react-router';

import { api } from '@/api/api';
import { ConsoleFooter } from '@/components/ConsoleFooter/ConsoleFooter';
import { ConsoleHeader } from '@/components/ConsoleHeader/ConsoleHeader';
import type { LoginRedirectState } from '@/components/RequireSession/RequireSession';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/i18n/LangContext';
import { describeApiError } from '@/shared/apiErrors';
import { useDocumentTitle } from '@/shared/documentTitle';
import { routePaths } from '@/shared/navigation';

/** Login form under the top bar; on success returns the operator to the page that sent them here. */
export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLang();
  const { user, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useDocumentTitle();

  const returnTo = (location.state as LoginRedirectState | null)?.from ?? routePaths.home;

  if (user) {
    return <Navigate to={returnTo} replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      login(await api.login({ username: username.trim(), password }));
      navigate(returnTo, { replace: true });
    } catch (failure) {
      // A refused login has no text of its own worth showing; anything else (the server down) says what happened
      const refused = axios.isAxiosError(failure) && failure.response?.status === 401;
      setError(refused ? t.login.refused : describeApiError(failure, t.api));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ConsoleHeader />
      <div className="pf-wrap pf-wrap--centered pf-page">
        <div className="pf-page__body">
          <div className="pf-login">
            <div className="pf-kicker">{t.pages.login.kicker}</div>
            <h1 className="pf-title">{t.pages.login.title}</h1>
            <form className="pf-login__card" onSubmit={submit}>
              <Stack gap="md">
                <TextInput
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  label={t.login.login}
                  value={username}
                  onChange={event => setUsername(event.currentTarget.value)}
                  autoComplete="username"
                  required
                  autoFocus
                />
                <PasswordInput
                  label={t.login.password}
                  value={password}
                  onChange={event => setPassword(event.currentTarget.value)}
                  autoComplete="current-password"
                  required
                />
                {error && <Alert color="red">{error}</Alert>}
                <Button type="submit" loading={isLoading} fullWidth>
                  {t.login.submit}
                </Button>
              </Stack>
            </form>
          </div>
        </div>
        <ConsoleFooter />
      </div>
    </>
  );
}
