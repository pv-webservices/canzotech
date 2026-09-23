import Link from 'next/link';
import { Brand } from './Brand';
import { Action } from './Action';
import { company, services } from '@/lib/site-data';
import { solutions } from '@/lib/solutions';

export function SiteFoot() {
  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="foot-top">
          <div className="footer-brand">
            <Brand />
            <p>Software engineering for businesses that need working products, not project theatre.</p>
            <Action href="/contact" variant="onink" inline>
              Start a project
            </Action>
          </div>

          <div className="foot-col">
            <span className="mono">Company</span>
            <Link href="/about">About</Link>
            <Link href="/services">Services</Link>
            <Link href="/work">Our work</Link>
            <Link href="/careers">Careers</Link>
            <Link href="/contact">Contact</Link>
          </div>

          <div className="foot-col">
            <span className="mono">Services</span>
            {services.slice(0, 6).map((service) => (
              <Link key={service.slug} href={`/services/${service.slug}`}>
                {service.shortName}
              </Link>
            ))}
          </div>

          <div className="foot-col">
            <span className="mono">Contact &amp; Social</span>
            <a href={`mailto:${company.email}`}>{company.email}</a>
            {company.mobile && <a href={`tel:${company.mobile}`}>Mob: {company.mobile}</a>}
            {company.landline && <span>LN: {company.landline}</span>}
            {company.linkedin && (
              <a href={company.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn ↗
              </a>
            )}
            {company.location && <span style={{ fontSize: '13.5px', opacity: 0.78, marginTop: '4px' }}>📍 {company.location}</span>}
          </div>
        </div>

        <div className="foot-mark" aria-hidden="true">
          Canzo<em>Tech</em>
        </div>

        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} CanzoTech</span>
          <div className="foot-links">
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
          </div>
          <span>Innovate · Build · Grow</span>
        </div>
      </div>
    </footer>
  );
}
