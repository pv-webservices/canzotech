'use client';

import { useEffect } from 'react';
import { Action } from '@/components/Action';
import { Icon } from '@/components/Icon';
import { PageIntro } from '@/components/PageIntro';
import { company } from '@/lib/site-data';

/** Error boundary for every route below the root layout; the header and footer stay usable. */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surfaces in the browser console and in the host's logs via the digest; no user data is included.
    console.error(error);
  }, [error]);

  return (
    <>
      <title>Something went wrong — CanzoTech</title>
      <meta name="robots" content="noindex" />
      <PageIntro
        index="500"
        label="Error"
        title={
          <>
            Something went <em>wrong.</em>
          </>
        }
        description={`This page failed to load. Please try again. If it keeps happening, email us at ${company.email} and we will look into it.`}
        actions={
          <>
            <button type="button" className="btn btn-solid" onClick={reset}>
              <span>Try again</span>
              <Icon name="arrowUpRight" size={14} />
            </button>
            <Action href="/" variant="outline">
              Back to home
            </Action>
          </>
        }
      />
    </>
  );
}
