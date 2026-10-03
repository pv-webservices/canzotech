// SEO audit of the built site. Run after `npm run build`:  npm run audit:seo
// Starts `next start` on a spare port (or audits BASE_URL if set), crawls every page reachable from the
// sitemap and from internal links, and exits non-zero if any check fails.
import { spawn } from 'node:child_process';
import { parse } from 'node-html-parser';

const SITE_URL = 'https://www.canzotech.com';
const PORT = 3200;
const BASE = process.env.BASE_URL ?? `http://localhost:${PORT}`;
const TITLE_MAX = 65;
const DESCRIPTION_RANGE = [70, 170];
// Utility pages that must stay out of the index and the sitemap.
const NOINDEX_PAGES = ['/thank-you', '/privacy-policy', '/terms'];
const NOT_FOUND_PROBE = '/this-page-does-not-exist';
const REQUIRED_ICONS = ['/favicon.ico', '/favicon.svg', '/favicon-48x48.png', '/favicon-96x96.png', '/icon-192x192.png', '/apple-touch-icon.png'];

const issues = [];
const fail = (page, message) => issues.push(`${page}: ${message}`);

async function startServer() {
  if (process.env.BASE_URL) return null;
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(PORT)], { stdio: 'ignore' });
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      if ((await fetch(BASE)).ok) return server;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  server.kill();
  throw new Error('next start did not come up — run `npm run build` first.');
}

const toPath = (url) => {
  const { pathname } = new URL(url, SITE_URL);
  return pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
};

const statusCache = new Map();
async function statusOf(path) {
  if (!statusCache.has(path)) {
    statusCache.set(path, fetch(BASE + path, { redirect: 'manual' }).then((response) => response.status).catch(() => 0));
  }
  return statusCache.get(path);
}

function meta(root, attr, name) {
  return root.querySelector(`meta[${attr}="${name}"]`)?.getAttribute('content') ?? null;
}

function checkHeadings(root, path) {
  const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6').map((node) => Number(node.tagName[1]));
  const h1s = headings.filter((level) => level === 1).length;
  if (h1s !== 1) fail(path, `expected exactly one <h1>, found ${h1s}`);
  let previous = 0;
  for (const level of headings) {
    if (previous && level > previous + 1) fail(path, `heading level skips from h${previous} to h${level}`);
    previous = level;
  }
}

function checkSocial(root, path) {
  for (const property of ['og:site_name', 'og:locale', 'og:title', 'og:description', 'og:url', 'og:type', 'og:image', 'og:image:alt']) {
    if (!meta(root, 'property', property)) fail(path, `missing ${property}`);
  }
  if (meta(root, 'property', 'og:image:width') !== '1200' || meta(root, 'property', 'og:image:height') !== '630') {
    fail(path, 'og:image must declare 1200×630');
  }
  if (!meta(root, 'name', 'twitter:card')) fail(path, 'missing twitter:card');
  const ogUrl = meta(root, 'property', 'og:url');
  if (ogUrl && toPath(ogUrl) !== path) fail(path, `og:url points to ${ogUrl}`);
}

function checkJsonLd(root, path, indexable) {
  const types = new Set();
  const collect = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(collect);
    [].concat(node['@type'] ?? []).forEach((type) => types.add(type));
    Object.values(node).forEach(collect);
  };
  for (const script of root.querySelectorAll('script[type="application/ld+json"]')) {
    if (script.rawText.includes('<')) fail(path, 'JSON-LD contains an unescaped "<"');
    try {
      collect(JSON.parse(script.rawText));
    } catch {
      fail(path, 'JSON-LD does not parse');
    }
  }
  for (const required of ['Organization', 'WebSite']) if (!types.has(required)) fail(path, `JSON-LD missing ${required}`);
  if (indexable && path !== '/' && !types.has('BreadcrumbList')) fail(path, 'JSON-LD missing BreadcrumbList');
  if (path.startsWith('/services/') && !types.has('FAQPage')) fail(path, 'service page missing FAQPage');
}

