// Run with `npm test` (Node's built-in test runner; Node 22.18+ runs TypeScript directly).
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  type Enquiry,
  FIELD_LIMITS,
  hasErrors,
  isLikelyBot,
  MAX_LINKS_IN_DETAILS,
  MIN_FILL_TIME_MS,
  validateEnquiry,
} from '../lib/enquiry-validation.ts';

const valid: Enquiry = {
  name: 'Asha Verma',
  email: 'asha@example.com',
  countryCode: 'IN',
  phone: '98765 43210',
  company: 'Example Pvt Ltd',
  service: '',
  budget: '',
  details: 'We need a customer portal connected to our existing ERP system.',
  website: '',
};

describe('validateEnquiry', () => {
  test('accepts a complete, genuine enquiry', () => {
    assert.deepEqual(validateEnquiry(valid), {});
  });

  test('accepts an enquiry with only the required fields', () => {
    const errors = validateEnquiry({ ...valid, phone: '', company: '' });
    assert.equal(hasErrors(errors), false);
  });

  test('flags every empty required field at once', () => {
    const errors = validateEnquiry({ ...valid, name: ' ', email: '', details: '' });
    assert.deepEqual(Object.keys(errors).sort(), ['details', 'email', 'name']);
  });

  test('rejects malformed email addresses', () => {
    for (const email of ['asha', 'asha@', 'asha@example', 'asha @example.com', 'asha@example.c']) {
      assert.ok(validateEnquiry({ ...valid, email }).email, `expected "${email}" to be rejected`);
    }
  });

  test('requires a 10-digit number for Indian phones', () => {
    assert.ok(validateEnquiry({ ...valid, phone: '98765' }).phone);
    assert.equal(validateEnquiry({ ...valid, phone: '9876543210' }).phone, undefined);
  });

  test('applies generic length rules to non-Indian phones', () => {
    assert.equal(validateEnquiry({ ...valid, countryCode: 'US', phone: '(415) 555-0100' }).phone, undefined);
    assert.ok(validateEnquiry({ ...valid, countryCode: 'US', phone: '12345' }).phone);
    assert.ok(validateEnquiry({ ...valid, countryCode: 'US', phone: '+1 415 555' }).phone, 'letters and + are not digits');
  });

  test('rejects project details that are too short or too long', () => {
    assert.ok(validateEnquiry({ ...valid, details: 'Need an app' }).details);
    assert.ok(validateEnquiry({ ...valid, details: 'x'.repeat(FIELD_LIMITS.details + 1) }).details);
  });

  test('rejects over-long names and company names', () => {
    assert.ok(validateEnquiry({ ...valid, name: 'a'.repeat(FIELD_LIMITS.name + 1) }).name);
    assert.ok(validateEnquiry({ ...valid, company: 'a'.repeat(FIELD_LIMITS.company + 1) }).company);
  });

  test('rejects links and markup in the name field', () => {
    assert.ok(validateEnquiry({ ...valid, name: 'Cheap SEO https://spam.example' }).name);
    assert.ok(validateEnquiry({ ...valid, name: 'Visit www.spam.example' }).name);
    assert.ok(validateEnquiry({ ...valid, name: '<b>Asha</b>' }).name);
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
    assert.equal(isLikelyBot(valid, startedAt, startedAt + MIN_FILL_TIME_MS + 1), false);
  });

  test('flags a submission faster than a person could type', () => {
    assert.equal(isLikelyBot(valid, startedAt, startedAt + 500), true);
  });

  test('flags a filled honeypot regardless of timing', () => {
    assert.equal(isLikelyBot({ ...valid, website: 'https://spam.example' }, startedAt, startedAt + 60_000), true);
  });
});
