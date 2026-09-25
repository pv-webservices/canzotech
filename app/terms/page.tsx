import type { Metadata } from 'next';
import Link from 'next/link';
import { company } from '@/lib/site-data';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms & Conditions',
  description:
    'The terms that apply to use of the CanzoTech website and to enquiries submitted through it.',
  path: '/terms',
  // Thin boilerplate page: crawlable, but kept out of search results and the sitemap.
  noIndex: true,
});

export default function TermsPage() {
  return (
    <section className="band legal">
      <div className="wrap legal-content">
        <span className="mono index-label">Legal</span>
        <h1 className="display display-l">Terms &amp; Conditions</h1>
        <p className="lede legal-lead">These terms apply to your use of the CanzoTech website and any enquiry you submit through it.</p>

        <h2 className="display display-s">Website use</h2>
        <p>
          You may browse and use this website for lawful purposes related to evaluating or engaging our services. You agree
          not to attempt to disrupt the site, access it through automated abuse, or use it in a way that infringes the
          rights of others.
        </p>

        <h2 className="display display-s">Service enquiries</h2>
        <p>
          Information on this website is provided for general guidance. Submitting an enquiry does not create a project
          engagement. Scope, deliverables, timelines, fees and responsibilities become binding only in a separate written
          agreement signed by both parties.
        </p>

        <h2 className="display display-s">Intellectual property</h2>
        <p>
          The CanzoTech name, logo, website content and design are owned by CanzoTech unless stated otherwise. Imagery
          illustrating solution blueprints is conceptual and does not depict a specific client deployment. Client project
          deliverables are governed by the relevant engagement agreement.
        </p>

        <h2 className="display display-s">Third-party links</h2>
        <p>We are not responsible for the content, availability or practices of external websites linked from this site.</p>

        <h2 className="display display-s">Liability</h2>
        <p>
          This website is provided on an &ldquo;as is&rdquo; basis. To the extent permitted by law, CanzoTech is not liable
          for indirect or consequential loss arising from use of the website or reliance on its general information.
        </p>

        <h2 className="display display-s">Governing law</h2>
        <p>
          These terms are governed by the laws of India, and the courts of India have jurisdiction over any dispute arising
          from them, unless a signed engagement agreement specifies otherwise.
        </p>

        <h2 className="display display-s">Contact</h2>
        <p>
          Questions about these terms can be sent to <a href={`mailto:${company.email}`}>{company.email}</a>. See also our{' '}
          <Link href="/privacy-policy">Privacy Policy</Link>.
        </p>
      </div>
    </section>
  );
}
