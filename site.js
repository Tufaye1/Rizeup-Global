// ============ RizeUp Global, shared site behaviour ============
// Loaded on every page (including generated blog pages). Keep this file
// dependency-free and safe to run on pages that lack the elements it targets.

// ---------- Mobile navigation ----------
(function () {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const toggle = nav.querySelector('.navbar__toggle');
  const panel = nav.querySelector('.navbar__links');
  if (!toggle || !panel) return;

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(!nav.classList.contains('is-open'));
  });

  // Tapping a link closes the panel. Matters for same-page anchors,
  // which don't trigger a reload.
  panel.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target)) setOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Resizing up to desktop leaves the panel stranded open otherwise.
  window.addEventListener('resize', function () {
    if (window.innerWidth > 820) setOpen(false);
  });
})();

// ---------- Scroll-reveal (see .reveal in styles.css) ----------
// Deliberately NOT using IntersectionObserver thresholds. A threshold of 0.15
// is unsatisfiable for any element taller than ~6.7x the viewport: a 6410px
// blog grid on an 844px phone caps out at ratio 0.132, so isIntersecting never
// fired and the content stayed at opacity 0 forever. A plain rect check has no
// such trap and is trivially cheap when throttled to one rAF per scroll.
//
// The hidden state is also gated behind .js-reveal on <html>, so if this script
// never loads the content is simply visible.
(function () {
  const targets = [].slice.call(document.querySelectorAll('.reveal'));
  if (!targets.length) return;

  const root = document.documentElement;
  const revealAll = function () {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('js-reveal');
    revealAll();
    return;
  }

  root.classList.add('js-reveal');

  let pending = targets.slice();
  let queued = false;

  const check = function () {
    queued = false;
    const limit = window.innerHeight - 40;
    pending = pending.filter(function (el) {
      const r = el.getBoundingClientRect();
      // Any part of it has entered the viewport (minus a small bottom margin).
      if (r.top < limit && r.bottom > 0) {
        el.classList.add('is-visible');
        return false;
      }
      return true;
    });
    if (!pending.length) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  };

  const onScroll = function () {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(check);
  };

  window.addEventListener('scroll', onScroll, {passive: true});
  window.addEventListener('resize', onScroll);
  check();

  // Last-resort guarantee: content is never left invisible, whatever happens.
  window.setTimeout(function () {
    if (pending.length) revealAll();
  }, 3000);
})();
