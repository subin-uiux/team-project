(() => {
  const initMainScroll = () => {
    const root = document.querySelector('.main-scroll');
    if (!root) return;

    const viewport = root.querySelector('.main-scroll__viewport');
    const track = root.querySelector('.main-scroll__track');
    const fill = root.querySelector('.main-hero__fill');
    const items = gsap.utils.toArray('.main-problem__item', root);
    const navItems = gsap.utils.toArray('.main-problem-nav__item', root);
    if (!viewport || !track || items.length < 1) return;

    const problemCount = items.length;
    const FEATHER = 2.5;
    const SLIDE_DURATION = 0.9; /* hero → problem 패널 전환 속도 */
    const HERO_FILL_DURATION = 2.0; /* hero 글자 채움·되돌림 */
    const SLIDE_EASE = 'power2.inOut';
    const TEXT_ANIM = {
      duration: 1.5, /* problem 번호·제목·본문 텍스트 전환 속도 */
      ease: 'power3.out',
      fadeDownY: -40,
      fadeUpY: 40,
    };
    const compactMq = window.matchMedia('(max-width: 63.9375rem)');
    const isCompact = () => compactMq.matches;
    const heroStepCount = () => (isCompact() ? 1 : 2);

    /* PC: step 0 hero 시작 → step 1 채움 완료 → step 2~ problem
       Tab/Mo: 로드 시 자동 채움, step 0은 채워진 hero → step 1~ problem */
    const problemSteps = Array.from({ length: problemCount }, (_, index) => ({
      fill: 1,
      track: index + 1,
    }));
    const STEPS = isCompact()
      ? [{ fill: 1, track: 0 }, ...problemSteps]
      : [{ fill: 0, track: 0 }, { fill: 1, track: 0 }, ...problemSteps];

    const animState = { fill: 0, track: 0 };
    let currentStep = 0;
    let isAnimating = false;
    let scrollTrigger = null;
    let stepTween = null;
    let textTween = null;

    const getProblemTextElements = (item) => ({
      fadeDown: gsap.utils.toArray('.main-problem__number, .main-problem__title', item),
      fadeUp: gsap.utils.toArray('.main-problem__desc', item),
    });

    const resetProblemText = (item) => {
      const { fadeDown, fadeUp } = getProblemTextElements(item);

      gsap.set(fadeDown, { opacity: 0, y: TEXT_ANIM.fadeDownY });
      gsap.set(fadeUp, { opacity: 0, y: TEXT_ANIM.fadeUpY });
    };

    const resetAllProblemText = () => {
      if (textTween) {
        textTween.kill();
        textTween = null;
      }

      items.forEach(resetProblemText);
    };

    const showProblemTextImmediate = (problemIndex) => {
      const item = items[problemIndex];
      if (!item) return;

      items.forEach((entry, index) => {
        if (index === problemIndex) {
          const { fadeDown, fadeUp } = getProblemTextElements(entry);
          gsap.set(fadeDown, { opacity: 1, y: 0 });
          gsap.set(fadeUp, { opacity: 1, y: 0 });
          return;
        }

        resetProblemText(entry);
      });
    };

    const animateProblemText = (problemIndex) => {
      const item = items[problemIndex];
      if (!item) return;

      if (textTween) {
        textTween.kill();
        textTween = null;
      }

      items.forEach((entry, index) => {
        if (index !== problemIndex) resetProblemText(entry);
      });

      const { fadeDown, fadeUp } = getProblemTextElements(item);

      textTween = gsap.timeline({
        onComplete: () => {
          textTween = null;
        },
      });

      if (fadeDown.length) {
        textTween.fromTo(
          fadeDown,
          { opacity: 0, y: TEXT_ANIM.fadeDownY },
          {
            opacity: 1,
            y: 0,
            duration: TEXT_ANIM.duration,
            ease: TEXT_ANIM.ease,
          },
          0,
        );
      }

      if (fadeUp.length) {
        textTween.fromTo(
          fadeUp,
          { opacity: 0, y: TEXT_ANIM.fadeUpY },
          {
            opacity: 1,
            y: 0,
            duration: TEXT_ANIM.duration,
            ease: TEXT_ANIM.ease,
          },
          0,
        );
      }
    };

    const updateProblemText = (trackStep, { animate = false, immediate = false } = {}) => {
      if (trackStep < 1) {
        resetAllProblemText();
        return;
      }

      const problemIndex = trackStep - 1;

      if (animate) {
        animateProblemText(problemIndex);
        return;
      }

      if (immediate) {
        showProblemTextImmediate(problemIndex);
      }
    };

    const setFillProgress = (progress) => {
      if (!fill) return;

      const p = Math.max(0, Math.min(1, progress));

      if (p >= 1) {
        fill.style.webkitMaskImage = 'none';
        fill.style.maskImage = 'none';
        return;
      }

      const pct = p * 100;
      const solidEnd = Math.max(0, pct - FEATHER);
      const mask = `linear-gradient(to bottom, #000 0%, #000 ${solidEnd}%, transparent ${Math.max(pct, solidEnd)}%)`;
      fill.style.webkitMaskImage = mask;
      fill.style.maskImage = mask;
    };

    const applyVisualState = (fillValue, trackValue) => {
      setFillProgress(fillValue);
      gsap.set(track, { y: -viewport.offsetHeight * trackValue });
    };

    const setActiveNav = (trackStep) => {
      document.body.classList.toggle('is-main-scroll-nav-visible', trackStep >= 1);

      navItems.forEach((btn, index) => {
        const isActive = trackStep >= 1 && index === trackStep - 1;
        btn.classList.toggle('is-active', isActive);
        if (isActive) {
          btn.setAttribute('aria-current', 'true');
        } else {
          btn.removeAttribute('aria-current');
        }
      });

      items.forEach((item, index) => {
        item.classList.toggle('is-active', trackStep >= 1 && index === trackStep - 1);
      });
    };

    const getScrollYForStep = (step) => {
      if (!scrollTrigger) return window.scrollY;
      const progress = step / (STEPS.length - 1);
      return scrollTrigger.start + (scrollTrigger.end - scrollTrigger.start) * progress;
    };

    const applyStep = (step, { immediate = false, animateText = false } = {}) => {
      const safeStep = Math.max(0, Math.min(STEPS.length - 1, step));
      const target = STEPS[safeStep];

      currentStep = safeStep;
      animState.fill = target.fill;
      animState.track = target.track;
      applyVisualState(target.fill, target.track);
      setActiveNav(target.track);
      updateProblemText(target.track, { animate: animateText, immediate });

      return safeStep;
    };

    const getStepDuration = (fromStep, toStep) => {
      const isHeroFill =
        !isCompact() &&
        ((fromStep === 0 && toStep === 1) || (fromStep === 1 && toStep === 0));
      return isHeroFill ? HERO_FILL_DURATION : SLIDE_DURATION;
    };

    const goToStep = (step, { immediate = false } = {}) => {
      const safeStep = Math.max(0, Math.min(STEPS.length - 1, step));
      if (!immediate && (isAnimating || safeStep === currentStep)) return false;

      if (stepTween) {
        stepTween.kill();
        stepTween = null;
      }

      if (immediate) {
        isAnimating = false;
        applyStep(safeStep, { immediate: true });
        window.scrollTo(0, getScrollYForStep(safeStep));
        return true;
      }

      const fromStep = currentStep;
      const target = STEPS[safeStep];
      const startFill = animState.fill;
      const startTrack = animState.track;
      const startY = window.scrollY;
      const targetY = getScrollYForStep(safeStep);

      isAnimating = true;
      currentStep = safeStep;
      setActiveNav(target.track);

      stepTween = gsap.to(
        { progress: 0 },
        {
          progress: 1,
          duration: getStepDuration(fromStep, safeStep),
          ease: SLIDE_EASE,
          onUpdate() {
            const t = this.targets()[0].progress;
            const nextFill = gsap.utils.interpolate(startFill, target.fill, t);
            const nextTrack = gsap.utils.interpolate(startTrack, target.track, t);
            animState.fill = nextFill;
            animState.track = nextTrack;
            applyVisualState(nextFill, nextTrack);
            setActiveNav(nextTrack >= 1 ? Math.round(nextTrack) : 0);
            window.scrollTo(0, startY + (targetY - startY) * t);
          },
          onComplete() {
            isAnimating = false;
            stepTween = null;
            applyStep(safeStep, {
              immediate: true,
              animateText: target.track >= 1,
            });
          },
        },
      );

      return true;
    };

    const handleStepInput = (direction) => {
      if (!scrollTrigger?.isActive || isAnimating) return false;

      if (direction > 0) {
        if (currentStep >= STEPS.length - 1) return false;
        goToStep(currentStep + 1);
        return true;
      }

      if (direction < 0) {
        if (currentStep <= 0) return false;
        goToStep(currentStep - 1);
        return true;
      }

      return false;
    };

    const bindWheelNavigation = () => {
      const onWheel = (event) => {
        if (!scrollTrigger?.isActive) return;

        if (isAnimating) {
          event.preventDefault();
          return;
        }

        const direction = event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0;
        if (!direction) return;

        const handled = handleStepInput(direction);
        if (handled) {
          event.preventDefault();
        }
      };

      viewport.addEventListener('wheel', onWheel, { passive: false });

      let touchStartY = 0;

      viewport.addEventListener(
        'touchstart',
        (event) => {
          touchStartY = event.changedTouches[0]?.clientY ?? 0;
        },
        { passive: true },
      );

      viewport.addEventListener(
        'touchend',
        (event) => {
          if (!scrollTrigger?.isActive || isAnimating) return;

          const touchEndY = event.changedTouches[0]?.clientY ?? 0;
          const deltaY = touchStartY - touchEndY;
          if (Math.abs(deltaY) < 40) return;

          handleStepInput(deltaY > 0 ? 1 : -1);
        },
        { passive: true },
      );
    };

    resetAllProblemText();
    applyStep(0, { immediate: true });
    if (isCompact()) setFillProgress(0);

    const playHeroFillOnLoad = () => {
      if (!fill || !isCompact()) return;

      setFillProgress(0);
      gsap.to(
        { progress: 0 },
        {
          progress: 1,
          duration: HERO_FILL_DURATION,
          ease: 'power2.out',
          onUpdate() {
            setFillProgress(this.targets()[0].progress);
          },
          onComplete() {
            setFillProgress(1);
          },
        },
      );
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (fill) {
        fill.style.webkitMaskImage = 'none';
        fill.style.maskImage = 'none';
      }
      applyStep(STEPS.length - 1, { immediate: true });
      showProblemTextImmediate(problemCount - 1);
      return;
    }

    scrollTrigger = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: () => `+=${viewport.offsetHeight * (STEPS.length - 1)}`,
      pin: viewport,
      scrub: false,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onToggle: (self) => {
        document.body.classList.toggle('is-main-scroll-pinned', self.isActive);
      },
      onLeave: () => {
        document.body.classList.remove('is-main-scroll-nav-visible');
        applyStep(STEPS.length - 1, { immediate: true });
        setFillProgress(1);
      },
      onEnterBack: () => {
        applyStep(STEPS.length - 1, { immediate: true, animateText: true });
      },
      onUpdate: (self) => {
        if (isAnimating) return;

        const syncedStep = Math.round(self.progress * (STEPS.length - 1));
        if (syncedStep !== currentStep) {
          applyStep(syncedStep, { immediate: true });
        }
      },
    });

    bindWheelNavigation();
    playHeroFillOnLoad();

    navItems.forEach((btn) => {
      btn.addEventListener('click', () => {
        const problemIndex = Number(btn.dataset.index);
        if (Number.isNaN(problemIndex)) return;

        /* hero 스텝 + problem index */
        goToStep(problemIndex + heroStepCount());
      });
    });
  };

  const initMainMattressSolution = () => {
    const section = document.querySelector('.main-mattress-solution');
    const viewport = section?.querySelector('.main-mattress-solution__viewport');
    const images = gsap.utils.toArray('.main-mattress-solution__image', section);
    const thumb = section?.querySelector('.main-mattress-solution__thumb');
    const media = section?.querySelector('.main-mattress-solution__media');
    const panels = gsap.utils.toArray('.main-mattress-solution__panel', section);
    if (!section || !viewport || !thumb || !media || panels.length < 2 || images.length !== panels.length) {
      return;
    }

    const LAST_INDEX = panels.length - 1;
    const SLIDE_DURATION = 0.9; /* 매트리스 이미지 슬라이드 전환 속도 */
    const SLIDE_EASE = 'power2.inOut';
    const FADE_UP_DURATION = 3; /* heading·features fadeUp 속도 */
    const FADE_UP_EASE = 'power3.out';
    const FADE_UP_Y = 40;
    const FEATURES_DELAY = 0.2; /* heading 이후 features가 따라오는 지연 */
    const ENTRY_LOCK_MS = 800;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const compactMq = window.matchMedia('(max-width: 63.9375rem)');
    const isCompact = () => compactMq.matches;
    const navItems = gsap.utils.toArray('.main-mattress-solution__nav-item', section);

    let currentIndex = -1;
    let isAnimating = false;
    let entryLockUntil = 0;
    let textTween = null;
    let slideTween = null;
    let scrollTrigger = null;

    const getPanelParts = (panel) => ({
      heading: panel.querySelector('.main-mattress-solution__heading'),
      features: panel.querySelector('.main-mattress-solution__features'),
    });

    const hidePanel = (panel) => {
      const { heading, features } = getPanelParts(panel);
      panel.classList.remove('is-active');
      panel.setAttribute('aria-hidden', 'true');
      gsap.set([heading, features].filter(Boolean), { opacity: 0, y: FADE_UP_Y });
    };

    const showPanelImmediate = (panel) => {
      const { heading, features } = getPanelParts(panel);
      panel.classList.add('is-active');
      panel.setAttribute('aria-hidden', 'false');
      gsap.set([heading, features].filter(Boolean), { opacity: 1, y: 0 });
    };

    const activatePanel = (index, { animate = true } = {}) => {
      const nextPanel = panels[index];
      if (!nextPanel || index === currentIndex) return;

      if (textTween) {
        textTween.kill();
        textTween = null;
      }

      panels.forEach((panel, panelIndex) => {
        if (panelIndex === index) return;
        hidePanel(panel);
      });

      currentIndex = index;
      nextPanel.classList.add('is-active');
      nextPanel.setAttribute('aria-hidden', 'false');
      setActiveNav(index);

      const { heading, features } = getPanelParts(nextPanel);
      const targets = [heading, features].filter(Boolean);

      if (!animate || reduceMotion || !targets.length) {
        showPanelImmediate(nextPanel);
        return;
      }

      gsap.set(targets, { opacity: 0, y: FADE_UP_Y });

      textTween = gsap.timeline({
        onComplete: () => {
          textTween = null;
        },
      });

      if (heading) {
        /* main-mattress-solution__heading fadeUp */
        textTween.to(
          heading,
          {
            opacity: 1,
            y: 0,
            duration: FADE_UP_DURATION,
            ease: FADE_UP_EASE,
          },
          0,
        );
      }

      if (features) {
        /* main-mattress-solution__features fadeUp */
        textTween.to(
          features,
          {
            opacity: 1,
            y: 0,
            duration: FADE_UP_DURATION,
            ease: FADE_UP_EASE,
          },
          FEATURES_DELAY,
        );
      }
    };

    const setActiveNav = (index) => {
      navItems.forEach((btn, navIndex) => {
        btn.classList.toggle('is-active', navIndex === index);
      });
    };

    const percentKey = () => (isCompact() ? 'xPercent' : 'yPercent');

    const getThumbY = (index) => {
      const unit = media.offsetHeight / 3;
      return index * unit;
    };

    const setImagesImmediate = (index) => {
      const key = percentKey();
      const other = key === 'xPercent' ? 'yPercent' : 'xPercent';

      images.forEach((image, imageIndex) => {
        gsap.set(image, {
          [other]: 0,
          [key]: imageIndex === index ? 0 : imageIndex < index ? -100 : 100,
        });
      });
    };

    const setThumbImmediate = (index) => {
      gsap.set(thumb, { y: getThumbY(index) });
    };

    const getScrollYForIndex = (index) => {
      if (!scrollTrigger) return window.scrollY;
      const progress = LAST_INDEX === 0 ? 0 : index / LAST_INDEX;
      return scrollTrigger.start + (scrollTrigger.end - scrollTrigger.start) * progress;
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

    const applyIndex = (index, { animateText = false } = {}) => {
      const safeIndex = Math.max(0, Math.min(LAST_INDEX, index));
      setImagesImmediate(safeIndex);
      if (!isCompact()) setThumbImmediate(safeIndex);
      activatePanel(safeIndex, { animate: animateText });
    };

    const goTo = (index, { immediate = false } = {}) => {
      const fromIndex = Math.max(0, currentIndex);
      const safeIndex = isCompact() ? wrapIndex(index) : Math.max(0, Math.min(LAST_INDEX, index));

      if (!immediate && (isAnimating || safeIndex === fromIndex && currentIndex !== -1)) {
        return false;
      }

      if (slideTween) {
        slideTween.kill();
        slideTween = null;
      }

      if (immediate || reduceMotion) {
        isAnimating = false;
        applyIndex(safeIndex, { animateText: false });
        if (!isCompact()) window.scrollTo(0, getScrollYForIndex(safeIndex));
        return true;
      }

      const isForward = isCompact() ? isWrapForward(fromIndex, safeIndex) : safeIndex > fromIndex;
      const currentImage = images[fromIndex];
      const nextImage = images[safeIndex];
      const startY = window.scrollY;
      const targetY = getScrollYForIndex(safeIndex);
      const key = percentKey();

      isAnimating = true;
      gsap.set(nextImage, { [key]: isForward ? 100 : -100 });
      activatePanel(safeIndex, { animate: true });

      slideTween = gsap.timeline({
        onComplete: () => {
          isAnimating = false;
          slideTween = null;
          setImagesImmediate(safeIndex);
          if (!isCompact()) {
            setThumbImmediate(safeIndex);
            window.scrollTo(0, targetY);
          }
        },
      });

      slideTween
        .to(
          currentImage,
          {
            [key]: isForward ? -100 : 100,
            duration: SLIDE_DURATION,
            ease: SLIDE_EASE,
          },
          0,
        )
        .to(
          nextImage,
          {
            [key]: 0,
            duration: SLIDE_DURATION,
            ease: SLIDE_EASE,
          },
          0,
        );

      if (!isCompact()) {
        slideTween
          .to(
            thumb,
            {
              y: getThumbY(safeIndex),
              duration: SLIDE_DURATION,
              ease: SLIDE_EASE,
            },
            0,
          )
          .to(
            { progress: 0 },
            {
              progress: 1,
              duration: SLIDE_DURATION,
              ease: SLIDE_EASE,
              onUpdate() {
                const t = this.targets()[0].progress;
                window.scrollTo(0, startY + (targetY - startY) * t);
              },
            },
            0,
          );
      }

      return true;
    };

    const handleStepInput = (direction) => {
      if (isAnimating) return false;
      if (!isCompact()) {
        if (!scrollTrigger?.isActive) return false;
        if (Date.now() < entryLockUntil) return true;
      }

      if (direction > 0) {
        if (!isCompact() && currentIndex >= LAST_INDEX) return false;
        goTo(Math.max(0, currentIndex) + 1);
        return true;
      }

      if (direction < 0) {
        if (!isCompact() && currentIndex <= 0) return false;
        goTo(Math.max(0, currentIndex) - 1);
        return true;
      }

      return false;
    };

    const bindWheelNavigation = () => {
      const onWheel = (event) => {
        if (!scrollTrigger?.isActive) return;

        if (isAnimating || Date.now() < entryLockUntil) {
          event.preventDefault();
          return;
        }

        const direction = event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0;
        if (!direction) return;

        const handled = handleStepInput(direction);
        if (handled) {
          event.preventDefault();
        }
      };

      viewport.addEventListener('wheel', onWheel, { passive: false });

      let touchStartY = 0;

      viewport.addEventListener(
        'touchstart',
        (event) => {
          touchStartY = event.changedTouches[0]?.clientY ?? 0;
        },
        { passive: true },
      );

      viewport.addEventListener(
        'touchend',
        (event) => {
          if (!scrollTrigger?.isActive || isAnimating) return;

          const touchEndY = event.changedTouches[0]?.clientY ?? 0;
          const deltaY = touchStartY - touchEndY;
          if (Math.abs(deltaY) < 40) return;

          handleStepInput(deltaY > 0 ? 1 : -1);
        },
        { passive: true },
      );
    };

    const bindCompactSwipe = () => {
      let touchStartX = 0;

      media.addEventListener(
        'touchstart',
        (event) => {
          touchStartX = event.changedTouches[0]?.clientX ?? 0;
        },
        { passive: true },
      );

      media.addEventListener(
        'touchend',
        (event) => {
          if (isAnimating) return;

          const touchEndX = event.changedTouches[0]?.clientX ?? 0;
          const deltaX = touchStartX - touchEndX;
          if (Math.abs(deltaX) < 40) return;

          handleStepInput(deltaX > 0 ? 1 : -1);
        },
        { passive: true },
      );
    };

    panels.forEach(hidePanel);
    setImagesImmediate(0);
    setActiveNav(0);
    if (!isCompact()) setThumbImmediate(0);

    if (reduceMotion) {
      showPanelImmediate(panels[0]);
      currentIndex = 0;
      return;
    }

    ScrollTrigger.create({
      trigger: section,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        activatePanel(0, { animate: true });
      },
    });

    navItems.forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = Number(btn.dataset.index);
        if (Number.isNaN(index)) return;
        goTo(index);
      });
    });

    if (isCompact()) {
      bindCompactSwipe();
      return;
    }

    scrollTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${viewport.offsetHeight * LAST_INDEX}`,
      pin: viewport,
      scrub: false,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onEnter: () => {
        entryLockUntil = Date.now() + ENTRY_LOCK_MS;
        applyIndex(0, { animateText: currentIndex !== 0 });
      },
      onEnterBack: () => {
        entryLockUntil = Date.now() + ENTRY_LOCK_MS;
        applyIndex(LAST_INDEX, { animateText: true });
      },
      onUpdate: (self) => {
        if (isAnimating) return;

        const syncedIndex = Math.round(self.progress * LAST_INDEX);
        if (syncedIndex !== Math.max(0, currentIndex)) {
          applyIndex(syncedIndex, { animateText: true });
        }
      },
    });

    bindWheelNavigation();
  };

  const initMainPillowSolution = () => {
    const section = document.querySelector('.main-pillow-solution');
    const cardsWrap = section?.querySelector('.main-pillow-solution__cards');
    const cards = gsap.utils.toArray('.main-pillow-solution__card', section);
    const navItems = gsap.utils.toArray('.main-pillow-solution__nav-item', section);
    const compactMq = window.matchMedia('(max-width: 63.9375rem)');
    if (!section || !cardsWrap || cards.length < 2 || !compactMq.matches) return;

    const LAST_INDEX = cards.length - 1;
    const SLIDE_DURATION = 0.9;
    const SLIDE_EASE = 'power2.inOut';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let currentIndex = 0;
    let isAnimating = false;
    let slideTween = null;

    const setActiveNav = (index) => {
      navItems.forEach((btn, navIndex) => {
        btn.classList.toggle('is-active', navIndex === index);
      });
    };

    const setActiveCard = (index) => {
      cards.forEach((card, cardIndex) => {
        card.classList.toggle('is-active', cardIndex === index);
      });
    };

    const setCardsImmediate = (index) => {
      cards.forEach((card, cardIndex) => {
        gsap.set(card, {
          xPercent: cardIndex === index ? 0 : cardIndex < index ? -100 : 100,
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
        setCardsImmediate(safeIndex);
        setActiveNav(safeIndex);
        setActiveCard(safeIndex);
        return true;
      }

      const isForward = isWrapForward(currentIndex, safeIndex);
      const currentCard = cards[currentIndex];
      const nextCard = cards[safeIndex];

      isAnimating = true;
      gsap.set(nextCard, { xPercent: isForward ? 100 : -100 });
      setActiveNav(safeIndex);
      setActiveCard(safeIndex);

      slideTween = gsap.timeline({
        onComplete: () => {
          isAnimating = false;
          slideTween = null;
          currentIndex = safeIndex;
          setCardsImmediate(safeIndex);
        },
      });

      slideTween
        .to(
          currentCard,
          {
            xPercent: isForward ? -100 : 100,
            duration: SLIDE_DURATION,
            ease: SLIDE_EASE,
          },
          0,
        )
        .to(
          nextCard,
          {
            xPercent: 0,
            duration: SLIDE_DURATION,
            ease: SLIDE_EASE,
          },
          0,
        );

      return true;
    };

    setCardsImmediate(0);
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

    cardsWrap.addEventListener(
      'touchstart',
      (event) => {
        touchStartX = event.changedTouches[0]?.clientX ?? 0;
      },
      { passive: true },
    );

    cardsWrap.addEventListener(
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

  const initMainBeddingSolution = () => {
    const section = document.querySelector('.main-bedding-solution');
    const viewport = section?.querySelector('.main-bedding-solution__viewport');
    const panels = gsap.utils.toArray('.main-bedding-solution__panel', section);
    const navItems = gsap.utils.toArray('.main-bedding-solution__nav-item', section);
    const compactMq = window.matchMedia('(max-width: 63.9375rem)');
    if (!section || !viewport || panels.length < 2 || !compactMq.matches) return;

    const LAST_INDEX = panels.length - 1;
    const SLIDE_DURATION = 0.9;
    const SLIDE_EASE = 'power2.inOut';
    const FADE_UP_DURATION = 1.26;
    const FADE_UP_Y = 40;
    const charClass = 'main-bedding-solution__char';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let currentIndex = 0;
    let isAnimating = false;
    let slideTween = null;
    let fadeTween = null;

    const splitChars = (element) => {
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

    const panelChars = panels.map((panel) => {
      const copy = panel.querySelector('.main-bedding-solution__copy');
      const targets = [
        copy?.querySelector('.main-bedding-solution__title'),
        copy?.querySelector('.main-bedding-solution__text'),
      ].filter(Boolean);

      return targets.flatMap((element) => splitChars(element));
    });

    const setActiveNav = (index) => {
      navItems.forEach((btn, navIndex) => {
        btn.classList.toggle('is-active', navIndex === index);
      });
    };

    const setActivePanel = (index) => {
      panels.forEach((panel, panelIndex) => {
        panel.classList.toggle('is-active', panelIndex === index);
      });
    };

    const setPanelsImmediate = (index) => {
      panels.forEach((panel, panelIndex) => {
        gsap.set(panel, {
          xPercent: panelIndex === index ? 0 : panelIndex < index ? -100 : 100,
        });
      });
    };

    const playCopyFadeUp = (index) => {
      if (fadeTween) {
        fadeTween.kill();
        fadeTween = null;
      }

      panelChars.forEach((chars, panelIndex) => {
        if (!chars.length) return;

        if (panelIndex !== index) {
          gsap.set(chars, { opacity: 0, y: FADE_UP_Y });
          return;
        }

        if (reduceMotion) {
          gsap.set(chars, { opacity: 1, y: 0 });
          return;
        }

        const stagger = FADE_UP_DURATION / Math.max(chars.length * 2.5, 1);

        gsap.set(chars, { opacity: 0, y: FADE_UP_Y });
        fadeTween = gsap.to(chars, {
          opacity: 1,
          y: 0,
          duration: FADE_UP_DURATION,
          ease: 'power3.out',
          stagger: chars.length > 1 ? stagger : 0,
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
        setPanelsImmediate(safeIndex);
        setActiveNav(safeIndex);
        setActivePanel(safeIndex);
        playCopyFadeUp(safeIndex);
        return true;
      }

      const isForward = isWrapForward(currentIndex, safeIndex);
      const currentPanel = panels[currentIndex];
      const nextPanel = panels[safeIndex];

      isAnimating = true;
      gsap.set(nextPanel, { xPercent: isForward ? 100 : -100 });
      setActiveNav(safeIndex);
      setActivePanel(safeIndex);
      playCopyFadeUp(safeIndex);

      slideTween = gsap.timeline({
        onComplete: () => {
          isAnimating = false;
          slideTween = null;
          currentIndex = safeIndex;
          setPanelsImmediate(safeIndex);
        },
      });

      slideTween
        .to(
          currentPanel,
          {
            xPercent: isForward ? -100 : 100,
            duration: SLIDE_DURATION,
            ease: SLIDE_EASE,
          },
          0,
        )
        .to(
          nextPanel,
          {
            xPercent: 0,
            duration: SLIDE_DURATION,
            ease: SLIDE_EASE,
          },
          0,
        );

      return true;
    };

    panelChars.forEach((chars) => {
      if (!chars.length) return;
      gsap.set(chars, reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: FADE_UP_Y });
    });

    setPanelsImmediate(0);
    setActiveNav(0);
    setActivePanel(0);
    section.classList.add('is-ready');

    ScrollTrigger.create({
      trigger: section,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        playCopyFadeUp(0);
      },
    });

    navItems.forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = Number(btn.dataset.index);
        if (Number.isNaN(index)) return;
        goTo(index);
      });
    });

    let touchStartX = 0;

    viewport.addEventListener(
      'touchstart',
      (event) => {
        touchStartX = event.changedTouches[0]?.clientX ?? 0;
      },
      { passive: true },
    );

    viewport.addEventListener(
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

  const initMainBeddingOverviewFadeUp = () => {
    const heading = document.querySelector('.main-bedding-overview__heading');
    if (!heading) return;

    const FADE_UP_DURATION = 1.26;
    const charClass = 'main-bedding-overview__char';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const splitChars = (element) => {
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

    const targets = [
      heading.querySelector('.heading-3tier__sub-title'),
      heading.querySelector('.heading-3tier__title'),
      heading.querySelector('.heading-3tier__desc'),
    ].filter(Boolean);

    const chars = targets.flatMap((element) => splitChars(element));
    if (!chars.length) return;

    if (reduceMotion) {
      gsap.set(chars, { opacity: 1, y: 0 });
      return;
    }

    const stagger = FADE_UP_DURATION / Math.max(chars.length * 2.5, 1);

    /* main-bedding-overview__heading 글자 단위 fadeUp */
    gsap.set(chars, { opacity: 0, y: 40 });
    gsap.to(chars, {
      opacity: 1,
      y: 0,
      duration: FADE_UP_DURATION,
      ease: 'power3.out',
      stagger: chars.length > 1 ? stagger : 0,
      scrollTrigger: {
        trigger: heading,
        start: 'top 90%',
        once: true,
      },
      onComplete: () => {
        gsap.set(chars, { clearProps: 'will-change' });
      },
    });
  };

  const initMainSleepFit = () => {
    const section = document.querySelector('.main-sleep-fit');
    const viewport = section?.querySelector('.main-sleep-fit__viewport');
    const media = section?.querySelector('.main-sleep-fit__media');
    const frame = section?.querySelector('.main-sleep-fit__frame');
    const header = section?.querySelector('.main-sleep-fit__header');
    if (!section || !viewport || !media || !frame || !header) return;

    const LAST_INDEX = 1;
    const SLIDE_DURATION = 1.1; /* 풀스크린 이미지가 1680×520으로 줄어드는 속도 */
    const SLIDE_EASE = 'power2.inOut';
    const FADE_UP_DURATION = 1.26; /* main-sleep-fit__header fadeUp 속도 */
    const FADE_UP_EASE = 'power3.out';
    const ENTRY_LOCK_MS = 800;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const compactMq = window.matchMedia('(max-width: 63.9375rem)');
    const mobileMq = window.matchMedia('(max-width: 47.9375rem)');

    let currentIndex = 0;
    let isAnimating = false;
    let entryLockUntil = 0;
    let slideTween = null;
    let scrollTrigger = null;

    const getFullHeight = () => {
      if (mobileMq.matches) return 290;
      if (compactMq.matches) return 430;
      return viewport.offsetHeight;
    };

    const getFullProps = () => {
      const height = getFullHeight();

      return {
        top: 0,
        left: 0,
        width: viewport.offsetWidth,
        height,
        borderRadius: '0px',
      };
    };

    const getShrunkProps = () => {
      const viewportRect = viewport.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();

      return {
        top: frameRect.top - viewportRect.top,
        left: frameRect.left - viewportRect.left,
        width: frameRect.width,
        height: frameRect.height,
        borderRadius: '30px',
      };
    };

    const applyMediaState = (expanded) => {
      gsap.set(media, expanded ? getShrunkProps() : getFullProps());
    };

    const applyHeaderState = (expanded, { animate = false } = {}) => {
      if (!animate || reduceMotion) {
        gsap.set(header, {
          opacity: expanded ? 1 : 0,
          y: expanded ? 0 : 40,
        });
        return;
      }

      if (expanded) {
        gsap.fromTo(
          header,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: FADE_UP_DURATION,
            ease: FADE_UP_EASE,
          },
        );
        return;
      }

      gsap.to(header, {
        opacity: 0,
        y: 40,
        duration: 0.45,
        ease: 'power2.in',
      });
    };

    const applyIndex = (index, { animate = false } = {}) => {
      const expanded = index >= LAST_INDEX;
      currentIndex = expanded ? LAST_INDEX : 0;
      section.classList.toggle('is-expanded', expanded);
      applyMediaState(expanded);
      applyHeaderState(expanded, { animate });
    };

    const getScrollYForIndex = (index) => {
      if (!scrollTrigger) return window.scrollY;
      const progress = LAST_INDEX === 0 ? 0 : index / LAST_INDEX;
      return scrollTrigger.start + (scrollTrigger.end - scrollTrigger.start) * progress;
    };

    const goTo = (index, { immediate = false } = {}) => {
      const safeIndex = Math.max(0, Math.min(LAST_INDEX, index));
      if (!immediate && (isAnimating || safeIndex === currentIndex)) return false;

      if (slideTween) {
        slideTween.kill();
        slideTween = null;
      }

      if (immediate || reduceMotion) {
        isAnimating = false;
        applyIndex(safeIndex, { animate: false });
        return true;
      }

      const expanded = safeIndex >= LAST_INDEX;
      const startY = window.scrollY;
      const targetY = getScrollYForIndex(safeIndex);

      isAnimating = true;
      currentIndex = safeIndex;
      section.classList.toggle('is-expanded', expanded);

      const HEADER_OUT_DURATION = 0.45; /* header 사라지는 속도 (이미지 확대 전) */

      slideTween = gsap.timeline({
        onComplete: () => {
          isAnimating = false;
          slideTween = null;
          applyMediaState(expanded);
          applyHeaderState(expanded, { animate: false });
        },
      });

      if (expanded) {
        gsap.set(header, { opacity: 0, y: 40 });
        /* 1) 이미지 사방 축소 */
        slideTween.to(media, {
          ...getShrunkProps(),
          duration: SLIDE_DURATION,
          ease: SLIDE_EASE,
        }, 0);
        /* 2) 축소 후 header fadeUp */
        slideTween.to(header, {
          opacity: 1,
          y: 0,
          duration: FADE_UP_DURATION,
          ease: FADE_UP_EASE,
        }, SLIDE_DURATION);
      } else {
        /* 되돌리기: header 먼저 페이드아웃 */
        slideTween.to(header, {
          opacity: 0,
          y: 40,
          duration: HEADER_OUT_DURATION,
          ease: 'power2.in',
        }, 0);
        /* 그다음 이미지 풀스크린으로 확대 */
        slideTween.to(media, {
          ...getFullProps(),
          duration: SLIDE_DURATION,
          ease: SLIDE_EASE,
        }, HEADER_OUT_DURATION);
      }

      if (scrollTrigger) {
        slideTween.to(
          { progress: 0 },
          {
            progress: 1,
            duration: SLIDE_DURATION,
            ease: SLIDE_EASE,
            onUpdate() {
              const t = this.targets()[0].progress;
              window.scrollTo(0, startY + (targetY - startY) * t);
            },
          },
          expanded ? 0 : HEADER_OUT_DURATION,
        );
      }

      return true;
    };

    const handleStepInput = (direction) => {
      if (!scrollTrigger?.isActive || isAnimating) return false;
      if (Date.now() < entryLockUntil) return true;

      if (direction > 0) {
        if (currentIndex >= LAST_INDEX) return false;
        goTo(currentIndex + 1);
        return true;
      }

      if (direction < 0) {
        if (currentIndex <= 0) return false;
        goTo(currentIndex - 1);
        return true;
      }

      return false;
    };

    const bindWheelNavigation = () => {
      const onWheel = (event) => {
        if (!scrollTrigger?.isActive) return;

        if (isAnimating || Date.now() < entryLockUntil) {
          event.preventDefault();
          return;
        }

        const direction = event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0;
        if (!direction) return;

        const handled = handleStepInput(direction);
        if (handled) {
          event.preventDefault();
        }
      };

      viewport.addEventListener('wheel', onWheel, { passive: false });
    };

    applyIndex(0, { animate: false });

    if (reduceMotion) {
      applyIndex(LAST_INDEX, { animate: false });
      return;
    }

    scrollTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${viewport.offsetHeight}`,
      pin: viewport,
      scrub: false,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: () => {
        applyMediaState(currentIndex >= LAST_INDEX);
      },
      onEnter: () => {
        entryLockUntil = Date.now() + ENTRY_LOCK_MS;
        applyIndex(0, { animate: false });
      },
      onEnterBack: () => {
        entryLockUntil = Date.now() + ENTRY_LOCK_MS;
        applyIndex(LAST_INDEX, { animate: false });
      },
      onUpdate: (self) => {
        if (isAnimating) return;

        const syncedIndex = Math.round(self.progress * LAST_INDEX);
        if (syncedIndex !== currentIndex) {
          applyIndex(syncedIndex, { animate: true });
        }
      },
    });

    bindWheelNavigation();
  };

  const SCROLL_POSITION_KEY = 'equil:index-scroll-y';

  const start = () => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    window.addEventListener('pagehide', () => {
      sessionStorage.setItem(SCROLL_POSITION_KEY, String(window.scrollY));
    });

    const init = () => {
      initMainScroll();
      initMainMattressSolution();
      initMainPillowSolution();
      initMainBeddingSolution();
      initMainSleepFit();
      initMainBeddingOverviewFadeUp();
      ScrollTrigger.refresh();

      const savedY = Number(sessionStorage.getItem(SCROLL_POSITION_KEY));
      if (Number.isFinite(savedY) && savedY > 0) {
        window.scrollTo(0, savedY);
      }

      if (typeof window.AOS !== 'undefined') {
        window.AOS.init({
          once: false,
          mirror: true,
          offset: 80,
          duration: 1000,
          easing: 'ease-out-cubic',
        });
        window.AOS.refreshHard();
      }
    };

    if (!window.equilLibsReady) {
      init();
      return;
    }

    window.equilLibsReady.then(init).catch((error) => {
      console.error('[main] GSAP init failed:', error);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
