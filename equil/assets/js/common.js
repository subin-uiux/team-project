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

  const FADE_UP_DURATION = 1.26;

  const splitHeadingChars = (element, charClass) => {
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const chars = Array.from(node.textContent);
        const fragment = document.createDocumentFragment();

        chars.forEach((char) => {
          if (/^\s$/.test(char)) {
            fragment.appendChild(document.createTextNode(char));
            return;
          }

          const span = document.createElement('span');
          span.className = charClass;
          span.textContent = char;
          fragment.appendChild(span);
        });

        node.parentNode.replaceChild(fragment, node);
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'BR') return;
        Array.from(node.childNodes).forEach(walk);
      }
    };

    Array.from(element.childNodes).forEach(walk);
    return Array.from(element.querySelectorAll(`.${charClass}`));
  };

  const initHeading3tierFadeUp = () => {
    document.querySelectorAll('.heading-3tier').forEach((heading) => {
      /* 질문 헤딩은 좁은 폭에서 단어 단위 줄바꿈을 유지해야 해서 글자 분리를 하지 않음 */
      if (heading.classList.contains('sleep-fit-test__question-heading')) return;
      if (heading.classList.contains('sleep-fit-result__heading')) return;
      if (heading.classList.contains('sleep-fit-structure__heading')) return;

      const targets = [
        heading.querySelector('.heading-3tier__sub-title'),
        heading.querySelector('.heading-3tier__title'),
        heading.querySelector('.heading-3tier__desc'),
      ].filter(Boolean);
      if (!targets.length) return;

      const charClass = 'heading-3tier__char';
      const allChars = targets.flatMap((element) =>
        splitHeadingChars(element, charClass)
      );
      if (!allChars.length) return;

      const charStagger =
        FADE_UP_DURATION / Math.max(allChars.length * 2.5, 1);

      gsap.set(allChars, { opacity: 0, y: 40 });

      gsap.to(allChars, {
        opacity: 1,
        y: 0,
        duration: FADE_UP_DURATION,
        ease: 'power3.out',
        stagger: allChars.length > 1 ? charStagger : 0,
        scrollTrigger: {
          trigger: heading,
          start: 'top 90%',
          once: true,
        },
        onComplete: () => {
          gsap.set(allChars, { clearProps: 'will-change' });
        },
      });
    });
  };

  const initScrollFeatureTitleFadeUp = () => {
    document.querySelectorAll('.scroll-feature__title--ko').forEach((title) => {
      const charClass = 'scroll-feature__char';
      const chars = splitHeadingChars(title, charClass);
      if (!chars.length) return;

      const charStagger =
        FADE_UP_DURATION / Math.max(chars.length * 2.5, 1);

      gsap.set(chars, { opacity: 0, y: 40 });

      gsap.to(chars, {
        opacity: 1,
        y: 0,
        duration: FADE_UP_DURATION,
        ease: 'power3.out',
        stagger: chars.length > 1 ? charStagger : 0,
        scrollTrigger: {
          trigger: title,
          start: 'top 50%',
          once: true,
        },
        onComplete: () => {
          gsap.set(chars, { clearProps: 'will-change' });
        },
      });
    });
  };

  window.equilLibsReady
    .then(() => {
      initHeading3tierFadeUp();
      initScrollFeatureTitleFadeUp();
    })
    .catch(() => {});

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
    document.body.classList.remove('is-mega-open');
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

  const mega = header.querySelector('.site-header__mega');
  const nav = header.querySelector('.site-header__nav');
  const megaMq = window.matchMedia('(min-width: 64rem)');

  const setMegaOpen = (isOpen) => {
    document.body.classList.toggle('is-mega-open', isOpen);
  };

  const openMega = () => {
    if (!megaMq.matches || header.classList.contains('is-menu-open')) return;
    setMegaOpen(true);
  };

  const closeMega = () => {
    setMegaOpen(false);
  };

  if (nav) {
    nav.addEventListener('mouseenter', openMega);
    nav.addEventListener('focusin', openMega);
  }

  if (mega) {
    mega.addEventListener('mouseenter', openMega);
  }

  header.addEventListener('mouseleave', (event) => {
    if (!megaMq.matches) return;
    if (!header.contains(event.relatedTarget)) {
      closeMega();
    }
  });

  megaMq.addEventListener('change', () => {
    closeMega();
  });

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
