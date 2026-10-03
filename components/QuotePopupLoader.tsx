'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// The pop-up's code (slider, form, validation) is only downloaded when it is about to open,
// so it adds nothing to the first page load.
const QuotePopup = dynamic(() => import('./QuotePopup').then((module) => module.QuotePopup), { ssr: false });

export const POPUP_DELAY_MS = 5000;
export const POPUP_SEEN_KEY = 'canzotech-quote-popup-seen';
// Pages where a quote pop-up would interrupt the visitor or duplicate the page's own form.
const EXCLUDED_PATHS = ['/contact', '/thank-you', '/privacy-policy', '/terms'];

function alreadySeen(): boolean {
  try {
    return sessionStorage.getItem(POPUP_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(POPUP_SEEN_KEY, '1');
  } catch {
    // Without storage the pop-up may show again on the next page; acceptable.
  }
}

/** Opens the free-quote pop-up once per browser session, 5 seconds after the visitor lands. */
export function QuotePopupLoader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const excluded = EXCLUDED_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (excluded) {
      setOpen(false);
      return;
    }
    if (alreadySeen()) return;
    const timer = window.setTimeout(() => {
      markSeen();
      setOpen(true);
    }, POPUP_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [excluded]);

  return open ? <QuotePopup onClose={() => setOpen(false)} /> : null;
}
