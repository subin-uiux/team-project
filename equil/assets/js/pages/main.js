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
    const SLIDE_DURATION = 0.9;
    const HERO_FILL_DURATION = 2.0; /* hero 글자 채움·되돌림 */
    const SLIDE_EASE = 'power2.inOut';
    const TEXT_ANIM = {
      duration: 1.5,
      ease: 'power3.out',
      fadeDownY: -40,
      fadeUpY: 40,
    };

    /* step 0: hero 시작 → step 1: hero 채움 완료 → step 2~: problem 01~04 */
    const STEPS = [
      { fill: 0, track: 0 },
      { fill: 1, track: 0 },
      ...Array.from({ length: problemCount }, (_, index) => ({
        fill: 1,
        track: index + 1,
      })),
    ];

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
        (fromStep === 0 && toStep === 1) || (fromStep === 1 && toStep === 0);
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

    navItems.forEach((btn) => {
      btn.addEventListener('click', () => {
        const problemIndex = Number(btn.dataset.index);
        if (Number.isNaN(problemIndex)) return;

        /* hero 2스텝 + problem index */
        goToStep(problemIndex + 2);
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
    const SLIDE_DURATION = 0.9;
    const SLIDE_EASE = 'power2.inOut';
    const FADE_UP_DURATION = 1.26;
    const FADE_UP_EASE = 'power3.out';
    const FADE_UP_Y = 40;
    const FEATURES_DELAY = 0.3;
    const ENTRY_LOCK_MS = 800;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    const getThumbY = (index) => {
      const unit = media.offsetHeight / 3;
      return index * unit;
    };

    const setImagesImmediate = (index) => {
      images.forEach((image, imageIndex) => {
        gsap.set(image, {
          yPercent: imageIndex === index ? 0 : imageIndex < index ? -100 : 100,
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

    const applyIndex = (index, { animateText = false } = {}) => {
      const safeIndex = Math.max(0, Math.min(LAST_INDEX, index));
      setImagesImmediate(safeIndex);
      setThumbImmediate(safeIndex);
      activatePanel(safeIndex, { animate: animateText });
    };

    const goTo = (index, { immediate = false } = {}) => {
      const safeIndex = Math.max(0, Math.min(LAST_INDEX, index));
      const fromIndex = Math.max(0, currentIndex);

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
        window.scrollTo(0, getScrollYForIndex(safeIndex));
        return true;
      }

      const isForward = safeIndex > fromIndex;
      const currentImage = images[fromIndex];
      const nextImage = images[safeIndex];
      const startY = window.scrollY;
      const targetY = getScrollYForIndex(safeIndex);

      isAnimating = true;
      gsap.set(nextImage, { yPercent: isForward ? 100 : -100 });
      activatePanel(safeIndex, { animate: true });

      slideTween = gsap.timeline({
        onComplete: () => {
          isAnimating = false;
          slideTween = null;
          setImagesImmediate(safeIndex);
          setThumbImmediate(safeIndex);
          window.scrollTo(0, targetY);
        },
      });

      slideTween
        .to(
          currentImage,
          {
            yPercent: isForward ? -100 : 100,
            duration: SLIDE_DURATION,
            ease: SLIDE_EASE,
          },
          0,
        )
        .to(
          nextImage,
          {
            yPercent: 0,
            duration: SLIDE_DURATION,
            ease: SLIDE_EASE,
          },
          0,
        )
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

      return true;
    };

    const handleStepInput = (direction) => {
      if (!scrollTrigger?.isActive || isAnimating) return false;
      if (Date.now() < entryLockUntil) return true;

      if (direction > 0) {
        if (currentIndex >= LAST_INDEX) return false;
        goTo(Math.max(0, currentIndex) + 1);
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

    panels.forEach(hidePanel);
    setImagesImmediate(0);
    setThumbImmediate(0);

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

  const initMainSleepFit = () => {
    const section = document.querySelector('.main-sleep-fit');
    const viewport = section?.querySelector('.main-sleep-fit__viewport');
    const media = section?.querySelector('.main-sleep-fit__media');
    const frame = section?.querySelector('.main-sleep-fit__frame');
    const header = section?.querySelector('.main-sleep-fit__header');
    if (!section || !viewport || !media || !frame || !header) return;

    const LAST_INDEX = 1;
    const SLIDE_DURATION = 1.1;
    const SLIDE_EASE = 'power2.inOut';
    const FADE_UP_DURATION = 1.26;
    const FADE_UP_EASE = 'power3.out';
    const ENTRY_LOCK_MS = 800;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let currentIndex = 0;
    let isAnimating = false;
    let entryLockUntil = 0;
    let slideTween = null;
    let scrollTrigger = null;

    const getFullProps = () => ({
      top: 0,
      left: 0,
      width: viewport.offsetWidth,
      height: viewport.offsetHeight,
      borderRadius: '0px',
    });

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
      applyHeaderState(expanded, { animate: true });

      slideTween = gsap.timeline({
        onComplete: () => {
          isAnimating = false;
          slideTween = null;
          applyMediaState(expanded);
        },
      });

      slideTween.to(media, {
        ...(expanded ? getShrunkProps() : getFullProps()),
        duration: SLIDE_DURATION,
        ease: SLIDE_EASE,
      }, 0);

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
          0,
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
      initMainSleepFit();
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
