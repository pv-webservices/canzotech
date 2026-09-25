'use client';

import { useEffect } from 'react';
import './globals.css';
import { company } from '@/lib/site-data';

/**
 * Last-resort boundary for failures in the root layout itself. It replaces the whole document, so it
 * renders its own <html> and cannot rely on the header, footer or web fonts.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en-IN">
      <head>
        <title>Something went wrong — CanzoTech</title>
        <meta name="robots" content="noindex" />
      </head>
      <body>
        <main className="band">
          <div className="wrap">
            <span className="mono index-label">500 / Error</span>
            <h1 className="display display-xl" style={{ margin: '24px 0' }}>
              Something went wrong.
            </h1>
            <p className="lede" style={{ marginBottom: 32 }}>
              The site failed to load. Please try again, or email us at{' '}
              <a href={`mailto:${company.email}`}>{company.email}</a>.
            </p>
            <button type="button" className="btn btn-solid" onClick={reset}>
              <span>Try again</span>
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
