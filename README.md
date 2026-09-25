# CanzoTech Website

Next.js (App Router) site for CanzoTech, built around a deliberate design language rather than a template.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

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
`/privacy-policy`, `/terms`, plus `sitemap.xml` and `robots.txt`. There is no blog.

Editable content lives in `lib/site-data.ts` (company, navigation, services, stats, tech stack, commitments,
jobs) and `lib/solutions.ts` (project blueprints).

## Images

`public/images/*.webp` were generated for this build and optimised to WebP (36–160 KB each). The people and
environment shots are black and white so the brand gradient is the only colour on the page; the project shots
are neutral product photography, rendered greyscale until hovered.

`public/canzotech-mark.webp` is the brand symbol extracted from the supplied logo; the header and footer pair
it with a live wordmark whose "Tech" carries the gradient, so it works on white and black.

There are no videos on the site, and none were generated.

## Content integrity

The site does not invent client logos, testimonials, project results, office addresses or business statistics:

- The logo rail shows the technology we build with (official marks from simple-icons), not client logos.
- The testimonial slot publishes CanzoTech's own delivery commitments until approved client quotes exist.
- The stat rows describe the delivery model, not client counts.
- Our Work shows clearly labelled solution blueprints with concept visuals, not claimed client deployments.

See `CONTENT_CHECKLIST.md` for what to swap in before launch.

## Contact form

`app/api/contact/route.ts` validates input server-side (including a honeypot) and returns success. Connect it
to the client's email provider or CRM and add rate limiting / bot protection before production.
