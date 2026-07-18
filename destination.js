// ============================================================
// RizeUp Global — Destination page renderer
// Reads window.COUNTRY_KEY + window.DESTINATIONS, builds the page,
// wires the Consult modal (Formspree) and WhatsApp buttons.
// ============================================================

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xbdbbnzb';
const WHATSAPP_NUMBER = '8801612497157'; // Bangladesh WhatsApp

const key = window.COUNTRY_KEY;
const data = (window.DESTINATIONS || {})[key];

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function waLink(university) {
  const text = `Hi RizeUp Global, I'm interested in ${university} (${data.name}). Can we talk about applying?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
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

function renderCard(u) {
  const tone = u.tone || 'indigo';
  const media = u.photo
    ? `<img src="${esc(u.photo)}" alt="${esc(u.name)}" class="uni-card__img">`
    : `<span class="uni-card__mark">${esc(u.short || u.name.charAt(0))}</span>`;

  const courses = u.courses.map((c) => `<span class="uni-tag">${esc(c)}</span>`).join('');
  const reqs = u.requirements.map((r) => `<li>${esc(r)}</li>`).join('');

  return `
    <article class="uni-card">
      <div class="uni-card__media uni-card__media--${tone}">
        ${media}
        <span class="uni-card__rank">${esc(u.rank)}</span>
      </div>
      <div class="uni-card__body">
        <h3 class="uni-card__name">${esc(u.name)}</h3>
        <div class="uni-card__loc">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21C12 21 19 15.5 19 10C19 6.1 15.9 3 12 3C8.1 3 5 6.1 5 10C5 15.5 12 21 12 21Z"/><circle cx="12" cy="10" r="2.6"/></svg>
          ${esc(u.city)}
        </div>

        <div class="uni-card__section-label">Available courses</div>
        <div class="uni-card__tags">${courses}</div>

        <div class="uni-card__section-label">What you need to apply</div>
        <ul class="uni-card__reqs">${reqs}</ul>

        <div class="uni-card__actions">
          <button type="button" class="uni-btn uni-btn--primary js-consult" data-uni="${esc(u.name)}">Consult</button>
          <a href="${waLink(u.name)}" target="_blank" rel="noopener" class="uni-btn uni-btn--wa">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff"><path d="M12 2C6.5 2 2 6.4 2 11.8C2 13.6 2.5 15.3 3.4 16.8L2 22L7.4 20.6C8.8 21.4 10.4 21.8 12 21.8C17.5 21.8 22 17.4 22 12C22 6.4 17.5 2 12 2ZM16.9 15.4C16.7 16 15.7 16.6 15.2 16.6C14.7 16.7 14.1 16.7 13.5 16.5C13.1 16.4 12.6 16.2 11.9 15.9C9.1 14.7 7.3 11.9 7.2 11.7C7 11.5 6.1 10.3 6.1 9C6.1 7.8 6.7 7.2 7 6.9C7.2 6.6 7.5 6.6 7.7 6.6C7.9 6.6 8 6.6 8.2 6.6C8.4 6.6 8.6 6.5 8.8 7.1C9 7.7 9.6 8.9 9.6 9C9.7 9.1 9.7 9.3 9.6 9.5C9 10.7 8.4 10.6 8.8 11.3C10.2 13.7 11.6 14.5 13.7 15.6C14 15.8 14.2 15.7 14.4 15.5C14.6 15.3 15.2 14.6 15.4 14.3C15.6 14 15.9 14 16.1 14.1C16.4 14.2 17.7 14.9 18 15C18.3 15.2 18.5 15.2 18.5 15.4C18.6 15.5 18.6 16 16.9 15.4Z"/></svg>
            Contact Consultant
          </a>
        </div>
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

  // WhatsApp float + footer prefill
  const wa = document.querySelector('.wa-float');
  if (wa) wa.href = `https://wa.me/${WHATSAPP_NUMBER}`;
}

// ---------- Consult modal ----------
function initModal() {
  const modal = document.getElementById('consult-modal');
  const form = document.getElementById('consult-form');
  const status = document.getElementById('consult-status');
  const uniField = document.getElementById('consult-uni');
  const subject = document.getElementById('consult-subject');
  const title = document.getElementById('consult-title');
  const submitBtn = form.querySelector('button[type="submit"]');
  let lastFocused = null;

  function open(university) {
    lastFocused = document.activeElement;
    uniField.value = university;
    subject.value = `Consult request — ${university} (${data.name})`;
    title.textContent = `Consult about ${university}`;
    status.textContent = '';
    status.className = 'form-status';
    form.querySelector('.js-reset')?.classList.remove('is-hidden');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modal.querySelector('input[name="name"]').focus();
  }
  function close() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.getElementById('uni-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.js-consult');
    if (btn) open(btn.dataset.uni);
  });
  modal.addEventListener('click', (e) => {
    if (e.target.matches('[data-close], .dmodal__backdrop')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    status.className = 'form-status';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        form.reset();
        status.className = 'form-status form-status--ok';
        status.textContent = "Thanks! A counselor will reach out on WhatsApp within one working day.";
        submitBtn.textContent = 'Sent ✓';
      } else {
        const d = await res.json().catch(() => ({}));
        status.textContent = d.errors
          ? d.errors.map((x) => x.message).join(', ')
          : 'Something went wrong. Please try again, or message us on WhatsApp.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send request →';
      }
    } catch (_) {
      status.textContent = 'Network error. Please try again, or message us on WhatsApp.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send request →';
    }
  });
}

renderPage();
initModal();
