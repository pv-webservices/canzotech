import type { Metadata } from 'next';
import Image from 'next/image';
import { Action } from '@/components/Action';
import { CtaBand } from '@/components/CtaBand';
import { PageIntro } from '@/components/PageIntro';
import { company, jobs } from '@/lib/site-data';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Careers & Open Positions',
  description:
    'Careers at CanzoTech: how we work, what we look for and how hiring works. Send an open application to join a small, senior software engineering team.',
  path: '/careers',
});

const principles = [
  { title: 'Ownership with context', text: 'Understand why the work matters before deciding how to build it.' },
  { title: 'Constructive review', text: 'Design and code review exist to improve the product, not to perform process.' },
  { title: 'Continuous learning', text: 'Keep skills current without chasing every new framework.' },
];

const hiring = [
  { title: 'Application review', text: 'Experience and role fit are reviewed against the actual position.' },
  { title: 'Working discussion', text: 'A conversation about past work, reasoning and collaboration style.' },
  { title: 'Role assessment', text: 'A practical assessment, only where it adds useful signal.' },
  { title: 'Decision', text: 'A clear outcome and next-step communication either way.' },
];

export default function CareersPage() {
  return (
    <>
      <PageIntro
        index="01"
        label="Careers"
        title={
          <>
            Small team. Real ownership. <em>Work that ships.</em>
          </>
        }
        description="We keep teams small, give engineers genuine ownership and treat clear thinking as a core skill."
        crumbs={[{ label: 'Careers' }]}
        actions={<Action href="#openings">See openings</Action>}
      />

      <figure className="page-figure">
        <div className="page-figure-frame">
          <Image
            src="/images/team-bw.webp"
            alt="The CanzoTech team at work"
            width={1264}
            height={848}
            priority
            sizes="100vw"
            data-parallax="-0.04"
          />
        </div>
        <figcaption className="wrap mono">Fig. 01 — Thinking out loud, on a wall</figcaption>
      </figure>

      <section className="band rule-top">
        <div className="wrap two-col">
          <span className="mono index-label" data-reveal="up">
            02 / How we work
          </span>
          <div className="col-copy">
            <h2 className="display display-l" data-reveal="mask">
              Good engineering needs <em>good working habits.</em>
            </h2>
            <div className="split-list">
              {principles.map((item, index) => (
                <div key={item.title} data-reveal="up" style={{ '--reveal-delay': `${index * 70}ms` } as React.CSSProperties}>
                  <h3 className="display display-s">{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="openings" className="band band-soft">
        <div className="wrap">
          <span className="mono index-label" data-reveal="up">
            03 / Open positions
          </span>
          {jobs.length ? (
            <div className="srv-rows job-rows">
              {jobs.map((job, index) => (
                <div className="srv-row job-row" key={`${job.role}-${job.location}`} data-reveal="up">
                  <span className="mono srv-num">{String(index + 1).padStart(2, '0')}</span>
                  <span className="srv-name display display-s">{job.role}</span>
                  <span className="srv-text">
                    {job.department} · {job.location} · {job.type}
                  </span>
                  <span className="srv-go">
                    <Action href="/contact" variant="outline" inline>
                      Apply
                    </Action>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="open-call" data-reveal="up">
              <h2 className="display display-l">No roles are open right now.</h2>
              <p className="lede">
                We still read every introduction. Send your CV and a note about the kind of work you want to do, and we
                will get in touch when a matching role opens.
              </p>
              <Action href={`mailto:${company.email}?subject=Open%20application`} variant="outline">
                Send an introduction
              </Action>
            </div>
          )}
        </div>
      </section>

      <section className="band">
        <div className="wrap two-col">
          <span className="mono index-label" data-reveal="up">
            04 / Hiring process
          </span>
          <div className="col-copy">
            <h2 className="display display-l" data-reveal="mask">
              What candidates should expect.
            </h2>
            <ol className="numbered-list numbered-list-tight">
              {hiring.map((step, index) => (
                <li key={step.title} data-reveal="up" style={{ '--reveal-delay': `${index * 60}ms` } as React.CSSProperties}>
                  <span className="mono">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="display display-s">{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <CtaBand
        label="05 / General application"
        title={
          <>
            Not seeing your role <em>listed?</em>
          </>
        }
        description="Tell us what you are great at and the kind of problems you want to work on."
      />
    </>
  );
}
