import type { Metadata } from 'next';
import Link from 'next/link';
import { Action } from '@/components/Action';
import { Icon } from '@/components/Icon';
import { PageIntro } from '@/components/PageIntro';
import { company, navigation, services } from '@/lib/site-data';

// Next.js sends a real 404 status for this page. noindex, and no canonical (none is inherited from the layout).
export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you were looking for does not exist or has moved. Find CanzoTech services, our work and contact details here.',
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
      description="The link may be out of date, or the address may have been mistyped. Everything we publish is reachable from the pages listed here."
      actions={
        <>
          <Action href="/">Back to home</Action>
          <Action href="/contact" variant="outline">
            Contact us
          </Action>
        </>
      }
      aside={
        <div className="intro-stack">
          <nav className="intro-stack" aria-label="Main pages">
            <span className="mono">Main pages</span>
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
          <nav className="intro-stack" aria-label="Popular services">
            <span className="mono">Popular services</span>
            <div className="chips chips-link">
              {services.slice(0, 5).map((service) => (
                <Link key={service.slug} href={`/services/${service.slug}`}>
                  {service.shortName}
                </Link>
              ))}
            </div>
          </nav>
          <a className="link" href={company.mobileHref}>
            <Icon name="mobile" size={15} />
            <span>Call {company.mobile}</span>
          </a>
        </div>
      }
    />
  );
}
