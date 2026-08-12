(() => {
  const SLEEP_POSITION_IMAGES = [
    '../../assets/images/about/pillow-tech/pillow-tech-sleep-position_img01.webp',
    '../../assets/images/about/pillow-tech/pillow-tech-sleep-position_img02.webp',
    '../../assets/images/about/pillow-tech/pillow-tech-sleep-position_img03.webp',
  ];

  const initPillowTechHero = () => {
    const hero = document.querySelector('.pillow-tech-hero');
    if (!hero) return;

    const image = hero.querySelector('.pillow-tech-hero__image');
    const overlay = hero.querySelector('.pillow-tech-hero__overlay');
    const content = hero.querySelector('.pillow-tech-hero__content');
    if (!image || !overlay || !content) return;

    gsap.set(overlay, { opacity: 0 });
    gsap.set(content, { opacity: 0 });
    gsap.set(image, { scale: 1 });

    gsap.to(overlay, {
      opacity: 0.3,
      duration: 0.5,
      delay: 0.5,
      ease: 'power1.out',
    });

    gsap.to(content, {
      opacity: 1,
      duration: 1,
      delay: 1,
      ease: 'power1.out',
    });

    gsap.to(image, {
      scale: 1.05,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * 0.2)}`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  };

  const initPillowTechSleepPosition = () => {
    const section = document.querySelector('.pillow-tech-sleep-position');
    if (!section) return;

    const tabs = Array.from(
      section.querySelectorAll('.pillow-tech-sleep-position__tab')
    );
    const panels = Array.from(
      section.querySelectorAll('.pillow-tech-sleep-position__panel-item')
    );
    const image = section.querySelector('.pillow-tech-sleep-position__image');
    if (!tabs.length || !panels.length || !image) return;

    const activateTab = (index) => {
      tabs.forEach((tab, tabIndex) => {
        const isActive = tabIndex === index;
        tab.classList.toggle('is-selected', isActive);
        tab.setAttribute('aria-selected', String(isActive));
      });

      panels.forEach((panel, panelIndex) => {
        const isActive = panelIndex === index;
        panel.classList.toggle('is-active', isActive);
        panel.hidden = !isActive;
      });

      image.src = SLEEP_POSITION_IMAGES[index];
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const index = Number(tab.dataset.index);
        if (Number.isNaN(index)) return;
        activateTab(index);
      });
    });
  };

  const HOTSPOT_POSITIONS = [
    { left: '32%', top: '62%' }, /* 01 경추 지지 곡선 — 좌측 볼록 */
    { left: '60%', top: '75%' }, /* 02 머리 안착 존 — 중앙 홈 */
    { left: '90%', top: '58%' }, /* 03 압력 분산 구조 — 우측 볼록 */
  ];

  const STRUCTURE_TRANSITION_DURATION = 0.75;

  const initPillowTechStructure = () => {
    const section = document.querySelector('.pillow-tech-structure');
    if (!section) return;

    const features = Array.from(
      section.querySelectorAll('.pillow-tech-structure__feature')
    );
    const hotspot = section.querySelector('.pillow-tech-structure__hotspot');
    if (!features.length || !hotspot) return;

    const LAST_FEATURE_INDEX = features.length - 1;
    let currentIndex = 0;
    let isLocked = false;
    let isAnimating = false;
    let pinTrigger = null;
    let transitionTl = null;

    const nextSection = document.querySelector('.pillow-tech-zones');

    const getNextSectionTop = () => {
      if (!nextSection) return 0;
      return nextSection.getBoundingClientRect().top + window.pageYOffset;
    };

    const unlockAndGoNext = () => {
      isLocked = false;
      isAnimating = false;

      if (pinTrigger) {
        pinTrigger.kill(true);
        pinTrigger = null;
      }

      ScrollTrigger.refresh();
      if (nextSection) {
        window.scrollTo(0, getNextSectionTop());
      }
    };

    const getFeatureElements = (feature) => ({
      indicator: feature.querySelector('.pillow-tech-structure__indicator'),
      desc: feature.querySelector('.pillow-tech-structure__feature-desc'),
    });

    const setHotspotPosition = (index, { animate = false } = {}) => {
      const position = HOTSPOT_POSITIONS[index];
      if (!position) return;

      if (animate) {
        gsap.to(hotspot, {
          left: position.left,
          top: position.top,
          opacity: 1,
          duration: STRUCTURE_TRANSITION_DURATION,
          ease: 'power2.inOut',
        });
        return;
      }

      gsap.set(hotspot, {
        left: position.left,
        top: position.top,
        opacity: 1,
      });
    };

    const applyFeatureState = (index, { animate = false, unlockOnComplete = null } = {}) => {
      if (transitionTl) {
        transitionTl.kill();
        transitionTl = null;
      }

      if (!animate || index === currentIndex) {
        isAnimating = false;
        currentIndex = index;

        features.forEach((feature, featureIndex) => {
          const isActive = featureIndex === index;
          const { indicator, desc } = getFeatureElements(feature);

          feature.classList.toggle('is-active', isActive);

          if (indicator) {
            gsap.set(indicator, { opacity: isActive ? 1 : 0 });
          }

          if (desc && !desc.textContent.trim()) return;

          if (desc) {
            desc.hidden = !isActive;
            gsap.set(desc, {
              opacity: isActive ? 1 : 0,
              y: 0,
              clearProps: 'transform',
            });
          }
        });

        setHotspotPosition(index);
        return;
      }

      isAnimating = true;
      const prevIndex = currentIndex;
      const prevFeature = features[prevIndex];
      const nextFeature = features[nextIndex];
      const prevEls = getFeatureElements(prevFeature);
      const nextEls = getFeatureElements(nextFeature);

      features.forEach((feature, featureIndex) => {
        feature.classList.toggle('is-active', featureIndex === index);
      });

      transitionTl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => {
          currentIndex = index;
          isAnimating = false;
          transitionTl = null;

          if (prevEls.desc) {
            prevEls.desc.hidden = true;
            gsap.set(prevEls.desc, { clearProps: 'transform' });
          }

          if (typeof unlockOnComplete === 'function') {
            unlockOnComplete();
          }
        },
      });

      if (prevEls.indicator) {
        transitionTl.to(
          prevEls.indicator,
          { opacity: 0, duration: STRUCTURE_TRANSITION_DURATION * 0.45, ease: 'power2.in' },
          0
        );
      }

      if (nextEls.indicator) {
        gsap.set(nextEls.indicator, { opacity: 0 });
        transitionTl.to(
          nextEls.indicator,
          { opacity: 1, duration: STRUCTURE_TRANSITION_DURATION * 0.55, ease: 'power2.out' },
          STRUCTURE_TRANSITION_DURATION * 0.25
        );
      }

      setHotspotPosition(index, { animate: true });

      if (prevEls.desc && prevEls.desc.textContent.trim()) {
        transitionTl.to(
          prevEls.desc,
          {
            opacity: 0,
            y: -10,
            duration: STRUCTURE_TRANSITION_DURATION * 0.45,
            ease: 'power2.in',
          },
          0
        );
      }

      if (nextEls.desc && nextEls.desc.textContent.trim()) {
        nextEls.desc.hidden = false;
        gsap.set(nextEls.desc, { opacity: 0, y: 14 });

        transitionTl.to(
          nextEls.desc,
          {
            opacity: 1,
            y: 0,
            duration: STRUCTURE_TRANSITION_DURATION * 0.6,
            ease: 'power2.out',
          },
          STRUCTURE_TRANSITION_DURATION * 0.3
        );
      }
    };

    const activate = (startIndex) => {
      isLocked = true;
      applyFeatureState(startIndex);
    };

    const deactivate = () => {
      isLocked = false;
      isAnimating = false;
      if (transitionTl) {
        transitionTl.kill();
        transitionTl = null;
      }
    };

    const finishForward = () => {
      isLocked = false;
    };

    const finishBackward = () => {
      isLocked = false;
    };

    const onWheel = (event) => {
      if (!pinTrigger) return;

      if (isAnimating) {
        event.preventDefault();
        return;
      }

      if (!isLocked) return;

      const goingDown = event.deltaY > 0;

      if (goingDown && currentIndex === LAST_FEATURE_INDEX) {
        finishForward();
        return;
      }

      if (!goingDown && currentIndex === 0) {
        finishBackward();
        return;
      }

      event.preventDefault();

      if (goingDown) {
        const nextIndex = currentIndex + 1;
        applyFeatureState(nextIndex, {
          animate: true,
          unlockOnComplete: nextIndex === LAST_FEATURE_INDEX ? unlockAndGoNext : null,
        });
        return;
      }

      applyFeatureState(currentIndex - 1, { animate: true });
    };

    features.forEach((feature, featureIndex) => {
      const { indicator, desc } = getFeatureElements(feature);
      const isActive = featureIndex === 0;

      feature.classList.toggle('is-active', isActive);

      if (indicator) {
        gsap.set(indicator, { opacity: isActive ? 1 : 0 });
      }

      if (desc && desc.textContent.trim()) {
        desc.hidden = !isActive;
        gsap.set(desc, { opacity: isActive ? 1 : 0, y: 0 });
      }
    });

    setHotspotPosition(0);

    pinTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=100%',
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onEnter: () => activate(0),
      onEnterBack: () => activate(LAST_FEATURE_INDEX),
      onLeave: deactivate,
      onLeaveBack: deactivate,
    });

    section.addEventListener('wheel', onWheel, { passive: false });
  };

  const start = () => {
    const init = () => {
      initPillowTechHero();
      initPillowTechSleepPosition();
      initPillowTechStructure();
      ScrollTrigger.refresh();
    };

    if (!window.equilLibsReady) {
      init();
      return;
    }

    window.equilLibsReady.then(init).catch((error) => {
      console.error('[pillow-tech] GSAP init failed:', error);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
