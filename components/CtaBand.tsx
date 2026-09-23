import { Action } from './Action';
import { company } from '@/lib/site-data';

export function CtaBand({ label, title, description }: { label: string; title: React.ReactNode; description: string }) {
  return (
    <section className="band band-ink cta-band">
      <div className="wrap cta-inner">
        <span className="mono index-label">{label}</span>
        <h2 className="display display-l" data-reveal="mask">
          {title}
        </h2>
        <p className="lede" data-reveal="up">
          {description}
        </p>
        <div className="cta-actions" data-reveal="up">
          <Action href="/contact" variant="grad">
            Start a project
          </Action>
          <a className="link" href={`mailto:${company.email}`}>
            <span>{company.email}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
