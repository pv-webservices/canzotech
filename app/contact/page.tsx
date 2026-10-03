import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactDetails } from '@/components/ContactDetails';
import { EnquiryForm } from '@/components/EnquiryForm';
import { PageIntro } from '@/components/PageIntro';
import { services } from '@/lib/site-data';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Us — Start a Software Project',
  description:
    'Discuss a software development, modernisation or automation project with CanzoTech. Share your goals and get a considered plan, not a sales sequence.',
  path: '/contact',
});

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
            <span className="mono">Direct contact</span>
            <ContactDetails />
          </div>
        }
      />

      <section className="band rule-top">
        <div className="wrap contact-grid">
          <div className="contact-side">
            <h2 className="mono index-label" data-reveal="up">
              02 / What happens next
            </h2>
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
            <EnquiryForm formType="contact" />
          </div>
        </div>
      </section>
    </>
  );
}
