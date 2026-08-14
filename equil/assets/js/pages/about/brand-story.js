(() => {
  const initBrandStoryName = () => {
    const section = document.querySelector('.brand-story-name');
    const pin = section?.querySelector('.brand-story-name__pin');
    const title = section?.querySelector('.brand-story-name__layer--base .brand-story-name__title');
    const titleEquil = section?.querySelector(
      '.brand-story-name__layer--base .brand-story-name__title-equil'
    );
    const sideLetters = section?.querySelectorAll(
      '.brand-story-name__layer--base .brand-story-name__title-lead, .brand-story-name__layer--base .brand-story-name__title-tail'
    );
    const caption = section?.querySelector('.brand-story-name__caption');
    const invertLayer = section?.querySelector('.brand-story-name__invert-layer');
    const invertTitle = section?.querySelector('.brand-story-name__title--invert');
    const circle = section?.querySelector('.brand-story-name__circle');
    const content = section?.querySelector('.brand-story-name__circle-content');
    const row = section?.querySelector('.brand-story-name__row');
    const eq = section?.querySelector('.brand-story-name__eq');
    const uil = section?.querySelector('.brand-story-name__uil');
    const message = section?.querySelector('.brand-story-name__message');
    const messageInner = section?.querySelector('.brand-story-name__message-inner');
    const messageA = section?.querySelector('.brand-story-name__message-part--a');
    const messageB = section?.querySelector('.brand-story-name__message-part--b');

    if (
      !section ||
      !pin ||
      !title ||
      !titleEquil ||
      !sideLetters?.length ||
      !caption ||
      !invertLayer ||
      !invertTitle ||
      !circle ||
      !content ||
      !row ||
      !eq ||
      !uil ||
      !message ||
      !messageInner ||
      !messageA ||
      !messageB
    ) {
      return;
    }
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const SIDE_GAP = 24;
    let titleSlideX = 0;
    const titles = [title, invertTitle];
    const fadeWithSlide = gsap.utils.toArray(sideLetters).concat(caption);

    const getCoverRadius = () => {
      const w = pin.offsetWidth;
      const h = pin.offsetHeight;
      return Math.ceil(Math.hypot(w, h) / 2) + 24;
    };

    const measureTitleSlideX = () => {
      gsap.set(titles, { x: 0 });
      const pinRect = pin.getBoundingClientRect();
      const equilRect = titleEquil.getBoundingClientRect();
      const pinCenterX = pinRect.left + pinRect.width / 2;
      const equilCenterX = equilRect.left + equilRect.width / 2;
      titleSlideX = pinCenterX - equilCenterX;
      return titleSlideX;
    };

    const measureLogoAlignX = () => {
      gsap.set(titles, { x: titleSlideX });
      gsap.set(row, { x: 0 });
      gsap.set(message, { width: 0, marginLeft: 0, marginRight: 0 });

      const equilRect = titleEquil.getBoundingClientRect();
      const eqRect = eq.getBoundingClientRect();
      const uilRect = uil.getBoundingClientRect();
      const logoCenterX = (eqRect.left + uilRect.right) / 2;
      const equilCenterX = equilRect.left + equilRect.width / 2;
      return equilCenterX - logoCenterX;
    };

    const getAvailableMessageWidth = () =>
      Math.max(0, content.clientWidth - eq.offsetWidth - uil.offsetWidth - SIDE_GAP * 2);

    const getPartWidth = (partEl) => {
      const available = getAvailableMessageWidth();
      return Math.min(partEl.scrollWidth, available);
    };

    const getFullMessageWidth = () => {
      const available = getAvailableMessageWidth();
      return Math.min(messageInner.scrollWidth, available);
    };

    const prepare = () => {
      measureTitleSlideX();
      gsap.set(titles, { x: 0 });
      gsap.set(fadeWithSlide, { opacity: 1 });
      gsap.set(row, { x: 0 });
      gsap.set(invertLayer, { opacity: 1 });
      gsap.set(circle, { clipPath: 'circle(0px at 50% 50%)' });
      gsap.set([eq, uil], { opacity: 0 });
      gsap.set(message, { width: 0, marginLeft: 0, marginRight: 0 });
      gsap.set([messageA, messageB], { opacity: 0 });
    };

    prepare();

    // 전체적으로 더 부드러운 scrub / 구간
    const SLIDE_DUR = 0.16;
    const CIRCLE_START = SLIDE_DUR * 0.55;
    const CIRCLE_DUR = 0.5;
    const HANDOFF = CIRCLE_START + CIRCLE_DUR;
    const MSG_START = HANDOFF + 0.16;

    const tl = gsap.timeline({
      defaults: { ease: 'power1.inOut' },
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: '+=900%',
        pin: true,
        scrub: 1.15,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onRefreshInit: prepare,
      },
    });

    // 1) AEQUILIBRIUM 부드럽게 오른쪽 이동
    tl.to(
      titles,
      {
        duration: SLIDE_DUR,
        x: () => titleSlideX || measureTitleSlideX(),
      },
      0
    );

    // 1-b) A / IBRIUM + 한글 문구 함께 fade out
    tl.to(
      fadeWithSlide,
      {
        duration: SLIDE_DUR * 0.55,
        opacity: 0,
        ease: 'power2.out',
      },
      0
    );

    // 2) 원 확대 — EQUIL 반전 드러남
    tl.to(
      circle,
      {
        duration: CIRCLE_DUR,
        clipPath: () => `circle(${getCoverRadius()}px at 50% 50%)`,
      },
      CIRCLE_START
    );

    // 3) 반전 EQUIL → EQ/UIL 인계
    tl.to(
      invertLayer,
      {
        duration: 0.14,
        opacity: 0,
      },
      HANDOFF
    );
    tl.fromTo(
      row,
      { x: 0 },
      {
        duration: 0.01,
        x: () => measureLogoAlignX(),
        ease: 'none',
      },
      HANDOFF
    );
    tl.to(
      [eq, uil],
      {
        duration: 0.14,
        opacity: 1,
      },
      HANDOFF
    );

    // 4) 문구 펼침
    tl.to(
      message,
      {
        duration: 0.28,
        width: () => getPartWidth(messageA),
        marginLeft: SIDE_GAP,
        marginRight: SIDE_GAP,
      },
      MSG_START
    );
    tl.to(
      messageA,
      {
        duration: 0.2,
        opacity: 1,
      },
      MSG_START + 0.06
    );

    tl.to(
      message,
      {
        duration: 0.3,
        width: () => getFullMessageWidth(),
      },
      MSG_START + 0.28
    );
    tl.to(
      messageB,
      {
        duration: 0.24,
        opacity: 1,
      },
      MSG_START + 0.3
    );
    tl.to(
      [eq, uil],
      {
        duration: 0.24,
        opacity: 0.2,
      },
      MSG_START + 0.3
    );

    // 5) 로고 소멸
    tl.to(
      [eq, uil],
      {
        duration: 0.2,
        opacity: 0,
      },
      MSG_START + 0.62
    );
  };

  const start = () => {
    const init = () => {
      initBrandStoryName();
      ScrollTrigger.refresh();
    };

    const run = () => {
      if (document.fonts?.ready) {
        document.fonts.ready.then(init).catch(init);
        return;
      }
      init();
    };

    if (!window.equilLibsReady) {
      run();
      return;
    }

    window.equilLibsReady.then(run).catch((error) => {
      console.error('[brand-story] GSAP init failed:', error);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
