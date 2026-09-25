import type { MetadataRoute } from 'next';
import { company } from '@/lib/site-data';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CanzoTech — Software Engineering Studio',
    short_name: company.name,
    description: company.description,
    start_url: '/',
    display: 'browser',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      { src: '/icon.png', sizes: '192x192', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
