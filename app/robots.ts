import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

// Everything is crawlable, including /_next/static and /_next/image (needed to render pages and index images).
// Pages that should stay out of search results use a noindex robots meta tag instead, which crawlers can only
// see if the page is not blocked here.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
