// ============================================================
// RizeUp Global — Destination page renderer
// Reads window.COUNTRY_KEY + window.DESTINATIONS and builds the page.
// Conversion happens through the page-level CTA band (Book Free
// Consult / WhatsApp), so the cards themselves stay clean & info-only.
// ============================================================

const WHATSAPP_NUMBER = '8801612497157'; // Bangladesh WhatsApp

const key = window.COUNTRY_KEY;
const data = (window.DESTINATIONS || {})[key];

// Soft pastel themes, cycled across the university cards.
const THEMES = ['t-purple', 't-green', 't-pink', 't-blue'];

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function renderHero() {
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
      <div class="dhero__stats">${stats}</div>
    </div>`;
}

function renderCard(u, i) {
  const theme = THEMES[i % THEMES.length];
  const media = u.photo
    ? `<img src="${esc(u.photo)}" alt="${esc(u.name)}" class="uni-card__img">`
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

function renderPage() {
  if (!data) {
    document.getElementById('dhero').innerHTML =
      '<div class="dhero__inner"><h1 class="dhero__title">Destination not found</h1>' +
      '<p class="dhero__intro"><a href="index.html#destinations">Back to destinations →</a></p></div>';
    return;
  }
  document.title = `Study in ${data.name} — RizeUp Global`;
  document.getElementById('dhero').innerHTML = renderHero();
  document.getElementById('uni-grid').innerHTML = data.universities.map(renderCard).join('');

  const wa = document.querySelector('.wa-float');
  if (wa) wa.href = `https://wa.me/${WHATSAPP_NUMBER}`;
}

renderPage();
