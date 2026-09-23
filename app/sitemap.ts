import type { MetadataRoute } from 'next';
import { services } from '@/lib/site-data';
import { solutions } from '@/lib/solutions';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.canzotech.com';
  const routes = ['', '/about', '/services', '/work', '/careers', '/contact', '/privacy-policy', '/terms'];

  return [
    ...routes.map((path) => ({
      url: `${base}${path}`,
      changeFrequency: path === '' ? ('weekly' as const) : ('monthly' as const),
      priority: path === '' ? 1 : 0.7,
    })),
    ...services.map((service) => ({ url: `${base}/services/${service.slug}`, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...solutions.map((solution) => ({ url: `${base}/work/${solution.slug}`, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ];
}
