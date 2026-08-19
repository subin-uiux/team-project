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

  const POST_HERO_FADE_UP_DURATION = 2;
  const POST_HERO_HEADING_SELECTORS = [
    '.pillow-tech-sleep-position__heading',
    '.heating-mat-tech-problem__heading',
  ];

  const initHeading3tierFadeUp = () => {
    document.querySelectorAll('.heading-3tier').forEach((heading) => {
      /* 질문 헤딩은 좁은 폭에서 단어 단위 줄바꿈을 유지해야 해서 글자 분리를 하지 않음 */
      if (heading.classList.contains('sleep-fit-test__question-heading')) return;
      if (heading.classList.contains('sleep-fit-result__heading')) return;
      if (heading.classList.contains('sleep-fit-structure__heading')) return;
      /* 메인 핀 스크롤 이후에 main.js에서 따로 실행 */
      if (heading.classList.contains('main-bedding-overview__heading')) return;

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

      const fadeUpDuration = POST_HERO_HEADING_SELECTORS.some((selector) =>
        heading.matches(selector)
      )
        ? POST_HERO_FADE_UP_DURATION
        : FADE_UP_DURATION;
      const charStagger =
        fadeUpDuration / Math.max(allChars.length * 2.5, 1);

      gsap.set(allChars, { opacity: 0, y: 40 });

      gsap.to(allChars, {
        opacity: 1,
        y: 0,
        duration: fadeUpDuration,
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

      const section = title.closest('section');
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
          trigger: section || title,
          start: 'top 90%',
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

  const parsePx = (value) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  window.initTechHero = (blockClass) => {
    const hero = document.querySelector(`.${blockClass}`);
    if (!hero) return;

    const frame = hero.querySelector(`.${blockClass}__frame`);
    const image = hero.querySelector(`.${blockClass}__image`);
    const overlay = hero.querySelector(`.${blockClass}__overlay`);
    const content = hero.querySelector(`.${blockClass}__content`);
    if (!frame || !image || !overlay || !content) return;

    const getEndHeight = () =>
      parsePx(getComputedStyle(hero).getPropertyValue('--hero-end-height')) ||
      437;
    const getStartHeight = () => window.innerHeight;
    const getShrinkDistance = () =>
      Math.max(getStartHeight() - getEndHeight(), 1);
    const getScaleDistance = () => Math.round(window.innerHeight * 0.2);

    gsap.set(overlay, { opacity: 0 });
    gsap.set(content, { opacity: 0 });
    gsap.set(image, { scale: 1 });
    gsap.set([hero, frame], { height: getStartHeight() });

    let introPlayed = false;
    let imageScaled = false;
    let hasCompleted = false;
    let tl = null;

    const playIntro = () => {
      if (introPlayed) return;
      introPlayed = true;

      gsap.to(overlay, {
        opacity: 0.3,
        duration: 0.5,
        ease: 'power1.out',
      });

      gsap.to(content, {
        opacity: 1,
        duration: 1,
        ease: 'power1.out',
      });
    };

    const playImageScale = () => {
      if (imageScaled) return;
      imageScaled = true;

      gsap.to(image, {
        scale: 1.05,
        ease: 'none',
        duration: getScaleDistance() / getShrinkDistance(),
      });
    };

    const lockCompleted = () => {
      if (hasCompleted) return;
      hasCompleted = true;

      playIntro();
      playImageScale();

      if (tl) {
        tl.scrollTrigger?.kill();
        tl.kill();
        tl = null;
      }

      gsap.set([hero, frame], { height: getEndHeight() });

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    };

    tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: () => `+=${getShrinkDistance()}`,
        pin: true,
        pinSpacing: false,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (self.progress >= 0.5) {
            playIntro();
            playImageScale();
          }

          if (self.progress >= 1) {
            lockCompleted();
          }
        },
        onLeave: lockCompleted,
      },
    });

    tl.fromTo(
      [hero, frame],
      { height: () => getStartHeight() },
      {
        height: () => getEndHeight(),
        ease: 'none',
        duration: 1,
      }
    );
  };

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
  const megaMq = window.matchMedia('(min-width: 48rem)');

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
