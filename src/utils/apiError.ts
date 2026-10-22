// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import axios from 'axios';

export interface ApiErrorText {
  status?: number | string;
  /** What the operator reads: the server's localized text, otherwise a human text by the status. */
  message: string;
  /** The technical text for the console only. */
  technical?: string;
}

// BaseApiResponse of pathfinder: message = "FAIL", error = FieldErrorDto(message, localizedMessage)
interface ErrorEnvelope {
  message?: string;
  error?: {
    message?: string;
    localizedMessage?: string;
    localized_message?: string;
  } | null;
}

const TEXT_BY_STATUS: Record<string, string> = {
  '400': 'Некорректный запрос',
  '403': 'Недостаточно прав',
  '404': 'Объект не найден',
  '409': 'Такой объект уже есть',
  '502': 'Сервис недоступен',
  '503': 'Зависимый сервис недоступен',
  NETWORK: 'Нет связи с сервером',
  TIMEOUT: 'Сервер не ответил вовремя'
};

const statusOf = (error: unknown): number | string | undefined => {
  if (!axios.isAxiosError(error)) return undefined;
  if (error.response) return error.response.status;
  return error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' ? 'TIMEOUT' : 'NETWORK';
};

/** The text of a failed request the way every screen shows it. */
export const apiErrorText = (error: unknown): ApiErrorText | null => {
  if (!error) return null;
  if (!axios.isAxiosError(error)) {
    return {
      message: 'Неизвестная ошибка',
      technical: error instanceof Error ? error.message : String(error)
    };
  }

  const status = statusOf(error);
  const envelope = (error.response?.data ?? null) as ErrorEnvelope | null;
  const localized = envelope?.error?.localizedMessage ?? envelope?.error?.localized_message;

  return {
    status,
    message: localized ?? TEXT_BY_STATUS[String(status)] ?? 'Не удалось загрузить данные',
    technical: envelope?.error?.message ?? envelope?.message ?? error.message
  };
};

/** The HTTP status of a failed request, if the server answered at all. */
export const apiErrorStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;
