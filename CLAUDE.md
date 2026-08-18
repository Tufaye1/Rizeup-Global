# RizeUp Global — project brief

Study-abroad consultancy site for Bangladeshi students. Static HTML/CSS/JS site
with a Sanity-powered blog, deployed to Cloudflare Workers. Read this whole
file before making changes; it captures state, workflows, and gotchas learned
the hard way across the previous build sessions.

## The three places involved

| What | Where | Notes |
|---|---|---|
| **Site repo** (this folder) | `/Users/eskimibd/rizeup new white` | GitHub: `Tufaye1/Rizeup-Global`, branch `main`. Plain HTML/CSS/JS, no bundler. |
| **Sanity Studio** | `/Users/eskimibd/studio-rizeup-global` (sibling folder, own separate git repo) | CMS for blog posts + marketing content. Hosted at **rizeupglobal.sanity.studio**. Project ID `yjw01pkk`, dataset `production` (public read, no token needed). |
| **Live site** | **rizeupglobal.com** | Served by Cloudflare Workers, service name `rizeup-rlobal` (yes, missing a "g", that's the real service name). |

## Tech stack, deliberately simple

No React, no build tool, no npm deps for the site itself. Every page is a
hand-authored `.html` file, styles live in a handful of shared `.css` files
(`styles.css` is the base, plus per-section files like `blog.css`,
`destination.css`, `resources.css`), and interaction logic lives in plain
`.js` files (`script.js` for the homepage, `destination.js` for country
pages, `faq.js`, `resources.js`). This was a deliberate choice over Astro to
ship fast; an Astro migration was discussed as a possible future step if the
blog grows a lot, but nothing has moved in that direction yet.

The one exception is the **blog**, which is generated from Sanity by
`build-blog.js` (Node, zero dependencies, uses native `fetch`).

## Critical workflow #1: editing static pages

Homepage (`index.html`), the four destination pages (`malaysia.html`,
`australia.html`, `usa.html`, `europe.html`), `resources.html`, `faq.html` —
just edit the HTML/CSS/JS directly, then `git add / commit / push`. The
destination pages pull their university/course data from
`destinations-data.js` (one object per country, each university has a
`photo:` field pointing into `images/universities/`).

## Critical workflow #2: editing the blog

**The blog is NOT live-fetched.** Sanity is only a content database; nothing
a visitor sees updates until someone runs the build script. The loop is:

1. Edit content in the Studio (rizeupglobal.sanity.studio) — text, or upload
   a cover image on a post, or add/edit an author.
2. From this repo root, run:
   ```bash
   node build-blog.js
   ```
   This fetches all **published** posts from Sanity's public CDN API and
   regenerates `blog.html`, every `blog/<slug>.html`, and `sitemap.xml`.
   Use `node build-blog.js --preview` instead to include **drafts** (reads
   with the local Sanity CLI auth token) when you want to check something
   before publishing.
3. `git add -A && git commit && git push`.

**Gotchas that have actually happened:**
- A post's **slug** can get accidentally edited in the Studio (e.g. spaces
  instead of hyphens). If you rebuild without noticing, that article's URL
  breaks. Sanity check before rebuilding: `slug.current` should always be
  lowercase-hyphenated and match the live URL if the post was already
  published (changing it silently breaks the existing indexed URL).
- New posts are created as **drafts** by default. A draft never appears in
  a production build (`node build-blog.js` filters to published-only) —
  publish it in the Studio first.
- Cover images: some early ones were uploaded as large SVGs (1-1.8MB). They
  render fine and aren't broken, just heavier than an optimized JPG/WebP
  would be. Worth re-exporting only if page speed becomes a real concern.

Authoring pipeline for *new* long-form articles (as opposed to quick edits
in the Studio UI): `content/articles/*.md` (frontmatter + markdown) →
`node content/build-ndjson.js` → writes `content/posts.ndjson` → import with
`npx sanity dataset import content/posts.ndjson production --replace`
(run from the studio folder) → then `node build-blog.js` as above. This is
how the first 13 articles were bulk-created; for one-off edits just use the
Studio directly.

## Critical workflow #3: deploying

Push to `main` → Cloudflare is *supposed* to auto-deploy. In practice, **the
build queue gets stuck almost every single push** and needs a manual nudge:

1. Open the Cloudflare dashboard → **Workers & Pages → rizeup-rlobal →
   Deployments**.
