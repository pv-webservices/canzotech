// Builds the enquiry email (headers, HTML and plain text). Pure: no network, no environment access.
import { findCountry } from '../country-codes.ts';
import { company } from '../site-data.ts';
import { type Enquiry, FORM_TYPES } from '../enquiry-validation.ts';

export const SITE_LABEL = `${company.name} Website`;
const TIME_ZONE = 'Asia/Kolkata';

// Flagged in the subject instead of being dropped, so a genuine enquiry that mentions one is never lost.
const SUSPICIOUS_PATTERNS = [
  /\bviagra\b/i,
  /\bcasino\b/i,
  /\bcrypto(currency)? invest/i,
  /\bbitcoin invest/i,
  /\bbacklinks?\b/i,
  /\bforex\b/i,
  /\bseo (services|ranking|package)/i,
  /\bguest post/i,
  /\bloan offer/i,
];

/** Removes CR/LF and other control characters so a value can never add or split an email header. */
export function headerSafe(value: string, max = 120): string {
  return value.replace(/[\r\n\t\u0000-\u001f\u007f]+/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, max);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isSuspicious(enquiry: Enquiry): boolean {
  const text = [enquiry.name, enquiry.company, enquiry.details].join(' ');
  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(text));
}

export function formatSubmittedAt(date: Date): string {
  const formatted = new Intl.DateTimeFormat('en-IN', { timeZone: TIME_ZONE, dateStyle: 'medium', timeStyle: 'short' }).format(date);
  return `${formatted} IST`;
}

function topic(enquiry: Enquiry): string {
  return enquiry.service || (enquiry.formType === 'quote' ? 'Free quote request' : 'Project enquiry');
}

export function buildSubject(enquiry: Enquiry): string {
  const subject = `New enquiry from ${headerSafe(enquiry.name, 80)}: ${headerSafe(topic(enquiry), 80)}`;
  return isSuspicious(enquiry) ? `[Possible spam] ${subject}` : subject;
}

type Row = [label: string, value: string];

function rows(enquiry: Enquiry, submittedAt: Date): Row[] {
  const phone = enquiry.phone ? `${findCountry(enquiry.countryCode).dial} ${enquiry.phone}` : '';
  const all: Row[] = [
    ['Form', FORM_TYPES[enquiry.formType]],
    ['Name', enquiry.name],
    ['Email', enquiry.email],
    ['Phone', phone],
    ['Company', enquiry.company],
    ['Service', enquiry.service],
    ['Budget', enquiry.budget],
    ['Message', enquiry.details],
    ['Privacy consent', enquiry.consent ? 'Yes — agreed to the privacy policy' : 'No'],
    ['Page', enquiry.page],
    ['Submitted', formatSubmittedAt(submittedAt)],
  ];
  // Optional fields the visitor left empty are left out rather than listed blank.
  return all.filter(([, value]) => value);
}

export function buildText(enquiry: Enquiry, submittedAt: Date): string {
  const lines = rows(enquiry, submittedAt).map(([label, value]) =>
    label === 'Message' ? `\n${label}:\n${value}\n` : `${label}: ${value}`,
  );
  return [`New enquiry via the ${SITE_LABEL}`, '', ...lines, '', 'Reply to this email to answer the visitor directly.'].join('\n');
}

export function buildHtml(enquiry: Enquiry, submittedAt: Date): string {
  const body = rows(enquiry, submittedAt)
    .map(([label, value]) => {
      const safe = escapeHtml(value).replace(/\n/g, '<br>');
      const cell =
        label === 'Email'
          ? `<a href="mailto:${escapeHtml(value)}" style="color:#2563eb">${safe}</a>`
          : label === 'Page'
            ? `<a href="${escapeHtml(value)}" style="color:#2563eb">${safe}</a>`
            : safe;
      return `<tr><th align="left" valign="top" style="padding:10px 14px;border-bottom:1px solid #e4e4e7;font:600 13px Arial,sans-serif;color:#6b6b74;width:140px">${escapeHtml(label)}</th><td style="padding:10px 14px;border-bottom:1px solid #e4e4e7;font:15px/1.5 Arial,sans-serif;color:#0a0a0c">${cell}</td></tr>`;
    })
    .join('');

  return `<!doctype html><html lang="en"><body style="margin:0;padding:24px;background:#f4f4f5">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-collapse:collapse">
<tr><td colspan="2" style="height:4px;background:#2563eb;background-image:linear-gradient(100deg,#7b3fe4,#2563eb 48%,#22d3ee)"></td></tr>
<tr><td colspan="2" style="padding:20px 14px;background:#0a0a0c;font:800 20px Arial,sans-serif;color:#f7f7f8">Canzo<span style="color:#22d3ee">Tech</span>
<div style="font:12px Arial,sans-serif;color:#9797a1;margin-top:4px;letter-spacing:.05em;text-transform:uppercase">New website enquiry</div></td></tr>
${body}
<tr><td colspan="2" style="padding:16px 14px;font:13px Arial,sans-serif;color:#6b6b74">Click Reply to answer ${escapeHtml(enquiry.name)} directly.</td></tr>
</table></body></html>`;
}

export type MailConfig = { from: string; to: string[] };

/** The message handed to the mail transport (nodemailer's sendMail options). */
export function buildMessage(enquiry: Enquiry, config: MailConfig, submittedAt: Date) {
  return {
    // Sent by the client's own mailbox (passes SPF/DKIM/DMARC); the visitor's name is only the display name.
    from: { name: `${headerSafe(enquiry.name, 80)} via ${SITE_LABEL}`, address: config.from },
    to: config.to,
    replyTo: { name: headerSafe(enquiry.name, 80), address: headerSafe(enquiry.email, 254) },
    subject: buildSubject(enquiry),
    text: buildText(enquiry, submittedAt),
    html: buildHtml(enquiry, submittedAt),
  };
}

export type EnquiryMessage = ReturnType<typeof buildMessage>;
