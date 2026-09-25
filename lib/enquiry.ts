import { company } from './site-data';
import { findCountry } from './country-codes';
import { type Enquiry, isLikelyBot } from './enquiry-validation';

export type { Enquiry } from './enquiry-validation';

// FormSubmit (formsubmit.co) forwards each enquiry to the client's inbox. The first submission triggers a
// one-time "Activate Form" email to this address; nothing is delivered until that link is clicked.
// After activation, FormSubmit also offers a random alias that can replace the email in this URL.
export const ENQUIRY_ENDPOINT = `https://formsubmit.co/ajax/${company.email}`;

// FormSubmit discards submissions containing any of these phrases, server side. That also covers bots that
// post straight to the endpoint and never load this page.
const SPAM_PHRASES = ['viagra', 'casino', 'crypto investment', 'bitcoin investment', 'buy backlinks', 'forex signals'];

function formatPhone(countryCode: string, phone: string) {
  const value = phone.trim();
  return value ? `${findCountry(countryCode).dial} ${value}` : '';
}

function buildPayload(enquiry: Enquiry) {
  const name = enquiry.name.trim();
  const fields: Record<string, string> = {
    Name: name,
    Email: enquiry.email.trim(),
    Phone: formatPhone(enquiry.countryCode, enquiry.phone),
    Company: enquiry.company.trim(),
    Service: enquiry.service,
    Budget: enquiry.budget,
    'Project details': enquiry.details.trim(),
  };
  // Leave unanswered optional fields out of the email instead of listing them blank.
  const answered = Object.fromEntries(Object.entries(fields).filter(([, value]) => value));

  return {
    ...answered,
    _subject: `New website enquiry from ${name}`,
    _replyto: enquiry.email.trim(),
    _template: 'table',
    _captcha: 'false',
    _blacklist: SPAM_PHRASES.join(', '),
  };
}

/**
 * Sends a validated enquiry to the client's inbox. `startedAt` is when the visitor began filling the form,
 * used for the time-trap spam check. Throws with a user-facing message on failure.
 */
export async function sendEnquiry(enquiry: Enquiry, startedAt: number): Promise<void> {
  // Bots get a silent "success" and nothing is sent.
  if (isLikelyBot(enquiry, startedAt, Date.now())) return;

  let response: Response;
  try {
    response = await fetch(ENQUIRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(buildPayload(enquiry)),
    });
  } catch {
    throw new Error(`We could not reach our mail service. Please try again or email us at ${company.email}.`);
  }

  const data = (await response.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
  // FormSubmit reports success as the string "true" (e.g. "false" while the form awaits activation).
  const delivered = response.ok && String(data.success) === 'true';
  if (delivered) return;

  if (/activat/i.test(data.message ?? '')) {
    throw new Error(
      `This form is not active yet. The site owner must click "Activate Form" in the FormSubmit email sent to ${company.email}. Until then, please email us directly.`,
    );
  }
  const reason = data.message ? ` (${data.message})` : '';
  throw new Error(`Your enquiry could not be sent right now${reason}. Please try again or email us at ${company.email}.`);
}
