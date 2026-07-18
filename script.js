// ============ RizeUp Global — interactions ============

// ---------- Testimonials carousel ----------
const TESTIMONIALS = [
  { q: 'RizeUp handled my whole application timeline. I just showed up to interviews. They prepared every document.', n: 'Ayesha R.', r: 'University of Malaya · Computer Science' },
  { q: "I got a 40% tuition scholarship I didn't know existed. That alone paid for the whole counselling fee twice over.", n: 'Mahdi H.', r: 'Monash University · Business' },
  { q: 'The visa interview was the most stressful part, but their mock sessions made the real one feel routine.', n: 'Nazia K.', r: 'Arizona State · Engineering' },
  { q: 'Testimonial 4 goes here. Paste the real student quote and it will appear in the carousel.', n: 'Student 4', r: 'University · Program' },
  { q: 'Testimonial 5 goes here. Paste the real student quote and it will appear in the carousel.', n: 'Student 5', r: 'University · Program' },
  { q: 'Testimonial 6 goes here. Paste the real student quote and it will appear in the carousel.', n: 'Student 6', r: 'University · Program' },
  { q: 'Testimonial 7 goes here. Paste the real student quote and it will appear in the carousel.', n: 'Student 7', r: 'University · Program' },
  { q: 'Testimonial 8 goes here. Paste the real student quote and it will appear in the carousel.', n: 'Student 8', r: 'University · Program' },
  { q: 'Testimonial 9 goes here. Paste the real student quote and it will appear in the carousel.', n: 'Student 9', r: 'University · Program' },
  { q: 'Testimonial 10 goes here. Paste the real student quote and it will appear in the carousel.', n: 'Student 10', r: 'University · Program' },
];
const AVATAR_COLORS = ['#5B4FE9', '#E8544D', '#C79418', '#1B9B57', '#6C4AC9'];

const avatarsEl = document.getElementById('t-avatars');
const quoteEl = document.getElementById('t-quote');
const nameEl = document.getElementById('t-name');
const roleEl = document.getElementById('t-role');
let tIndex = 0;

TESTIMONIALS.forEach((t, i) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 't-avatar ' + (i % 2 ? 't-avatar--drop' : 't-avatar--lift');
  btn.setAttribute('aria-label', 'Show testimonial from ' + t.n);
  const face = document.createElement('span');
  face.className = 't-avatar__face';
  face.style.background = AVATAR_COLORS[i % AVATAR_COLORS.length];
  face.textContent = t.n.charAt(0);
  btn.appendChild(face);
  btn.addEventListener('click', () => setTestimonial(i));
  avatarsEl.appendChild(btn);
});

function setTestimonial(i) {
  tIndex = (i + TESTIMONIALS.length) % TESTIMONIALS.length;
  const t = TESTIMONIALS[tIndex];
  quoteEl.textContent = '"' + t.q + '"';
  nameEl.textContent = t.n;
  roleEl.textContent = t.r;
  avatarsEl.querySelectorAll('.t-avatar').forEach((el, j) => {
    el.classList.toggle('active', j === tIndex);
  });
}

document.querySelector('.testimonials__nav .prev').addEventListener('click', () => setTestimonial(tIndex - 1));
document.querySelector('.testimonials__nav .next').addEventListener('click', () => setTestimonial(tIndex + 1));
setTestimonial(0);
setInterval(() => setTestimonial(tIndex + 1), 7000);

// ---------- FAQ accordion ----------
document.querySelectorAll('.faq-item__q').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach((el) => {
      el.classList.remove('open');
      el.querySelector('.faq-item__sym').textContent = '+';
      el.querySelector('.faq-item__q').setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) {
      item.classList.add('open');
      item.querySelector('.faq-item__sym').textContent = '−';
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ---------- Formspree submission ----------
async function submitToFormspree(form, statusEl) {
  const res = await fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: { Accept: 'application/json' },
  });
  if (res.ok) return true;
  const data = await res.json().catch(() => ({}));
  statusEl.textContent = data.errors
    ? data.errors.map((err) => err.message).join(', ')
    : 'Something went wrong. Please try again, or message us on WhatsApp.';
  return false;
}

// ---------- Lead magnet ----------
const leadForm = document.getElementById('lead-form');
const leadSend = document.getElementById('lead-send');
const leadStatus = document.getElementById('lead-status');
leadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  leadStatus.textContent = '';
  leadSend.disabled = true;
  leadSend.textContent = 'Sending…';
  const ok = await submitToFormspree(leadForm, leadStatus).catch(() => false);
  leadSend.disabled = false;
  if (ok) {
    leadSend.textContent = 'Sent ✓';
    leadStatus.textContent = 'Check your inbox soon — your handbook is on its way.';
  } else {
    leadSend.textContent = 'Send Me the PDF →';
    leadStatus.textContent = leadStatus.textContent || 'Could not send. Please try again.';
  }
});
document.getElementById('lead-pdf').addEventListener('change', () => {
  leadSend.textContent = 'Send Me the PDF →';
  leadStatus.textContent = '';
});

// ---------- Contact form ----------
const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');
contactForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  contactStatus.textContent = '';
  contactStatus.classList.remove('form-status--ok');
  btn.disabled = true;
  btn.textContent = 'Sending…';
  const ok = await submitToFormspree(this, contactStatus).catch(() => false);
  btn.disabled = false;
  if (ok) {
    btn.textContent = 'Request Sent ✓';
    contactStatus.classList.add('form-status--ok');
    contactStatus.textContent = "Thanks! A counselor will reach out on WhatsApp within one working day.";
    this.reset();
  } else {
    btn.textContent = 'Book My Free Consult →';
    contactStatus.textContent = contactStatus.textContent || 'Could not send. Please try again.';
  }
});
