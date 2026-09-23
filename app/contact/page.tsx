import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from '@/components/ContactForm';
import { PageIntro } from '@/components/PageIntro';
import { company, services } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Discuss a software development, modernisation or automation project with CanzoTech.',
  alternates: { canonical: '/contact' },
};

const steps = [
  { title: 'You share the context', text: 'The problem, your current setup, the timeline and what a good outcome looks like.' },
  { title: 'We review together', text: 'A short call to clarify scope, constraints and the questions that matter most.' },
  { title: 'You get a plan', text: 'An approach, a delivery shape and the trade-offs behind it — before any commitment.' },
];

export default function ContactPage() {
  return (
    <>
      <PageIntro
        index="01"
        label="Contact"
        title={
          <>
            Tell us what is <em>not working</em> today.
          </>
        }
        description="Share enough context to understand the problem, your current setup, the timeline and the outcome you expect."
        crumbs={[{ label: 'Contact' }]}
        aside={
          <div className="intro-stack">
            <span className="mono">Direct Contact</span>
            <div className="contact-detail-block">
              <span className="mono contact-detail-label">Email</span>
              <a className="display display-s contact-link" href={`mailto:${company.email}`}>
                {company.email}
              </a>
            </div>
            {company.mobile && (
              <div className="contact-detail-block">
                <span className="mono contact-detail-label">Mobile</span>
                <a className="display display-s contact-link" href={`tel:${company.mobile}`}>
                  {company.mobile}
                </a>
              </div>
            )}
            {company.landline && (
              <div className="contact-detail-block">
                <span className="mono contact-detail-label">Landline</span>
                <span className="display display-s contact-text">
                  {company.landline}
                </span>
              </div>
            )}
            {company.location && (
              <div className="contact-detail-block">
                <span className="mono contact-detail-label">Office Address</span>
                <span className="display display-s contact-text">
                  {company.location}
                </span>
              </div>
            )}
            {company.linkedin && (
              <div className="contact-detail-block">
                <span className="mono contact-detail-label">LinkedIn</span>
                <a className="display display-s contact-link" href={company.linkedin} target="_blank" rel="noopener noreferrer">
                  CanzoTech Profile ↗
                </a>
              </div>
            )}
          </div>
        }
      />

      <section className="band rule-top">
        <div className="wrap contact-grid">
          <div className="contact-side">
            <span className="mono index-label" data-reveal="up">
              02 / What happens next
            </span>
            <ol className="numbered-list numbered-list-tight">
              {steps.map((step, index) => (
                <li key={step.title} data-reveal="up" style={{ '--reveal-delay': `${index * 60}ms` } as React.CSSProperties}>
                  <span className="mono">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="display display-s">{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="contact-links">
              <span className="mono">Looking for something specific?</span>
              <div className="chips chips-link">
                {services.slice(0, 5).map((service) => (
                  <Link key={service.slug} href={`/services/${service.slug}`}>
                    {service.shortName}
                  </Link>
                ))}
                <Link href="/careers">Careers</Link>
              </div>
            </div>
          </div>

          <div id="form" className="contact-form-wrap" data-reveal="up">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
