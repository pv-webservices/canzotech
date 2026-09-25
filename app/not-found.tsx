import type { Metadata } from 'next';
import Link from 'next/link';
import { Action } from '@/components/Action';
import { PageIntro } from '@/components/PageIntro';
import { navigation } from '@/lib/site-data';

// Next.js also sends a 404 status and a noindex tag for this page.
export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you were looking for does not exist or has moved.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <PageIntro
      index="404"
      label="Not found"
      title={
        <>
          This page <em>does not exist.</em>
        </>
      }
      description="The link may be out of date, or the address may have been mistyped. Everything we publish is reachable from the pages below."
      actions={
        <>
          <Action href="/">Back to home</Action>
          <Action href="/contact" variant="outline">
            Contact us
          </Action>
        </>
      }
      aside={
        <nav className="intro-stack" aria-label="Main pages">
          <span className="mono">Try instead</span>
          <div className="chips chips-link">
            {navigation
              .filter((item) => item.href !== '/')
              .map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
          </div>
        </nav>
      }
    />
  );
}
