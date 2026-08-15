#!/usr/bin/env node
/**
 * RizeUp Global — blog build script (no dependencies, Node 18+).
 *
 * Pulls published blog posts from Sanity's public API and generates:
 *   - blog.html                (blog index)
 *   - blog/<slug>.html         (article pages, with Article + Breadcrumb schema)
 *   - sitemap.xml              (static pages + all blog posts)
 *
 * Run:  node build-blog.js            (published posts only — for production)
 *       node build-blog.js --preview  (includes drafts — for local review)
 *
 * Re-run whenever content changes in the Studio, then commit + push.
 */

const fs = require('fs');
const path = require('path');

const PROJECT = 'yjw01pkk';
const DATASET = 'production';
const SITE = 'https://rizeupglobal.com';
const API_VER = 'v2024-01-01';
const PREVIEW = process.argv.includes('--preview');
const ROOT = __dirname;

const WA = '8801612497157';

// ---------------------------------------------------------------- helpers
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
  ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);

function refToUrl(ref) {
  if (!ref) return null;
  // image-<id>-<w>x<h>-<ext>
  const m = /^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/.exec(ref);
  if (!m) return null;
  return `https://cdn.sanity.io/images/${PROJECT}/${DATASET}/${m[1]}-${m[2]}.${m[3]}`;
}

function previewToken() {
  // PREVIEW only: read the local Sanity CLI token so drafts (private) are readable.
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(require('os').homedir(), '.config/sanity/config.json'), 'utf8'));
    return cfg.authToken || null;
  } catch { return null; }
}

async function sanityFetch(query) {
  // Production: fast CDN, published only. Preview: authenticated API, includes drafts.
  const host = PREVIEW ? `${PROJECT}.api.sanity.io` : `${PROJECT}.apicdn.sanity.io`;
  const url = `https://${host}/${API_VER}/data/query/${DATASET}?query=${encodeURIComponent(query)}`;
  const headers = {};
  if (PREVIEW) {
    const tok = previewToken();
    if (tok) headers.Authorization = `Bearer ${tok}`;
  }
  const res = await fetch(url, {headers});
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status} ${await res.text()}`);
  return (await res.json()).result;
}

// ------------------------------------------------- portable text -> HTML
function spansToHtml(children = [], markDefs = []) {
  return children.map((c) => {
    let t = esc(c.text || '');
    const marks = c.marks || [];
    marks.forEach((mk) => {
      const def = markDefs.find((d) => d._key === mk);
      if (def && def._type === 'link') {
        const href = esc(def.href || '#');
        const ext = /^https?:/.test(def.href || '') && !def.href.includes('rizeupglobal.com');
        t = `<a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`;
      } else if (mk === 'strong') t = `<strong>${t}</strong>`;
      else if (mk === 'em') t = `<em>${t}</em>`;
    });
    return t;
  }).join('');
}

function bodyToHtml(blocks = []) {
  const out = [];
  let list = null; // {type:'ul'|'ol', items:[]}
  const flush = () => {
    if (list) {
      out.push(`<${list.type}>${list.items.map((i) => `<li>${i}</li>`).join('')}</${list.type}>`);
      list = null;
    }
  };
  for (const b of blocks) {
    if (b._type === 'image') {
      flush();
      const url = b.asset && b.asset.url ? b.asset.url : refToUrl(b.asset && b.asset._ref);
      if (url) out.push(`<img src="${esc(url)}" alt="${esc(b.alt || '')}" loading="lazy">`);
      continue;
    }
    if (b._type !== 'block') continue;
    const html = spansToHtml(b.children, b.markDefs);
    if (b.listItem === 'bullet' || b.listItem === 'number') {
      const type = b.listItem === 'bullet' ? 'ul' : 'ol';
      if (!list || list.type !== type) { flush(); list = {type, items: []}; }
      list.items.push(html);
      continue;
    }
    flush();
    const style = b.style || 'normal';
    if (style === 'h2') out.push(`<h2 id="${slugify(b.children.map((c) => c.text).join(' '))}">${html}</h2>`);
    else if (style === 'h3') out.push(`<h3>${html}</h3>`);
    else if (style === 'h4') out.push(`<h4>${html}</h4>`);
    else if (style === 'blockquote') out.push(`<blockquote>${html}</blockquote>`);
    else if (html.trim()) out.push(`<p>${html}</p>`);
  }
  flush();
  return out.join('\n');
}

function tocFromBody(blocks = []) {
  return blocks
    .filter((b) => b._type === 'block' && b.style === 'h2')
    .map((b) => {
      const text = (b.children || []).map((c) => c.text).join(' ');
      return {text, id: slugify(text)};
    });
}

// ----------------------------------------------------- shared chrome
function head(title, desc, canonical, opts = {}) {
  const p = opts.depth ? '../' : '';
  const img = opts.ogImage || `${SITE}/og-image.png`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${p}styles.css">
<link rel="stylesheet" href="${p}blog.css">
<link rel="icon" type="image/png" sizes="32x32" href="${p}favicon-32.png">
<link rel="icon" type="image/png" href="${p}favicon.png">
<link rel="apple-touch-icon" href="${p}apple-touch-icon.png">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow">
<meta property="og:type" content="${opts.ogType || 'website'}">
<meta property="og:site_name" content="RizeUp Global">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${esc(img)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">
${(opts.jsonld || []).map((j) => `<script type="application/ld+json">\n${JSON.stringify(j, null, 2)}\n</script>`).join('\n')}
</head>
<body>`;
}

