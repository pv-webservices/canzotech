import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Action, TextLink } from '@/components/Action';
import { BandHead } from '@/components/BandHead';
import { CaseCard } from '@/components/CaseCard';
import { CtaBand } from '@/components/CtaBand';
import { Icon } from '@/components/Icon';
import { Rail } from '@/components/Rail';
import { ServiceIndex } from '@/components/ServiceIndex';
import { TechRail } from '@/components/TechRail';
import { commitments, services, stats } from '@/lib/site-data';
import { solutions } from '@/lib/solutions';
import { SITE_LOCALE, SITE_NAME } from '@/lib/seo';

const HOME_TITLE = 'CanzoTech — Custom Software Development Company in Noida';
const HOME_DESCRIPTION =
  'CanzoTech is a software engineering studio in Noida, India, designing and building custom software, web and mobile apps, AI automation and cloud platforms.';

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: SITE_NAME, locale: SITE_LOCALE, url: '/', title: HOME_TITLE, description: HOME_DESCRIPTION },
  twitter: { card: 'summary_large_image', title: HOME_TITLE, description: HOME_DESCRIPTION },
};

const heroLines = ['We turn ambitious', 'ideas into <em>software</em>', 'that earns its keep.'];

const process = [
  { step: 'Discover', text: 'Goals, users, workflows and constraints — mapped before a line of code is written.' },
  { step: 'Plan', text: 'Scope, architecture and milestones you can hold us to, with the trade-offs made explicit.' },
  { step: 'Build', text: 'Design and engineering in two-week sprints, each closing with a live demo of real features.' },
  { step: 'Deliver', text: 'Launch, monitoring, handover and the support plan that keeps the product improving.' },
];

