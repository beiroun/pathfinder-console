// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, { useRef, useState } from 'react';
import { Button, PasswordInput, Stack, TextInput } from '@mantine/core';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { api } from '../../api/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { HOME_PATH } from '@routes/paths.ts';
import { shake } from '@ui/motion/motion.ts';

interface ErrorEnvelope {
  error?: { localizedMessage?: string } | null;
}

/** The server's own words when it sent them, otherwise a human fallback. */
const loginErrorText = (error: unknown): string => {
  if (axios.isAxiosError(error) && error.response) {
    const envelope = error.response.data as ErrorEnvelope | undefined;
    return envelope?.error?.localizedMessage || 'Неверный логин или пароль';
  }
  return 'Нет связи с сервером';
};

/** Login and password; Enter submits, the server's error stays under the password until the next keystroke. */
export const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ username: false, password: false });
  const [serverError, setServerError] = useState<string | null>(null);
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const usernameError =
    touched.username && !username.trim() ? 'Логин обязателен для заполнения' : undefined;
  const passwordError =
    touched.password && !password.trim() ? 'Пароль обязателен для заполнения' : undefined;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ username: true, password: true });
    setServerError(null);
    if (!username.trim() || !password.trim()) return;

    setIsLoading(true);
    try {
      login(await api.login({ username, password }));
      navigate(HOME_PATH, { replace: true });
    } catch (error) {
      setServerError(loginErrorText(error));
      // A refused login shakes the card once, so the eye goes to the message under the fields
      const card = formRef.current?.closest('.pf-login__card');
      if (card) shake(card);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form ref={formRef} className="pf-login__form" onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          label="Логин"
          placeholder="Введите логин"
          autoComplete="username"
          value={username}
          disabled={isLoading}
          error={usernameError}
          onChange={event => {
            setUsername(event.currentTarget.value);
            setTouched(previous => ({ ...previous, username: false }));
            setServerError(null);
          }}
        />
        <PasswordInput
          label="Пароль"
          placeholder="Введите пароль"
          autoComplete="current-password"
          value={password}
          disabled={isLoading}
          error={passwordError ?? serverError}
          onChange={event => {
            setPassword(event.currentTarget.value);
            setTouched(previous => ({ ...previous, password: false }));
            setServerError(null);
          }}
        />
        <Button type="submit" fullWidth size="md" mt="xs" loading={isLoading}>
          Войти
        </Button>
      </Stack>
    </form>
  );
};