function navbar(depth) {
  const p = depth ? '../' : '';
  return `
<nav class="navbar">
  <div class="navbar__inner">
    <a href="${p}index.html#top" class="navbar__logo">
      <img src="${p}navbar-logo.png" alt="" class="navbar__logo-img">
      RizeUp<em>Global</em>
    </a>
    <div class="navbar__links">
      <a href="${p}index.html#services">Services</a>
      <a href="${p}index.html#destinations">Destinations</a>
      <a href="${p}blog.html">Blog</a>
      <a href="${p}resources.html">Resources</a>
      <a href="${p}index.html#faq">FAQ</a>
    </div>
    <a href="${p}index.html#contact" class="navbar__cta">Free Consult</a>
  </div>
</nav>`;
}

function footer(depth) {
  const p = depth ? '../' : '';
  return `
<footer class="footer">
  <div class="footer__grid">
    <div>
      <div class="footer__logo">RizeUp <em>Global</em></div>
      <p class="footer__about">Helping Bangladeshi students find their way to global degrees. Based in Chattogram. Trusted across four countries.</p>
      <div class="footer__social">
        <a href="https://facebook.com" aria-label="Facebook"><svg width="17" height="17" viewBox="0 0 24 24" fill="#ffffff"><path d="M18 2H15A5 5 0 0 0 10 7V10H7V14H10V22H14V14H17L18 10H14V7A1 1 0 0 1 15 6H18Z"/></svg></a>
        <a href="https://instagram.com" aria-label="Instagram"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#ffffff"/></svg></a>
        <a href="https://tiktok.com" aria-label="TikTok"><svg width="17" height="17" viewBox="0 0 24 24" fill="#ffffff"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg></a>
      </div>
    </div>
    <div>
      <div class="footer__col-title">Services</div>
      <div class="footer__links">
        <a href="${p}index.html#services">University selection</a>
        <a href="${p}index.html#services">Application &amp; admission</a>
        <a href="${p}index.html#services">Visa guidance</a>
        <a href="${p}index.html#services">Scholarship help</a>
        <a href="${p}index.html#services">Accommodation</a>
        <a href="${p}index.html#services">Pre-departure</a>
      </div>
    </div>
    <div>
      <div class="footer__col-title">Destinations</div>
      <div class="footer__links">
        <a href="${p}malaysia.html">Malaysia</a>
        <a href="${p}australia.html">Australia</a>
        <a href="${p}usa.html">USA</a>
        <a href="${p}europe.html">Europe</a>
      </div>
    </div>
    <div>
      <div class="footer__col-title">Contact</div>
      <div class="footer__links">
        <a href="https://wa.me/8801612497157">+880 1612-497157 (WhatsApp BD)</a>
        <a href="https://wa.me/60178853621">+60 17-885 3621 (WhatsApp MY)</a>
        <a href="mailto:contact@rizeupglobal.com">contact@rizeupglobal.com</a>
        <a href="mailto:rizeupglobal@gmail.com">rizeupglobal@gmail.com</a>
        <span>Hazera-Taju College, Old Chandgaon,<br>Chattogram 4212, Bangladesh</span>
      </div>
    </div>
  </div>
  <div class="footer__bar">© 2026 RizeUp Global · Find Your Way.</div>
</footer>
<a href="https://wa.me/${WA}" class="wa-float" aria-label="Chat on WhatsApp"><svg width="30" height="30" viewBox="0 0 24 24" fill="#ffffff"><path d="M12 2C6.5 2 2 6.4 2 11.8C2 13.6 2.5 15.3 3.4 16.8L2 22L7.4 20.6C8.8 21.4 10.4 21.8 12 21.8C17.5 21.8 22 17.4 22 12C22 6.4 17.5 2 12 2ZM16.9 15.4C16.7 16 15.7 16.6 15.2 16.6C14.7 16.7 14.1 16.7 13.5 16.5C13.1 16.4 12.6 16.2 11.9 15.9C9.1 14.7 7.3 11.9 7.2 11.7C7 11.5 6.1 10.3 6.1 9C6.1 7.8 6.7 7.2 7 6.9C7.2 6.6 7.5 6.6 7.7 6.6C7.9 6.6 8 6.6 8.2 6.6C8.4 6.6 8.6 6.5 8.8 7.1C9 7.7 9.6 8.9 9.6 9C9.7 9.1 9.7 9.3 9.6 9.5C9 10.7 8.4 10.6 8.8 11.3C10.2 13.7 11.6 14.5 13.7 15.6C14 15.8 14.2 15.7 14.4 15.5C14.6 15.3 15.2 14.6 15.4 14.3C15.6 14 15.9 14 16.1 14.1C16.4 14.2 17.7 14.9 18 15C18.3 15.2 18.5 15.2 18.5 15.4C18.6 15.5 18.6 16 16.9 15.4Z"/></svg></a>
</body>
</html>`;
}

