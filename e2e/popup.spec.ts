import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator } from '@playwright/test';
import { fillForm } from './helpers';

// These tests use real time: the pop-up opens 5 s after landing and the slider advances every 6 s.
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
// Opens at ~6 s; the headroom covers the local server being busy resizing images for the whole-site sweeps.
const OPEN_TIMEOUT = 45_000;

async function slideNumber(current: Locator) {
  return Number((await current.getAttribute('aria-label'))?.match(/Show (\d+)/)?.[1]);
}

test('the quote pop-up opens about 5 seconds after landing, once per session', async ({ page }) => {
  // Count from the first response byte: the 5-second timer starts when the page mounts, after that.
  const started = Date.now();
  await page.goto('/', { waitUntil: 'commit' });
  const dialog = page.getByRole('dialog', { name: 'Get a free quote' });
  await expect(dialog).toBeHidden();
  await expect(dialog).toBeVisible({ timeout: OPEN_TIMEOUT });
  expect(Date.now() - started).toBeGreaterThanOrEqual(5_000);
  await expect(dialog.getByRole('region', { name: /Our commitments|What clients say/ })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();

  await page.goto('/about');
  await page.waitForTimeout(7_000);
  await expect(dialog).toBeHidden();
});

test('the slider auto-advances and has working controls', async ({ page }) => {
  await page.goto('/services');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: OPEN_TIMEOUT });
  const current = dialog.locator('.qp-dots button[aria-current="true"]');
  const first = await slideNumber(current);
  await expect.poll(() => slideNumber(current), { timeout: 10_000 }).not.toBe(first);
  // Hovering pauses autoplay, so the Next button result is deterministic.
  await dialog.locator('.qp-slider').hover();
  const before = await slideNumber(current);
  await dialog.getByRole('button', { name: 'Next' }).click();
  await expect.poll(() => slideNumber(current)).toBe((before % 5) + 1);
});

test('the pop-up never opens on /contact', async ({ page }) => {
  await page.goto('/contact');
  await page.waitForTimeout(7_000);
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('the pop-up form submits as a "quote" enquiry and lands on /thank-you', async ({ page }) => {
  let formType = '';
  await page.route('**/api/enquiry', async (route) => {
    formType = route.request().postDataJSON().formType;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, redirect: '/thank-you' }) });
  });
  await page.goto('/');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: OPEN_TIMEOUT });
  await fillForm(dialog);
  await dialog.getByRole('button', { name: 'Get my free quote' }).click();
  await expect(page).toHaveURL(/\/thank-you$/);
  await expect(page.getByRole('dialog')).toBeHidden();
  expect(formType).toBe('quote');
});

for (const viewport of [{ width: 320, height: 640 }, { width: 375, height: 812 }, { width: 1440, height: 900 }]) {
  test(`the pop-up fits ${viewport.width}px wide and passes axe`, async ({ page }) => {
    // axe takes ~30 s on this animated page; allow for the machine being shared with the whole-site sweeps.
    test.setTimeout(240_000);
    await page.setViewportSize(viewport);
    await page.goto('/');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: OPEN_TIMEOUT });
    const box = await dialog.locator('.qp-panel').boundingBox();
    expect(box && box.width <= viewport.width).toBeTruthy();
    await expect(dialog.getByRole('button', { name: /Close/ })).toBeInViewport();
    const results = await new AxeBuilder({ page }).include('dialog.qp').withTags(WCAG).analyze();
    expect(results.violations.map((violation) => `${violation.id}: ${violation.nodes[0]?.target}`)).toEqual([]);
  });
}

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the slider does not auto-advance', async ({ page }) => {
    await page.goto('/services');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: OPEN_TIMEOUT });
    const current = dialog.locator('.qp-dots button[aria-current="true"]');
    await expect(current).toHaveAttribute('aria-label', /^Show 1 of/);
    await page.waitForTimeout(13_000);
    await expect(current).toHaveAttribute('aria-label', /^Show 1 of/);
  });
});
