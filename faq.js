// ============ RizeUp Global — FAQ page accordion ============
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