export default function HomePage() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════ Stage / hero */}
      <section className="stage">
        <div className="stage-bg" aria-hidden="true">
          <Image src="/images/ribbon-bw.webp" alt="" fill priority sizes="100vw" className="stage-ribbon" />
          <span className="stage-tint" />
          <span className="stage-grid" />
        </div>

        <div className="wrap stage-inner">
          <div className="stage-meta mono">
            <span className="index-label">Software engineering studio</span>
            <span className="stage-status">
              <span className="live-dot" /> Available for new projects
            </span>
          </div>

          <h1 className="display display-xl lines stage-title">
            {heroLines.map((line, index) => (
              <span key={line}>
                <span style={{ '--i': index } as React.CSSProperties} dangerouslySetInnerHTML={{ __html: line }} />
              </span>
            ))}
          </h1>

          <div className="stage-grid-row">
            <p className="lede rise" style={{ '--rise-delay': '420ms' } as React.CSSProperties}>
              We design and build scalable web, mobile and cloud products for businesses that need software to change how
              they operate — not just to look modern.
            </p>
            <div className="stage-actions rise" style={{ '--rise-delay': '500ms' } as React.CSSProperties}>
              <Action href="/contact" variant="grad">
                Start a project
              </Action>
              <Action href="/work" variant="onink">
                See our work
              </Action>
            </div>
          </div>

          <div className="stage-foot rise" style={{ '--rise-delay': '600ms' } as React.CSSProperties}>
            <span className="mono stage-scroll">
              Scroll <Icon name="chevronDown" size={13} />
            </span>
            <dl className="stage-facts">
              <div>
                <dt className="mono">Discovery first</dt>
                <dd>The problem before the stack</dd>
              </div>
              <div>
                <dt className="mono">Every sprint</dt>
                <dd>Working software, not slideware</dd>
              </div>
              <div>
                <dt className="mono">Full handover</dt>
                <dd>Code, design and infrastructure</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ══════════════════ Signature moment: the frame opens as you scroll */}
      <section className="reveal-panel band-ink" data-scrub>
        <figure className="reveal-figure">
          <Image
            src="/images/hero-bw.webp"
            alt="CanzoTech engineers working together"
            width={1264}
            height={848}
            priority
            sizes="100vw"
          />
        </figure>
        <figcaption className="wrap reveal-caption mono">
          <span>Fig. 01 — Delivery studio, Noida</span>
          <span>Est. engineering practice</span>
        </figcaption>
      </section>

      <TechRail />

      {/* ═══════════════════════════════════════════════════════════ Studio */}
      <section className="band studio rule-top">
        <div className="wrap studio-grid">
          <div className="studio-copy">
            <span className="mono index-label" data-reveal="up">
              01 / The studio
            </span>
            <h2 className="display display-l" data-reveal="mask">
              A small senior team, deliberately. Fewer hand-offs, <em>clearer thinking</em>, faster answers.
            </h2>
            <p className="lede" data-reveal="up">
              We are a product-minded engineering studio. Every engagement starts by understanding the business, the
              people who will use the product and the constraints around it. Only then do we choose the technology.
            </p>
            <div data-reveal="up">
              <TextLink href="/about">About the studio</TextLink>
            </div>
          </div>

          <div className="studio-media">
            <figure className="studio-shot shot-a" data-parallax="0.06" data-reveal="right">
              <Image src="/images/team-bw.webp" alt="The CanzoTech team in discussion" width={1264} height={848} sizes="(max-width: 1000px) 88vw, 460px" />
            </figure>
            <figure className="studio-shot shot-b" data-parallax="-0.09" data-reveal="up">
              <Image src="/images/keys-bw.webp" alt="Hands typing on a keyboard" width={1200} height={896} sizes="(max-width: 1000px) 52vw, 260px" />
            </figure>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════ Services */}
      <section className="band band-soft services-band">
        <div className="wrap">
          <BandHead
            index="02"
            label="Capabilities"
            title={
              <>
                Everything needed to take a product from <em>idea</em> to running system.
              </>
            }
            action={<TextLink href="/services">All services</TextLink>}
          />
        </div>
        <ServiceIndex services={services} />
      </section>

      {/* ══════════════════════════════════════════════════════════ Numbers */}
      <section className="band band-ink numbers">
        <div className="wrap">
          <span className="mono index-label" data-reveal="up">
            03 / How we work
          </span>
          <div className="number-rows">
            {stats.map((stat, index) => (
              <div className="number-row" key={stat.label} data-reveal="up" style={{ '--reveal-delay': `${index * 60}ms` } as React.CSSProperties}>
                <span className="number-value display">
                  <span data-count={stat.value}>{stat.value}</span>
                  <i>{stat.suffix}</i>
                </span>
                <span className="number-label">{stat.label}</span>
              </div>
            ))}
          </div>
          <p className="number-note mono" data-reveal="up">
            These describe our delivery model. Client-verified performance metrics are published only once approved.
          </p>
        </div>

        <div className="scroll-type" data-scrub aria-hidden="true">
          <div className="scroll-type-inner">
            <span>Innovate</span>
            <span className="ghost">Build</span>
            <em>Grow</em>
            <span className="ghost">Innovate</span>
            <span>Build</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ Process */}
      <section className="band process" id="process">
        <div className="wrap process-grid">
          <div className="process-aside">
            <span className="mono index-label">04 / Process</span>
            <h2 className="display display-m">
              Four phases. <em>No surprises.</em>
            </h2>
            <p>A repeatable structure with enough flexibility for real product decisions.</p>
            <Action href="/contact" variant="outline" inline>
              Book a discovery call
            </Action>
          </div>

          <ol className="process-list">
            {process.map((item, index) => (
              <li key={item.step} style={{ '--stack': index } as React.CSSProperties} data-reveal="up">
                <span className="mono">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="display display-s">{item.step}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════ Work */}
      <section className="band band-soft work-band">
        <div className="wrap">
          <BandHead
            index="05"
            label="Selected work"
            title={
              <>
                Products we design and build, <em>end to end</em>.
              </>
            }
            action={<TextLink href="/work">All projects</TextLink>}
          />
        </div>

        <Rail label="Selected work">
          {solutions.map((solution, index) => (
            <div className="rail-slide" key={solution.slug}>
              <CaseCard solution={solution} priority={index === 0} />
            </div>
          ))}
          <div className="rail-slide">
            <Link className="case case-end" href="/contact">
              <span className="mono">Next</span>
              <span className="display display-m">
                Your product <em>here</em>.
              </span>
              <span className="link">
                <span>Start a project</span>
                <Icon name="arrowUpRight" size={13} />
              </span>
            </Link>
          </div>
        </Rail>
      </section>

      {/* ══════════════════════════════════════════════════════ Commitments */}
      <section className="band commitments rule-top">
        <div className="wrap">
          <BandHead
            index="06"
            label="Commitments"
            title={
              <>
                What working with us <em>actually</em> looks like.
              </>
            }
            description="The promises we hold ourselves to on every engagement — published here instead of testimonials we have not earned yet."
          />
          <ol className="promise-list">
            {commitments.map((item, index) => (
              <li key={item.title} data-reveal="up" style={{ '--reveal-delay': `${index * 50}ms` } as React.CSSProperties}>
                <span className="mono">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="display display-s">{item.title}</h3>
                  <p>{item.text}</p>
                </div>
                <span className="mono promise-tag">{item.tag}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand
        label="07 / Next step"
        title={
          <>
            Tell us what is not working today. <em>We will tell you how we would fix it.</em>
          </>
        }
        description="Share the problem, your current setup and the outcome you need. You will get a considered answer, not a sales sequence."
      />
    </>
  );
}
