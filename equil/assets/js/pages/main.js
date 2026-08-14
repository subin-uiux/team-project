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

      const targetY = getScrollYForStep(safeStep);
      if (immediate) {
        window.scrollTo(0, targetY);
      }

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

  const start = () => {
    const init = () => {
      initMainScroll();
      ScrollTrigger.refresh();
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
