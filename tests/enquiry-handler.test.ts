// Unit tests for POST /api/enquiry with a mocked mail transport. Nothing here sends a real email.
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import nodemailer from 'nodemailer';
import { handleEnquiry, type HandlerDeps, type MailEnv } from '../lib/server/enquiry-handler.ts';
import { buildMessage, escapeHtml, headerSafe, type EnquiryMessage } from '../lib/server/enquiry-email.ts';
import { createRateLimiter } from '../lib/server/rate-limit.ts';
import { MIN_FILL_TIME_MS } from '../lib/enquiry-validation.ts';
import { validEnquiry } from './fixtures.ts';

const NOW = 1_800_000_000_000;
const ORIGIN = 'https://www.canzotech.com';
const ENV: MailEnv = {
  SMTP_HOST: 'smtp.zoho.in',
  SMTP_PORT: '465',
  SMTP_USER: 'info@canzotech.com',
  SMTP_PASS: 'test-only-not-a-real-password',
  MAIL_TO: 'info@canzotech.com, vishwajit@canzotech.com, sunita.ku@canzotech.com',
  MAIL_FROM: 'info@canzotech.com',
};

const body = (overrides: Record<string, unknown> = {}) => ({ ...validEnquiry, startedAt: NOW - 10_000, ...overrides });

function setup({ env = ENV, fail = false, limit = 5 }: { env?: MailEnv; fail?: boolean; limit?: number } = {}) {
  const sent: EnquiryMessage[] = [];
  const deps: HandlerDeps = {
    env,
    now: () => NOW,
    rateLimiter: createRateLimiter({ limit, windowMs: 10 * 60 * 1000 }),
    sendMail: async (message) => {
      if (fail) throw new Error('535 Authentication Failed');
      sent.push(message);
    },
  };
  return { deps, sent };
}

function jsonRequest(payload: unknown, { origin = ORIGIN, ip = '203.0.113.7', raw }: { origin?: string | null; ip?: string; raw?: string } = {}) {
  const headers: Record<string, string> = { 'content-type': 'application/json', 'x-forwarded-for': ip };
  if (origin) headers.origin = origin;
  return new Request('https://www.canzotech.com/api/enquiry', { method: 'POST', headers, body: raw ?? JSON.stringify(payload) });
}

function formRequest(fields: Record<string, string>, origin = ORIGIN) {
  return new Request('https://www.canzotech.com/api/enquiry', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', origin, 'x-forwarded-for': '198.51.100.4' },
    body: new URLSearchParams(fields).toString(),
  });
}

describe('successful enquiry', () => {
  test('sends from the client mailbox with the visitor as display name and Reply-To', async () => {
    const { deps, sent } = setup();
    const response = await handleEnquiry(jsonRequest(body()), deps);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, redirect: '/thank-you' });
    assert.equal(sent.length, 1);
    const [message] = sent;
    assert.deepEqual(message.from, { name: 'Asha Verma via CanzoTech Website', address: 'info@canzotech.com' });
    assert.deepEqual(message.replyTo, { name: 'Asha Verma', address: 'asha@example.com' });
    assert.deepEqual(message.to, ['info@canzotech.com', 'vishwajit@canzotech.com', 'sunita.ku@canzotech.com']);
    assert.equal(message.subject, 'New enquiry from Asha Verma: Web Application Development');
  });

  test('includes form type, every field, the page and the IST time in HTML and text', async () => {
    const { deps, sent } = setup();
    await handleEnquiry(jsonRequest(body({ formType: 'quote' })), deps);
    const { html, text } = sent[0];
    for (const expected of ['Free quote pop-up', 'Asha Verma', 'asha@example.com', '+91 98765 43210', 'Example Pvt Ltd', 'ERP system', 'https://www.canzotech.com/contact', 'IST']) {
      assert.ok(text.includes(expected), `text is missing ${expected}`);
      assert.ok(html.includes(expected), `html is missing ${expected}`);
    }
    assert.ok(!/formsubmit/i.test(html + text), 'no third-party branding');
  });

  test('uses a quote subject when no service is chosen', async () => {
    const { deps, sent } = setup();
    await handleEnquiry(jsonRequest(body({ formType: 'quote', service: '' })), deps);
    assert.equal(sent[0].subject, 'New enquiry from Asha Verma: Free quote request');
  });

  test('without JavaScript, a normal form post gets a 303 redirect to /thank-you', async () => {
    const { deps, sent } = setup();
    const fields = { ...Object.fromEntries(Object.entries(body()).map(([key, value]) => [key, String(value)])), consent: 'yes', startedAt: '' };
    const response = await handleEnquiry(formRequest(fields), deps);
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), '/thank-you');
    assert.equal(sent.length, 1);
  });
});

