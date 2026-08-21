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
   */
  const initScrollFeature = ({
    sectionSelector,
    images = null,
    hotspotPositions = null,
    imageTransition = 'crossfade',
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
    let compactPrevButton = null;
    let compactNextButton = null;

    const updateCompactArrows = () => {
      if (!compactPrevButton || !compactNextButton) return;
      compactPrevButton.classList.toggle('is-hidden', currentIndex <= 0);
      compactNextButton.classList.toggle('is-hidden', currentIndex >= LAST_INDEX);
    };

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

    const ARROW_LEFT_SRC =
      '../../assets/images/about/mattress-tech/mobile/mattress-tech-research_icon_arrow_left.svg';
    const ARROW_RIGHT_SRC =
      '../../assets/images/about/mattress-tech/mobile/mattress-tech-research_icon_arrow_right.svg';

    const setupCompactNav = () => {
      if (!media || media.querySelector('.scroll-feature__media-nav')) return;

      const nav = document.createElement('div');
      nav.className = 'scroll-feature__media-nav';

      const prevButton = document.createElement('button');
      prevButton.type = 'button';
      prevButton.className = 'scroll-feature__arrow scroll-feature__arrow--prev';
      prevButton.setAttribute('aria-label', '이전 특징');
      prevButton.innerHTML = `<img src="${ARROW_LEFT_SRC}" alt="">`;

      const nextButton = document.createElement('button');
      nextButton.type = 'button';
      nextButton.className = 'scroll-feature__arrow scroll-feature__arrow--next';
      nextButton.setAttribute('aria-label', '다음 특징');
      nextButton.innerHTML = `<img src="${ARROW_RIGHT_SRC}" alt="">`;
      compactPrevButton = prevButton;
      compactNextButton = nextButton;

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

      prevButton.addEventListener('click', () => {
        if (isEntryLocked() || isTransitioning) return;
        if (currentIndex > 0) activateFeature(currentIndex - 1, true);
      });

      nextButton.addEventListener('click', () => {
        if (isEntryLocked() || isTransitioning) return;
        if (currentIndex < LAST_INDEX) activateFeature(currentIndex + 1, true);
      });

      nav.append(prevButton, nextButton);
      media.appendChild(nav);
      media.closest('.scroll-feature').appendChild(dots);
    };

    const compactMq = window.matchMedia('(max-width: 63.9375rem)');
    const isCompactView = () => compactMq.matches;
    const SWIPE_THRESHOLD = 40;
    let pointerStartX = null;
    let pointerStartY = null;

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

      const prevIndex = currentIndex;
      currentIndex = index;

      if (isCompactView()) {
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
        updateCompactArrows();

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

    const onWheel = (event) => {
      if (!pinTrigger) return;

      const goingDown = event.deltaY > 0;
      const pinActive = isSectionPinnedInView();

      if (!pinActive && !(currentIndex < LAST_INDEX && isSectionStuckInViewport())) {
        return;
      }

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

    const enableDesktopPin = () => {
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
    };

    const disableDesktopPin = () => {
      if (pinTrigger) {
        pinTrigger.kill();
        pinTrigger = null;
        ScrollTrigger.refresh();
      }
      window.removeEventListener('wheel', onWheel);
    };

    const syncPinToViewport = () => {
      if (isCompactView()) {
        disableDesktopPin();
        enableCompactTitleReveal();
        return;
      }

      disableCompactTitleReveal();
      enableDesktopPin();
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
