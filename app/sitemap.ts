import type { MetadataRoute } from 'next';
import { services } from '@/lib/site-data';
import { solutions } from '@/lib/solutions';
import { absoluteUrl } from '@/lib/seo';

// Only indexable, canonical URLs belong here. /privacy-policy and /terms are noindex, so they are left out.
const pages = ['/', '/about', '/services', '/work', '/careers', '/contact'];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...pages.map((path) => ({
      url: absoluteUrl(path),
      lastModified,
      changeFrequency: path === '/' ? ('weekly' as const) : ('monthly' as const),
      priority: path === '/' ? 1 : 0.7,
    })),
    ...services.map((service) => ({
      url: absoluteUrl(`/services/${service.slug}`),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...solutions.map((solution) => ({
      url: absoluteUrl(`/work/${solution.slug}`),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
