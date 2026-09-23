import type { Metadata } from 'next';
import { Action } from '@/components/Action';
import { CtaBand } from '@/components/CtaBand';
import { PageIntro } from '@/components/PageIntro';
import { WorkGrid } from '@/components/WorkGrid';
import { solutions } from '@/lib/solutions';

export const metadata: Metadata = {
  title: 'Our Work',
  description: 'Solution blueprints from CanzoTech across SaaS platforms, commerce, fintech and healthcare products.',
  alternates: { canonical: '/work' },
};

const standard = [
  { title: 'Context', text: 'The business situation, the users and the constraints.' },
  { title: 'Challenge', text: 'The operational or product problem worth solving.' },
  { title: 'Solution', text: 'Design, architecture and implementation choices.' },
  { title: 'Results', text: 'Only outcomes the client can verify.' },
];

export default function WorkPage() {
  return (
    <>
      <PageIntro
        index="01"
        label="Work"
        title={
          <>
            Products we design and build, <em>end to end.</em>
          </>
        }
        description="Each blueprint sets out the problem, our approach, the features involved and the stack behind it."
        crumbs={[{ label: 'Work' }]}
        actions={<Action href="/contact">Start a project</Action>}
      />

      <section className="band rule-top">
        <div className="wrap">
          <WorkGrid solutions={solutions} />
        </div>
      </section>

      <section className="band band-soft">
        <div className="wrap two-col">
          <span className="mono index-label" data-reveal="up">
            02 / Case study standard
          </span>
          <div className="col-copy">
            <h2 className="display display-l" data-reveal="mask">
              Show the work, the constraint and <em>the result.</em>
            </h2>
            <p className="lede" data-reveal="up">
              When we publish a client case study it explains what changed, what CanzoTech delivered and which outcomes
              the client has verified.
            </p>
            <ol className="numbered-list numbered-list-tight">
              {standard.map((item, index) => (
                <li key={item.title} data-reveal="up" style={{ '--reveal-delay': `${index * 60}ms` } as React.CSSProperties}>
                  <span className="mono">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="display display-s">{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <CtaBand
        label="03 / Next step"
        title={
          <>
            Build the next blueprint <em>from real work.</em>
          </>
        }
        description="Share the business challenge and your current technical context."
      />
    </>
  );
}
