import type { Page } from '@playwright/test';

export const POPUP_SEEN_KEY = 'canzotech-quote-popup-seen';

/** Every page to check: the sitemap's URLs plus the noindex utility pages. */
export async function allPages(page: Page): Promise<string[]> {
  const xml = await (await page.request.get('/sitemap.xml')).text();
  const fromSitemap = [...xml.matchAll(/<loc>https:\/\/www\.canzotech\.com([^<]*)<\/loc>/g)].map(([, path]) => path || '/');
  return [...fromSitemap, '/thank-you', '/privacy-policy', '/terms'];
}

/** Stops the 5-second quote pop-up from opening during tests that are not about it. */
export async function suppressPopup(page: Page) {
  await page.addInitScript((key) => sessionStorage.setItem(key, '1'), POPUP_SEEN_KEY);
}

/** Reveals scroll-animated content and scrolls the page so lazy images load. */
export async function revealAll(page: Page) {
  await page.evaluate(async () => {
    document.querySelectorAll('[data-reveal]').forEach((element) => element.classList.add('is-visible'));
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
  });
}

export const VALID = {
  name: 'Asha Verma',
  email: 'asha@example.com',
  phone: '9876543210',
  details: 'We need a customer portal connected to our existing ERP system.',
};

/** Fills the enquiry form inside `scope` (the page or the pop-up dialog). */
export async function fillForm(scope: Page | ReturnType<Page['locator']>, values = VALID) {
  await scope.getByLabel('Full name').fill(values.name);
  await scope.getByLabel('Email', { exact: false }).first().fill(values.email);
  await scope.getByRole('textbox', { name: /Phone/ }).fill(values.phone);
  await scope.getByRole('textbox', { name: /Project details|Message/ }).fill(values.details);
  await scope.getByRole('checkbox', { name: /privacy policy/ }).check();
}