describe('validation', () => {
  test('returns 422 with a message per invalid field and sends nothing', async () => {
    const { deps, sent } = setup();
    const response = await handleEnquiry(jsonRequest(body({ email: 'not-an-email', phone: '123', details: 'short' })), deps);
    assert.equal(response.status, 422);
    const data = await response.json();
    assert.equal(data.code, 'invalid');
    assert.deepEqual(Object.keys(data.errors).sort(), ['details', 'email', 'phone']);
    assert.equal(sent.length, 0);
  });

  test('requires consent on the server too', async () => {
    const { deps, sent } = setup();
    const response = await handleEnquiry(jsonRequest(body({ consent: false })), deps);
    assert.equal(response.status, 422);
    assert.ok((await response.json()).errors.consent);
    assert.equal(sent.length, 0);
  });

  test('without JavaScript, errors come back as a page that points to the Back button', async () => {
    const { deps } = setup();
    const response = await handleEnquiry(formRequest({ name: 'Asha', email: 'bad' }), deps);
    assert.equal(response.status, 422);
    assert.match(response.headers.get('content-type') ?? '', /text\/html/);
    const page = await response.text();
    assert.match(page, /Back/);
    assert.match(page, /Please enter a valid email address/);
  });

  test('rejects malformed JSON and oversized bodies', async () => {
    const { deps } = setup();
    assert.equal((await handleEnquiry(jsonRequest(null, { raw: '{oops' }), deps)).status, 400);
    assert.equal((await handleEnquiry(jsonRequest(body({ details: 'x'.repeat(25_000) })), deps)).status, 413);
  });
});

describe('spam protection', () => {
  test('a filled honeypot is accepted silently and discarded', async () => {
    const { deps, sent } = setup();
    const response = await handleEnquiry(jsonRequest(body({ website: 'https://spam.example' })), deps);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).ok, true);
    assert.equal(sent.length, 0);
  });

  test('a submission faster than 3 seconds is accepted silently and discarded', async () => {
    const { deps, sent } = setup();
    const response = await handleEnquiry(jsonRequest(body({ startedAt: NOW - (MIN_FILL_TIME_MS - 1) })), deps);
    assert.equal(response.status, 200);
    assert.equal(sent.length, 0);
  });

  test('rejects other origins and requests with no origin or referer', async () => {
    const { deps, sent } = setup();
    assert.equal((await handleEnquiry(jsonRequest(body(), { origin: 'https://evil.example' }), deps)).status, 403);
    assert.equal((await handleEnquiry(jsonRequest(body(), { origin: null }), deps)).status, 403);
    assert.equal(sent.length, 0);
  });

  test('allows the apex domain, localhost and Hostinger preview domains', async () => {
    for (const origin of ['https://canzotech.com', 'http://localhost:3000', 'https://lightblue-abc-123.hostingersite.com']) {
      const { deps } = setup();
      assert.equal((await handleEnquiry(jsonRequest(body(), { origin }), deps)).status, 200, origin);
    }
  });

  test('rate-limits each IP to 5 requests per 10 minutes', async () => {
    const { deps, sent } = setup();
    for (let i = 0; i < 5; i += 1) assert.equal((await handleEnquiry(jsonRequest(body()), deps)).status, 200);
    const blocked = await handleEnquiry(jsonRequest(body()), deps);
    assert.equal(blocked.status, 429);
    assert.equal((await blocked.json()).code, 'rate_limited');
    assert.equal((await handleEnquiry(jsonRequest(body(), { ip: '192.0.2.99' }), deps)).status, 200, 'other IPs are unaffected');
    assert.equal(sent.length, 6);
  });

  test('flags suspicious keywords in the subject instead of dropping the email', async () => {
    const { deps, sent } = setup();
    await handleEnquiry(jsonRequest(body({ details: 'We offer cheap backlinks and guest post packages for your site.' })), deps);
    assert.equal(sent.length, 1);
    assert.match(sent[0].subject, /^\[Possible spam\] New enquiry from Asha Verma/);
  });

  test('drops a reported page URL that is not on this site', async () => {
    const { deps, sent } = setup();
    await handleEnquiry(jsonRequest(body({ page: 'javascript:alert(1)' })), deps);
    assert.ok(!sent[0].text.includes('javascript:'));
  });
});

