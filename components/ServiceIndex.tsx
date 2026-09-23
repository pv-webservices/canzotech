'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Service } from '@/lib/site-data';
import { Icon } from './Icon';

const previews: Record<string, string> = {
  'custom-software-development': '/images/keys-bw.webp',
  'web-development': '/images/case-saas.webp',
  'mobile-app-development': '/images/case-fintech.webp',
  'ai-automation': '/images/architecture-sketch.webp',
  'cloud-devops': '/images/hero-bw.webp',
  'ui-ux-design': '/images/designer-whiteboard.webp',
  'qa-testing': '/images/case-health.webp',
  'technology-consulting': '/images/team-bw.webp',
};

/**
 * The service list is an index of rows, not a card grid. On pointer devices a
 * preview follows the cursor; touch devices simply get the rows.
 */
export function ServiceIndex({ services }: { services: Service[] }) {
  const [active, setActive] = useState<string | null>(null);
  const layer = useRef<HTMLDivElement>(null);

  const track = (event: React.PointerEvent) => {
    if (event.pointerType !== 'mouse' || !layer.current) return;
    layer.current.style.setProperty('--x', `${event.clientX}px`);
    layer.current.style.setProperty('--y', `${event.clientY}px`);
  };

  return (
    <div className="srv" onPointerMove={track}>
      <div className="wrap">
        <ol className="srv-rows">
          {services.map((service, index) => (
            <li key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                className="srv-row"
                data-reveal="up"
                style={{ '--reveal-delay': `${Math.min(index, 7) * 45}ms` } as React.CSSProperties}
                onPointerEnter={(event) => {
                  if (event.pointerType === 'mouse') setActive(service.slug);
                }}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(null)}
              >
                <span className="mono srv-num">{String(index + 1).padStart(2, '0')}</span>
                <span className="srv-name display display-s">{service.name}</span>
                <span className="srv-text">{service.description}</span>
                <span className="srv-go" aria-hidden="true">
                  <Icon name="arrowUpRight" size={18} />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <div className={`srv-preview ${active ? 'is-on' : ''}`} ref={layer} aria-hidden="true">
        {services.map((service) => (
          <Image
            key={service.slug}
            src={previews[service.slug] ?? '/images/keys-bw.webp'}
            alt=""
            width={520}
            height={390}
            className={active === service.slug ? 'is-active' : ''}
          />
        ))}
      </div>
    </div>
  );
}
