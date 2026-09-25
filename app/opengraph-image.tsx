import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og-image';

// Default share card for every page that does not define its own.
export const alt = 'CanzoTech — Software Engineering Studio';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpenGraphImage() {
  return renderOgImage({ label: 'Software engineering studio', title: 'We turn ambitious ideas into software that earns its keep.' });
}
