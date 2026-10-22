// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useLocation, useNavigate } from 'react-router';

// Opened from outside the console (a link from a messenger): a step back would leave it, so go to the list
export const useGoBack = (fallback: string) => {
  const navigate = useNavigate();
  const location = useLocation();
  return () => (location.key === 'default' ? navigate(fallback) : navigate(-1));
};
