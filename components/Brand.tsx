import Image from 'next/image';
import Link from 'next/link';

export function Brand({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`brand ${className}`} aria-label="CanzoTech — home">
      <Image src="/canzotech-mark.webp" alt="" width={144} height={80} priority className="brand-symbol" />
      <span className="brand-word">
        Canzo<em>Tech</em>
      </span>
    </Link>
  );
}
