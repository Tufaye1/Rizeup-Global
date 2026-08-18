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
// Progressive enhancement: the hidden state is gated behind .js-reveal on
// <html>, so if this script never runs the content is simply visible. There's
// also a bail-out if IntersectionObserver never reports, which would otherwise
// leave the hero stuck at opacity 0.
(function () {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  const root = document.documentElement;
  const revealAll = function () {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    root.classList.add('js-reveal');
    revealAll();
    return;
  }

  root.classList.add('js-reveal');

  // A healthy observer reports on every target it is given, including ones
  // that are off screen (isIntersecting false). So "did it report at all" is
  // the honest health check. Counting only reveals would wrongly call the
  // observer broken on pages whose sections all start below the fold.
  let reported = false;
  const observer = new IntersectionObserver(function (entries) {
    reported = true;
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function (el) { observer.observe(el); });

  // Never leave content stranded at opacity 0. If the observer never reported,
  // give up on the animation and show everything.
  window.setTimeout(function () {
    if (reported) return;
    observer.disconnect();
    revealAll();
  }, 1200);
})();
