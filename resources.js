// ============ RizeUp Global — Resources page ============

const resForm = document.getElementById('res-form');
const resStatus = document.getElementById('res-status');
const resResource = document.getElementById('res-resource');
const resSubmit = document.getElementById('res-submit');
const resEmail = resForm ? resForm.querySelector('input[type="email"]') : null;

// "Get the PDF" on a card → preselect that resource, scroll to the form, focus email.
document.querySelectorAll('.res-card__btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (resResource) resResource.value = btn.dataset.resource || 'Full resource pack';
    document.querySelector('.res-hero').scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (resEmail) setTimeout(() => resEmail.focus(), 400);
    if (resStatus) {
      resStatus.className = 'res-hero__status';
      resStatus.textContent = `Great pick — add your email and we'll send “${btn.dataset.resource}”.`;
    }
  });
});

// Submit to Formspree.
if (resForm) {
  resForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    resStatus.className = 'res-hero__status';
    resStatus.textContent = '';
    resSubmit.disabled = true;
    resSubmit.textContent = 'Sending…';
    try {
      const res = await fetch(resForm.action, {
        method: 'POST',
        body: new FormData(resForm),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        resForm.reset();
        resStatus.className = 'res-hero__status ok';
        resStatus.textContent = "Done! Check your inbox — your resources are on the way.";
        resSubmit.textContent = 'Sent ✓';
      } else {
        const d = await res.json().catch(() => ({}));
        resStatus.textContent = d.errors
          ? d.errors.map((x) => x.message).join(', ')
          : 'Something went wrong. Please try again, or message us on WhatsApp.';
        resSubmit.disabled = false;
        resSubmit.textContent = 'Email me the pack →';
      }
    } catch (_) {
      resStatus.textContent = 'Network error. Please try again, or message us on WhatsApp.';
      resSubmit.disabled = false;
      resSubmit.textContent = 'Email me the pack →';
    }
  });
}