const PH = ['post-card__ph--t1', 'post-card__ph--t2', 'post-card__ph--t3', 'post-card__ph--t4'];
const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'});
};
const initials = (name) => (name || 'RG').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

function postCard(post, i) {
  const cat = post.categories && post.categories[0] ? post.categories[0].title : 'Study Abroad';
  const media = post.cover && post.cover.url
    ? `<div class="post-card__media"><img src="${esc(post.cover.url)}" alt="${esc(post.cover.alt || post.title)}"></div>`
    : `<div class="post-card__media post-card__media--ph ${PH[i % 4]}">${esc(initials(post.title))}</div>`;
  return `
    <article class="post-card">
      <a href="blog/${esc(post.slug)}.html">
        ${media}
        <div class="post-card__body">
          <span class="post-card__tag">${esc(cat)}</span>
          <h2 class="post-card__title">${esc(post.title)}</h2>
          <p class="post-card__excerpt">${esc(post.excerpt || '')}</p>
          <span class="post-card__more">Read article →</span>
        </div>
      </a>
    </article>`;
}

function renderIndex(posts) {
  const canonical = `${SITE}/blog`;
  const jsonld = [{
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'RizeUp Global Blog',
    url: canonical,
    description: 'Study-abroad guides for Bangladeshi students — countries, scholarships, applications, visas and more.',
  }];
  const cards = posts.length
    ? `<div class="blog-grid">${posts.map(postCard).join('')}</div>`
    : `<p class="blog-empty">Articles are on the way — check back soon.</p>`;
  return head(
    'Study-Abroad Blog & Guides — RizeUp Global',
    'Free study-abroad guides for Bangladeshi students: country guides, scholarships, university applications, SOPs, visas and costs — from RizeUp Global.',
    canonical, {jsonld}
  ) + navbar(0) + `
<header class="blog-hero">
  <div class="blog-hero__inner">
    <span class="blog-hero__eyebrow">RizeUp Global Blog</span>
    <h1>Study-Abroad <em>Guides</em></h1>
    <p>Everything a Bangladeshi student needs — country guides, scholarships, applications, SOPs, visas and costs. Written by counsellors who do this every day.</p>
  </div>
</header>
<section class="blog-grid-section">
  ${cards}
</section>` + footer(0);
}

function renderArticle(post, related) {
  const canonical = `${SITE}/blog/${post.slug}`;
  const cat = post.categories && post.categories[0] ? post.categories[0].title : 'Study Abroad';
  const author = post.author || {name: 'RizeUp Global Team'};
  const toc = tocFromBody(post.body);
  const desc = (post.seo && post.seo.description) || post.excerpt || '';
  const title = (post.seo && post.seo.title) || `${post.title} — RizeUp Global`;
  const cover = post.cover && post.cover.url ? post.cover.url : null;

  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: desc,
      datePublished: post.publishedAt || post._createdAt,
      dateModified: post._updatedAt || post.publishedAt || post._createdAt,
      author: {'@type': 'Person', name: author.name},
      publisher: {'@type': 'Organization', name: 'RizeUp Global', logo: {'@type': 'ImageObject', url: `${SITE}/favicon.png`}},
      mainEntityOfPage: canonical,
      ...(cover ? {image: cover} : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {'@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/`},
        {'@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog`},
        {'@type': 'ListItem', position: 3, name: post.title, item: canonical},
      ],
    },
  ];

  const avatar = author.photo
    ? `<span class="article__meta-avatar"><img src="${esc(author.photo)}" alt="${esc(author.name)}"></span>`
    : `<span class="article__meta-avatar">${esc(initials(author.name))}</span>`;

  const tocHtml = toc.length > 2 ? `
  <nav class="article__toc" aria-label="Table of contents">
    <p class="article__toc-title">In this guide</p>
    <ol>${toc.map((t) => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`).join('')}</ol>
  </nav>` : '';

  const coverHtml = cover ? `<div class="article__cover"><img src="${esc(cover)}" alt="${esc((post.cover && post.cover.alt) || post.title)}"></div>` : '';

  const relatedHtml = related.length ? `
