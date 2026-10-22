// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { type RefObject, useEffect } from 'react';
import { useLocation } from 'react-router';
import { riseIn } from '@ui/motion/motion.ts';

/**
 * The working area's content rises into place on every new page: a change of the path, not of the query – filters,
 * tabs and pages of a list written to the address keep the screen still.
 */
export const usePageEnterMotion = (ref: RefObject<Element | null>) => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (ref.current) riseIn(ref.current);
  }, [pathname, ref]);
};
