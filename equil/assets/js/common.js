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
  const HEADING_3TIER_SCROLL_START = 'top 90%';
  const HEADING_3TIER_SCROLL_START_COMPACT = 'top 70%';

  const getHeading3tierScrollTrigger = (heading) =>
    heading.closest('section') || heading;

  const getHeading3tierScrollStart = () =>
    window.matchMedia('(max-width: 63.9375rem)').matches
      ? HEADING_3TIER_SCROLL_START_COMPACT
      : HEADING_3TIER_SCROLL_START;

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

  /* 단어 단위로 묶어 줄바꿈·띄어쓰기 유지 (section-cta 등) */
  const splitCharsPreserveWords = (element, charClass, wordClass) => {
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parts = node.textContent.split(/(\s+)/);
        const fragment = document.createDocumentFragment();

        parts.forEach((part) => {
          if (!part) return;

          if (/^\s+$/.test(part)) {
            fragment.appendChild(document.createTextNode(part));
            return;
          }

          const word = document.createElement('span');
          word.className = wordClass;

          Array.from(part).forEach((char) => {
            const span = document.createElement('span');
            span.className = charClass;
            span.textContent = char;
            word.appendChild(span);
          });

          fragment.appendChild(word);
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
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('.heading-3tier').forEach((heading) => {
      if (heading.dataset.equilFadeUpInit === 'true') return;

      /* 질문 헤딩은 좁은 폭에서 단어 단위 줄바꿈을 유지해야 해서 글자 분리를 하지 않음 */
      if (heading.classList.contains('sleep-fit-test__question-heading')) return;
      if (heading.classList.contains('sleep-fit-result__heading')) return;
      if (heading.classList.contains('sleep-fit-structure__heading')) return;
      /* 패널·연동 애니메이션은 각 page JS에서 따로 실행 */
      if (heading.classList.contains('main-mattress-solution__heading')) return;
      if (heading.classList.contains('bedding-tech-seasonal__heading')) return;

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

      heading.dataset.equilFadeUpInit = 'true';

      const fadeUpDuration = POST_HERO_HEADING_SELECTORS.some((selector) =>
        heading.matches(selector)
      )
        ? POST_HERO_FADE_UP_DURATION
        : FADE_UP_DURATION;
      const charStagger =
        fadeUpDuration / Math.max(allChars.length * 2.5, 1);

      if (reduceMotion) {
        gsap.set(allChars, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(allChars, { opacity: 0, y: 40 });

      gsap.to(allChars, {
        opacity: 1,
        y: 0,
        duration: fadeUpDuration,
        ease: 'power3.out',
        stagger: allChars.length > 1 ? charStagger : 0,
        scrollTrigger: {
          trigger: getHeading3tierScrollTrigger(heading),
          start: getHeading3tierScrollStart(),
          once: true,
          invalidateOnRefresh: true,
        },
        onComplete: () => {
          gsap.set(allChars, { clearProps: 'will-change' });
        },
      });
    });
  };

  window.initEquilHeading3tierFadeUp = initHeading3tierFadeUp;

  const runEquilHeading3tierFadeUp = () => {
    initHeading3tierFadeUp();
    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
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
          start: 'top 70%',
          once: true,
        },
        onComplete: () => {
          title.dataset.revealed = 'true';
          gsap.set(chars, { clearProps: 'will-change' });
        },
      });
    });
  };

  const initSectionCtaFadeUp = () => {
    document.querySelectorAll('.section-cta').forEach((block) => {
      const title = block.querySelector('.section-cta__title');
      const desc = block.querySelector('.section-cta__desc');
      const button = block.querySelector('.section-cta__button');
      if (!title) return;

      const charClass = 'section-cta__char';
      const wordClass = 'section-cta__word';
      const titleChars = splitCharsPreserveWords(title, charClass, wordClass);
      const descChars = desc
        ? splitCharsPreserveWords(desc, charClass, wordClass)
        : [];

      gsap.set(titleChars, { opacity: 0, y: 40 });
      if (descChars.length) gsap.set(descChars, { opacity: 0, y: 40 });
      if (button) gsap.set(button, { opacity: 0, y: 20 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: block,
          start: window.matchMedia('(max-width: 63.9375rem)').matches
            ? 'top 70%'
            : 'top 90%',
          once: true,
        },
      });

      const getFadeUpTotal = (chars) => {
        const stagger = FADE_UP_DURATION / Math.max(chars.length * 2.5, 1);
        if (chars.length <= 1) return FADE_UP_DURATION;
        return FADE_UP_DURATION + stagger * (chars.length - 1);
      };

      if (titleChars.length) {
        const titleStagger =
          FADE_UP_DURATION / Math.max(titleChars.length * 2.5, 1);
        tl.to(
          titleChars,
          {
            opacity: 1,
            y: 0,
            duration: FADE_UP_DURATION,
            ease: 'power3.out',
            stagger: titleChars.length > 1 ? titleStagger : 0,
            onComplete: () => {
              gsap.set(titleChars, { clearProps: 'will-change' });
            },
          },
          0
        );
      }

      if (descChars.length) {
        const descStagger =
          FADE_UP_DURATION / Math.max(descChars.length * 2.5, 1);
        const descStart = titleChars.length
          ? getFadeUpTotal(titleChars) * 0.3
          : 0;
        tl.to(
          descChars,
          {
            opacity: 1,
            y: 0,
            duration: FADE_UP_DURATION,
            ease: 'power3.out',
            stagger: descChars.length > 1 ? descStagger : 0,
            onComplete: () => {
              gsap.set(descChars, { clearProps: 'will-change' });
            },
          },
          descStart
        );

        if (button) {
          tl.to(
            button,
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: 'power2.out',
            },
            descStart + getFadeUpTotal(descChars) * 0.5
          );
        }
      } else if (button) {
        const buttonStart = titleChars.length
          ? getFadeUpTotal(titleChars) * 0.5
          : 0;
        tl.to(
          button,
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
          },
          buttonStart
        );
      }
    });
  };

  window.equilLibsReady
    .then(() => {
      initScrollFeatureTitleFadeUp();
      initSectionCtaFadeUp();

      /* page JS(pin·ScrollTrigger) 이후 실행 — common.js가 main.js보다 먼저 로드됨 */
      setTimeout(runEquilHeading3tierFadeUp, 0);
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
    const desc = hero.querySelector(`.${blockClass}__desc`);
    if (!frame || !image || !overlay || !content) return;

    const getEndHeight = () =>
      parsePx(getComputedStyle(hero).getPropertyValue('--hero-end-height')) ||
      437;
    const getStartHeight = () => window.innerHeight;
    const getShrinkDistance = () =>
      Math.max(getStartHeight() - getEndHeight(), 1);
    const getScaleDistance = () => Math.round(window.innerHeight * 0.2);
    const mobileQuery = window.matchMedia('(max-width: 47.9375rem)');
    const shouldFadeDescOnScroll = () => mobileQuery.matches;

    gsap.set(overlay, { opacity: 0 });
    gsap.set(content, { opacity: 0 });
    gsap.set(image, { scale: 1 });
    gsap.set([hero, frame], { height: getStartHeight() });
    if (desc) gsap.set(desc, { opacity: 1 });

    let introPlayed = false;
    let imageScaled = false;

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

    const tl = gsap.timeline({
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
        },
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

    if (desc && shouldFadeDescOnScroll()) {
      tl.fromTo(
        desc,
        { opacity: 1 },
        {
          opacity: 0,
          ease: 'power1.out',
          duration: 0.35,
        },
        0.55
      );
    }
  };

  const header = document.querySelector('.site-header');
  if (!header) return;

  /* 로고 클릭 시 메인 KV(맨 위)부터 보이도록 */
  const INDEX_SCROLL_KEY = 'equil:index-scroll-y';
  const INDEX_FORCE_TOP_KEY = 'equil:index-force-top';

  const isLogoTargetCurrentPage = (logo) => {
    try {
      const target = new URL(logo.getAttribute('href') || '', window.location.href);
      const current = new URL(window.location.href);
      const normalize = (pathname) =>
        pathname
          .replace(/\\/g, '/')
          .replace(/\/index\.html?$/i, '/')
          .replace(/\/+$/, '/') || '/';
      return normalize(target.pathname) === normalize(current.pathname);
    } catch {
      return false;
    }
  };

  const goToMainKvTop = () => {
    sessionStorage.setItem(INDEX_FORCE_TOP_KEY, '1');
    sessionStorage.removeItem(INDEX_SCROLL_KEY);
    header.classList.remove('is-hidden');

    if (typeof window.resetEquilMainToHero === 'function') {
      window.resetEquilMainToHero();
    } else {
      window.scrollTo(0, 0);
      window.ScrollTrigger?.refresh();
    }
  };

  header.querySelectorAll('.site-header__logo').forEach((logo) => {
    logo.addEventListener('click', (event) => {
      sessionStorage.setItem(INDEX_FORCE_TOP_KEY, '1');
      sessionStorage.removeItem(INDEX_SCROLL_KEY);

      if (!isLogoTargetCurrentPage(logo)) return;

      event.preventDefault();
      goToMainKvTop();
      sessionStorage.removeItem(INDEX_FORCE_TOP_KEY);
    });
  });

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
