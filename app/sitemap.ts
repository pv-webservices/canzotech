import type { MetadataRoute } from 'next';
import { services } from '@/lib/site-data';
import { solutions } from '@/lib/solutions';
import { absoluteUrl } from '@/lib/seo';

// Only indexable, canonical URLs belong here. Left out on purpose (all noindex): /privacy-policy, /terms,
// /thank-you and the 404 page. scripts/audit-seo.mjs fails the build check if this list drifts from the pages.

/** Date each page's content last changed (YYYY-MM-DD). Update when you edit a page, so lastmod stays truthful. */
const SITE_UPDATED = '2026-10-03';
const UPDATED: Record<string, string> = {
  '/': SITE_UPDATED,
  '/about': SITE_UPDATED,
  '/careers': SITE_UPDATED,
  '/contact': SITE_UPDATED,
  '/services': '2026-09-26',
  '/work': '2026-09-26',
};
const SERVICES_UPDATED = '2026-09-26';
const WORK_UPDATED = '2026-09-26';

const pages = ['/', '/about', '/services', '/work', '/careers', '/contact'];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...pages.map((path) => ({
      url: absoluteUrl(path),
      lastModified: UPDATED[path] ?? SITE_UPDATED,
      changeFrequency: path === '/' ? ('weekly' as const) : ('monthly' as const),
      priority: path === '/' ? 1 : 0.7,
    })),
    ...services.map((service) => ({
      url: absoluteUrl(`/services/${service.slug}`),
      lastModified: SERVICES_UPDATED,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...solutions.map((solution) => ({
      url: absoluteUrl(`/work/${solution.slug}`),
      lastModified: WORK_UPDATED,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
