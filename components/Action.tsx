import Link from 'next/link';
import { Icon } from './Icon';

type Variant = 'solid' | 'outline' | 'onink' | 'grad';

/** Primary call-to-action. The colour wipe on hover lives in globals.css. */
export function Action({
  href,
  children,
  variant = 'solid',
  inline = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  inline?: boolean;
}) {
  const className = `btn btn-${variant} ${inline ? 'btn-inline' : ''}`;
  const body = (
    <>
      <span>{children}</span>
      <Icon name="arrowUpRight" size={14} />
    </>
  );

  if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) {
    return (
      <a className={className} href={href}>
        {body}
      </a>
    );
  }

  return (
    <Link className={className} href={href}>
      {body}
    </Link>
  );
}

/** Quiet text link with a sweeping underline. */
export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="link" href={href}>
      <span>{children}</span>
      <Icon name="arrowUpRight" size={13} />
    </Link>
  );
}
