// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties } from 'react';
import { useFeedback } from '../context/FeedbackContext';
import { copyText } from '../utils/format';
import { SparkleIcon } from './icons';

interface CopyableLinkProps {
  url: string;
  // Detail view wraps the full URL; the list keeps it to a single ellipsized line.
  multiline?: boolean;
}

// The blue fill eases in (0.2s CSS), holds only long enough to read as "filled", then releases
// straight into the sparkle burst — no lingering solid blue, just the plain hover afterwards.
const FILL_HOLD_MS = 240;
// A dense burst so the whole area erupts with stars.
const SPARK_COUNT = 40;
// Longest star (duration + stagger) plus a buffer, so nodes are removed only once they finish.
const SPARK_LIFETIME_MS = 1300;

interface Spark {
  id: number;
  style: CSSProperties;
}

// Position + size of the link at copy time; the burst is portalled over it (see handleCopy).
interface Burst {
  rect: { left: number; top: number; width: number; height: number };
  sparks: Spark[];
}

/**
 * Builds a one-off swarm of stars that erupt from every corner of the box: each starts at a random
 * point across the whole area (and a touch beyond), then flies outward from the centre with jitter,
 * a gentle upward drift and its own size/spin/timing — so it reads as magic, not a tidy ring.
 */
const buildSparks = (): Spark[] =>
  Array.from({ length: SPARK_COUNT }, (_, id) => {
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
        // Bias every star a little upward so the swarm floats as it scatters.
        '--spark-ty': `${Math.sin(angle) * distance - (8 + Math.random() * 16)}px`,
        '--spark-rot': `${Math.random() * 360 - 180}deg`,
        animationDelay: `${Math.random() * 140}ms`,
        animationDuration: `${640 + Math.random() * 460}ms`
      } as CSSProperties
    };
  });

/**
 * The public URL shown as plain clickable text: clicking the text itself copies it — no button or
 * box. Hovering paints a soft blue area a touch wider than the text. A copy fills that area solid
 * blue (white text), then the fill "explodes" into a swarm of little blue stars — portalled over the
 * page so they fly free of any scroll clipping — and settles back to the plain hover. A failed copy
 * falls back to an error toast.
 */
const CopyableLink = ({ url, multiline = false }: CopyableLinkProps) => {
  const { showAlert } = useFeedback();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);
  const [burst, setBurst] = useState<Burst | null>(null);
  const fillTimer = useRef<number | null>(null);
  const sparkTimer = useRef<number | null>(null);

  // Cancel pending timers if the component unmounts mid-effect.
  useEffect(() => {
    return () => {
      if (fillTimer.current !== null) window.clearTimeout(fillTimer.current);
      if (sparkTimer.current !== null) window.clearTimeout(sparkTimer.current);
    };
  }, []);

  const handleCopy = async () => {
    const ok = await copyText(url);
    if (!ok) {
      showAlert('error', 'Не удалось скопировать ссылку.');
      return;
    }

    // Same sliding toaster the rest of the app uses ("QR-код сохранён" etc.).
    showAlert('success', 'Ссылка скопирована');

    // A rapid re-click restarts the whole effect from scratch.
    if (fillTimer.current !== null) window.clearTimeout(fillTimer.current);
    if (sparkTimer.current !== null) window.clearTimeout(sparkTimer.current);
    setBurst(null);

    // 1) Fill the area solid blue (white text).
    setCopied(true);

    // 2) Once filled, drop the blue back to plain hover and erupt it into stars at the same moment.
    fillTimer.current = window.setTimeout(() => {
      setCopied(false);
      const node = buttonRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      setBurst({
        rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
        sparks: buildSparks()
      });
      sparkTimer.current = window.setTimeout(() => setBurst(null), SPARK_LIFETIME_MS);
    }, FILL_HOLD_MS);
  };

  const className =
    'copy-link' +
    (multiline ? ' copy-link--multiline' : '') +
    (copied ? ' copy-link--copied' : '');

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={className}
        onClick={handleCopy}
        title="Нажмите, чтобы скопировать ссылку"
      >
        <span className="copy-link__text">{url}</span>
      </button>
      {burst &&
        createPortal(
          <div
            className="spark-burst"
            style={{
              left: burst.rect.left,
              top: burst.rect.top,
              width: burst.rect.width,
              height: burst.rect.height
            }}
            aria-hidden
          >
            {burst.sparks.map(spark => (
              <span key={spark.id} className="spark" style={spark.style}>
                <SparkleIcon />
              </span>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

export default CopyableLink;