<section class="article__related">
  <h2>Keep reading</h2>
  <div class="blog-grid">${related.map(postCard).join('')}</div>
</section>` : '';

  const ctaHtml = `
  <div class="article__cta">
    <h3>Ready to make it happen?</h3>
    <p>Get a free, no-pressure consult. Tell us your goals and a counsellor maps the exact steps for you.</p>
    <div class="article__cta-actions">
      <a class="y" href="../index.html#contact">Book Free Consult →</a>
      <a class="w" href="https://wa.me/${WA}" target="_blank" rel="noopener">Chat on WhatsApp</a>
    </div>
  </div>`;

  return head(title, desc, canonical, {depth: 1, ogType: 'article', ogImage: cover || undefined, jsonld}) + navbar(1) + `
<article class="article">
  <div class="article__breadcrumb"><a href="../index.html">Home</a> › <a href="../blog.html">Blog</a> › ${esc(post.title)}</div>
  <span class="article__tag">${esc(cat)}</span>
  <h1 class="article__title">${esc(post.title)}</h1>
  <div class="article__meta">${avatar}<div><b>${esc(author.name)}</b>${author.role ? ` · ${esc(author.role)}` : ''}${post.publishedAt ? `<br>${esc(fmtDate(post.publishedAt))}` : ''}</div></div>
  ${coverHtml}
  ${tocHtml}
  <div class="article__body">
${bodyToHtml(post.body)}
  </div>
  ${ctaHtml}
</article>
${relatedHtml}` + footer(1);
}

// ----------------------------------------------------------- sitemap
function writeSitemap(posts) {
  const today = new Date().toISOString().slice(0, 10);
  const staticUrls = [
    ['/', '1.0', 'weekly'], ['/blog', '0.9', 'daily'], ['/resources', '0.8', 'weekly'],
    ['/malaysia', '0.8', 'monthly'], ['/australia', '0.8', 'monthly'],
    ['/usa', '0.8', 'monthly'], ['/europe', '0.8', 'monthly'],
  ];
  const urls = staticUrls.map(([loc, pr, cf]) =>
    `  <url>\n    <loc>${SITE}${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${cf}</changefreq>\n    <priority>${pr}</priority>\n  </url>`);
  posts.forEach((p) => {
    urls.push(`  <url>\n    <loc>${SITE}/blog/${p.slug}</loc>\n    <lastmod>${(p.publishedAt || p._createdAt || today).slice(0, 10)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`);
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
}

// --------------------------------------------------------------- main
async function main() {
  const filter = PREVIEW ? '_type == "post"' : '_type == "post" && !(_id in path("drafts.**"))';
  const query = `*[${filter}]{
    _id, title, "slug": slug.current, excerpt, publishedAt, _createdAt, _updatedAt,
    "cover": mainImage{"url": asset->url, alt},
    "author": author->{name, role, "photo": photo.asset->url},
    "categories": categories[]->{title, "slug": slug.current},
    body[]{..., _type == "image" => {"asset": {"url": asset->url}, alt}},
    seo
  } | order(coalesce(publishedAt, _createdAt) desc)`;

  let posts = await sanityFetch(query);
  // In preview, dedupe drafts over published by base id.
  if (PREVIEW) {
    const byBase = new Map();
    for (const p of posts) {
      const base = p._id.replace(/^drafts\./, '');
      const isDraft = p._id.startsWith('drafts.');
      if (!byBase.has(base) || isDraft) byBase.set(base, p);
    }
    posts = [...byBase.values()];
  }
  posts = posts.filter((p) => p.slug);

  fs.mkdirSync(path.join(ROOT, 'blog'), {recursive: true});
  fs.writeFileSync(path.join(ROOT, 'blog.html'), renderIndex(posts));

  for (const post of posts) {
    const related = posts.filter((p) => p._id !== post._id).slice(0, 3);
    fs.writeFileSync(path.join(ROOT, 'blog', `${post.slug}.html`), renderArticle(post, related));
  }

  writeSitemap(posts);
  console.log(`Built ${posts.length} post(s)${PREVIEW ? ' (PREVIEW — incl. drafts)' : ''} + blog index + sitemap.`);
  posts.forEach((p) => console.log(`  - blog/${p.slug}.html  «${p.title}»`));
}

main().catch((e) => { console.error(e); process.exit(1); });
