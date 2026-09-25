import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { solutions } from '@/lib/solutions';
import { services } from '@/lib/site-data';
import { Action, TextLink } from '@/components/Action';
import { CaseCard } from '@/components/CaseCard';
import { CtaBand } from '@/components/CtaBand';
import { Icon } from '@/components/Icon';
import { PageIntro } from '@/components/PageIntro';
import { pageMetadata } from '@/lib/seo';

// Only the known project slugs exist; anything else is a real 404 instead of an on-demand render.
export const dynamicParams = false;

export function generateStaticParams() {
  return solutions.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const solution = solutions.find((item) => item.slug === slug);
  if (!solution) return {};
  return pageMetadata({
    title: `${solution.name} Development`,
    description: `${solution.summary} See the approach, features and stack.`,
    path: `/work/${solution.slug}`,
    image: `/work/${solution.slug}/opengraph-image`,
  });
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = solutions.find((item) => item.slug === slug);
  if (!solution) notFound();

  const service = services.find((item) => item.slug === solution.serviceSlug);
  const others = solutions.filter((item) => item.slug !== solution.slug).slice(0, 3);
  const position = solutions.findIndex((item) => item.slug === solution.slug) + 1;

  return (
    <>
      <PageIntro
        index={String(position).padStart(2, '0')}
        label="Blueprint"
        title={solution.name}
        description={solution.summary}
        crumbs={[{ label: 'Work', href: '/work' }, { label: solution.name }]}
        actions={
          <>
            <Action href="/contact">Build something like this</Action>
            {service ? (
              <Action href={`/services/${service.slug}`} variant="outline">
                {service.shortName}
              </Action>
            ) : null}
          </>
        }
        aside={
          <dl className="spec-list">
            <div>
              <dt className="mono">Type</dt>
              <dd>{solution.type}</dd>
            </div>
            <div>
              <dt className="mono">Focus</dt>
              <dd>{solution.categories.join(', ')}</dd>
            </div>
            <div>
              <dt className="mono">Stack</dt>
              <dd>{solution.stack.join(' · ')}</dd>
            </div>
          </dl>
        }
      />

      <figure className="page-figure">
        <div className="page-figure-frame">
          <Image
            src={solution.image}
            alt={`${solution.name} interface concept`}
            width={1200}
            height={896}
            priority
            sizes="100vw"
            data-parallax="-0.04"
          />
        </div>
        <figcaption className="wrap mono">Fig. 01 — {solution.name}, concept visual</figcaption>
      </figure>

      <section className="band rule-top">
        <div className="wrap two-col">
          <span className="mono index-label" data-reveal="up">
            A / The problem
          </span>
          <div className="col-copy">
            <h2 className="display display-l" data-reveal="mask">
              {solution.problem}
            </h2>
          </div>
        </div>
      </section>

      <section className="band band-soft">
        <div className="wrap two-col">
          <h2 className="mono index-label" data-reveal="up">
            B / How we approach it
          </h2>
          <div className="col-copy">
            <ol className="numbered-list">
              {solution.approach.map((step, index) => (
                <li key={step} data-reveal="up" style={{ '--reveal-delay': `${index * 60}ms` } as React.CSSProperties}>
                  <span className="mono">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="display display-s">{step}</h3>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="band band-ink">
        <div className="wrap two-col">
          <h2 className="mono index-label" data-reveal="up">
            C / Typical feature set
          </h2>
          <div className="col-copy">
            <ul className="tick-list tick-list-split">
              {solution.features.map((feature, index) => (
                <li key={feature} data-reveal="up" style={{ '--reveal-delay': `${index * 50}ms` } as React.CSSProperties}>
                  <Icon name="check" size={15} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="chips chips-on-ink" data-reveal="up">
              {solution.stack.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="band-head" data-reveal="up">
            <span className="mono index-label">D / More work</span>
            <div className="band-head-copy">
              <h2 className="display display-l">Other products we build</h2>
              <TextLink href="/work">All projects</TextLink>
            </div>
          </div>
          <div className="case-grid">
            {others.map((item) => (
              <CaseCard key={item.slug} solution={item} />
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        label="E / Next step"
        title={
          <>
            Need something similar, <em>built properly?</em>
          </>
        }
        description="Start with the problem, your current system and the constraints you are working within."
      />
    </>
  );
}
