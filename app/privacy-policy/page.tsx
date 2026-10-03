import type { Metadata } from 'next';
import Link from 'next/link';
import { company } from '@/lib/site-data';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'How CanzoTech collects, uses and protects information submitted through this website, and the choices available to you.',
  path: '/privacy-policy',
  // Thin boilerplate page: crawlable, but kept out of search results and the sitemap.
  noIndex: true,
});

export default function PrivacyPage() {
  return (
    <section className="band legal">
      <div className="wrap legal-content">
        <span className="mono index-label">Legal</span>
        <h1 className="display display-l">Privacy Policy</h1>
        <p className="lede legal-lead">
          This policy explains what information CanzoTech collects through this website, how it is used and the choices
          available to you.
        </p>

        <h2 className="display display-s">Information we collect</h2>
        <p>
          We collect the information you choose to submit through our contact and application forms — typically your name,
          email address, phone number, company and the details of your enquiry. Our servers also record standard technical
          data such as IP address, browser type and pages visited, which is used to keep the site secure and reliable.
        </p>

        <h2 className="display display-s">How form submissions are sent and stored</h2>
        <p>
          When you send the contact or free-quote form, your details travel over an encrypted (HTTPS) connection to our own
          website server. The server checks them and emails them, over an encrypted connection, from CanzoTech&apos;s own
          business mailbox (hosted by Zoho Mail) to our team inboxes at {company.emails.join(', ')}. No third-party form
          service receives your enquiry, and the website itself does not keep a database of submissions: the copy we keep
          is the email in our business mailbox.
        </p>
        <p>
          The email contains the fields you filled in, the page you sent it from and the time it was sent. To protect the
          form from abuse, the server briefly holds your IP address in memory to limit repeated submissions; it is not
          stored or included in the email. While you are typing, the form also keeps a copy of your entries in your own
          browser for that tab only (session storage), so nothing is lost if the page reloads; it is cleared once the
          enquiry is sent or when you close the tab.
        </p>
        <p>
          If you choose &ldquo;Send via WhatsApp&rdquo; or the WhatsApp button, your message is sent through WhatsApp
          (Meta) under WhatsApp&apos;s own privacy policy.
        </p>

        <h2 className="display display-s">How we use information</h2>
        <p>
          Enquiry details are used to respond to you, scope potential work and maintain our business records. Recruitment
          submissions are used to assess suitability for current and future roles. We do not sell your information, and we
          do not use it for unrelated marketing without your consent.
        </p>

        <h2 className="display display-s">Retention and security</h2>
        <p>
          Information is retained only as long as needed for the purpose it was collected or as required by applicable law.
          Access is limited to team members who need it, and we use reputable service providers for hosting, email and
          business tooling.
        </p>

        <h2 className="display display-s">Cookies</h2>
        <p>
          This website does not set analytics or marketing cookies. It uses your browser&apos;s session storage only to keep
          an unsent form draft and to remember that you have already seen the free-quote pop-up during this visit. If
          analytics or marketing cookies are introduced later, this policy will be updated and consent will be requested
          where required.
        </p>

        <h2 className="display display-s">Your choices</h2>
        <p>
          You may request access to, correction of, or deletion of the personal information you have provided, and you may
          ask us to stop contacting you at any time. Contact <a href={`mailto:${company.email}`}>{company.email}</a> and we
          will respond within a reasonable period.
        </p>

        <h2 className="display display-s">Changes to this policy</h2>
        <p>
          We may update this policy as our services or legal obligations change. The version published on this page is the
          current one.
        </p>

        <h2 className="display display-s">Contact</h2>
        <p>
          Questions about this policy can be sent to <a href={`mailto:${company.email}`}>{company.email}</a>. See also our{' '}
          <Link href="/terms">Terms &amp; Conditions</Link>.
        </p>
      </div>
    </section>
  );
}
