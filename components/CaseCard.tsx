import Image from 'next/image';
import Link from 'next/link';
import type { Solution } from '@/lib/solutions';
import { Icon } from './Icon';

export function CaseCard({ solution, priority = false }: { solution: Solution; priority?: boolean }) {
  return (
    <Link href={`/work/${solution.slug}`} className="case">
      <span className="case-frame">
        <Image
          src={solution.image}
          alt={`${solution.name} interface concept`}
          width={900}
          height={672}
          sizes="(max-width: 700px) 84vw, 420px"
          priority={priority}
        />
        <span className="case-tag mono">{solution.type}</span>
      </span>
      <span className="case-meta">
        <span className="case-title display display-s">{solution.name}</span>
        <Icon name="arrowUpRight" size={18} />
      </span>
      <span className="case-text">{solution.summary}</span>
    </Link>
  );
}
