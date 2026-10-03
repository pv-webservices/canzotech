# CanzoTech Website

Next.js (App Router) site for CanzoTech, built around a deliberate design language rather than a template.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`. To test the enquiry form locally, copy `.env.example` to `.env.local` and fill in
the Zoho SMTP values (never commit `.env.local`).

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3000 |
| `npm run build` / `npm start` | Production build / serve it (what Hostinger runs) |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm test` | Unit tests (`tests/*.test.ts`, Node's built-in runner): validation and the enquiry handler with a mocked mail transport |
| `npm run audit:seo` | After a build: crawls every page and checks titles, descriptions, headings, alt text, canonicals, robots, Open Graph, JSON-LD, favicons, broken links, robots.txt and the sitemap. Fails on any issue |
| `npm run test:e2e` | After a build: Playwright browser tests using the installed Chrome. Form flows (endpoint intercepted, nothing sent), quote pop-up, axe WCAG 2.1 AA on every page, keyboard, reduced motion, layout at 320–1440px, console errors, broken images |
| `npm run verify` | All of the above, in order |
| `npm run images` | Rebuilds `public/images/team/*.webp` from the masters in `source-files/` |
| `npm run icons` | Rebuilds every favicon and app icon from the brand mark |

## Folder structure

```
app/                 Routes (App Router), global CSS, robots.ts, sitemap.ts, OG images
  api/enquiry/       POST endpoint for both enquiry forms (sends through Zoho SMTP)
  thank-you/         Post-submit page (noindex)
components/          UI (EnquiryForm, QuotePopup, ContactDetails, WhatsAppWidget, ...)
lib/                 Content and logic: site-data, solutions, testimonials, photos, seo, validation
  server/            Server-only enquiry handler, email builder, rate limiter
public/              Served as-is from the site root
  images/brand/      Logo and mark
  images/editorial/  Black-and-white editorial imagery
  images/team/       Real team and office photos (generated web copies)
  images/work/       Solution blueprint visuals
  favicon.*, icon-*.png, apple-touch-icon.png, site.webmanifest
source-files/        Full-resolution photo masters (never deployed)
scripts/             audit-seo, optimize-images, generate-icons
tests/               Unit tests
e2e/                 Browser tests (Playwright)
docs/                CONTENT_CHECKLIST.md, GOOGLE-SEARCH-CONSOLE.md
```

## Deploy (Hostinger, Node.js web app)

The live site runs as a Next.js Node.js application on Hostinger (LiteSpeed proxies to `next start`). Redirects
(apex to `www`, `/index.html` to `/`, trailing slash) and the security and caching headers are in `next.config.ts`;
Hostinger already redirects HTTP to HTTPS.

1. Push to the deployed branch (or upload the project) and let Hostinger run `npm install` and `npm run build`.
2. Environment variables (hPanel > Websites > canzotech.com > Node.js > Environment variables): `SMTP_HOST`,
   `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO`, `MAIL_FROM` (see `.env.example`). Redeploy after changing them.
3. Check the live site with the commands in `docs/GOOGLE-SEARCH-CONSOLE.md` section 1.

## Design language

Monochrome canvas, brand gradient as the only colour. The palette comes straight from the logo: a near-black
wordmark and a violet→blue→cyan mark.

| Decision | Value |
| --- | --- |
| Surfaces | Pure white `#ffffff`, soft grey `#f4f4f5`, near-black `#0a0a0c` — bands alternate light/dark as colour zones |
| Accent | One gradient, `--gradient` (violet `#7b3fe4` → blue `#2563eb` → cyan `#22d3ee`), sampled from the logo. It appears only on accent words, index rules, hover wipes and progress — never as a decorative blob |
| Display type | **Archivo** 800, tight tracking (`-0.045em`) |
| Accent type | **Instrument Serif** italic, gradient-filled, for one word per headline |
| Labels | **JetBrains Mono**, uppercase, letterspaced, for indices like `02 / CAPABILITIES` |
| Structure | Hairline rules, editorial row lists instead of card grids, oversized numerals, full-bleed media |
| Photography | Black and white throughout; project shots are greyscale and return to colour on hover |

Stylesheets, all imported from `app/layout.tsx`:

- `app/globals.css` — tokens, type, motion primitives, buttons, header, footer, rail, tickers
- `app/home.css` — homepage scenes
- `app/pages.css` — inner pages

## Motion

Scroll is treated as a timeline. One client component, `components/ScrollEffects.tsx`, drives it:

| Attribute | Effect |
| --- | --- |
| `data-reveal="up \| left \| right \| mask \| fade"` | Entrance on first view; `--reveal-delay` staggers groups |
| `data-count="8"` | Count-up when scrolled into view (SSR renders the final number, so it is correct without JS) |
| `data-parallax="-0.05"` | Scroll-linked vertical offset. Disabled below 900px, where it would overlap stacked content |
| `data-scrub` | Sets `--p` from 0→1 across the element's travel — drives the hero frame that opens and the oversized type that slides |
| `.lines` | Headline lines rise out of their own mask, staggered |

Buttons animate with a colour wipe that rises from the bottom edge; links use a sweeping underline; service
rows fill with ink from the left. Sticky columns, a marquee ticker and an oversized moving display ticker
provide the scroll rhythm. Everything collapses safely under `prefers-reduced-motion: reduce`.

**The signature moment** is the hero: after the headline, a black-and-white frame opens from an inset window
to full bleed as you scroll, driven by `clip-path` + `scale` on `--p`. It costs no JavaScript animation loop
beyond one scroll handler, and it degrades to a static full-bleed image on small screens.

**`components/TechRail.tsx`** shows the real stack marks (from `lib/tech-logos.ts`, extracted from
`simple-icons` at build time so the package is not a runtime dependency).

**`components/ServiceIndex.tsx`** renders services as an index of rows; on pointer devices a preview image
follows the cursor. Touch devices simply get the rows.

**`components/Rail.tsx`** is the horizontal slideshow. It is built on native overflow scrolling with
scroll-snap, so touch swipe works on every device; pointer drag, arrow buttons and arrow keys are layered on
top for desktop. (It replaced an earlier scroll-pinned implementation that did not work on touch.)

> Gotcha worth knowing: `.masthead` uses `backdrop-filter`, which makes it the containing block for any
> `position: fixed` descendant. The mobile menu sheet is therefore rendered as a **sibling** of `<header>`,
> not a child.

## Routes

`/`, `/about`, `/services` + 9 service pages, `/work` + 4 project pages, `/careers`, `/contact`,
`/privacy-policy`, `/terms`, `/thank-you`, the `/api/enquiry` endpoint, plus `sitemap.xml` and `robots.txt`. There is no blog.

Unknown URLs, including unknown service or project slugs (`dynamicParams = false`), render `app/not-found.tsx`
with a real 404 status. Runtime failures render `app/error.tsx`, or `app/global-error.tsx` if the root layout
itself fails.

Editable content lives in `lib/site-data.ts` (company, navigation, services, stats, commitments, jobs) and
`lib/solutions.ts` (project blueprints).

## SEO

- **Metadata**: every page builds its tags with `pageMetadata()` in `lib/seo.ts`, which sets a unique title,
  description, canonical, Open Graph and Twitter tags. The production origin (`SITE_URL`) is defined once there.
- **Share images**: `app/opengraph-image.tsx`, plus a card for each service and project, rendered at build time by
  `lib/og-image.tsx`. The renderer fetches Archivo and JetBrains Mono subsets from Google Fonts and falls back
  to a built-in font when offline.
- **Structured data**: Organization + WebSite (root layout), BreadcrumbList (from `PageIntro` crumbs), and
  Service + FAQPage (service pages), all rendered through `components/JsonLd.tsx`.
- **Indexing**: `/privacy-policy` and `/terms` are `noindex, follow` and left out of the sitemap, and error pages
  are noindex. Every other page is in `app/sitemap.ts`. To index the legal pages, remove `noIndex` and add them
  back to the sitemap.
- **Icons**: `public/favicon.ico` (16/32/48), `favicon.svg`, 48/96/192/512 px PNGs and `apple-touch-icon.png`,
  generated from the brand mark by `npm run icons` and linked from every page, plus `public/site.webmanifest`.

See `docs/GOOGLE-SEARCH-CONSOLE.md` for the launch and indexing steps.

## Tests

```bash
npm test
```

Runs `tests/*.test.ts` with Node's built-in test runner. Node 22.18+ runs TypeScript directly, so no extra
packages are needed.

## Images

`public/images/editorial/` and `public/images/work/` were generated for this build (WebP, 36-160 KB each).
`public/images/team/` holds real CanzoTech photos, cropped and compressed from the masters in `source-files/` by
`npm run images` (15-52 KB each). Photos render greyscale and return to colour on hover; `next/image` serves
AVIF/WebP at responsive sizes with explicit dimensions.

`public/images/brand/canzotech-mark.webp` is the brand symbol extracted from the supplied logo; the header and footer pair
it with a live wordmark whose "Tech" carries the gradient, so it works on white and black.

There are no videos on the site, and none were generated.

## Content integrity

The site does not invent client logos, testimonials, project results, office addresses or business statistics:

- The logo rail shows the technology we build with (official marks from simple-icons), not client logos.
- The pop-up slider publishes only testimonials marked `approved` in `lib/testimonials.ts`; until then it shows
  CanzoTech's own delivery commitments.
- The stat rows describe the delivery model, not client counts.
- Our Work shows clearly labelled solution blueprints with concept visuals, not claimed client deployments.

See `docs/CONTENT_CHECKLIST.md` for what to swap in before launch.

## Contact form and quote pop-up

Both forms are `components/EnquiryForm.tsx` and post to our own endpoint, `app/api/enquiry/route.ts`, which sends
the email **through CanzoTech's own Zoho mailbox over SMTP** (`smtp.zoho.in:465`). No third-party form service is
involved, so the email passes SPF/DKIM/DMARC and lands in the inbox.

- **Email**: From `"Visitor Name via CanzoTech Website" <info@canzotech.com>`, Reply-To the visitor, sent to every
  address in `MAIL_TO`. Subject `New enquiry from {Name}: {Service or "Free quote request"}`. Branded HTML table plus
  plain text, with the form type, all fields, the source page and the submission time (IST).
- **Progressive enhancement**: without JavaScript the form is a normal POST answered with a 303 to `/thank-you`. With
  JavaScript it validates inline, posts JSON with a 20-second timeout, then navigates to `/thank-you`.
- **Required**: name, email, phone (10-15 digits including the country code; 10 for India), message (20+ characters)
  and privacy consent. Errors are linked to their fields (`aria-describedby`, `aria-invalid`) and focus moves to the
  first one.
- **Never loses data**: offline, timeout and delivery-failure messages keep every value and offer phone, WhatsApp and
  email; a draft is also kept in session storage for the tab.
- **Spam protection (server side)**: honeypot and 3-second time trap (silently accepted and discarded), origin
  allow-list, 5 requests per IP per 10 minutes, full validation, CR/LF stripped from headers, HTML-escaped body,
  suspicious keywords flagged as `[Possible spam]` in the subject rather than dropped.
- **Errors**: missing SMTP configuration returns 500 and an SMTP failure 502, both with a visitor-friendly fallback.

The **quote pop-up** (`QuotePopupLoader` then `QuotePopup`) opens once per browser session, 5 seconds after landing
(not on `/contact`, `/thank-you` or the legal pages). Its code is downloaded only when it opens. The left panel slides
through approved client testimonials from `lib/testimonials.ts`; until one is approved it shows the published delivery
commitments instead.
