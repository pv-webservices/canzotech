'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';

/**
 * Horizontal rail built on native overflow scrolling, so touch swipe, trackpad,
 * keyboard and arrow buttons all work on every device. Pointer drag is layered
 * on top for mouse users.
 */
export function Rail({ children, label }: { children: React.ReactNode; label: string }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState({ left: 0, width: 30 });
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const measure = useCallback(() => {
    const element = viewport.current;
    if (!element) return;
    const max = element.scrollWidth - element.clientWidth;
    const ratio = element.scrollWidth > 0 ? element.clientWidth / element.scrollWidth : 1;
    const width = Math.max(ratio * 100, 12);
    const left = max > 0 ? (element.scrollLeft / max) * (100 - width) : 0;
    setProgress({ left, width });
    setAtStart(element.scrollLeft <= 2);
    setAtEnd(element.scrollLeft >= max - 2);
  }, []);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    measure();
    element.addEventListener('scroll', measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      element.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, [measure]);

  const step = useCallback((direction: 1 | -1) => {
    const element = viewport.current;
    if (!element) return;
    const first = element.querySelector<HTMLElement>('.rail-slide');
    const distance = first ? first.offsetWidth + 1 : element.clientWidth * 0.8;
    element.scrollBy({ left: direction * distance, behavior: 'smooth' });
  }, []);

  // pointer drag (mouse only — touch already scrolls natively)
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    let startX = 0;
    let startScroll = 0;
    let dragging = false;

    const down = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      dragging = true;
      startX = event.clientX;
      startScroll = element.scrollLeft;
    };
    const move = (event: PointerEvent) => {
      if (!dragging) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 4) element.classList.add('is-dragging');
      element.scrollLeft = startScroll - delta;
    };
    const up = () => {
      dragging = false;
      element.classList.remove('is-dragging');
    };

    element.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      element.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  return (
    <div className="rail">
      <div
        className="rail-viewport"
        ref={viewport}
        tabIndex={0}
        role="region"
        aria-label={label}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') step(1);
          if (event.key === 'ArrowLeft') step(-1);
        }}
      >
        <div className="rail-track">{children}</div>
      </div>

      <div className="wrap rail-foot">
        <span className="rail-bar" aria-hidden="true">
          <span style={{ '--rail-left': `${progress.left}%`, '--rail-width': `${progress.width}%` } as React.CSSProperties} />
        </span>
        <span className="rail-arrows">
          <button type="button" className="icon-btn" aria-label="Previous" onClick={() => step(-1)} disabled={atStart}>
            <Icon name="chevronLeft" size={18} />
          </button>
          <button type="button" className="icon-btn" aria-label="Next" onClick={() => step(1)} disabled={atEnd}>
            <Icon name="chevronRight" size={18} />
          </button>
        </span>
      </div>
    </div>
  );
}
