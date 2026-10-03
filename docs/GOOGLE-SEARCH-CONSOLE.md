# Google Search Console — CanzoTech launch guide

Canonical site: **https://www.canzotech.com** (the bare `canzotech.com` redirects to it with a 301).
Sitemap: **https://www.canzotech.com/sitemap.xml**
DNS provider: **GoDaddy** (nameservers `ns69/ns70.domaincontrol.com`). Email: Zoho Mail.

> Note: this site is built with Next.js, which publishes a single `sitemap.xml` (not `sitemap-index.xml`).
> It already lists every indexable page, so it is the only sitemap to submit.

---

## 1. Pre-launch checklist (run on the live domain after each deploy)

Run these from any terminal (Git Bash, macOS/Linux terminal). Each line shows what you should see.

| Check | Command | Expected |
| --- | --- | --- |
| HTTPS redirect | `curl -sI http://www.canzotech.com/` | `301` → `https://www.canzotech.com/` |
| Apex → www | `curl -sI https://canzotech.com/about` | `301` → `https://www.canzotech.com/about` |
| Trailing slash | `curl -sI https://www.canzotech.com/about/` | `308` → `/about` |
| `/index.html` | `curl -sI https://www.canzotech.com/index.html` | `301` → `/` |
| robots.txt | `curl -s https://www.canzotech.com/robots.txt` | `Allow: /` and `Sitemap: https://www.canzotech.com/sitemap.xml`, no `Disallow` |
| Sitemap | `curl -s https://www.canzotech.com/sitemap.xml` | 19 `<loc>` entries, each with `<lastmod>` |
| 404 status | `curl -sI https://www.canzotech.com/no-such-page` | `HTTP/1.1 404` |
| Favicon | `curl -sI https://www.canzotech.com/favicon.ico` | `200`, `image/x-icon` |
| Form endpoint | `curl -s -X POST https://www.canzotech.com/api/enquiry -H "content-type: application/json" -d "{}"` | `403` `forbidden` (correct: it only accepts posts from the site itself) |
| Working form | Send one real enquiry from `/contact` | Lands on `/thank-you`; email arrives in the **inbox** of info@, vishwajit@ and sunita.ku@ |

---

## 2. Add the Domain property (DNS TXT verification, GoDaddy)

A Domain property covers `https://`, `http://`, `www` and the bare domain in one place.

