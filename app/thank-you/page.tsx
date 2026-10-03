import type { Metadata } from 'next';
import { Action } from '@/components/Action';
import { ContactDetails } from '@/components/ContactDetails';
import { PageIntro } from '@/components/PageIntro';

// Utility page reached only after sending an enquiry: noindex, no canonical, and not in the sitemap.
export const metadata: Metadata = {
  title: 'Thank you — enquiry received',
  description: 'Your enquiry has reached the CanzoTech team. Here is what happens next and how to reach us directly.',
  robots: { index: false, follow: true },
};

export default function ThankYouPage() {
  return (
    <PageIntro
      index="✓"
      label="Enquiry received"
      title={
        <>
          Thank you. <em>Your enquiry is with our team.</em>
        </>
      }
      description="We have received your message and a copy is in our inbox. A member of the team will reply to the email address you gave us. If it is urgent, call or WhatsApp us using the details here."
      actions={
        <>
          <Action href="/">Back to home</Action>
          <Action href="/work" variant="outline">
            See our work
          </Action>
        </>
      }
      aside={
        <div className="intro-stack">
          <span className="mono">Need us sooner?</span>
          <ContactDetails />
        </div>
      }
    />
  );
}
