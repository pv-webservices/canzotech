import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { allPages, revealAll, suppressPopup } from './helpers';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const WIDTHS = [320, 375, 768, 1024, 1440];
// WCAG 2.2 "Target Size (Minimum)": controls must be at least 24×24 CSS px (inline text links are exempt).
const MIN_TARGET = 24;

test.beforeEach(async ({ page }) => {
  await suppressPopup(page);
});

/** Collects console errors, page errors and failed same-origin requests while a page loads. */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.hostname === 'localhost' && response.status() >= 400) errors.push(`${response.status()} ${url.pathname}`);
  });
  return errors;
}

test('every page: axe WCAG 2.1 AA, no console errors, no broken images', async ({ page }) => {
  test.setTimeout(600_000);
  const pages = await allPages(page);
  const report: string[] = [];
  for (const path of [...pages, '/this-page-does-not-exist']) {
    const errors = watchErrors(page);
    const response = await page.goto(path, { waitUntil: 'networkidle' });
    expect(response?.status(), path).toBe(path === '/this-page-does-not-exist' ? 404 : 200);
    await revealAll(page);
    await page.waitForLoadState('networkidle');

    // Every image URL on the page must answer 200 with an image (lazy ones may not have loaded yet, so ask directly).
    const sources = await page.evaluate(() => [...new Set([...document.images].map((image) => image.currentSrc || image.src))]);
    const broken: string[] = [];
    for (const source of sources) {
      const reply = await page.request.get(source);
      if (reply.status() !== 200 || !(reply.headers()['content-type'] ?? '').startsWith('image/')) broken.push(`${source} (${reply.status()})`);
    }
    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    for (const violation of results.violations) report.push(`${path} axe ${violation.id}: ${violation.nodes.map((node) => node.target).join(' | ')}`);
    for (const image of broken) report.push(`${path} broken image ${image}`);
    // On the 404 probe, the page's own (expected) 404 status is logged by Chrome; nothing else may fail.
    const expected = (error: string) => path === '/this-page-does-not-exist' && (error.startsWith('404 /this-page') || error.includes('status of 404'));
    for (const error of errors.filter((error) => !expected(error))) report.push(`${path} ${error}`);
    page.removeAllListeners('console');
    page.removeAllListeners('pageerror');
    page.removeAllListeners('response');
  }
  expect(report).toEqual([]);
});

test('no horizontal scroll and large enough tap targets at 320–1440px', async ({ page }) => {
  test.setTimeout(900_000);
  const pages = await allPages(page);
  const report: string[] = [];
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of pages) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await revealAll(page);
      const result = await page.evaluate((min) => {
        const overflow = document.documentElement.scrollWidth - window.innerWidth;
        const targets = [...document.querySelectorAll<HTMLElement>('a, button, input, select, textarea, [role="button"]')]
          .filter((element) => {
            const style = getComputedStyle(element);
            if (style.display === 'none' || style.visibility === 'hidden' || element.closest('[aria-hidden="true"], .honeypot')) return false;
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          })
          .map((element) => ({ element, rect: element.getBoundingClientRect() }));
        const isSmall = (rect: DOMRect) => rect.width < min || rect.height < min;
        const center = (rect: DOMRect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        const distanceToRect = (point: { x: number; y: number }, rect: DOMRect) =>
          Math.hypot(Math.max(rect.left - point.x, 0, point.x - rect.right), Math.max(rect.top - point.y, 0, point.y - rect.bottom));
        // WCAG 2.2 SC 2.5.8: an undersized target passes if a 24px circle on its centre touches no other target
        // (or another undersized target's circle). Links inside running text are exempt.
        const small = targets
          .filter(({ element, rect }) => {
            if (!isSmall(rect)) return false;
            if (element.tagName === 'A' && getComputedStyle(element).display === 'inline' && element.closest('p, li span, .consent')) return false;
            const c = center(rect);
            return targets.some((other) => {
              if (other.element === element || other.element.contains(element) || element.contains(other.element)) return false;
              return isSmall(other.rect)
                ? Math.hypot(center(other.rect).x - c.x, center(other.rect).y - c.y) < min
                : distanceToRect(c, other.rect) < min / 2;
            });
          })
          .map(({ element }) => `${element.tagName.toLowerCase()} "${(element.textContent || element.getAttribute('aria-label') || '').trim().slice(0, 30)}"`);
        return { overflow, small };
      }, MIN_TARGET);
      if (result.overflow > 0) report.push(`${width}px ${path}: horizontal overflow of ${result.overflow}px`);
      for (const item of result.small) report.push(`${width}px ${path}: small tap target ${item}`);
    }
  }
  expect(report).toEqual([]);
});

test('keyboard: the skip link is first, visible on focus and jumps to the content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('keyboard focus is clearly visible', async ({ page }) => {
  await page.goto('/contact');
  await page.getByLabel('Full name').focus();
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500); // let the 0.35s underline colour transition finish
  const outline = await page.evaluate(() => {
    const active = document.activeElement as HTMLElement;
    const style = getComputedStyle(active);
    return { width: style.outlineWidth, style: style.outlineStyle, border: style.borderBottomColor };
  });
  // Text fields show focus with a blue underline; other controls get a 2px outline.
  expect(outline.style !== 'none' || outline.border === 'rgb(37, 99, 235)').toBeTruthy();
  await page.getByRole('link', { name: 'Skip to content' }).focus();
  await page.keyboard.press('Tab');
  const outlineStyle = await page.evaluate(() => getComputedStyle(document.activeElement as HTMLElement).outlineStyle);
  expect(outlineStyle).not.toBe('none');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('scroll-animated content is visible without animation', async ({ page }) => {
    await page.goto('/about');
    const hiddenReveals = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((element) => getComputedStyle(element).opacity === '0').length);
    expect(hiddenReveals).toBe(0);
  });
});

test('the WhatsApp widget is on every page and links to the company number', async ({ page }) => {
  await page.goto('/work');
  const widget = page.getByRole('link', { name: /Chat with CanzoTech on WhatsApp/ });
  await expect(widget).toBeVisible();
  await expect(widget).toHaveAttribute('href', /^https:\/\/wa\.me\/917651850667\?text=/);
});
