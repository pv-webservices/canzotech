import { company } from './site-data';
import { findCountry } from './country-codes';

// FormSubmit (formsubmit.co) forwards each enquiry to the client's inbox. The first submission triggers a
// one-time "Activate Form" email to this address; nothing is delivered until that link is clicked.
// After activation, FormSubmit also offers a random alias that can replace the email in this URL.
export const ENQUIRY_ENDPOINT = `https://formsubmit.co/ajax/${company.email}`;

export type Enquiry = {
  name: string;
  email: string;
  countryCode: string; // ISO code of the phone number's country, e.g. 'IN'
  phone: string;
  company: string;
  service: string;
  budget: string;
  details: string;
  website: string; // honeypot: real visitors never see or fill this
};

const MIN_NAME_LENGTH = 2;
const MIN_DETAILS_LENGTH = 20;
// ITU-T E.164 caps full numbers at 15 digits; national numbers are rarely shorter than 6.
const MIN_PHONE_DIGITS = 6;
const MAX_PHONE_DIGITS = 14;
const INDIA_PHONE_DIGITS = 10;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Phone is optional; when given it must look like a real national number for the chosen country. */
function phoneError(countryCode: string, phone: string): string | null {
  const value = phone.trim();
  if (!value) return null;
  if (!/^[\d\s()-]+$/.test(value)) return 'Please enter the phone number using digits only.';
  const digits = value.replace(/\D/g, '');
  if (countryCode === 'IN' && digits.length !== INDIA_PHONE_DIGITS) return 'Please enter a 10-digit Indian phone number.';
  if (digits.length < MIN_PHONE_DIGITS || digits.length > MAX_PHONE_DIGITS) return 'Please enter a valid phone number.';
  return null;
}

function formatPhone(countryCode: string, phone: string) {
  const value = phone.trim();
  return value ? `${findCountry(countryCode).dial} ${value}` : '';
}

/** Returns a user-facing error message, or null when the enquiry can be sent. */
export function validateEnquiry(enquiry: Enquiry): string | null {
  if (enquiry.name.trim().length < MIN_NAME_LENGTH) return 'Please enter your full name.';
  if (!isValidEmail(enquiry.email.trim())) return 'Please enter a valid business email.';
  const invalidPhone = phoneError(enquiry.countryCode, enquiry.phone);
  if (invalidPhone) return invalidPhone;
  if (enquiry.details.trim().length < MIN_DETAILS_LENGTH) return 'Please provide more detail about the project.';
  return null;
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
  };
}

/** Sends the enquiry to the client's inbox. Throws with a user-facing message on failure. */
export async function sendEnquiry(enquiry: Enquiry): Promise<void> {
  // Bots that fill the honeypot get a silent "success" and nothing is sent.
  if (enquiry.website.trim()) return;

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
