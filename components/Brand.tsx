import Image from 'next/image';
import Link from 'next/link';

export function Brand({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`brand ${className}`} aria-label="CanzoTech — home">
      <Image src="/images/brand/canzotech-mark.webp" alt="" width={34} height={19} loading="eager" className="brand-symbol" />
      <span className="brand-word">
        Canzo<em>Tech</em>
      </span>
    </Link>
  );
}