> The DNS for canzotech.com **already contains** a `google-site-verification=nZy7duL0d8A2W0mE_llR2DzxkizSY46ZNlVSrge9LAk`
> TXT record, so someone has verified (or started verifying) a property before. First open
> [Search Console](https://search.google.com/search-console) with the client's Google account and check whether a
> `canzotech.com` Domain property already exists. If it does, skip to step 3.

1. Go to <https://search.google.com/search-console> → **Add property** → **Domain** → enter `canzotech.com` → Continue.
2. Copy the TXT value Google shows (`google-site-verification=…`).
3. Sign in to GoDaddy → **My Products** → `canzotech.com` → **DNS** → **Manage DNS**.
4. **Add New Record** → Type **TXT** → Name **@** → Value: paste the string → TTL **1 hour** → **Save**.
   Do not delete the existing Zoho `zoho-verification` or SPF (`v=spf1 …`) TXT records.
5. Back in Search Console click **Verify**. If it fails, wait 15–60 minutes for DNS to update and try again.

---

## 3. Submit the sitemap

1. In the property, open **Indexing → Sitemaps**.
2. Enter `https://www.canzotech.com/sitemap.xml` and click **Submit**.
3. What to expect:
   - **"Couldn't fetch" or "Pending" for up to 24 hours is normal** for a new submission. Check again the next day.
   - Opening the sitemap in a browser shows *"This XML file does not appear to have any style information"* —
     that is normal; sitemaps are meant for crawlers, not people.
   - Once processed it should report **19 discovered pages**.

---

## 4. The indexable URLs (19)

**Core pages (6)**
- https://www.canzotech.com/
- https://www.canzotech.com/about
- https://www.canzotech.com/services
- https://www.canzotech.com/work
- https://www.canzotech.com/careers
- https://www.canzotech.com/contact

**Service pages (9)**
- https://www.canzotech.com/services/custom-software-development
- https://www.canzotech.com/services/web-development
- https://www.canzotech.com/services/mobile-app-development
- https://www.canzotech.com/services/ai-automation
- https://www.canzotech.com/services/cloud-devops
- https://www.canzotech.com/services/ui-ux-design
- https://www.canzotech.com/services/qa-testing
- https://www.canzotech.com/services/cyber-security
- https://www.canzotech.com/services/technology-consulting

**Work / solution pages (4)**
- https://www.canzotech.com/work/saas-analytics-platform
- https://www.canzotech.com/work/ecommerce-solution
- https://www.canzotech.com/work/fintech-app
- https://www.canzotech.com/work/healthcare-portal

### Manual "Request indexing" (URL Inspection), about 10 per day

Paste each URL into the search bar at the top of Search Console → **Request indexing**. Google limits how many
requests you can make per day, so split them:

- **Day 1 (10):** `/`, `/services`, `/contact`, `/about`, `/services/custom-software-development`,
  `/services/web-development`, `/services/mobile-app-development`, `/services/ai-automation`,
  `/services/cyber-security`, `/work`
- **Day 2 (9):** `/careers`, `/services/cloud-devops`, `/services/ui-ux-design`, `/services/qa-testing`,
  `/services/technology-consulting`, `/work/saas-analytics-platform`, `/work/ecommerce-solution`,
  `/work/fintech-app`, `/work/healthcare-portal`

Request the **homepage first**: it also makes Google pick up the new favicon sooner (see §7).

---

## 5. Pages that must NOT be submitted

| URL | Why |
| --- | --- |
| `/thank-you` | Shown only after sending a form; no value in search. `noindex, follow`. |
| `/privacy-policy`, `/terms` | Legal boilerplate; `noindex, follow` (still crawlable, links followed). |
| Any 404 URL | Returns a real 404 status and `noindex`. |
| `/api/enquiry` | The form endpoint; sends `X-Robots-Tag: noindex`. |

These pages are deliberately **not** blocked in robots.txt: Google has to be able to crawl them to see the
`noindex` tag. In the Pages report they will appear as **"Excluded by 'noindex' tag"** — that is the intended result,
not an error.

---

## 6. Weeks 1–4 follow-up

**Week 1**
- **Indexing → Pages**: watch "Indexed" climb toward 19. "Discovered – currently not indexed" is normal early on.
- **URL Inspection** on the homepage: "URL is on Google", canonical = `https://www.canzotech.com/`.
- Set up **Google Business Profile** (<https://business.google.com>) for BSI Business Park, H-161, Sector 63, Noida,
  with the same name, phone (+91 76518 50667) and website as the site. Consistent details help local results.

**Week 2**
- **Enhancements**: check **Breadcrumbs** (all inner pages), **FAQ** (service pages) and that the Organization
  logo is detected (URL Inspection → View crawled page → "Detected items"). Fix anything marked "Invalid".
- Run the homepage and one service page through <https://search.google.com/test/rich-results>.

**Week 3**
- **Experience → Core Web Vitals** (needs real-user data; may say "Not enough data" for a few weeks).
- Run <https://pagespeed.web.dev/> on the homepage and `/services/web-development` (mobile).

**Week 4**
- **Bing Webmaster Tools** (<https://www.bing.com/webmasters>) → **Import from Google Search Console** (fastest), then
  submit the same sitemap.
- **Performance** report: first queries and clicks. Re-check the Pages report for any "Crawled – currently not
  indexed" pages and strengthen their content or internal links.

---

## 7. Favicon in Google results

The favicon (`/favicon.ico`, `/favicon.svg`, 48/96/192/512 px PNGs, `apple-touch-icon.png`) is linked from every
page's `<head>`, including the homepage, and is not blocked by robots.txt. **Google can take several days to a few
weeks to show a new favicon** in results. Requesting indexing of the homepage (§4, Day 1) speeds this up.
