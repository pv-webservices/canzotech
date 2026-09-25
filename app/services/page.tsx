import type { Metadata } from 'next';
import { Action } from '@/components/Action';
import { CtaBand } from '@/components/CtaBand';
import { PageIntro } from '@/components/PageIntro';
import { ServiceIndex } from '@/components/ServiceIndex';
import { services } from '@/lib/site-data';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Software Development Services',
  description:
    'Custom software, web and mobile app development, AI automation, cloud and DevOps, UI/UX design, QA testing, cyber security and technology consulting.',
  path: '/services',
});

const stages = [
  { title: 'Discover', text: 'Objectives, workflows, users and constraints.' },
  { title: 'Shape', text: 'Scope, UX, architecture and milestones.' },
  { title: 'Build', text: 'Frontend, backend, integrations and QA.' },
  { title: 'Operate', text: 'Launch, monitoring, support and iteration.' },
];

const engagements = [
  { title: 'End-to-end product build', text: 'A complete delivery team from discovery through launch, for businesses without in-house engineering.' },
  { title: 'Dedicated capability', text: 'Extra engineering, design, QA or cloud capacity plugged into the team you already have.' },
  { title: 'Modernisation engagement', text: 'Staged improvement of an existing system instead of a risky full rewrite.' },
];

export default function ServicesPage() {
  return (
    <>
      <PageIntro
        index="01"
        label="Services"
        title={
          <>
            Capabilities that take a product from <em>idea</em> to running system.
          </>
        }
        description="From product discovery to deployment and ongoing improvement — the disciplines needed to build and operate modern software, in one team."
        crumbs={[{ label: 'Services' }]}
        actions={<Action href="/contact">Discuss your project</Action>}
      />

      <section className="band rule-top">
        <div className="wrap">
          <span className="mono index-label" data-reveal="up">
            02 / The index
          </span>
        </div>
        <ServiceIndex services={services} />
        <div className="wrap">
        </div>
      </section>

      <section className="band band-soft">
        <div className="wrap two-col">
          <span className="mono index-label" data-reveal="up">
            03 / Delivery model
          </span>
          <div className="col-copy">
            <h2 className="display display-l" data-reveal="mask">
              One team, clear stages, <em>fewer hand-off gaps.</em>
            </h2>
            <p className="lede" data-reveal="up">
              Product thinking, UX, engineering, QA and deployment sit together rather than being split across
              disconnected vendors.
            </p>
            <ol className="numbered-list numbered-list-tight">
              {stages.map((stage, index) => (
                <li key={stage.title} data-reveal="up" style={{ '--reveal-delay': `${index * 60}ms` } as React.CSSProperties}>
                  <span className="mono">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="display display-s">{stage.title}</h3>
                    <p>{stage.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap two-col">
          <span className="mono index-label" data-reveal="up">
            04 / Engagement
          </span>
          <div className="col-copy">
            <h2 className="display display-l" data-reveal="mask">
              Flexible enough for different delivery needs.
            </h2>
            <div className="split-list">
              {engagements.map((item, index) => (
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
        label="05 / Next step"
        title={
          <>
            Describe the business problem, <em>not the technology.</em>
          </>
        }
        description="The right implementation approach can be decided once the constraints are clear."
      />
    </>
  );
}
