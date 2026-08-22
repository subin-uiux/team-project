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
    const mobileMq = window.matchMedia('(max-width: 47.9375rem)');
    const isMobileMessage = () => mobileMq.matches;
    let titleSlideX = 0;
    const titles = [title, invertTitle];
    const fadeWithSlide = gsap.utils.toArray(sideLetters);
    const CAPTION_FADE_UP_DURATION = 1.26;
    const CAPTION_FADE_UP_Y = 40;
    const MSG_FADE_UP_DURATION = 1.26;
    const MSG_FADE_UP_Y = 70;
    const PC_MSG_EXPAND_FIRST_DUR = 0.32;
    const PC_MSG_EXPAND_FULL_DUR = 0.38;
    const PC_MSG_PART_A_OPACITY_DUR = 0.18;
    const PC_MSG_PART_B_OPACITY_DUR = 0.22;
    const PC_MSG_EXPAND_B_START = 0.26;
    const PC_MSG_PART_B_START = 0.28;
    let tl;
    let captionEnterTween = null;

    const playCaptionFadeUp = () => {
      captionEnterTween?.kill();
      gsap.set(caption, { opacity: 0, y: CAPTION_FADE_UP_Y, xPercent: -50 });
      captionEnterTween = gsap.to(caption, {
        opacity: 1,
        y: 0,
        duration: CAPTION_FADE_UP_DURATION,
        ease: 'power3.out',
        onComplete: () => {
          captionEnterTween = null;
        },
      });
    };

    const resetCaption = () => {
      captionEnterTween?.kill();
      captionEnterTween = null;
      gsap.set(caption, { opacity: 0, y: CAPTION_FADE_UP_Y, xPercent: -50 });
    };

    const resetSection = () => {
      resetCaption();
      tl?.progress(0);
      prepare();
    };

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

    const getAvailableMessageWidth = () => {
      if (isMobileMessage()) {
        return Math.max(0, content.clientWidth - 40); /* 좌우 20px */
      }
      return Math.max(0, content.clientWidth - eq.offsetWidth - uil.offsetWidth - SIDE_GAP * 2);
    };

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
      gsap.set(sideLetters, { opacity: 1 });
      // 첫 화면: 영어만 고정, 한글은 아래쪽에서 대기
      gsap.set(caption, { opacity: 0, y: CAPTION_FADE_UP_Y, xPercent: -50 });
      gsap.set(row, { x: 0 });
      gsap.set(invertLayer, { opacity: 1 });
      gsap.set(circle, { clipPath: 'circle(0px at 50% 50%)' });
      gsap.set([eq, uil], { opacity: 0 });
      if (isMobileMessage()) {
        gsap.set(message, { width: 'auto', marginLeft: 0, marginRight: 0 });
        gsap.set([messageA, messageB], { opacity: 0, y: MSG_FADE_UP_Y });
      } else {
        gsap.set(message, { width: 0, marginLeft: 0, marginRight: 0 });
        gsap.set([messageA, messageB], { opacity: 0, y: 0 });
      }
    };

    prepare();

    // 캡션 fadeUp(실시간) → 슬라이드/원 순 (섹션 pin 후 스크롤로 진행)
    const SLIDE_START = CAPTION_FADE_UP_DURATION * 0.75;
    const SLIDE_DUR = 0.8;
    const SLIDE_FADE_RATIO = 0.6; /* A/IBRIUM·캡션 fade out — SLIDE_DUR 대비 */
    const CIRCLE_START = SLIDE_START + SLIDE_DUR * 0.75;
    const CIRCLE_DUR = 0.8;
    const HANDOFF = CIRCLE_START + CIRCLE_DUR;
    const EQUIL_FADE_DUR = 0.48; /* 반전 EQUIL 서서히 fade out */
    const MSG_START = HANDOFF + EQUIL_FADE_DUR * 0.85; /* EQUIL 거의 사라진 뒤 문구 등장 */
    const SECTION_HOLD_DUR = 1; /* row 완전 등장 후 pin 유지(초) — 스크롤 길이 */
    const getRowRevealEnd = () =>
      isMobileMessage()
        ? MSG_START + MSG_FADE_UP_DURATION * 0.67 /* 2줄 fadeUp + stagger */
        : MSG_START + PC_MSG_PART_B_START + Math.max(PC_MSG_PART_B_OPACITY_DUR, 0.4);

    tl = gsap.timeline({
      defaults: { ease: 'power1.inOut' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=650%',
        pin,
        pinSpacing: true,
        scrub: 4.5,
        anticipatePin: 0,
        invalidateOnRefresh: true,
        onRefreshInit: prepare,
        onEnter: playCaptionFadeUp,
        onLeaveBack: resetSection,
      },
    });

    // 1) AEQUILIBRIUM 부드럽게 오른쪽 이동
    tl.to(
      titles,
      {
        duration: SLIDE_DUR,
        x: () => titleSlideX || measureTitleSlideX(),
      },
      SLIDE_START
    );

    // 1-b) A / IBRIUM + 캡션 함께 fade out
    tl.to(
      fadeWithSlide,
      {
        duration: SLIDE_DUR * SLIDE_FADE_RATIO,
        opacity: 0,
        ease: 'power2.out',
      },
      SLIDE_START
    );
    tl.to(
      caption,
      {
        duration: SLIDE_DUR * SLIDE_FADE_RATIO,
        opacity: 0,
        ease: 'power2.out',
      },
      SLIDE_START
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

    // 3) 반전 EQUIL 서서히 fade out → EQ/UIL · 문구 인계
    tl.to(
      invertLayer,
      {
        duration: EQUIL_FADE_DUR,
        opacity: 0,
        ease: 'power1.inOut',
      },
      HANDOFF
    );
    tl.fromTo(
      row,
      { x: 0 },
      {
        duration: 0.01,
        x: () => (isMobileMessage() ? 0 : measureLogoAlignX()),
        ease: 'none',
      },
      HANDOFF + EQUIL_FADE_DUR * 0.55
    );
    if (!isMobileMessage()) {
      tl.to(
        [eq, uil],
        {
          duration: 0.22,
          opacity: 1,
          ease: 'power2.out',
        },
        HANDOFF + EQUIL_FADE_DUR * 0.6
      );
    }

    // 4) 문구 펼침
    if (isMobileMessage()) {
      tl.set(message, { width: 'auto' }, MSG_START);
      tl.fromTo(
        messageA,
        { opacity: 0, y: MSG_FADE_UP_Y },
        {
          opacity: 1,
          y: 0,
          duration: MSG_FADE_UP_DURATION * 0.55,
          ease: 'power3.out',
        },
        MSG_START
      );
      tl.fromTo(
        messageB,
        { opacity: 0, y: MSG_FADE_UP_Y },
        {
          opacity: 1,
          y: 0,
          duration: MSG_FADE_UP_DURATION * 0.55,
          ease: 'power3.out',
        },
        MSG_START + MSG_FADE_UP_DURATION * 0.12
      );
    } else {
      tl.to(
        message,
        {
          duration: PC_MSG_EXPAND_FIRST_DUR,
          width: () => getPartWidth(messageA),
          marginLeft: SIDE_GAP,
          marginRight: SIDE_GAP,
          ease: 'power2.out',
        },
        MSG_START
      );
      tl.to(
        messageA,
        {
          duration: PC_MSG_PART_A_OPACITY_DUR,
          opacity: 1,
          ease: 'power1.out',
        },
        MSG_START + 0.04
      );

      tl.to(
        message,
        {
          duration: PC_MSG_EXPAND_FULL_DUR,
          width: () => getFullMessageWidth(),
          ease: 'power2.out',
        },
        MSG_START + PC_MSG_EXPAND_B_START
      );
      tl.to(
        messageB,
        {
          duration: PC_MSG_PART_B_OPACITY_DUR,
          opacity: 1,
          ease: 'power1.out',
        },
        MSG_START + PC_MSG_PART_B_START
      );
      // 문구 펼침과 함께 EQ / UIL 서서히 사라짐
      tl.to(
        [eq, uil],
        {
          duration: 0.4,
          opacity: 0,
          ease: 'power1.out',
        },
        MSG_START + PC_MSG_PART_B_START
      );
    }

    // 5) row 완전 등장 후 잠깐 고정 — 추가 스크롤 시 다음 섹션으로
    tl.to({}, { duration: SECTION_HOLD_DUR }, getRowRevealEnd());
  };

  const initBrandStoryPhilosophy = () => {
    const section = document.querySelector('.brand-story-philosophy');
    const list = section?.querySelector('.brand-story-philosophy__list');
    const compactMq = window.matchMedia('(max-width: 63.9375rem)');
    if (!section || !list || !compactMq.matches) return;
    if (typeof gsap === 'undefined') return;

    const items = gsap.utils.toArray('.brand-story-philosophy__item', section);
    const cards = gsap.utils.toArray('.brand-story-philosophy__card', section);
    const navItems = gsap.utils.toArray('.brand-story-philosophy__nav-item', section);
    if (items.length < 2) return;

    const LAST_INDEX = items.length - 1;
    const SLIDE_DURATION = 0.9;
    const SLIDE_EASE = 'power2.inOut';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let currentIndex = 0;
    let isAnimating = false;
    let slideTween = null;

    const getSlideX = () => list.offsetWidth || 0;

    const setActiveNav = (index) => {
      navItems.forEach((btn, navIndex) => {
        btn.classList.toggle('is-active', navIndex === index);
      });
    };

    const setActiveCard = (index) => {
      cards.forEach((card, cardIndex) => {
        card.classList.toggle('is-active', cardIndex === index);
      });
      items.forEach((item, itemIndex) => {
        item.style.zIndex = itemIndex === index ? '1' : '0';
      });
    };

    const setItemsImmediate = (index) => {
      const slideX = getSlideX();
      items.forEach((item, itemIndex) => {
        gsap.set(item, {
          x: itemIndex === index ? 0 : itemIndex < index ? -slideX : slideX,
        });
      });
    };

    const wrapIndex = (index) => {
      const count = LAST_INDEX + 1;
      return ((index % count) + count) % count;
    };

    const isWrapForward = (fromIndex, toIndex) => {
      if (fromIndex === LAST_INDEX && toIndex === 0) return true;
      if (fromIndex === 0 && toIndex === LAST_INDEX) return false;
      return toIndex > fromIndex;
    };

    const goTo = (index) => {
      const safeIndex = wrapIndex(index);
      if (isAnimating || safeIndex === currentIndex) return false;

      if (slideTween) {
        slideTween.kill();
        slideTween = null;
      }

      if (reduceMotion) {
        currentIndex = safeIndex;
        setItemsImmediate(safeIndex);
        setActiveNav(safeIndex);
        setActiveCard(safeIndex);
        return true;
      }

      const isForward = isWrapForward(currentIndex, safeIndex);
      const currentItem = items[currentIndex];
      const nextItem = items[safeIndex];
      const slideX = getSlideX();

      isAnimating = true;
      gsap.set(nextItem, { x: isForward ? slideX : -slideX });
      setActiveNav(safeIndex);
      setActiveCard(safeIndex);

      slideTween = gsap.timeline({
        onComplete: () => {
          isAnimating = false;
          slideTween = null;
          currentIndex = safeIndex;
          setItemsImmediate(safeIndex);
        },
      });

      slideTween
        .to(
          currentItem,
          {
            x: isForward ? -slideX : slideX,
            duration: SLIDE_DURATION,
            ease: SLIDE_EASE,
          },
          0,
        )
        .to(
          nextItem,
          {
            x: 0,
            duration: SLIDE_DURATION,
            ease: SLIDE_EASE,
          },
          0,
        );

      return true;
    };

    setItemsImmediate(0);
    setActiveNav(0);
    setActiveCard(0);

    navItems.forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = Number(btn.dataset.index);
        if (Number.isNaN(index)) return;
        goTo(index);
      });
    });

    let touchStartX = 0;

    list.addEventListener(
      'touchstart',
      (event) => {
        touchStartX = event.changedTouches[0]?.clientX ?? 0;
      },
      { passive: true },
    );

    list.addEventListener(
      'touchend',
      (event) => {
        if (isAnimating) return;

        const touchEndX = event.changedTouches[0]?.clientX ?? 0;
        const deltaX = touchStartX - touchEndX;
        if (Math.abs(deltaX) < 40) return;

        if (deltaX > 0) goTo(currentIndex + 1);
        if (deltaX < 0) goTo(currentIndex - 1);
      },
      { passive: true },
    );
  };

  const start = () => {
    const init = () => {
      initBrandStoryName();
      initBrandStoryPhilosophy();
      window.initEquilHeading3tierFadeUp?.();
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
