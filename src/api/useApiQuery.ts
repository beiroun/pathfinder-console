// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useCallback, useEffect, useState } from 'react';

/** What a screen reads of one request: the same flags the list frame takes (`ClientListSource`). */
export interface ApiQuery<T> {
  data?: T;
  /** Nothing arrived yet for the current key: the screen shows its first-load state. */
  isLoading: boolean;
  /** Any request is in flight, a refetch included: the old data stays on screen. */
  isFetching: boolean;
  error?: unknown;
  refetch: () => void;
}

interface Settled<T> {
  key: string;
  data?: T;
  error?: unknown;
}

/**
 * Loads `load(key)` while the key is set and again on `refetch`. A refetch keeps the previous data on screen and
 * replaces it only on success; a failed refetch shows the error over the old data. A new key starts over.
 * `load` must be stable (a module function): it is a dependency of the request.
 */
export function useApiQuery<T>(key: string | null, load: (key: string) => Promise<T>): ApiQuery<T> {
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    if (key === null) return;
    let cancelled = false;
    setIsFetching(true);
    load(key)
      .then(
        data => {
          if (!cancelled) setSettled({ key, data });
        },
        error => {
          if (cancelled) return;
          // Old data of the same key stays under the error, data of another key does not
          setSettled(previous => ({
            key,
            data: previous?.key === key ? previous.data : undefined,
            error
          }));
        }
      )
      .finally(() => {
        if (!cancelled) setIsFetching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [key, load, generation]);

  const refetch = useCallback(() => setGeneration(value => value + 1), []);
  const current = key !== null && settled?.key === key ? settled : null;

  return {
    data: current?.data,
    error: current?.error,
    isLoading: key !== null && !current,
    isFetching,
    refetch
  };
}
