// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React from 'react';

/** The code of an error, large: three digits (404, 403) with the 0 in the middle in the action blue. */
export const ErrorCodeArt: React.FC<{ code: string }> = ({ code }) => (
  <div className="pf-error-page__code" aria-hidden="true">
    {[...code].map((digit, index) => (
      <span key={index} className={digit === '0' ? 'pf-error-page__zero' : undefined}>
        {digit}
      </span>
    ))}
  </div>
);
