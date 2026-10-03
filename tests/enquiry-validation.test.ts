// Run with `npm test` (Node's built-in test runner; Node 22.18+ runs TypeScript directly).
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  FIELD_LIMITS,
  hasErrors,
  isLikelyBot,
  MAX_LINKS_IN_DETAILS,
  MIN_FILL_TIME_MS,
  normalizeEnquiry,
  validateEnquiry,
} from '../lib/enquiry-validation.ts';
import { validEnquiry } from './fixtures.ts';

const valid = validEnquiry;

describe('validateEnquiry', () => {
  test('accepts a complete, genuine enquiry', () => {
    assert.deepEqual(validateEnquiry(valid), {});
  });

  test('accepts an enquiry with only the required fields', () => {
    const errors = validateEnquiry({ ...valid, company: '', service: '', budget: '' });
    assert.equal(hasErrors(errors), false);
  });

  test('flags every empty required field at once, including phone and consent', () => {
    const errors = validateEnquiry({ ...valid, name: ' ', email: '', phone: '', details: '', consent: false });
    assert.deepEqual(Object.keys(errors).sort(), ['consent', 'details', 'email', 'name', 'phone']);
  });

  test('requires consent to the privacy policy', () => {
    assert.ok(validateEnquiry({ ...valid, consent: false }).consent);
  });

  test('rejects malformed email addresses', () => {
    for (const email of ['asha', 'asha@', 'asha@example', 'asha @example.com', 'asha@example.c', 'a@b.com\r\nBcc: x@y.com']) {
      assert.ok(validateEnquiry({ ...valid, email }).email, `expected "${email}" to be rejected`);
    }
  });

  test('requires a 10-digit number for Indian phones', () => {
    assert.ok(validateEnquiry({ ...valid, phone: '98765' }).phone);
    assert.ok(validateEnquiry({ ...valid, phone: '98765432101' }).phone);
    assert.equal(validateEnquiry({ ...valid, phone: '9876543210' }).phone, undefined);
  });

  test('requires 10–15 digits including the country code elsewhere', () => {
    assert.equal(validateEnquiry({ ...valid, countryCode: 'US', phone: '(415) 555-0100' }).phone, undefined); // 11 digits
    assert.ok(validateEnquiry({ ...valid, countryCode: 'US', phone: '12345' }).phone, 'too short');
    assert.ok(validateEnquiry({ ...valid, countryCode: 'GB', phone: '1234567890123456' }).phone, 'too long');
    assert.ok(validateEnquiry({ ...valid, countryCode: 'US', phone: '+1 415 555' }).phone, 'letters and + are not digits');
  });

  test('checks minimum lengths by hand (autofill never triggers validity.tooShort)', () => {
    assert.ok(validateEnquiry({ ...valid, name: 'A' }).name);
    assert.ok(validateEnquiry({ ...valid, details: 'Need an app' }).details);
  });

  test('rejects values over the maximum lengths', () => {
    assert.ok(validateEnquiry({ ...valid, name: 'a'.repeat(FIELD_LIMITS.name + 1) }).name);
    assert.ok(validateEnquiry({ ...valid, company: 'a'.repeat(FIELD_LIMITS.company + 1) }).company);
    assert.ok(validateEnquiry({ ...valid, details: 'x'.repeat(FIELD_LIMITS.details + 1) }).details);
  });

  test('only accepts listed service and budget options', () => {
    assert.ok(validateEnquiry({ ...valid, service: 'Free money' }).service);
    assert.ok(validateEnquiry({ ...valid, budget: '₹1' }).budget);
  });

  test('rejects links, markup and line breaks in the name field', () => {
    assert.ok(validateEnquiry({ ...valid, name: 'Cheap SEO https://spam.example' }).name);
    assert.ok(validateEnquiry({ ...valid, name: 'Visit www.spam.example' }).name);
    assert.ok(validateEnquiry({ ...valid, name: '<b>Asha</b>' }).name);
    assert.ok(validateEnquiry({ ...valid, name: 'Asha\r\nBcc: x@y.com' }).name);
  });

  test(`allows up to ${MAX_LINKS_IN_DETAILS} links in the details, but not more`, () => {
    const links = (count: number) => Array.from({ length: count }, (_, i) => `https://site${i}.example`).join(' ');
    assert.equal(validateEnquiry({ ...valid, details: `Our current sites: ${links(MAX_LINKS_IN_DETAILS)}` }).details, undefined);
    assert.ok(validateEnquiry({ ...valid, details: `Great offer: ${links(MAX_LINKS_IN_DETAILS + 1)}` }).details);
  });
});

describe('isLikelyBot', () => {
  const startedAt = 1_000_000;

  test('passes a person who took longer than the minimum fill time', () => {
    assert.equal(isLikelyBot({ website: '', startedAt }, startedAt + MIN_FILL_TIME_MS + 1), false);
  });

  test('flags a submission faster than a person could type', () => {
    assert.equal(isLikelyBot({ website: '', startedAt }, startedAt + 500), true);
  });

  test('flags a filled honeypot regardless of timing', () => {
    assert.equal(isLikelyBot({ website: 'https://spam.example', startedAt }, startedAt + 60_000), true);
  });

  test('skips the time trap when the browser ran no JavaScript', () => {
    assert.equal(isLikelyBot({ website: '', startedAt: null }, startedAt), false);
  });
});

describe('normalizeEnquiry', () => {
  test('reads a no-JavaScript form post (strings, checkbox "yes")', () => {
    const enquiry = normalizeEnquiry({ name: ' Asha ', consent: 'yes', startedAt: '', formType: 'quote' });
    assert.equal(enquiry.name, 'Asha');
    assert.equal(enquiry.consent, true);
    assert.equal(enquiry.startedAt, null);
    assert.equal(enquiry.formType, 'quote');
  });

  test('ignores unknown form types and non-string values', () => {
    const enquiry = normalizeEnquiry({ formType: 'admin', name: { $ne: 1 }, consent: 'false' });
    assert.equal(enquiry.formType, 'contact');
    assert.equal(enquiry.name, '');
    assert.equal(enquiry.consent, false);
  });
});
