(() => {
  /** @type {Readonly<Record<string, number | string>>} */
  const SCROLL_FEATURE = {
    PIN_START: 'top top',
    PIN_END: '+=100%',
    ENTRY_LOCK_MS: 400,
    COOLDOWN_MS: 0,
    TRANSITION_DURATION: 1,
    FADE_OUT_RATIO: 0.55,
    IMAGE_FADE_DURATION: 0.45,
  };

  const getFadeOutDuration = () =>
    SCROLL_FEATURE.TRANSITION_DURATION * SCROLL_FEATURE.FADE_OUT_RATIO;

  /**
   * @param {object} options
   * @param {string} options.sectionSelector
   * @param {string[]|null} [options.images]
   * @param {Array<{ left: string, top: string }>|null} [options.hotspotPositions]
   */
  const initScrollFeature = ({
    sectionSelector,
    images = null,
    hotspotPositions = null,
  }) => {
    const section = document.querySelector(sectionSelector);
    if (!section) return;

    const features = Array.from(
      section.querySelectorAll('.scroll-feature__feature')
    );
    const image = section.querySelector('.scroll-feature__image');
    const hotspot = section.querySelector('.scroll-feature__hotspot');

    if (!features.length) return;
    if (images && !image) return;
    if (hotspotPositions && !hotspot) return;

    const LAST_INDEX = features.length - 1;
    let currentIndex = 0;
    let pinTrigger = null;
    let lastSwitchTime = 0;
    let entryLockUntil = 0;
    let isTransitioning = false;
    let transitionTl = null;

    const isInCooldown = () =>
      SCROLL_FEATURE.COOLDOWN_MS > 0 &&
      lastSwitchTime > 0 &&
      Date.now() - lastSwitchTime < SCROLL_FEATURE.COOLDOWN_MS;

    const isEntryLocked = () => Date.now() < entryLockUntil;

    const startEntryLock = () => {
      entryLockUntil = Date.now() + SCROLL_FEATURE.ENTRY_LOCK_MS;
    };

    const setImage = (index, animate = true) => {
      if (!images || !image) return;

      const nextSrc = images[index];
      if (!nextSrc || image.getAttribute('src') === nextSrc) return;

      if (!animate) {
        image.src = nextSrc;
        gsap.set(image, { opacity: 1 });
        return;
      }

      gsap.to(image, {
        opacity: 0,
        duration: SCROLL_FEATURE.IMAGE_FADE_DURATION,
        ease: 'power1.in',
        onComplete: () => {
          image.src = nextSrc;
          gsap.to(image, {
            opacity: 1,
            duration: SCROLL_FEATURE.IMAGE_FADE_DURATION,
            ease: 'power1.out',
          });
        },
      });
    };

    const activateFeature = (index, animate = true) => {
      if (index === currentIndex && animate) return;

      const prevIndex = currentIndex;
      currentIndex = index;

      const prevFeature = features[prevIndex];
      const nextFeature = features[index];
      const prevIndicator = prevFeature?.querySelector(
        '.scroll-feature__indicator'
      );
      const prevDesc = prevFeature?.querySelector(
        '.scroll-feature__feature-desc'
      );
      const nextIndicator = nextFeature.querySelector(
        '.scroll-feature__indicator'
      );
      const nextDesc = nextFeature.querySelector(
        '.scroll-feature__feature-desc'
      );
      const hotspotPos = hotspotPositions?.[index];

      if (!animate) {
        features.forEach((feature, i) => {
          const isActive = i === index;
          feature.classList.toggle('is-active', isActive);

          const indicator = feature.querySelector(
            '.scroll-feature__indicator'
          );
          const desc = feature.querySelector('.scroll-feature__feature-desc');

          if (indicator) gsap.set(indicator, { opacity: isActive ? 1 : 0 });
          if (desc) {
            desc.hidden = !isActive;
            gsap.set(desc, { opacity: isActive ? 1 : 0, y: 0 });
          }
        });

        setImage(index, false);
        if (hotspotPos && hotspot) {
          gsap.set(hotspot, { left: hotspotPos.left, top: hotspotPos.top });
        }
        lastSwitchTime = 0;
        isTransitioning = false;
        return;
      }

      if (transitionTl) {
        transitionTl.kill();
        transitionTl = null;
      }

      isTransitioning = true;
      setImage(index, true);

      const fadeOutDuration = getFadeOutDuration();

      transitionTl = gsap.timeline({
        onComplete: () => {
          isTransitioning = false;
          transitionTl = null;
          lastSwitchTime = Date.now();
        },
      });

      if (prevFeature && prevIndex !== index) {
        prevFeature.classList.remove('is-active');

        if (prevIndicator) {
          transitionTl.to(
            prevIndicator,
            {
              opacity: 0,
              duration: fadeOutDuration,
              ease: 'power2.in',
            },
            0
          );
        }

        if (prevDesc) {
          transitionTl.to(
            prevDesc,
            {
              opacity: 0,
              y: -8,
              duration: fadeOutDuration,
              ease: 'power2.in',
              onComplete: () => {
                prevDesc.hidden = true;
                gsap.set(prevDesc, { y: 0 });
              },
            },
            0
          );
        }

        if (!prevIndicator && !prevDesc) {
          transitionTl.to({}, { duration: fadeOutDuration });
        }
      }

      transitionTl.add(() => {
        features.forEach((feature, i) => {
          feature.classList.toggle('is-active', i === index);
        });

        if (nextDesc) {
          nextDesc.hidden = false;
        }
      });

      if (nextDesc) {
        transitionTl.fromTo(
          nextDesc,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: SCROLL_FEATURE.TRANSITION_DURATION,
            ease: 'power2.out',
          }
        );
      }

      if (nextIndicator) {
        transitionTl.to(
          nextIndicator,
          {
            opacity: 1,
            duration: SCROLL_FEATURE.TRANSITION_DURATION,
            ease: 'power2.out',
          },
          nextDesc ? '<' : '>'
        );
      }

      if (hotspotPos && hotspot) {
        transitionTl.to(
          hotspot,
          {
            left: hotspotPos.left,
            top: hotspotPos.top,
            duration: SCROLL_FEATURE.TRANSITION_DURATION,
            ease: 'power2.inOut',
          },
          nextDesc || nextIndicator ? '<' : '>'
        );
      }
    };

    activateFeature(0, false);

    const onWheel = (event) => {
      if (!pinTrigger || !pinTrigger.isActive) return;

      const goingDown = event.deltaY > 0;

      if (isEntryLocked()) {
        event.preventDefault();
        return;
      }

      if (isTransitioning) {
        event.preventDefault();
        return;
      }

      /* 첫 특징 + 위로 → pin 해제, 자연 스크롤 */
      if (!goingDown && currentIndex === 0) {
        return;
      }

      /* 마지막 특징 + 아래로 → pin 해제, 자연 스크롤 */
      if (goingDown && currentIndex === LAST_INDEX) {
        if (isInCooldown()) {
          event.preventDefault();
        }
        return;
      }

      event.preventDefault();
      if (isInCooldown()) return;

      activateFeature(goingDown ? currentIndex + 1 : currentIndex - 1, true);
    };

    pinTrigger = ScrollTrigger.create({
      trigger: section,
      start: SCROLL_FEATURE.PIN_START,
      end: SCROLL_FEATURE.PIN_END,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onEnter: () => {
        activateFeature(0, false);
        startEntryLock();
      },
      onEnterBack: () => {
        activateFeature(LAST_INDEX, false);
        startEntryLock();
      },
    });

    window.addEventListener('wheel', onWheel, { passive: false });

    return pinTrigger;
  };

  window.initScrollFeature = initScrollFeature;
  window.SCROLL_FEATURE = SCROLL_FEATURE;
})();
