(() => {
  const GSAP_SRC =
    'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js';
  const SCROLL_TRIGGER_SRC =
    'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js';

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === 'true') {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve(), { once: true });
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

  window.equilLibsReady = loadScript(GSAP_SRC)
    .then(() => loadScript(SCROLL_TRIGGER_SRC))
    .then(() => {
      gsap.registerPlugin(ScrollTrigger);
    });

  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScrollY = window.scrollY;
  const threshold = 6;

  const updateHeader = () => {
    if (header.classList.contains('is-menu-open')) {
      header.classList.remove('is-hidden');
      return;
    }

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

  const menuBtn = header.querySelector('.site-header__menu-btn');
  const dim = header.querySelector('.site-header__dim');
  const drawerToggles = header.querySelectorAll('.site-header__drawer-toggle');

  if (dim && dim.parentElement !== document.body) {
    document.body.appendChild(dim);
  }

  const closeMenu = () => {
    header.classList.remove('is-menu-open');
    document.body.classList.remove('is-menu-open');
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', '메뉴 열기');
    }
    header.querySelectorAll('.site-header__drawer-item.is-open').forEach((item) => {
      item.classList.remove('is-open');
    });
  };

  const openMenu = () => {
    header.classList.add('is-menu-open');
    header.classList.remove('is-hidden');
    document.body.classList.add('is-menu-open');
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.setAttribute('aria-label', '메뉴 닫기');
    }
  };

  const toggleMenu = () => {
    if (header.classList.contains('is-menu-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  if (menuBtn) {
    menuBtn.addEventListener('click', toggleMenu);
  }

  if (dim) {
    dim.addEventListener('click', closeMenu);
  }

  drawerToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const item = toggle.closest('.site-header__drawer-item');
      if (!item) return;

      const willOpen = !item.classList.contains('is-open');
      header.querySelectorAll('.site-header__drawer-item.is-open').forEach((openItem) => {
        if (openItem !== item) openItem.classList.remove('is-open');
      });
      item.classList.toggle('is-open', willOpen);
    });
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
})();
