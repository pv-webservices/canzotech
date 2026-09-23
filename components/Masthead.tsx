'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brand } from './Brand';
import { Icon } from './Icon';
import { company, navigation, services } from '@/lib/site-data';

export function Masthead() {
  const [open, setOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setSubOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    return () => document.body.classList.remove('menu-open');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const active = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <header className={`masthead ${stuck ? 'is-stuck' : ''}`}>
      <div className="wrap masthead-row">
        <Brand />

        <nav className="nav" aria-label="Primary">
          {navigation.map((item) =>
            item.href === '/services' ? (
              <div className="nav-item" key={item.href}>
                <Link className="nav-link" href={item.href} data-active={active(item.href)}>
                  {item.label}
                </Link>
                <div className="flyout">
                  {services.map((service, index) => (
                    <Link key={service.slug} href={`/services/${service.slug}`}>
                      <span className="mono">{String(index + 1).padStart(2, '0')}</span>
                      <strong>{service.shortName}</strong>
                      <small>{service.description}</small>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link className="nav-link" key={item.href} href={item.href} data-active={active(item.href)}>
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="masthead-actions">
          <Link className="btn btn-solid btn-inline" href="/contact">
            <span>Start a project</span>
            <Icon name="arrowUpRight" size={14} />
          </Link>
          <button
            type="button"
            className="burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="menu-sheet"
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

        <span className="progress" data-scroll-progress aria-hidden="true" />
      </header>

      {open ? (
        <div className="sheet" id="menu-sheet">
          <div className="wrap">
            <div className="sheet-nav">
              {navigation.map((item, index) =>
                item.href === '/services' ? (
                  <div key={item.href}>
                    <button
                      type="button"
                      className="sheet-link"
                      style={{ '--i': index } as React.CSSProperties}
                      aria-expanded={subOpen}
                      onClick={() => setSubOpen((value) => !value)}
                    >
                      <span className="mono">{String(index + 1).padStart(2, '0')}</span>
                      <span>Services</span>
                      <Icon name={subOpen ? 'minus' : 'plus'} size={20} />
                    </button>
                    {subOpen ? (
                      <div className="sheet-sub">
                        <Link href="/services">All services</Link>
                        {services.map((service) => (
                          <Link key={service.slug} href={`/services/${service.slug}`}>
                            {service.shortName}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <Link key={item.href} className="sheet-link" href={item.href} style={{ '--i': index } as React.CSSProperties}>
                    <span className="mono">{String(index + 1).padStart(2, '0')}</span>
                    <span>{item.label}</span>
                    <Icon name="arrowUpRight" size={18} />
                  </Link>
                ),
              )}
            </div>

            <div className="sheet-foot">
              <span className="mono">Get in touch</span>
              <a className="display display-s" href={`mailto:${company.email}`}>
                {company.email}
              </a>
              {company.mobile && (
                <a className="mono" href={`tel:${company.mobile}`} style={{ color: 'var(--on-ink)' }}>
                  Mob: {company.mobile}
                </a>
              )}
              {company.landline && (
                <span className="mono" style={{ color: 'var(--on-ink-muted)' }}>
                  LN: {company.landline}
                </span>
              )}
              {company.linkedin && (
                <a className="mono" href={company.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--on-ink)' }}>
                  LinkedIn ↗
                </a>
              )}
              {company.location && (
                <span className="mono" style={{ color: 'var(--on-ink-muted)', fontSize: '12px' }}>
                  📍 {company.location}
                </span>
              )}
              <Link className="btn btn-solid" href="/contact">
                <span>Start a project</span>
                <Icon name="arrowUpRight" size={14} />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
