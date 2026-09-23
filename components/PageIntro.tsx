import Link from 'next/link';
import { Icon } from './Icon';

export type Crumb = { label: string; href?: string };

export function PageIntro({
  index,
  label,
  title,
  description,
  crumbs = [],
  actions,
  aside,
}: {
  index: string;
  label: string;
  title: React.ReactNode;
  description?: string;
  crumbs?: Crumb[];
  actions?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="page-intro">
      <div className="wrap">
        {crumbs.length ? (
          <nav className="crumbs mono" aria-label="Breadcrumb">
            <Link href="/">Index</Link>
            {crumbs.map((crumb) => (
              <span key={crumb.label}>
                <Icon name="chevronRight" size={11} />
                {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <em>{crumb.label}</em>}
              </span>
            ))}
          </nav>
        ) : null}

        <div className="intro-meta mono">
          <span className="index-label">
            {index} / {label}
          </span>
        </div>

        <h1 className="display display-xl rise">{title}</h1>

        <div className="intro-grid">
          <div className="intro-copy rise" style={{ '--rise-delay': '120ms' } as React.CSSProperties}>
            {description ? <p className="lede">{description}</p> : null}
            {actions ? <div className="intro-actions">{actions}</div> : null}
          </div>
          {aside ? (
            <div className="intro-aside rise" style={{ '--rise-delay': '200ms' } as React.CSSProperties}>
              {aside}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
