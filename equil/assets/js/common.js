(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScrollY = window.scrollY;
  const threshold = 6;

  const updateHeader = () => {
    const currentY = window.scrollY;

    if (currentY <= 0) {
      header.classList.remove('is-hidden');
      lastScrollY = currentY;
      return;
    }

    const delta = currentY - lastScrollY;
    if (Math.abs(delta) < threshold) return;

    if (delta > 0) {
      header.classList.add('is-hidden');
    } else {
      header.classList.remove('is-hidden');
    }

    lastScrollY = currentY;
  };

  window.addEventListener('scroll', updateHeader, { passive: true });
})();
