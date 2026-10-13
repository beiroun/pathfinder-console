// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import { api } from '../../api/api';
import { useNavigate } from 'react-router';

/**
 * Authentication page: company logo + a minimal login form.
 * Both roles (ADMIN / VIEWER) land on the single dashboard; access to write
 * actions there is gated by role.
 */
const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { showAlert } = useFeedback();
  const navigate = useNavigate();

  /**
   * Handles the submission of the login form.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const tokens = await api.login({ username, password });
      login(tokens);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      showAlert('error', 'Ошибка авторизации. Проверьте логин и пароль.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <div className="auth-logo">
          <img src="/logo.svg" alt="Pathfinder" />
        </div>

        <h2 className="auth-title">Pathfinder</h2>
        <p className="auth-subtitle">Управление QR-редиректами</p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <label>Логин</label>
            <input
              type="text"
              placeholder="Введите ваш логин"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Пароль</label>
            <input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? 'Вход…' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
