import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { services } from '@/lib/site-data';
import { solutions } from '@/lib/solutions';
import { Action, TextLink } from '@/components/Action';
import { CaseCard } from '@/components/CaseCard';
import { CtaBand } from '@/components/CtaBand';
import { FaqAccordion } from '@/components/FaqAccordion';
import { Icon } from '@/components/Icon';
import { JsonLd } from '@/components/JsonLd';
import { PageIntro } from '@/components/PageIntro';
import { absoluteUrl, ORGANIZATION_ID, pageMetadata } from '@/lib/seo';

const phases = ['Discover', 'Plan', 'Design', 'Build', 'Test', 'Deliver'];

// Only the known service slugs exist; anything else is a real 404 instead of an on-demand render.
export const dynamicParams = false;

const MAX_DESCRIPTION_LENGTH = 160;

/** Search title: 'Custom Software Development Services' rather than the bare service name. */
function serviceTitle(name: string) {
  return /(services|solutions)$/i.test(name) ? name : `${name} Services`;
}

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) return {};
  return pageMetadata({
    title: serviceTitle(service.name),
    description: service.intro.length <= MAX_DESCRIPTION_LENGTH ? service.intro : service.description,
    path: `/services/${service.slug}`,
    image: `/services/${service.slug}/opengraph-image`,
  });
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();

  const others = services.filter((item) => item.slug !== service.slug).slice(0, 4);
  const related = solutions.filter((item) => item.serviceSlug === service.slug);
  const position = services.findIndex((item) => item.slug === service.slug) + 1;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    serviceType: service.name,
    description: service.description,
    url: absoluteUrl(`/services/${service.slug}`),
    provider: { '@id': ORGANIZATION_ID },
    areaServed: { '@type': 'Country', name: 'India' },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: service.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <>
      <PageIntro
        index={String(position).padStart(2, '0')}
        label="Service"
        title={service.name}
        description={service.intro}
        crumbs={[{ label: 'Services', href: '/services' }, { label: service.shortName }]}
        actions={
          <>
            <Action href="/contact">Discuss this service</Action>
            <Action href="#capabilities" variant="outline">
              What is included
            </Action>
          </>
        }
        aside={
          <div className="intro-stack">
            <span className="mono">Stack</span>
            <div className="chips">
              {service.stack.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        }
      />

      <section className="band rule-top">
        <div className="wrap two-col">
          <span className="mono index-label" data-reveal="up">
            A / Where it helps
          </span>
          <div className="col-copy">
            <h2 className="display display-l" data-reveal="mask">
              {service.description}
            </h2>
            <ul className="tick-list">
              {service.challenges.map((item, index) => (
                <li key={item} data-reveal="up" style={{ '--reveal-delay': `${index * 55}ms` } as React.CSSProperties}>
                  <Icon name="check" size={15} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="capabilities" className="band band-soft">
        <div className="wrap">
          <h2 className="mono index-label" data-reveal="up">
            B / Capabilities
          </h2>
          <ol className="numbered-list numbered-list-split">
            {service.capabilities.map((item, index) => (
              <li key={item} data-reveal="up" style={{ '--reveal-delay': `${index * 50}ms` } as React.CSSProperties}>
                <span className="mono">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="display display-s">{item}</h3>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band band-ink">
        <div className="wrap two-col">
          <span className="mono index-label" data-reveal="up">
            C / Approach
          </span>
          <div className="col-copy">
            <h2 className="display display-l" data-reveal="mask">
              Practical decisions, <em>visible trade-offs.</em>
            </h2>
            <p className="lede" data-reveal="up">
              The delivery approach adapts to your existing system, risk level, team structure and release requirements
              rather than forcing every engagement into one fixed process.
            </p>
            <div className="phase-row">
              {phases.map((phase, index) => (
                <div key={phase} data-reveal="up" style={{ '--reveal-delay': `${index * 55}ms` } as React.CSSProperties}>
                  <span className="mono">{String(index + 1).padStart(2, '0')}</span>
                  <strong>{phase}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {related.length ? (
        <section className="band">
          <div className="wrap">
            <div className="band-head" data-reveal="up">
              <span className="mono index-label">D / In practice</span>
              <div className="band-head-copy">
                <h2 className="display display-l">{service.shortName} at work</h2>
                <TextLink href="/work">All projects</TextLink>
              </div>
            </div>
            <div className="case-grid">
              {related.map((solution) => (
                <CaseCard key={solution.slug} solution={solution} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="band band-soft">
        <div className="wrap two-col">
          <span className="mono index-label" data-reveal="up">
            E / Questions
          </span>
          <div className="col-copy">
            <h2 className="display display-l" data-reveal="mask">
              Straight answers, before you commit.
            </h2>
            <FaqAccordion items={service.faqs} />
          </div>
        </div>
      </section>

      <section className="band rule-top">
        <div className="wrap">
          <span className="mono index-label" data-reveal="up">
            F / Related
          </span>
          <ol className="srv-rows related-rows">
            {others.map((item, index) => (
              <li key={item.slug}><Link
                href={`/services/${item.slug}`}
                className="srv-row"
                data-reveal="up"
                style={{ '--reveal-delay': `${index * 55}ms` } as React.CSSProperties}
              >
                <span className="mono srv-num">{String(index + 1).padStart(2, '0')}</span>
                <span className="srv-name display display-s">{item.name}</span>
                <span className="srv-text">{item.description}</span>
                <span className="srv-go" aria-hidden="true">
                  <Icon name="arrowUpRight" size={18} />
                </span>
              </Link></li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand
        label="G / Next step"
        title={
          <>
            Have a specific {service.shortName} <em>requirement?</em>
          </>
        }
        description="Share the current system, the constraints and the outcome you are aiming for."
      />

      <JsonLd data={schema} />
      <JsonLd data={faqSchema} />
    </>
  );
}
