// Handles POST /api/enquiry. Every dependency (env, mail transport, clock, rate limiter) is passed in, so the
// whole flow is unit-tested with a mocked transport (tests/enquiry-handler.test.ts).
import { company } from '../site-data.ts';
import { type Enquiry, type EnquiryErrors, hasErrors, isLikelyBot, normalizeEnquiry, validateEnquiry } from '../enquiry-validation.ts';
import { buildMessage, escapeHtml, type EnquiryMessage } from './enquiry-email.ts';
import type { RateLimiter } from './rate-limit.ts';

export const THANK_YOU_PATH = '/thank-you';
export const MAX_BODY_BYTES = 20_000;

/** Production hosts, plus local development and Hostinger's temporary preview domains. */
const DEFAULT_ALLOWED_ORIGINS = ['https://www.canzotech.com', 'https://canzotech.com'];
const ALLOWED_ORIGIN_PATTERNS = [/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/, /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.hostingersite\.com$/];

export type MailEnv = {
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  MAIL_TO?: string;
  MAIL_FROM?: string;
  ALLOWED_ORIGINS?: string;
};

export type HandlerDeps = {
  env: MailEnv;
  sendMail: (message: EnquiryMessage, env: Required<Pick<MailEnv, 'SMTP_HOST' | 'SMTP_PORT' | 'SMTP_USER' | 'SMTP_PASS'>>) => Promise<unknown>;
  rateLimiter: RateLimiter;
  now?: () => number;
  log?: (message: string, detail?: unknown) => void;
};

export type ErrorCode = 'forbidden' | 'too_large' | 'bad_request' | 'rate_limited' | 'invalid' | 'not_configured' | 'delivery_failed';

const FALLBACK = `call ${company.mobile}, WhatsApp us, or email ${company.email}`;

const MESSAGES: Record<ErrorCode, string> = {
  forbidden: 'This form can only be sent from the CanzoTech website.',
  too_large: 'Your message is too long. Please shorten it and try again.',
  bad_request: 'We could not read your enquiry. Please try again.',
  rate_limited: `You have sent several enquiries in a short time. Please wait a few minutes, or ${FALLBACK}.`,
  invalid: 'Please correct the highlighted fields.',
  not_configured: `Our enquiry form is temporarily unavailable. Please ${FALLBACK}.`,
  delivery_failed: `Your enquiry could not be delivered just now. Please try again in a moment, or ${FALLBACK}.`,
};

const STATUS: Record<ErrorCode, number> = {
  forbidden: 403,
  too_large: 413,
  bad_request: 400,
  rate_limited: 429,
  invalid: 422,
  not_configured: 500,
  delivery_failed: 502,
};

export function isAllowedOrigin(origin: string, env: MailEnv): boolean {
  const extra = (env.ALLOWED_ORIGINS ?? '').split(',').map((value) => value.trim()).filter(Boolean);
  return [...DEFAULT_ALLOWED_ORIGINS, ...extra].includes(origin) || ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
}

/** Origin header, or the origin of the Referer when a browser omits Origin. */
function requestOrigin(request: Request): string {
  const origin = request.headers.get('origin');
  if (origin && origin !== 'null') return origin;
  try {
    return new URL(request.headers.get('referer') ?? '').origin;
  } catch {
    return '';
  }
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}

/** Keeps the reported page only when it is a URL on this site, so the email never links somewhere else. */
function safePage(page: string, request: Request, env: MailEnv): string {
  for (const candidate of [page, request.headers.get('referer') ?? '']) {
    try {
      const url = new URL(candidate);
      if (isAllowedOrigin(url.origin, env)) return url.toString();
    } catch {
      // not a URL; try the next candidate
    }
  }
  return '';
}

function mailConfig(env: MailEnv) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = env;
  const to = (env.MAIL_TO ?? '').split(',').map((value) => value.trim()).filter(Boolean);
  const from = (env.MAIL_FROM || SMTP_USER || '').trim();
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !to.length || !from) return null;
  return { smtp: { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS }, mail: { from, to } };
}

