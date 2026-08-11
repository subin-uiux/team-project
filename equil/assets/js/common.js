(() => {
  const GSAP_SRC =
    'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js';
  const SCROLL_TRIGGER_SRC =
    'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js';

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === 'true' || existing.getAttribute('data-loaded') === 'true') {
          resolve();
          return;
        }
        // Already in document (e.g. sync tag) — wait if still loading
        if (src.includes('gsap.min.js') && typeof window.gsap !== 'undefined') {
          existing.dataset.loaded = 'true';
          resolve();
          return;
        }
        if (src.includes('ScrollTrigger.min.js') && typeof window.ScrollTrigger !== 'undefined') {
          existing.dataset.loaded = 'true';
          resolve();
          return;
        }
        existing.addEventListener('load', () => {
          existing.dataset.loaded = 'true';
          resolve();
        }, { once: true });
        existing.addEventListener(
          'error',
          () => reject(new Error(`Failed to load ${src}`)),
          { once: true }
        );
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.addEventListener(
        'load',
        () => {
          script.dataset.loaded = 'true';
          resolve();
        },
        { once: true }
      );
      script.addEventListener(
        'error',
        () => reject(new Error(`Failed to load ${src}`)),
        { once: true }
      );
      document.head.appendChild(script);
    });

  window.equilLibsReady = (async () => {
    if (typeof window.gsap === 'undefined') {
      await loadScript(GSAP_SRC);
    }
    if (typeof window.ScrollTrigger === 'undefined') {
      await loadScript(SCROLL_TRIGGER_SRC);
    }
    window.gsap.registerPlugin(window.ScrollTrigger);
  })();

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
