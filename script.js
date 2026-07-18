// ============ RizeUp Global — interactions ============

// ---------- Testimonials carousel ----------
// Real RizeUp Global students. To add/replace: edit this list
// (q = quote, n = name, r = program · university, photo = image path).
const TESTIMONIALS = [
  { q: 'RizeUp Global handled my hospitality management application and documentation carefully, keeping me informed at every stage and making the whole process much less stressful.', n: 'Pranto Md Jahidul Hasan', r: 'Bachelor of Hospitality Management', photo: 'images/students/student-01-pranto.png' },
  { q: "I'm grateful to RizeUp Global for guiding my admission to Lincoln University. Their support with paperwork and communication made my hospitality management journey much smoother.", n: 'Rifat Shahruk', r: 'Hospitality Management · Lincoln University', photo: 'images/students/student-02-rifat.png' },
  { q: 'RizeUp Global helped me navigate my application and documentation for Geomatika University smoothly. Their guidance and consistent communication gave me real confidence throughout the process.', n: 'Samiul Mahmud', r: 'Foundation / Diploma · Geomatika University', photo: 'images/students/student-03-samiul.png' },
  { q: 'I chose RizeUp Global to guide my hotel management application at Lincoln University. Their clear communication and document support made my transition abroad smooth.', n: 'Sadman Sadid Ovi', r: 'Hotel Management · Lincoln University', photo: 'images/students/student-04-sadman.png' },
  { q: 'RizeUp Global made my BBA application to Alfa University straightforward, guiding me through documentation and keeping communication clear so I always knew what came next.', n: 'Minhajur Rahman', r: 'BBA · Alfa University', photo: 'images/students/student-05-minhajur.png' },
  { q: "I'm thankful to RizeUp Global for supporting my BBA admission to Lincoln University with clear guidance on documentation and steady communication throughout my application journey.", n: 'Mahbub Alam Abir', r: 'BBA · Lincoln University', photo: 'images/students/student-06-mahbub.png' },
  { q: 'RizeUp Global guided me from my Airlines Management studies through to my Master’s admission at Lincoln University, handling documentation and communication smoothly at every stage.', n: 'Ramjan Pathan', r: 'Airlines Management → Master’s · Lincoln University', photo: 'images/students/student-07-ramjan.png' },
  { q: "With RizeUp Global's help, my BBA application and later my Master’s admission to Lincoln University went smoothly, thanks to their clear communication and documentation support.", n: 'Shohagh Hossain', r: 'BBA → Master’s · Lincoln University', photo: 'images/students/student-08-shohagh.png' },
  { q: 'RizeUp Global supported my hospitality management admission to Lincoln University College, helping with documentation and communication so I could settle into my studies with confidence.', n: 'Islam Nahidul', r: 'Hospitality Management · Lincoln University College', photo: 'images/students/student-09-nahidul.png' },
  { q: 'RizeUp Global guided my accounting and finance application to University of Wollongong Malaysia, managing documentation and communication carefully so my transition abroad felt genuinely manageable.', n: 'Md Abid Hossain', r: 'Accounting & Finance · University of Wollongong Malaysia', photo: 'images/students/student-10-abid.png' },
];

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
  const img = document.createElement('img');
  img.src = t.photo;
  img.alt = t.n;
  img.loading = 'lazy';
  face.appendChild(img);
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

// ---------- Contact form ----------
const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');
if (contactForm) contactForm.addEventListener('submit', async function (e) {
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