describe('header injection and escaping', () => {
  test('CR/LF in the name is rejected before any header is built', async () => {
    const { deps, sent } = setup();
    const response = await handleEnquiry(jsonRequest(body({ name: 'Asha\r\nBcc: victim@example.com' })), deps);
    assert.equal(response.status, 422);
    assert.equal(sent.length, 0);
  });

  test('headerSafe strips line breaks and control characters', () => {
    assert.equal(headerSafe('Asha\r\nBcc: x@y.com\u0000'), 'Asha Bcc: x@y.com');
  });

  test('every value is HTML-escaped in the email body', async () => {
    const { deps, sent } = setup();
    await handleEnquiry(jsonRequest(body({ details: 'Need <script>alert("x")</script> & a portal for orders.' })), deps);
    assert.ok(!sent[0].html.includes('<script>'));
    assert.ok(sent[0].html.includes(escapeHtml('<script>alert("x")</script>')));
  });
});

describe('delivery problems', () => {
  test('missing SMTP configuration returns 500 and sends nothing', async () => {
    const { deps, sent } = setup({ env: { ...ENV, SMTP_PASS: '' } });
    const response = await handleEnquiry(jsonRequest(body()), deps);
    assert.equal(response.status, 500);
    const data = await response.json();
    assert.equal(data.code, 'not_configured');
    assert.match(data.message, /76518 50667/);
    assert.equal(sent.length, 0);
  });

  test('an SMTP failure returns 502 with phone and email alternatives', async () => {
    const { deps } = setup({ fail: true });
    const response = await handleEnquiry(jsonRequest(body()), deps);
    assert.equal(response.status, 502);
    const data = await response.json();
    assert.equal(data.code, 'delivery_failed');
    assert.match(data.message, /info@canzotech\.com/);
  });
});

describe('rendered email (nodemailer, not sent)', () => {
  test('produces the expected From, Reply-To and Subject headers', async () => {
    const message = buildMessage({ ...validEnquiry, name: 'Asha Verma' }, { from: 'info@canzotech.com', to: ['info@canzotech.com'] }, new Date(NOW));
    // streamTransport renders the full RFC 5322 message into a buffer without opening a network connection.
    const transport = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' });
    const info = await transport.sendMail(message);
    const raw = (info.message as Buffer).toString('utf8');
    const headers = raw.slice(0, raw.indexOf('\n\n'));
    assert.match(headers, /^From: Asha Verma via CanzoTech Website <info@canzotech\.com>$/m);
    assert.match(headers, /^Reply-To: Asha Verma <asha@example\.com>$/m);
    assert.match(headers, /^To: info@canzotech\.com$/m);
    assert.match(headers, /^Subject: New enquiry from Asha Verma: Web Application Development$/m);
    assert.match(raw, /Content-Type: multipart\/alternative/);
    assert.match(raw, /Content-Type: text\/plain/);
    assert.match(raw, /Content-Type: text\/html/);
  });
});
