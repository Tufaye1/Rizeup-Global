# Google Search Console setup for rizeupglobal.com

Current state (verified 2026-08-19):

- `https://rizeupglobal.com/sitemap.xml` is live, returns HTTP 200, and lists **21 URLs**
  (homepage, 4 destination pages, resources, FAQ, blog index, 13 blog posts).
- `https://rizeupglobal.com/robots.txt` is live and already points crawlers at the sitemap.

So nothing needs to be built. What's left is verifying ownership and submitting the
sitemap once.

## One thing to know first

**You do not upload the XML file to Google.** Search Console asks for the sitemap's
*path* on your own domain, and Google fetches it. The `sitemap.xml` in this repo is
just your local copy for reference. It is regenerated automatically every time
`node build-blog.js` runs, so it stays in sync on its own.

## Step 1: Add the property

1. Go to https://search.google.com/search-console
2. Sign in with the Google account you want to own this (use a business account you
   won't lose access to, not a personal throwaway).
3. Click the property dropdown, top left, then **Add property**.
4. Choose the **Domain** option, the left-hand box, not "URL prefix".
5. Enter `rizeupglobal.com` (no `https://`, no `www`).
6. Click **Continue**.

Why Domain and not URL prefix: one Domain property covers `http`, `https`, `www` and
every subdomain at once. With URL prefix you'd need a separate property per variant.

## Step 2: Verify ownership via Cloudflare DNS

Google will show you a TXT record that looks like
`google-site-verification=AbC123...`. Copy the whole string.

1. Open the Cloudflare dashboard and select the **rizeupglobal.com** zone.
2. Go to **DNS → Records**.
3. Click **Add record** and fill in:
   - **Type**: `TXT`
   - **Name**: `@`   (this means the root domain)
   - **Content**: paste the `google-site-verification=...` string
   - **TTL**: Auto
   - Proxy status: not applicable to TXT records, ignore it
4. **Save**.
5. Return to the Search Console tab and click **Verify**.

On Cloudflare this usually works within a minute or two. If it fails, wait five
minutes and press Verify again; don't delete the record and start over.

Leave that TXT record in place permanently. Removing it later un-verifies the property.

## Step 3: Submit the sitemap

1. In Search Console, with the property selected, click **Sitemaps** in the left sidebar.
2. Under "Add a new sitemap" the field is prefilled with `https://rizeupglobal.com/`.
3. Type just: `sitemap.xml`
4. Click **Submit**.

Expected result: status **Success**, with 21 discovered URLs. The count can take a few
hours to populate, and "Couldn't fetch" immediately after submitting is usually just
Google not having crawled yet. Give it a day before worrying.

You only ever do this once. New blog posts get picked up automatically because the
build script rewrites `sitemap.xml` on every run.

## Step 4: Nudge the important pages (optional)

For the handful of pages you most want indexed now:

1. Paste a full URL into the search bar at the very top ("Inspect any URL").
2. Wait for the result, then click **Request indexing**.

Worth doing for the homepage, the four destination pages, and two or three of your
strongest blog posts. Don't do all 21, there's a daily quota and it doesn't speed
anything up.

## What to check a week later

- **Pages** report: how many of the 21 are "Indexed" vs "Not indexed", and the stated
  reason for any that aren't.
- **Performance** report: which queries you're already appearing for. This is the real
  signal for what to write next.
- **Mobile usability** / Core Web Vitals: should be clean now that the mobile
  navigation and the horizontal-overflow bugs are fixed.

## If you'd rather not touch DNS

The alternative is the HTML meta tag method, which needs a URL-prefix property:

1. Add property → **URL prefix** → `https://rizeupglobal.com`
2. Choose the **HTML tag** verification method and copy the `content="..."` token.
3. Send me that token and I'll add the meta tag to every page, including the generated
   blog templates, then you push and click Verify.

The DNS route is better if you can do it, since it covers every URL variant.