async function readBody(request: Request): Promise<{ fields: Record<string, unknown>; isJson: boolean } | ErrorCode> {
  const isJson = (request.headers.get('content-type') ?? '').includes('application/json');
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) return 'too_large';
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return 'too_large';
  if (isJson) {
    try {
      const parsed: unknown = JSON.parse(raw);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? { fields: parsed as Record<string, unknown>, isJson } : 'bad_request';
    } catch {
      return 'bad_request';
    }
  }
  return { fields: Object.fromEntries(new URLSearchParams(raw)), isJson };
}

function json(status: number, body: object): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}

/** Browsers without JavaScript post a normal form; success is a 303 redirect so a refresh never re-sends. */
function redirect(location: string): Response {
  return new Response(null, { status: 303, headers: { Location: location, 'Cache-Control': 'no-store' } });
}

/**
 * Error page for browsers without JavaScript. The visitor's entries are untouched: the browser's Back button
 * returns to the filled-in form.
 */
function htmlError(code: ErrorCode, errors: EnquiryErrors = {}): Response {
  const list = Object.values(errors).map((message) => `<li>${escapeHtml(message ?? '')}</li>`).join('');
  const page = `<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Enquiry not sent — CanzoTech</title>
<style>body{font:16px/1.6 system-ui,sans-serif;color:#0a0a0c;max-width:640px;margin:0 auto;padding:48px 20px}h1{font-size:28px;line-height:1.2}a{color:#2563eb}li{margin:4px 0}</style></head>
<body><h1>Your enquiry was not sent</h1><p>${escapeHtml(MESSAGES[code])}</p>${list ? `<ul>${list}</ul>` : ''}
<p>Use your browser's <strong>Back</strong> button to return to the form — what you typed is still there.</p>
<p>Or reach us directly: <a href="${company.mobileHref}">${escapeHtml(company.mobile)}</a> · <a href="https://wa.me/${company.whatsapp}">WhatsApp</a> · <a href="mailto:${company.email}">${company.email}</a></p></body></html>`;
  return new Response(page, { status: STATUS[code], headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

function fail(code: ErrorCode, isJson: boolean, errors?: EnquiryErrors): Response {
  return isJson ? json(STATUS[code], { ok: false, code, message: MESSAGES[code], ...(errors ? { errors } : {}) }) : htmlError(code, errors);
}

function succeed(isJson: boolean): Response {
  return isJson ? json(200, { ok: true, redirect: THANK_YOU_PATH }) : redirect(THANK_YOU_PATH);
}

export async function handleEnquiry(request: Request, deps: HandlerDeps): Promise<Response> {
  const now = deps.now ?? Date.now;
  const log = deps.log ?? (() => undefined);
  const wantsJson = (request.headers.get('content-type') ?? '').includes('application/json');

  if (!isAllowedOrigin(requestOrigin(request), deps.env)) return fail('forbidden', wantsJson);
  if (!deps.rateLimiter.allow(clientIp(request), now())) return fail('rate_limited', wantsJson);

  const body = await readBody(request);
  if (typeof body === 'string') return fail(body, wantsJson);

  const enquiry: Enquiry = normalizeEnquiry(body.fields);
  // Bots are told "thank you" and nothing is sent, so they learn nothing about the checks.
  if (isLikelyBot(enquiry, now())) {
    log('enquiry discarded as likely bot');
    return succeed(body.isJson);
  }

  const errors = validateEnquiry(enquiry);
  if (hasErrors(errors)) return fail('invalid', body.isJson, errors);

  const config = mailConfig(deps.env);
  if (!config) {
    log('enquiry form is missing SMTP configuration (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO)');
    return fail('not_configured', body.isJson);
  }

  const message = buildMessage({ ...enquiry, page: safePage(enquiry.page, request, deps.env) }, config.mail, new Date(now()));
  try {
    await deps.sendMail(message, config.smtp);
  } catch (error) {
    // Logged without the visitor's details; the SMTP error code is enough to diagnose delivery.
    log('enquiry delivery failed', error instanceof Error ? error.message : error);
    return fail('delivery_failed', body.isJson);
  }
  return succeed(body.isJson);
}
