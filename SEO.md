# RizeUp Global, SEO status and what to do next

Audited 2026-08-21 against the live site and the repo. Everything in "Already
done" was verified by measurement, not assumed.

---

## 1. Sitemap

`sitemap.xml` is live at https://rizeupglobal.com/sitemap.xml and lists **21 URLs**:

| Type | Count | URLs |
|---|---|---|
| Homepage | 1 | `/` |
| Destinations | 4 | `/malaysia`, `/australia`, `/usa`, `/europe` |
| Other pages | 3 | `/blog`, `/resources`, `/faq` |
| Blog posts | 13 | `/blog/<slug>` |

It is **regenerated automatically** every time you run `node build-blog.js`, so
it never needs hand-editing. Add a post in Sanity, rebuild, push, and the new
URL is in the sitemap.

`robots.txt` is live, allows everything, and points at the sitemap:

```
User-agent: *
Allow: /

Sitemap: https://rizeupglobal.com/sitemap.xml
```

Both of those are correct. Nothing to change.

---

## 2. Google Search Console, step by step

**You do not upload the XML file to Google.** Search Console asks for the
sitemap's path on your own domain and fetches it itself.

### Step 1: Add the property

1. Go to https://search.google.com/search-console
2. Sign in with a business Google account you won't lose access to.
3. Property dropdown, top left, then **Add property**.
4. Choose **Domain**, the left-hand box, not "URL prefix".
5. Enter `rizeupglobal.com` (no `https://`, no `www`).
6. **Continue**.

Domain covers `http`, `https`, `www` and every subdomain in one property. URL
prefix would need a separate property per variant.

### Step 2: Verify via Cloudflare DNS

Google shows a TXT record like `google-site-verification=AbC123...`. Copy it all.

1. Cloudflare dashboard, select the **rizeupglobal.com** zone.
2. **DNS → Records → Add record**:
   - Type: `TXT`
   - Name: `@`
   - Content: paste the `google-site-verification=...` string
   - TTL: Auto
3. **Save**, then back in Search Console click **Verify**.

Usually works within a minute or two on Cloudflare. If it fails, wait five
minutes and press Verify again rather than recreating the record.

Leave that TXT record in place permanently. Deleting it un-verifies the property.

### Step 3: Submit the sitemap

1. **Sitemaps** in the left sidebar.
2. The field is prefilled with `https://rizeupglobal.com/`. Type just `sitemap.xml`.
3. **Submit**.

Expect status **Success** and 21 discovered URLs. "Couldn't fetch" right after
submitting usually just means Google hasn't crawled yet; give it a day.

You only do this once. New posts are picked up automatically.

### Step 4: Nudge the key pages

Paste a URL into the **Inspect any URL** bar at the top, then **Request
indexing**. Worth doing for the homepage, the four destination pages, and two
or three of your strongest posts. Don't do all 21, there's a daily quota and it
doesn't speed things up.

### If you'd rather not touch DNS

Add property → **URL prefix** → `https://rizeupglobal.com` → **HTML tag**
method, then send me the `content="..."` token and I'll add the meta tag to
every page including the blog templates.

---

## 3. Already done and verified

- **Canonical URLs** on all 8 static pages plus all 13 posts, all pointing at
  the clean form (`/malaysia`, not `/malaysia.html`).
- **`.html` URLs 307-redirect** to the clean form, so there is no duplicate
  content. Verified live on `/faq.html`, `/malaysia.html` and a post URL.
- **Open Graph and Twitter Card** tags on every page. `og-image.png` (48KB)
  exists and is referenced by all static pages.
- **Post og:image is now a real JPEG.** It used to point at the source SVG,
  which WhatsApp and Facebook refuse to render, so every shared link had a
  broken preview. This matters a lot for your audience.
- **Structured data on every page**, 34 JSON-LD blocks, all parsing:
  | Page | Types |
  |---|---|
  | Homepage | `EducationalOrganization`, `PostalAddress`, `Country` |
  | FAQ | `FAQPage`, `Question`, `Answer` |
  | Blog index | `Blog` |
  | Each post | `Article`, `BreadcrumbList`, `ImageObject`, `Organization`, `Person` |
  | 4 destinations + resources | `BreadcrumbList` (added 2026-08-21) |
- **One `<h1>` per page.** The four destination pages had **zero** `<h1>` in
  their raw HTML because the hero is injected by `destination.js`. They now
  carry a real static `<h1>`, tagline and intro that the script renders over,
  so crawlers and no-JS clients see the content. These are your highest-value
  commercial pages, so this was the biggest on-page gap.
- **Meta descriptions all within Google's ~155 char display limit.** Homepage
  was 202 (truncating), now 148. Resources 169 → 137. Europe 165 → 139.
- **Mobile is fixed**, which is a ranking factor: working navigation, no
  horizontal overflow at 320/375/390px, blog covers down from ~5MB to ~80KB on
  a phone, and no more blank pages.

---

## 4. Open, in priority order

1. **Blog post titles run long.** 12 of 13 exceed ~60 characters, so Google
   truncates them in results. Example: "Study in Europe from Bangladesh: Italy,
   France & Low-Cost Options" is 75. These are content decisions and live in
   Sanity, so they're yours to shorten. A `seoTitle` field separate from the
   on-page `title` would be the clean fix if you want both.
2. **University detail pages are still unbuilt.** Still the biggest opportunity
   on this list: "monash university australia" is roughly 8,100 searches/month
   at low competition, and the university data already exists in
   `destinations-data.js`. Would need a template, routes and sitemap entries.
3. **Internal links point at `.html`, which costs a 307 redirect hop** on every
   click. Harmless for ranking (canonical resolves it) but it slows navigation
   on mobile. I did not change this because clean URLs are served by Cloudflare
   and **not** by the local `python3 -m http.server` preview, so switching would
   break local testing. Worth doing if you'd rather have the speed.
4. **Author photos** are still missing for all three counsellors in Sanity, so
   bylines render initials. Author images strengthen `Article` structured data.
5. **Off-page**, your side: Google Business Profiles for the Chattogram and
   Shah Alam offices, directory listings, backlinks. For a local consultancy
   this usually moves the needle more than further on-page work.
6. **GA4** is still deliberately not installed. Search Console gives you query
   and impression data without it; add GA4 only if you want on-site behaviour.

---

## 5. After every deploy

Confirm what's live rather than trusting the Cloudflare dashboard:

```bash
curl -s "https://rizeupglobal.com/sitemap.xml?v=$(date +%s)" | grep -c '<url>'
```

Should print `21`.
