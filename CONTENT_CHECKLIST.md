# CanzoTech launch checklist

The site is complete and publishable as-is. The items below swap generated/neutral content for verified
CanzoTech material, and each one is a small edit in `lib/`.

## Content to supply

1. **Contact details** — set `company.phone` and `company.location` in `lib/site-data.ts`.
   Both are hidden everywhere until filled, so nothing breaks while they are empty.
2. **Client logos** — the logo rail shows the technology stack (`lib/tech-logos.ts`), standing in for a client
   logo row. Only publish real client marks with written permission.
3. **Testimonials** — the "What working with us actually looks like" list uses `commitments`. Replace it with
   approved client quotes (name, role, company) when available.
4. **Business statistics** — `stats` describes the delivery model. Swap in verified numbers
   (projects delivered, clients, years, retention) once CanzoTech can substantiate them.
5. **Case studies** — `lib/solutions.ts` holds labelled *solution blueprints* with concept visuals.
   Replace with real projects, client-approved screenshots and verified outcomes when ready.
6. **Careers** — add active roles to `jobs` in `lib/site-data.ts`; until then the page shows an open-application card.
7. **Team / office photos** — the black-and-white imagery is generated. Swap in real photography, kept monochrome,
   when available.
8. **Legal pages** — `/privacy-policy` and `/terms` are written as a reasonable baseline; have them reviewed by
   a lawyer for the correct jurisdiction and business model.
9. **Domain**: if the production domain differs, replace `SITE_URL` in `lib/seo.ts`. Canonicals, the sitemap,
   robots.txt, share images and structured data all derive from it.
10. **Structured address**: the search-engine address comes from `company` in `lib/site-data.ts`
    (street, city, region, postal code `201301`). Confirm the postal code.

## Before going live

- Activate FormSubmit: submit the contact form once from the live site, then click "Activate Form" in the email sent to canzotech@gmail.com.
- Confirm the imagery on Our Work is understood as illustrative; `/terms` already states this.
- Re-run `npm test` and `npm run build`, then check `/sitemap.xml` and `/robots.txt`.
- Verify the domain in Google Search Console, submit the sitemap and request indexing for the homepage.
- Run one service page through Google's Rich Results Test and check a link preview on LinkedIn.
