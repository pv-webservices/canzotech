import { expect, test } from '@playwright/test';
import { fillForm, suppressPopup, VALID } from './helpers';

// /api/enquiry is intercepted in every test, so no email is ever sent.
const ENDPOINT = '**/api/enquiry';
const reply = (status: number, body: object) => ({ status, contentType: 'application/json', body: JSON.stringify(body) });

test.beforeEach(async ({ page }) => {
  await suppressPopup(page);
});

test('a valid enquiry is posted as JSON and lands on /thank-you', async ({ page }) => {
  let posted: Record<string, unknown> = {};
  await page.route(ENDPOINT, async (route) => {
    posted = route.request().postDataJSON();
    await route.fulfill(reply(200, { ok: true, redirect: '/thank-you' }));
  });
  await page.goto('/contact');
  await fillForm(page);
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page).toHaveURL(/\/thank-you$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Thank you');
  expect(posted).toMatchObject({ name: VALID.name, email: VALID.email, consent: true, formType: 'contact', website: '' });
  expect(typeof posted.startedAt).toBe('number');
  expect(String(posted.page)).toContain('/contact');
});

test('empty submit shows a summary, field messages and focuses the first invalid field', async ({ page }) => {
  let calls = 0;
  await page.route(ENDPOINT, (route) => {
    calls += 1;
    return route.abort();
  });
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.locator('.form-status')).toContainText('Please correct the 5 highlighted fields');
  const name = page.getByLabel('Full name');
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  const describedBy = await name.getAttribute('aria-describedby');
  await expect(page.locator(`[id="${describedBy}"]`)).toHaveText('Please enter your name.');
  await expect(page.getByRole('checkbox', { name: /privacy policy/ })).toHaveAttribute('aria-invalid', 'true');
  expect(calls).toBe(0);
});

test('minimum lengths are enforced for programmatically filled values', async ({ page }) => {
  await page.goto('/contact');
  await fillForm(page, { ...VALID, details: 'Too short' });
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.getByText('Please add a little more detail (at least 20 characters).')).toBeVisible();
});

test('server-side field errors are shown next to the fields', async ({ page }) => {
  await page.route(ENDPOINT, (route) =>
    route.fulfill(reply(422, { ok: false, code: 'invalid', message: 'Please correct the highlighted fields.', errors: { email: 'Please enter a valid email address, like name@company.com.' } })),
  );
  await page.goto('/contact');
  await fillForm(page);
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.getByText('Please enter a valid email address, like name@company.com.')).toBeVisible();
  await expect(page.getByLabel('Email').first()).toBeFocused();
});

test('a delivery failure keeps the data and offers phone, WhatsApp and email', async ({ page }) => {
  await page.route(ENDPOINT, (route) =>
    route.fulfill(reply(502, { ok: false, code: 'delivery_failed', message: 'Your enquiry could not be delivered just now. Please try again in a moment, or call +91 76518 50667, WhatsApp us, or email info@canzotech.com.' })),
  );
  await page.goto('/contact');
  await fillForm(page);
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  const alert = page.locator('.form-status');
  await expect(alert).toContainText('could not be delivered');
  await expect(alert.getByRole('link', { name: /76518 50667/ })).toHaveAttribute('href', 'tel:+917651850667');
  await expect(alert.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('href', /wa\.me\/917651850667/);
  await expect(alert.getByRole('link', { name: 'info@canzotech.com' })).toHaveAttribute('href', 'mailto:info@canzotech.com');
  await expect(page.getByLabel('Full name')).toHaveValue(VALID.name);
  await expect(page.getByRole('button', { name: 'Send enquiry' })).toBeEnabled();
});

test('missing server configuration (500) shows the alternatives', async ({ page }) => {
  await page.route(ENDPOINT, (route) =>
    route.fulfill(reply(500, { ok: false, code: 'not_configured', message: 'Our enquiry form is temporarily unavailable. Please call +91 76518 50667, WhatsApp us, or email info@canzotech.com.' })),
  );
  await page.goto('/contact');
  await fillForm(page);
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.locator('.form-status')).toContainText('temporarily unavailable');
});

test('offline: a clear message, and nothing typed is lost', async ({ page, context }) => {
  await page.goto('/contact');
  await fillForm(page);
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.locator('.form-status')).toContainText('You appear to be offline');
  await expect(page.getByRole('textbox', { name: /Project details/ })).toHaveValue(VALID.details);
  await context.setOffline(false);
});

test('a request with no answer times out after 20 seconds with a clear message', async ({ page }) => {
  await page.clock.install();
  await page.route(ENDPOINT, () => undefined); // never answers
  await page.goto('/contact');
  await fillForm(page);
  const button = page.getByRole('button', { name: 'Send enquiry' });
  await button.click();
  await expect(page.getByRole('button', { name: 'Sending…' })).toBeDisabled();
  await page.clock.runFor(20_500);
  await expect(page.locator('.form-status')).toContainText('took too long');
  await expect(button).toBeEnabled();
});

test('typing survives a reload (draft kept for the tab)', async ({ page }) => {
  await page.goto('/contact');
  await fillForm(page);
  await page.reload();
  await expect(page.getByLabel('Full name')).toHaveValue(VALID.name);
  await expect(page.getByRole('textbox', { name: /Project details/ })).toHaveValue(VALID.details);
});

test('the button is usable again after coming Back from /thank-you', async ({ page }) => {
  await page.route(ENDPOINT, (route) => route.fulfill(reply(200, { ok: true, redirect: '/thank-you' })));
  await page.goto('/contact');
  await fillForm(page);
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page).toHaveURL(/\/thank-you$/);
  await page.goBack();
  await expect(page.getByRole('button', { name: 'Send enquiry' })).toBeEnabled();
});

test('"Send via WhatsApp" opens WhatsApp with the message pre-filled, without waiting for the timer', async ({ page, context }) => {
  await page.goto('/contact');
  await page.getByLabel('Full name').fill(VALID.name);
  await page.getByRole('textbox', { name: /Project details/ }).fill(VALID.details);
  const [popup] = await Promise.all([context.waitForEvent('page'), page.getByRole('button', { name: 'Send via WhatsApp' }).click()]);
  const url = new URL(popup.url());
  expect(url.hostname).toMatch(/wa\.me|whatsapp\.com/);
  expect(decodeURIComponent(url.search + url.pathname)).toContain('917651850667');
  await popup.close();
});

test.describe('without JavaScript', () => {
  // Reduced motion turns off the site's smooth scrolling, which otherwise keeps the checkbox "moving" while
  // Playwright scrolls it into view on a busy machine. It does not change what is tested: a plain form POST.
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('the form posts normally and the 303 lands on /thank-you', async ({ page }) => {
    let contentType = '';
    await page.route(ENDPOINT, async (route) => {
      contentType = route.request().headers()['content-type'] ?? '';
      await route.fulfill({ status: 303, headers: { Location: '/thank-you' } });
    });
    await page.goto('/contact');
    await fillForm(page);
    await page.getByRole('button', { name: 'Send enquiry' }).click();
    await expect(page).toHaveURL(/\/thank-you$/);
    expect(contentType).toContain('application/x-www-form-urlencoded');
  });
});
