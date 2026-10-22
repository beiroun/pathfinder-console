// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

import { useLang } from '@/i18n/LangContext';

import './copyableLink.css';

// The fill eases in (CSS), holds only long enough to read as "filled", then releases straight into the burst
const fillHoldMs = 240;
// A dense burst, so the whole area erupts with stars
const sparkCount = 40;
// The longest star (duration + stagger) plus a buffer: the nodes go only once every star has finished
const sparkLifetimeMs = 1300;
// How long a refused copy keeps its message next to the link
const failureShownMs = 3000;

interface Spark {
  id: number;
  style: CSSProperties;
}

// Where the link was at the moment of the copy: the burst is portalled over the page onto this box
interface Burst {
  rect: { left: number; top: number; width: number; height: number };
  sparks: Spark[];
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A one-off swarm of stars erupting from every corner of the box: each starts at a random point across the whole
 * area (and a touch beyond), then flies outward from the centre with jitter, a gentle upward drift and its own
 * size, spin and timing - so it reads as magic, not a tidy ring.
 */
const buildSparks = (): Spark[] =>
  Array.from({ length: sparkCount }, (_, id) => {
    const startX = -10 + Math.random() * 120;
    const startY = -10 + Math.random() * 120;
    let outward = Math.atan2(startY - 50, startX - 50);
    if (!Number.isFinite(outward)) outward = Math.random() * Math.PI * 2;
    const angle = outward + (Math.random() - 0.5) * 1.6;
    const distance = 22 + Math.random() * 48;
    const size = 5 + Math.random() * 10;
    return {
      id,
      style: {
        left: `${startX}%`,
        top: `${startY}%`,
        '--spark-size': `${size}px`,
        '--spark-tx': `${Math.cos(angle) * distance}px`,
        // Every star drifts a little upward, so the swarm floats as it scatters
        '--spark-ty': `${Math.sin(angle) * distance - (8 + Math.random() * 16)}px`,
        '--spark-rot': `${Math.random() * 360 - 180}deg`,
        animationDelay: `${Math.random() * 140}ms`,
        animationDuration: `${640 + Math.random() * 460}ms`
      } as CSSProperties
    };
  });

const SparkleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
    aria-hidden
    focusable={false}
  >
    <path d="M12 1.5 L14.1 9.9 L22.5 12 L14.1 14.1 L12 22.5 L9.9 14.1 L1.5 12 L9.9 9.9 Z" />
  </svg>
);

/**
 * The public link of a code as plain text, and the text itself is the copy target - no button, no icon. Hovering
 * washes a soft accent area a touch wider than the text; a copy fills it solid accent, then the fill bursts into a
 * swarm of stars, portalled over the page so they fly free of any scroll clipping, and settles back. With reduced
 * motion the fill alone confirms the copy. A refused copy says so next to the link.
 */
export function CopyableLink({ url, multiline = false }: { url: string; multiline?: boolean }) {
  const { t } = useLang();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const [burst, setBurst] = useState<Burst | null>(null);
  const fillTimer = useRef<number | null>(null);
  const sparkTimer = useRef<number | null>(null);
  const failureTimer = useRef<number | null>(null);

  // Pending timers die with the component
  useEffect(
    () => () => {
      for (const timer of [fillTimer, sparkTimer, failureTimer]) {
        if (timer.current !== null) window.clearTimeout(timer.current);
      }
    },
    []
  );

  const handleCopy = async () => {
    if (failureTimer.current !== null) window.clearTimeout(failureTimer.current);
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error('Failed to copy the link', error);
      setFailed(true);
      failureTimer.current = window.setTimeout(() => setFailed(false), failureShownMs);
      return;
    }
    setFailed(false);

    // A rapid re-click restarts the whole effect
    if (fillTimer.current !== null) window.clearTimeout(fillTimer.current);
    if (sparkTimer.current !== null) window.clearTimeout(sparkTimer.current);
    setBurst(null);
    setCopied(true);

    fillTimer.current = window.setTimeout(() => {
      setCopied(false);
      const node = buttonRef.current;
      if (!node || prefersReducedMotion()) return;
      const rect = node.getBoundingClientRect();
      setBurst({
        rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
        sparks: buildSparks()
      });
      sparkTimer.current = window.setTimeout(() => setBurst(null), sparkLifetimeMs);
    }, fillHoldMs);
  };

  const className =
    'pf-copy-link' +
    (multiline ? ' pf-copy-link--multiline' : '') +
    (copied ? ' pf-copy-link--copied' : '') +
    (failed ? ' pf-copy-link--failed' : '');

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={className}
        onClick={() => void handleCopy()}
        title={t.common.clickToCopy}
      >
        <span className="pf-copy-link__text">{url}</span>
      </button>
      <span className="pf-copy-link__status" role="status">
        {copied ? t.common.copied : failed ? t.common.copyRefused : ''}
      </span>
      {burst &&
        createPortal(
          <div
            className="pf-spark-burst"
            style={{
              left: burst.rect.left,
              top: burst.rect.top,
              width: burst.rect.width,
              height: burst.rect.height
            }}
            aria-hidden
          >
            {burst.sparks.map(spark => (
              <span key={spark.id} className="pf-spark" style={spark.style}>
                <SparkleIcon />
              </span>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
