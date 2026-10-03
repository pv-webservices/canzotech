import Image from 'next/image';
import type { Photo } from '@/lib/photos';

/** A photograph in the site's treatment: black and white, returning to colour on hover. */
export function PhotoFigure({ photo, sizes, caption, className = '' }: { photo: Photo; sizes: string; caption?: string; className?: string }) {
  return (
    <figure className={`photo ${className}`}>
      <span className="photo-frame">
        <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes={sizes} />
      </span>
      {caption ? <figcaption className="mono">{caption}</figcaption> : null}
    </figure>
  );
}
