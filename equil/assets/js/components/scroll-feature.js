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
   * @param {'fade'|'crossfade'|'none'} [options.imageTransition]
   * @param {boolean} [options.pinOnCompact] 모바일·태블릿에서도 pin + 세로 슬라이드 전환
   */
  const initScrollFeature = ({
    sectionSelector,
    images = null,
    hotspotPositions = null,
    imageTransition = 'crossfade',
    pinOnCompact = false,
  }) => {
    const section = document.querySelector(sectionSelector);
    if (!section) return;

    const features = Array.from(
      section.querySelectorAll('.scroll-feature__feature')
    );
    const image = section.querySelector('.scroll-feature__image');
    const media = section.querySelector('.scroll-feature__media');
    const hotspot = section.querySelector('.scroll-feature__hotspot');

    if (!features.length) return;
    if (images && !image) return;
    if (hotspotPositions && !hotspot) return;

    const LAST_INDEX = features.length - 1;
    const IMAGE_CROSSFADE_DURATION = 0.6;
    const PIN_SCROLL_END = SCROLL_FEATURE.PIN_END;
    let currentIndex = 0;
    let pinTrigger = null;
    let lastSwitchTime = 0;
    let entryLockUntil = 0;
    let isTransitioning = false;
    let transitionTl = null;
    let imageTween = null;
    let revealImage = null;

    const isInCooldown = () =>
      SCROLL_FEATURE.COOLDOWN_MS > 0 &&
      lastSwitchTime > 0 &&
      Date.now() - lastSwitchTime < SCROLL_FEATURE.COOLDOWN_MS;

    const isEntryLocked = () => Date.now() < entryLockUntil;

    const startEntryLock = () => {
      entryLockUntil = Date.now() + SCROLL_FEATURE.ENTRY_LOCK_MS;
    };

    const cleanupRevealImage = () => {
      if (revealImage) {
        revealImage.remove();
        revealImage = null;
      }
    };

    const setImage = (index, animate = true) => {
      if (!images || !image) return;

      const nextSrc = images[index];
      if (!nextSrc || image.getAttribute('src') === nextSrc) return;

      const mode = animate ? imageTransition : 'none';

      if (imageTween) {
        imageTween.kill();
        imageTween = null;
      }
      cleanupRevealImage();

      if (mode === 'none') {
        image.src = nextSrc;
        gsap.set(image, { opacity: 1 });
        return;
      }

      if (mode === 'crossfade' && media) {
        const nextReveal = document.createElement('img');
        nextReveal.className =
          'scroll-feature__image scroll-feature__image--reveal';
        nextReveal.alt = image.alt || '';
        nextReveal.src = nextSrc;
        revealImage = nextReveal;

        const startCrossfade = () => {
          if (revealImage !== nextReveal) return;

          media.appendChild(nextReveal);
          gsap.set(nextReveal, { opacity: 0 });
          imageTween = gsap.to(nextReveal, {
            opacity: 1,
            duration: IMAGE_CROSSFADE_DURATION,
            ease: 'power1.inOut',
            onComplete: () => {
              image.src = nextSrc;
              gsap.set(image, { opacity: 1 });
              cleanupRevealImage();
              imageTween = null;
            },
          });
        };

        if (nextReveal.complete) {
          startCrossfade();
        } else {
          nextReveal.addEventListener('load', startCrossfade, { once: true });
        }
        return;
      }

      gsap.to(image, {
        opacity: 0,
        duration: SCROLL_FEATURE.IMAGE_FADE_DURATION,
        ease: 'power1.in',
        onComplete: () => {
          image.src = nextSrc;
          imageTween = gsap.to(image, {
            opacity: 1,
            duration: SCROLL_FEATURE.IMAGE_FADE_DURATION,
            ease: 'power1.out',
            onComplete: () => {
              imageTween = null;
            },
          });
        },
      });
    };

    const updateDots = (index) => {
      section.querySelectorAll('.scroll-feature__dot').forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    const setupCompactNav = () => {
      if (!media || media.querySelector('.scroll-feature__dots')) return;

      const dots = document.createElement('div');
      dots.className = 'scroll-feature__dots';
      dots.setAttribute('role', 'tablist');
      dots.setAttribute('aria-label', '특징 슬라이드');

      features.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'scroll-feature__dot';
        if (index === 0) dot.classList.add('is-active');
        dot.setAttribute('aria-label', `${index + 1}번째 특징`);
        dot.addEventListener('click', () => {
          if (isEntryLocked() || isTransitioning) return;
          activateFeature(index, true);
        });
        dots.appendChild(dot);
      });

      media.closest('.scroll-feature').appendChild(dots);
    };

    const compactMq = window.matchMedia('(max-width: 63.9375rem)');
    const isCompactView = () => compactMq.matches;
    const shouldPin = () => !isCompactView() || pinOnCompact;
    const SWIPE_THRESHOLD = 40;
    let pointerStartX = null;
    let pointerStartY = null;
    let touchStartY = null;
    let touchGestureHandled = false;

    const setupCompactSwipe = () => {
      const root = section.querySelector('.scroll-feature');
      if (!root) return;

      root.addEventListener('pointerdown', (event) => {
        if (!isCompactView()) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
      });

      const endSwipe = (event) => {
        if (!isCompactView() || pointerStartX === null) return;

        const deltaX = event.clientX - pointerStartX;
        const deltaY = event.clientY - pointerStartY;
        pointerStartX = null;
        pointerStartY = null;

        if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
        if (Math.abs(deltaX) <= Math.abs(deltaY)) return;
        if (isEntryLocked() || isTransitioning) return;

        if (deltaX < 0 && currentIndex < LAST_INDEX) {
          activateFeature(currentIndex + 1, true);
          return;
        }

        if (deltaX > 0 && currentIndex > 0) {
          activateFeature(currentIndex - 1, true);
        }
      };

      root.addEventListener('pointerup', endSwipe);
      root.addEventListener('pointercancel', () => {
        pointerStartX = null;
        pointerStartY = null;
      });
    };

    const activateFeature = (index, animate = true) => {
      if (index === currentIndex && animate) return;
      if (animate && isTransitioning) return;

      const prevIndex = currentIndex;
      currentIndex = index;

      /* 스와이프 전용 컴팩트(비-pin): 즉시 전환. pinOnCompact면 PC와 동일하게 잠금+애니 */
      if (isCompactView() && !pinOnCompact) {
        features.forEach((feature, i) => {
          const isActive = i === index;
          feature.classList.toggle('is-active', isActive);

          const desc = feature.querySelector('.scroll-feature__feature-desc');
          if (!desc) return;

          desc.hidden = false;
          gsap.set(desc, { opacity: 1, y: 0 });
        });
        setImage(index, animate);
        updateDots(index);

        const hotspotPos = hotspotPositions?.[index];
        if (hotspotPos && hotspot) {
          if (animate) {
            gsap.to(hotspot, {
              left: hotspotPos.left,
              top: hotspotPos.top,
              duration: SCROLL_FEATURE.TRANSITION_DURATION,
              ease: 'power2.inOut',
            });
          } else {
            gsap.set(hotspot, {
              left: hotspotPos.left,
              top: hotspotPos.top,
            });
          }
        }
        return;
      }

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
        updateDots(index);
        return;
      }

      if (transitionTl) {
        transitionTl.kill();
        transitionTl = null;
      }

      isTransitioning = true;
      setImage(index, true);
      updateDots(index);

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
          gsap.set(nextDesc, { opacity: 0, y: 12 });
        }
      });

      if (nextDesc) {
        transitionTl.to(
          nextDesc,
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

    setupCompactNav();
    setupCompactSwipe();
    activateFeature(0, false);

    const splitTitleChars = (title) => {
      const existing = title.querySelectorAll('.scroll-feature__char');
      if (existing.length) return Array.from(existing);

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
            span.className = 'scroll-feature__char';
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

      Array.from(title.childNodes).forEach(walk);
      return Array.from(title.querySelectorAll('.scroll-feature__char'));
    };

    const revealTitle = () => {
      const title = section.querySelector('.scroll-feature__title--ko');
      if (!title || title.dataset.revealed === 'true') return;

      const chars = splitTitleChars(title);
      if (!chars.length) return;

      title.dataset.revealed = 'true';
      const charStagger =
        1.26 / Math.max(chars.length * 2.5, 1);

      gsap.killTweensOf(chars);
      gsap.set(chars, { opacity: 0, y: 40 });
      gsap.to(chars, {
        opacity: 1,
        y: 0,
        duration: 1.26,
        ease: 'power3.out',
        stagger: chars.length > 1 ? charStagger : 0,
        onComplete: () => {
          gsap.set(chars, { clearProps: 'will-change' });
        },
      });
    };

    let titleRevealTrigger = null;

    const enableCompactTitleReveal = () => {
      if (titleRevealTrigger) return;

      titleRevealTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top 90%',
        once: true,
        onEnter: revealTitle,
      });
    };

    const disableCompactTitleReveal = () => {
      if (!titleRevealTrigger) return;
      titleRevealTrigger.kill();
      titleRevealTrigger = null;
    };

    const isSectionPinnedInView = () => {
      if (!pinTrigger?.isActive) return false;
      return true;
    };

    const isSectionStuckInViewport = () => {
      const rect = section.getBoundingClientRect();
      return rect.top <= 0.5 && rect.bottom >= window.innerHeight - 0.5;
    };

    const canCapturePinNav = () => {
      if (!pinTrigger) return false;
      return (
        isSectionPinnedInView() ||
        (currentIndex < LAST_INDEX && isSectionStuckInViewport())
      );
    };

    const navigateByDirection = (goingDown) => {
      if (isEntryLocked() || isTransitioning || isInCooldown()) return false;

      if (goingDown && currentIndex < LAST_INDEX) {
        activateFeature(currentIndex + 1, true);
        return true;
      }

      if (!goingDown && currentIndex > 0) {
        activateFeature(currentIndex - 1, true);
        return true;
      }

      return false;
    };

    const onWheel = (event) => {
      if (!canCapturePinNav()) return;

      const goingDown = event.deltaY > 0;

      if (isEntryLocked()) {
        event.preventDefault();
        return;
      }

      if (isTransitioning) {
        event.preventDefault();
        return;
      }

      if (goingDown && currentIndex < LAST_INDEX) {
        event.preventDefault();
        if (isInCooldown()) return;
        activateFeature(currentIndex + 1, true);
        return;
      }

      if (!goingDown && currentIndex === 0) {
        return;
      }

      if (!goingDown && currentIndex > 0) {
        event.preventDefault();
        if (isInCooldown()) return;
        activateFeature(currentIndex - 1, true);
      }
    };

    const onTouchStart = (event) => {
      if (!canCapturePinNav() || !event.touches?.length) return;
      touchStartY = event.touches[0].clientY;
      touchGestureHandled = false;
    };

    const onTouchMove = (event) => {
      if (touchStartY === null || !canCapturePinNav() || !event.touches?.length) {
        return;
      }

      const deltaY = event.touches[0].clientY - touchStartY;
      const goingDown = deltaY < 0;
      const goingUp = deltaY > 0;

      if (isEntryLocked() || isTransitioning) {
        event.preventDefault();
        return;
      }

      if (goingDown && currentIndex >= LAST_INDEX) return;
      if (goingUp && currentIndex <= 0) return;

      if (
        (goingDown && currentIndex < LAST_INDEX) ||
        (goingUp && currentIndex > 0)
      ) {
        event.preventDefault();

        if (touchGestureHandled) return;
        if (Math.abs(deltaY) < SWIPE_THRESHOLD) return;

        touchGestureHandled = true;
        navigateByDirection(goingDown);
      }
    };

    const onTouchEnd = () => {
      touchStartY = null;
      touchGestureHandled = false;
    };

    const enablePin = () => {
      if (pinTrigger) return;

      pinTrigger = ScrollTrigger.create({
        trigger: section,
        start: SCROLL_FEATURE.PIN_START,
        end: PIN_SCROLL_END,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onEnter: () => {
          activateFeature(0, false);
          startEntryLock();
          revealTitle();
        },
        onEnterBack: () => {
          activateFeature(LAST_INDEX, false);
          startEntryLock();
          revealTitle();
        },
      });

      window.addEventListener('wheel', onWheel, { passive: false });
      section.addEventListener('touchstart', onTouchStart, { passive: true });
      section.addEventListener('touchmove', onTouchMove, { passive: false });
      section.addEventListener('touchend', onTouchEnd, { passive: true });
      section.addEventListener('touchcancel', onTouchEnd, { passive: true });
    };

    const disablePin = () => {
      if (pinTrigger) {
        pinTrigger.kill();
        pinTrigger = null;
        ScrollTrigger.refresh();
      }
      window.removeEventListener('wheel', onWheel);
      section.removeEventListener('touchstart', onTouchStart);
      section.removeEventListener('touchmove', onTouchMove);
      section.removeEventListener('touchend', onTouchEnd);
      section.removeEventListener('touchcancel', onTouchEnd);
      touchStartY = null;
      touchGestureHandled = false;
    };

    const syncPinToViewport = () => {
      if (shouldPin()) {
        disableCompactTitleReveal();
        enablePin();
        return;
      }

      disablePin();
      enableCompactTitleReveal();
    };

    syncPinToViewport();
    if (compactMq.addEventListener) {
      compactMq.addEventListener('change', syncPinToViewport);
    } else {
      compactMq.addListener(syncPinToViewport);
    }

    return pinTrigger;
  };

  window.initScrollFeature = initScrollFeature;
  window.SCROLL_FEATURE = SCROLL_FEATURE;
})();
