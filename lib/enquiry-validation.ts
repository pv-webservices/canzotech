// Validation and spam heuristics for the enquiry forms, shared by the browser and the server
// (app/api/enquiry). Imports use explicit `.ts` paths so `node --test` can load this file directly.
import { findCountry } from './country-codes.ts';
import { services } from './site-data.ts';

/** Which form the enquiry came from. Shown in the email so the team knows the context. */
export const FORM_TYPES = { contact: 'Contact page', quote: 'Free quote pop-up' } as const;
export type FormType = keyof typeof FORM_TYPES;

export const SERVICE_OPTIONS = services.map((service) => service.name);
export const BUDGET_OPTIONS = ['To be discussed', '₹1L–₹3L', '₹3L–₹8L', '₹8L+'];

export type Enquiry = {
  formType: FormType;
  name: string;
  email: string;
  countryCode: string; // ISO code of the phone number's country, e.g. 'IN'
  phone: string;
  company: string;
  service: string;
  budget: string;
  details: string;
  consent: boolean;
  website: string; // honeypot: real visitors never see or fill this
  /** Page the form was submitted from. */
  page: string;
  /** Epoch ms when the page loaded (time trap). Null when the browser ran no JavaScript. */
  startedAt: number | null;
};

export type EnquiryField = 'name' | 'email' | 'phone' | 'company' | 'service' | 'budget' | 'details' | 'consent';
export type EnquiryErrors = Partial<Record<EnquiryField, string>>;

/** Upper bounds, mirrored as `maxLength` on the inputs. */
export const FIELD_LIMITS = { name: 100, email: 254, phone: 20, company: 120, details: 5000, page: 500 } as const;

/** Order in which fields appear on the form, used to focus the first invalid one. */
export const FIELD_ORDER: EnquiryField[] = ['name', 'email', 'phone', 'company', 'service', 'budget', 'details', 'consent'];

export const MIN_NAME_LENGTH = 2;
export const MIN_DETAILS_LENGTH = 20;
// A full international number (country code + national number) has 10–15 digits (ITU-T E.164 caps it at 15).
export const MIN_PHONE_DIGITS = 10;
export const MAX_PHONE_DIGITS = 15;
const INDIA_PHONE_DIGITS = 10;
// Genuine enquiries may link to a current site or a brief; link-stuffed messages are almost always spam.
export const MAX_LINKS_IN_DETAILS = 3;
// Humans need more than a few seconds to fill the form; scripts submit instantly.
export const MIN_FILL_TIME_MS = 3000;

const LINK_PATTERN = /(https?:\/\/|www\.)\S+/gi;
const EMAIL_PATTERN = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;

function countLinks(value: string) {
  return value.match(LINK_PATTERN)?.length ?? 0;
}

// Lengths are checked by hand: the browser's validity.tooShort does not fire for autofilled or scripted values.
function nameError(name: string): string | undefined {
  const value = name.trim();
  if (!value) return 'Please enter your name.';
  if (value.length < MIN_NAME_LENGTH) return `Please enter at least ${MIN_NAME_LENGTH} characters.`;
  if (value.length > FIELD_LIMITS.name) return `Please keep your name under ${FIELD_LIMITS.name} characters.`;
  if (countLinks(value) > 0 || /[<>\r\n]/.test(value)) return 'Please enter your name without links or symbols.';
  return undefined;
}

function emailError(email: string): string | undefined {
  const value = email.trim();
  if (!value) return 'Please enter your email address.';
  if (value.length > FIELD_LIMITS.email || !EMAIL_PATTERN.test(value)) return 'Please enter a valid email address, like name@company.com.';
  return undefined;
}

function phoneError(countryCode: string, phone: string): string | undefined {
  const value = phone.trim();
  if (!value) return 'Please enter your phone number.';
  if (value.length > FIELD_LIMITS.phone || !/^[\d\s()-]+$/.test(value)) return 'Please enter the phone number using digits only.';
  const national = value.replace(/\D/g, '');
  if (countryCode === 'IN' && national.length !== INDIA_PHONE_DIGITS) return 'Please enter a 10-digit Indian mobile or landline number.';
  const total = findCountry(countryCode).dial.replace(/\D/g, '').length + national.length;
  if (total < MIN_PHONE_DIGITS || total > MAX_PHONE_DIGITS) return 'Please enter a valid phone number (10–15 digits including the country code).';
  return undefined;
}

function companyError(company: string): string | undefined {
  if (company.trim().length > FIELD_LIMITS.company) return `Please keep the company name under ${FIELD_LIMITS.company} characters.`;
  return undefined;
}

function optionError(value: string, options: string[]): string | undefined {
  return value && !options.includes(value) ? 'Please choose one of the listed options.' : undefined;
}

function detailsError(details: string): string | undefined {
  const value = details.trim();
  if (!value) return 'Please tell us briefly about your project.';
  if (value.length < MIN_DETAILS_LENGTH) return `Please add a little more detail (at least ${MIN_DETAILS_LENGTH} characters).`;
  if (value.length > FIELD_LIMITS.details) return `Please keep the message under ${FIELD_LIMITS.details} characters.`;
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
    service: optionError(enquiry.service, SERVICE_OPTIONS),
    budget: optionError(enquiry.budget, BUDGET_OPTIONS),
    details: detailsError(enquiry.details),
    consent: enquiry.consent ? undefined : 'Please agree to the privacy policy so we can reply to you.',
  };
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as EnquiryErrors;
}

export function hasErrors(errors: EnquiryErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Bot signals that are accepted and discarded silently (the sender still sees "success", so it learns nothing):
 * a filled honeypot, or a submission faster than a person could fill the form. Browsers without JavaScript
 * cannot report a load time, so the time trap only applies when `startedAt` is present.
 */
export function isLikelyBot(enquiry: Pick<Enquiry, 'website' | 'startedAt'>, now: number): boolean {
  if (enquiry.website.trim()) return true;
  if (enquiry.startedAt === null) return false;
  return now - enquiry.startedAt < MIN_FILL_TIME_MS;
}

const asString = (value: unknown) => (typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '');

/** Turns untrusted JSON or form fields into a well-typed enquiry (unknown keys are ignored). */
export function normalizeEnquiry(input: Record<string, unknown>): Enquiry {
  const formType = asString(input.formType);
  const consent = input.consent;
  const startedAt = Number(asString(input.startedAt));
  return {
    formType: formType in FORM_TYPES ? (formType as FormType) : 'contact',
    name: asString(input.name).trim(),
    email: asString(input.email).trim(),
    countryCode: asString(input.countryCode) || 'IN',
    phone: asString(input.phone).trim(),
    company: asString(input.company).trim(),
    service: asString(input.service).trim(),
    budget: asString(input.budget).trim(),
    details: asString(input.details).trim(),
    consent: consent === true || consent === 'true' || consent === 'on' || consent === 'yes',
    website: asString(input.website),
    page: asString(input.page).slice(0, FIELD_LIMITS.page),
    startedAt: Number.isFinite(startedAt) && startedAt > 0 ? startedAt : null,
  };
}
