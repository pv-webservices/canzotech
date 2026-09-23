'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const COUNT_DURATION = 1500;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Global motion controller. Scroll position drives visual state continuously
 * where it matters, and one-shot reveals elsewhere.
 *
 * - [data-reveal]   entrance on first view ("up" | "left" | "right" | "mask")
 * - .lines          headline lines rise out of their own mask, staggered
 * - [data-count]    count-up on first view (SSR renders the final value)
 * - [data-scrub]    sets --p from 0→1 across the element's travel: used by the
 *                   hero frame that opens and the oversized sliding type
 * - [data-parallax] scroll-linked offset, desktop only (it would overlap on mobile)
 */
export function ScrollEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: Array<() => void> = [];

    const revealItems = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal], .lines, .process-list li'));
    const counters = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));

    if (reduceMotion) {
      revealItems.forEach((element) => element.classList.add('is-visible'));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
      );
      revealItems.forEach((element) => revealObserver.observe(element));
      cleanups.push(() => revealObserver.disconnect());

      const countObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const element = entry.target as HTMLElement;
            countObserver.unobserve(element);
            const target = Number(element.dataset.count ?? 0);
            const start = performance.now();
            const tick = (now: number) => {
              const progress = clamp((now - start) / COUNT_DURATION, 0, 1);
              element.textContent = String(Math.round(easeOut(progress) * target));
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          });
        },
        { threshold: 0.5 },
      );
      counters.forEach((element) => countObserver.observe(element));
      cleanups.push(() => countObserver.disconnect());
    }

    const scrubItems = Array.from(document.querySelectorAll<HTMLElement>('[data-scrub]'));
    const parallaxItems = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
    const progressBar = document.querySelector<HTMLElement>('[data-scroll-progress]');

    let frame = 0;
    const render = () => {
      frame = 0;
      const viewportHeight = window.innerHeight;

      if (progressBar) {
        const scrollable = document.documentElement.scrollHeight - viewportHeight;
        progressBar.style.setProperty('--scroll-progress', String(scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 0));
      }

      if (reduceMotion) {
        scrubItems.forEach((element) => element.style.setProperty('--p', '1'));
        return;
      }

      scrubItems.forEach((element) => {
        const rect = element.getBoundingClientRect();
        // 0 when the element's top edge enters the viewport, 1 once it has
        // travelled its own height plus a viewport past that point.
        const travel = rect.height + viewportHeight;
        const progress = clamp((viewportHeight - rect.top) / travel, 0, 1);
        element.style.setProperty('--p', progress.toFixed(4));
      });

      const allowParallax = window.innerWidth >= 900;
      parallaxItems.forEach((element) => {
        if (!allowParallax) {
          element.style.removeProperty('--parallax-y');
          return;
        }
        const rect = element.getBoundingClientRect();
        const speed = Number(element.dataset.parallax) || 0.06;
        const fromCenter = rect.top + rect.height / 2 - viewportHeight / 2;
        element.style.setProperty('--parallax-y', `${(fromCenter * speed).toFixed(2)}px`);
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(render);
    };

    render();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    cleanups.push(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [pathname]);

  return null;
}
