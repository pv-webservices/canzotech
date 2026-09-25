// Pure validation and spam heuristics for the contact form. No imports, so it runs anywhere,
// including `node --test` (see tests/enquiry-validation.test.ts).

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

export type EnquiryField = 'name' | 'email' | 'phone' | 'company' | 'details';
export type EnquiryErrors = Partial<Record<EnquiryField, string>>;

/** Upper bounds, mirrored as `maxLength` on the inputs. */
export const FIELD_LIMITS = { name: 100, email: 254, phone: 20, company: 120, details: 5000 } as const;

/** Order in which fields appear on the form, used to focus the first invalid one. */
export const FIELD_ORDER: EnquiryField[] = ['name', 'email', 'phone', 'company', 'details'];

const MIN_NAME_LENGTH = 2;
export const MIN_DETAILS_LENGTH = 20;
// ITU-T E.164 caps full numbers at 15 digits; national numbers are rarely shorter than 6.
const MIN_PHONE_DIGITS = 6;
const MAX_PHONE_DIGITS = 14;
const INDIA_PHONE_DIGITS = 10;
// Genuine enquiries may link to a current site or a brief; link-stuffed messages are almost always spam.
export const MAX_LINKS_IN_DETAILS = 3;
// Humans need more than a few seconds to fill the form; scripts submit instantly.
export const MIN_FILL_TIME_MS = 3000;

const LINK_PATTERN = /(https?:\/\/|www\.)\S+/gi;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function countLinks(value: string) {
  return value.match(LINK_PATTERN)?.length ?? 0;
}

function nameError(name: string): string | undefined {
  const value = name.trim();
  if (value.length < MIN_NAME_LENGTH) return 'Please enter your full name.';
  if (value.length > FIELD_LIMITS.name) return `Please keep your name under ${FIELD_LIMITS.name} characters.`;
  if (countLinks(value) > 0 || /[<>]/.test(value)) return 'Please enter your name without links or symbols.';
  return undefined;
}

function emailError(email: string): string | undefined {
  const value = email.trim();
  if (!value) return 'Please enter your business email.';
  if (value.length > FIELD_LIMITS.email || !EMAIL_PATTERN.test(value)) return 'Please enter a valid email address.';
  return undefined;
}

/** Phone is optional; when given it must look like a real national number for the chosen country. */
function phoneError(countryCode: string, phone: string): string | undefined {
  const value = phone.trim();
  if (!value) return undefined;
  if (!/^[\d\s()-]+$/.test(value)) return 'Please enter the phone number using digits only.';
  const digits = value.replace(/\D/g, '');
  if (countryCode === 'IN' && digits.length !== INDIA_PHONE_DIGITS) return 'Please enter a 10-digit Indian phone number.';
  if (digits.length < MIN_PHONE_DIGITS || digits.length > MAX_PHONE_DIGITS) return 'Please enter a valid phone number.';
  return undefined;
}

function companyError(company: string): string | undefined {
  if (company.trim().length > FIELD_LIMITS.company) return `Please keep the company name under ${FIELD_LIMITS.company} characters.`;
  return undefined;
}

function detailsError(details: string): string | undefined {
  const value = details.trim();
  if (!value) return 'Please tell us about your project.';
  if (value.length < MIN_DETAILS_LENGTH) return `Please add a little more detail (at least ${MIN_DETAILS_LENGTH} characters).`;
  if (value.length > FIELD_LIMITS.details) return `Please keep the details under ${FIELD_LIMITS.details} characters.`;
  if (countLinks(value) > MAX_LINKS_IN_DETAILS) return `Please include no more than ${MAX_LINKS_IN_DETAILS} links.`;
  return undefined;
}

/** Returns one user-facing message per invalid field; an empty object means the enquiry can be sent. */
export function validateEnquiry(enquiry: Enquiry): EnquiryErrors {
  const errors: EnquiryErrors = {
    name: nameError(enquiry.name),
    email: emailError(enquiry.email),
    phone: phoneError(enquiry.countryCode, enquiry.phone),
    company: companyError(enquiry.company),
    details: detailsError(enquiry.details),
  };
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as EnquiryErrors;
}

export function hasErrors(errors: EnquiryErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Bot signals that should be dropped silently (the sender still sees "success", so it learns nothing):
 * a filled honeypot, or a submission faster than a person could type it.
 */
export function isLikelyBot(enquiry: Enquiry, startedAt: number, now: number): boolean {
  if (enquiry.website.trim()) return true;
  return now - startedAt < MIN_FILL_TIME_MS;
}
