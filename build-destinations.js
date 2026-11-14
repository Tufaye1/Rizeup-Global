/* ============================================================
   RizeUp Global, destination page pre-renderer
   ------------------------------------------------------------
   The four destination pages used to ship an empty #uni-grid and
   let destination.js fill it in the browser. Search crawlers run
   JS late and most AI crawlers never run it at all, so the
   universities, courses and entry requirements were invisible to
   them: /australia served 141 words of body text and never said
   the word "Monash".

   This bakes the same markup destination.js produces into the
   HTML at build time, plus an ItemList of the universities as
   JSON-LD. destination.js still runs and still renders the page
   when the data changes, it just skips anything already baked in.

   Run after editing destinations-data.js:
       node build-destinations.js

   Zero dependencies, same as build-blog.js.
   ============================================================ */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SITE = 'https://rizeupglobal.com';
const ROOT = __dirname;

// Must stay in sync with THEMES in destination.js.
const THEMES = ['t-purple', 't-green', 't-pink', 't-blue'];

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* Load window.DESTINATIONS out of the plain browser script. */
function loadDestinations() {
  const src = fs.readFileSync(path.join(ROOT, 'destinations-data.js'), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'destinations-data.js' });
  const data = sandbox.window.DESTINATIONS;
  if (!data || typeof data !== 'object') {
    throw new Error('destinations-data.js did not set window.DESTINATIONS');
  }
  return data;
}

/* ---------- markup, mirrors destination.js ---------- */

function renderHeroInner(data) {
  const stats = data.stats.map((s) => `
      <div class="dhero__stat">
        <div class="dhero__stat-num">${esc(s.num)}</div>
        <div class="dhero__stat-label">${esc(s.label)}</div>
      </div>`).join('');

  return `
    <div class="dhero__inner">
      <a href="index.html#destinations" class="dhero__back">← All destinations</a>
      <div class="dhero__flag" role="img" aria-label="${esc(data.name)} flag">${data.flag}</div>
      <h1 class="dhero__title">Study in <em>${esc(data.name)}</em></h1>
      <p class="dhero__tagline">${esc(data.tagline)}</p>
      <p class="dhero__intro">${esc(data.intro)}</p>
      <div class="dhero__stats">${stats}
      </div>
    </div>`;
}

function renderCard(u, i) {
  const theme = THEMES[i % THEMES.length];
  const media = u.photo
    ? `<img src="${esc(u.photo)}" alt="${esc(u.name)}" class="uni-card__img" width="640" height="420" loading="lazy" decoding="async">`
    : `<span class="uni-card__mark">${esc(u.short || u.name.charAt(0))}</span>`;

  const courses = u.courses.map((c) => `<span class="uni-tag">${esc(c)}</span>`).join('');
  const reqs = u.requirements.map((r) => `<li>${esc(r)}</li>`).join('');

  return `
      <article class="uni-card uni-card--${theme}">
        <div class="uni-card__media">
          ${media}
          <span class="uni-card__rank">${esc(u.rank)}</span>
        </div>
        <div class="uni-card__body">
          <h3 class="uni-card__name">${esc(u.name)}</h3>
          <div class="uni-card__loc">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21C12 21 19 15.5 19 10C19 6.1 15.9 3 12 3C8.1 3 5 6.1 5 10C5 15.5 12 21 12 21Z"/><circle cx="12" cy="10" r="2.6"/></svg>
            ${esc(u.city)}
          </div>

          <div class="uni-card__section-label">Available courses</div>
          <div class="uni-card__tags">${courses}</div>

          <div class="uni-card__section-label">What you need to apply</div>
          <ul class="uni-card__reqs">${reqs}</ul>
        </div>
      </article>`;
}

/* ---------- structured data ---------- */

function renderJsonLd(key, data) {
  const pageUrl = `${SITE}/${key}`;
  const items = data.universities.map((u, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'CollegeOrUniversity',
      name: u.name,
      address: { '@type': 'PostalAddress', addressLocality: u.city },
      description:
        `${u.name} in ${u.city}, ${u.rank}. Courses RizeUp Global places ` +
        `Bangladeshi students into: ${u.courses.join(', ')}. Entry requirements: ` +
        `${u.requirements.join('; ')}.`,
    },
  }));

  const payload = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Universities in ${data.name} for Bangladeshi students`,
    description: data.intro,
    url: pageUrl,
    numberOfItems: data.universities.length,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    itemListElement: items,
  };

  return '<!--unis-jsonld-->\n<script type="application/ld+json">\n'
    + JSON.stringify(payload, null, 2)
    + '\n</script>\n<!--/unis-jsonld-->';
}

/* ---------- injection ---------- */

function injectHero(html, inner) {
  const re = /<header id="dhero"[^>]*>[\s\S]*?<\/header>/;
  if (!re.test(html)) throw new Error('no #dhero header found');
  return html.replace(
    re,
    `<header id="dhero" class="dhero" data-prerendered="1">${inner}\n</header>`
  );
}

function injectGrid(html, cards) {
  const built = /<div id="uni-grid"[\s\S]*?<!--\/uni-grid--><\/div>/;
  const empty = /<div id="uni-grid"[^>]*><\/div>/;
  const replacement =
    `<div id="uni-grid" class="uni-grid" data-prerendered="1">${cards}\n  <!--/uni-grid--></div>`;

  if (built.test(html)) return html.replace(built, replacement);
  if (empty.test(html)) return html.replace(empty, replacement);
  throw new Error('no #uni-grid container found');
}

function injectJsonLd(html, block) {
  const existing = /<!--unis-jsonld-->[\s\S]*?<!--\/unis-jsonld-->/;
  if (existing.test(html)) return html.replace(existing, block);
  if (!html.includes('</head>')) throw new Error('no </head> found');
  return html.replace('</head>', `${block}\n</head>`);
}

/* ---------- main ---------- */

function main() {
  const destinations = loadDestinations();
  const keys = Object.keys(destinations);
  let totalUnis = 0;

  keys.forEach((key) => {
    const data = destinations[key];
    const file = path.join(ROOT, `${key}.html`);

    if (!fs.existsSync(file)) {
      console.warn(`  ! skipped ${key}: ${key}.html does not exist`);
      return;
    }

    let html = fs.readFileSync(file, 'utf8');
    const cards = data.universities.map(renderCard).join('');

    html = injectHero(html, renderHeroInner(data));
    html = injectGrid(html, cards);
    html = injectJsonLd(html, renderJsonLd(key, data));

    fs.writeFileSync(file, html);
    totalUnis += data.universities.length;
    console.log(`  - ${key}.html  «${data.universities.length} universities baked in»`);
  });

  console.log(`\nDone. ${keys.length} destination pages, ${totalUnis} universities now in static HTML.`);
}

main();