async function auditPage(path, html, { indexable }) {
  const root = parse(html);
  const title = root.querySelector('title')?.text.trim() ?? '';
  const description = meta(root, 'name', 'description') ?? '';
  // Next.js adds its own robots tag on the 404 page, so every robots tag is read together.
  const robots = root.querySelectorAll('meta[name="robots"]').map((node) => node.getAttribute('content')).join(', ');
  const canonicals = root.querySelectorAll('link[rel="canonical"]');

  if (!title) fail(path, 'missing <title>');
  if (title.length > TITLE_MAX) fail(path, `title is ${title.length} characters (max ${TITLE_MAX}): "${title}"`);
  if (description.length < DESCRIPTION_RANGE[0] || description.length > DESCRIPTION_RANGE[1]) {
    fail(path, `description is ${description.length} characters (want ${DESCRIPTION_RANGE.join('–')})`);
  }
  checkHeadings(root, path);

  for (const image of root.querySelectorAll('img')) {
    if (image.getAttribute('alt') === undefined) fail(path, `<img src="${image.getAttribute('src')}"> has no alt attribute`);
    if (!image.getAttribute('width') && !image.getAttribute('data-nimg')?.includes('fill')) fail(path, `<img src="${image.getAttribute('src')}"> has no width/height`);
  }

  if (indexable) {
    if (!/\bindex\b/.test(robots) || !/\bfollow\b/.test(robots) || !robots.includes('max-image-preview:large')) {
      fail(path, `robots meta should be "index, follow, max-image-preview:large", got "${robots}"`);
    }
    if (canonicals.length !== 1) fail(path, `expected one canonical, found ${canonicals.length}`);
    else if (toPath(canonicals[0].getAttribute('href')) !== path || !canonicals[0].getAttribute('href').startsWith(SITE_URL)) {
      fail(path, `canonical is not self-referencing: ${canonicals[0].getAttribute('href')}`);
    }
    checkSocial(root, path);
  } else {
    if (!/noindex/.test(robots) || !/\bfollow\b/.test(robots)) fail(path, `robots meta should be "noindex, follow", got "${robots}"`);
    if (canonicals.length) fail(path, 'noindex page must not have a canonical');
  }
  checkJsonLd(root, path, indexable);

  const iconHrefs = root.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]').map((link) => link.getAttribute('href'));
  for (const icon of REQUIRED_ICONS) if (!iconHrefs.some((href) => href?.startsWith(icon))) fail(path, `head does not link ${icon}`);
  if (!root.querySelector('link[rel="manifest"]')) fail(path, 'head does not link the web manifest');

  if (!/^\/[a-z0-9/-]*$/.test(path) || (path.length > 1 && path.endsWith('/'))) fail(path, 'URL is not lowercase-hyphenated without a trailing slash');

  const links = root
    .querySelectorAll('a[href]')
    .map((link) => link.getAttribute('href'))
    .filter((href) => href.startsWith('/') || href.startsWith(SITE_URL))
    .map((href) => href.replace(SITE_URL, '') || '/')
    .map((href) => href.split('#')[0] || path);
  const assets = root.querySelectorAll('img[src], link[rel~="icon"], link[rel="manifest"]').map((node) => node.getAttribute('src') ?? node.getAttribute('href'));
  for (const target of [...new Set([...links, ...assets])]) {
    if (!target.startsWith('/')) continue;
    const status = await statusOf(target);
    if (status !== 200) fail(path, `link to ${target} returns ${status}`);
  }
  return { title, description, links: links.filter((href) => !/\.\w+$/.test(href)).map((href) => toPath(href)) };
}

async function main() {
  const server = await startServer();
  try {
    const robots = await (await fetch(`${BASE}/robots.txt`)).text();
    if (!/^Allow: \/$/m.test(robots)) fail('/robots.txt', 'does not allow everything');
    if (/^Disallow: \S/m.test(robots)) fail('/robots.txt', 'contains a Disallow rule');
    if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) fail('/robots.txt', 'missing the Sitemap line');

    const sitemapXml = await (await fetch(`${BASE}/sitemap.xml`)).text();
    const entries = [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, block]) => ({
      path: toPath(block.match(/<loc>(.*?)<\/loc>/)[1]),
      lastmod: block.match(/<lastmod>(.*?)<\/lastmod>/)?.[1],
    }));
    for (const entry of entries) if (!entry.lastmod) fail('/sitemap.xml', `${entry.path} has no lastmod`);
    const sitemapPaths = new Set(entries.map((entry) => entry.path));

    // Crawl: start from the sitemap and the utility pages, follow internal links.
    const queue = [...new Set(['/', ...sitemapPaths, ...NOINDEX_PAGES])];
    const seen = new Set(queue);
    const indexablePages = new Set();
    const titles = new Map();
    const descriptions = new Map();

    while (queue.length) {
      const path = queue.shift();
      const response = await fetch(BASE + path, { redirect: 'manual' });
      if (response.status !== 200) {
        fail(path, `returns ${response.status}`);
        continue;
      }
      const html = await response.text();
      const indexable = !/<meta name="robots" content="[^"]*noindex/.test(html);
      if (indexable) indexablePages.add(path);
      const result = await auditPage(path, html, { indexable });
      if (indexable) {
        titles.set(result.title, [...(titles.get(result.title) ?? []), path]);
        descriptions.set(result.description, [...(descriptions.get(result.description) ?? []), path]);
      }
      for (const link of result.links) {
        if (!seen.has(link)) {
          seen.add(link);
          queue.push(link);
        }
      }
    }

    for (const [title, paths] of titles) if (paths.length > 1) fail(paths.join(', '), `duplicate title "${title}"`);
    for (const [description, paths] of descriptions) if (paths.length > 1) fail(paths.join(', '), `duplicate description "${description.slice(0, 60)}…"`);
    for (const path of indexablePages) if (!sitemapPaths.has(path)) fail('/sitemap.xml', `indexable page ${path} is missing`);
    for (const path of sitemapPaths) if (!indexablePages.has(path)) fail('/sitemap.xml', `lists ${path}, which is not an indexable page`);

    const notFound = await fetch(BASE + NOT_FOUND_PROBE);
    if (notFound.status !== 404) fail(NOT_FOUND_PROBE, `returns ${notFound.status}, expected 404`);
    else await auditPage('/404', await notFound.text(), { indexable: false });

    console.log(`Pages crawled: ${seen.size} (${indexablePages.size} indexable, ${seen.size - indexablePages.size} noindex) + 404 probe`);
    console.log(`Sitemap URLs: ${sitemapPaths.size}; internal links and assets checked: ${statusCache.size}`);
    if (issues.length) {
      console.error(`\n${issues.length} SEO issue(s):\n${issues.map((issue) => `  ✖ ${issue}`).join('\n')}`);
      process.exitCode = 1;
    } else {
      console.log('SEO audit passed: 0 issues.');
    }
  } finally {
    server?.kill();
  }
}

await main();