2. If the latest build is stuck "Initializing…" for more than a minute or
   two, **Cancel build**.
3. **Create deployment** (or Retry) on the latest commit on `main`.

The deploy command is `npx wrangler deploy`, which needs `wrangler.toml`
present with an `[assets] directory = "."` block — that's already in the
repo, don't remove it, without it every build fails silently at the deploy
step and stale content stays live.

To confirm something actually went live, curl a URL that only exists in the
new commit with a cache-busting query string, e.g.:
```bash
curl -s "https://rizeupglobal.com/blog/<slug>?v=$(date +%s)" | grep "cdn.sanity.io"
```

## Local preview

A launch config already exists at `.claude/launch.json` (server name
`rizeup-site`, `python3 -m http.server 8642`). Use the Browser preview tool
with that name rather than starting a server manually.

## Design conventions (do not violate these)

- **Zero em-dashes anywhere** — headlines, body copy, comments, everything.
  Use a period, comma, or hyphen instead. This was a deliberate, explicit,
  site-wide cleanup; don't reintroduce them.
- **Writing voice**: plain, specific, a little conversational, no AI-sounding
  filler ("elevate", "seamless", "unlock"), no promotional puffery, varied
  sentence length. If asked to write new copy, write it like a person who
  actually does this job, not like marketing copy.
- **Brand colors stay as-is**: indigo `#5B4FE9` (primary), yellow `#FDC93B`
  (secondary/CTA), red/green as semantic tints, ink `#171040` text, lavender
  `#F3F2FB` backgrounds. Sora (display) + DM Sans (body). This is an
  established brand (logo, favicon, og-image all indigo) — refine execution,
  don't swap the palette, unless explicitly asked to rebrand.
- **Motion**: there's a reusable `.reveal` utility (CSS + IntersectionObserver
  in `script.js`, respects `prefers-reduced-motion`) currently only applied to
  the homepage contact panel. A subtle, site-wide scroll-reveal + hover-polish
  pass was scoped and agreed with the user but **not yet executed** — see
  Open Items below.
- Forms post to **Formspree** (`https://formspree.io/f/xbdbbnzb`). Don't
  rename form field `name` attributes or IDs without checking — nothing
  downstream depends on them right now, but keep them stable out of habit.

## SEO state (already done)

`sitemap.xml` + `robots.txt` live and correct. Canonical URLs, Open Graph,
and Twitter Card meta on every page. JSON-LD: `EducationalOrganization` +
`FAQPage` on the homepage/FAQ page, `Article` + `BreadcrumbList` on every
blog post (all generated by `build-blog.js`). **GA4 is intentionally not set
up** (user deferred this explicitly — revisit if they ask about traffic
analytics).

## Open items / where to pick up

Roughly in priority order:

1. **Site-wide subtle motion + UX pass** — agreed direction: subtle scroll-
   reveal on section entrances + tasteful hover/active states across every
   page, keeping the current brand colors exactly as-is. Only seeded on one
   section so far (homepage contact panel). This was mid-flight when the
   session ended; pick it up by reusing the `.reveal` utility already in
   `script.js`/`styles.css`.
2. **Author photos** — three real counsellors exist in Sanity (Saiful Alam,
   Tufayel Hossain, Israt Jahan) but have no photo uploaded yet.
3. **Confirm "Israt Jahan" spelling** — the user originally typed "Israt
   Jhan"; "Israt Jahan" was used as a best-guess correction and never
   explicitly confirmed. Double-check with the user.
4. **Individual university detail pages** — proposed as a strong SEO
   opportunity (e.g. "monash university australia" is ~8,100 searches/mo at
   low competition, and the university data already exists in Sanity), but
   not built. Would need its own template + route.
5. **Off-page SEO** (the user's homework, not something to build): Google
   Business Profiles for the Chattogram and Shah Alam offices, backlinks,
   directory listings. Status unconfirmed, worth asking.
6. **Google Search Console** — sitemap submission instructions were given to
   the user; unconfirmed whether they completed verification/submission.
7. **GA4** — explicitly deferred, not an oversight. Set up only if asked.

## Where to find more detail

Persistent memory (auto-loaded in this environment, may or may not carry
into a different tool) has two supplementary notes: deploy setup specifics
and Sanity CMS schema details. This file is meant to be self-sufficient even
if that memory isn't available, so read this first regardless.
