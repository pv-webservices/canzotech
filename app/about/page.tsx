import type { Metadata } from 'next';
import Image from 'next/image';
import { Action } from '@/components/Action';
import { CtaBand } from '@/components/CtaBand';
import { PageIntro } from '@/components/PageIntro';
import { stats } from '@/lib/site-data';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'About Our Software Engineering Studio',
  description:
    'Meet CanzoTech, a product-minded software engineering studio in Noida. How we approach software development, product thinking and long-term partnerships.',
  path: '/about',
});

const values = [
  { title: 'Clarity before complexity', text: 'We define the real business problem, the constraints and what success looks like before adding technology.' },
  { title: 'Engineering with context', text: 'Architecture decisions are weighed against product needs, day-to-day operations and realistic growth.' },
  { title: 'Transparent communication', text: 'Trade-offs, progress and scope changes surface early rather than arriving as a surprise at delivery.' },
  { title: 'Maintainability matters', text: 'The product stays understandable and extendable long after the first release — by your team or ours.' },
];

const partnership = [
  { title: 'Understand first', text: 'Requirements are challenged and clarified before implementation begins.' },
  { title: 'Ship in increments', text: 'Progress stays reviewable instead of appearing only at the end of a project.' },
  { title: 'Document decisions', text: 'Important architecture and delivery choices stay traceable for your team.' },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro
        index="01"
        label="About"
        title={
          <>
            Software delivery <em>without the theatre.</em>
          </>
        }
        description="CanzoTech is a software engineering studio for companies that need practical digital products, modernised systems and delivery they can actually follow."
        crumbs={[{ label: 'About' }]}
        actions={
          <>
            <Action href="/contact">Talk to the team</Action>
            <Action href="/services" variant="outline">
              Our services
            </Action>
          </>
        }
      />

      <figure className="page-figure">
        <div className="page-figure-frame">
          <Image
            src="/images/hero-bw.webp"
            alt="The CanzoTech team working together"
            width={1264}
            height={848}
            priority
            sizes="100vw"
            data-parallax="-0.04"
          />
        </div>
        <figcaption className="wrap mono">Fig. 01 — Working sessions, not status meetings</figcaption>
      </figure>

      <section className="band rule-top">
        <div className="wrap two-col">
          <span className="mono index-label" data-reveal="up">
            02 / Who we are
          </span>
          <div className="col-copy">
            <h2 className="display display-l" data-reveal="mask">
              We are a product-minded engineering team — fewer status decks, more working software.
            </h2>
            <p className="lede" data-reveal="up">
              Every engagement starts the same way: understand the business, the people who will use the product and the
              constraints around it. Only then do we choose the technology. It is a slower start and a much faster finish.
            </p>
          </div>
        </div>
      </section>

      <section className="band band-soft">
        <div className="wrap">
          <h2 className="mono index-label" data-reveal="up">
            03 / Approach
          </h2>
          <ol className="numbered-list">
            {values.map((value, index) => (
              <li key={value.title} data-reveal="up" style={{ '--reveal-delay': `${index * 60}ms` } as React.CSSProperties}>
                <span className="mono">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="display display-s">{value.title}</h3>
                  <p>{value.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band band-ink numbers">
        <div className="wrap">
          <span className="mono index-label" data-reveal="up">
            04 / By the numbers
          </span>
          <div className="number-rows">
            {stats.map((stat, index) => (
              <div className="number-row" key={stat.label} data-reveal="up" style={{ '--reveal-delay': `${index * 70}ms` } as React.CSSProperties}>
                <span className="number-value display">
                  <span data-count={stat.value}>{stat.value}</span>
                  {stat.suffix}
                </span>
                <span className="number-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap two-col">
          <span className="mono index-label" data-reveal="up">
            05 / Partnership
          </span>
          <div className="col-copy">
            <h2 className="display display-l" data-reveal="mask">
              A working relationship built around <em>visibility.</em>
            </h2>
            <div className="split-list">
              {partnership.map((item, index) => (
                <div key={item.title} data-reveal="up" style={{ '--reveal-delay': `${index * 70}ms` } as React.CSSProperties}>
                  <h3 className="display display-s">{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        label="06 / Next step"
        title={
          <>
            Have a software problem <em>worth solving?</em>
          </>
        }
        description="Share the current process, the constraints and the outcome you want."
      />
    </>
  );
}
