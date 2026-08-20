(() => {
  const FADE_UP_DURATION = 1.26;

  const splitTextChars = (element, charClass) => {
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

  const initFadeUp = (trigger, elements, charClass) => {
    const allChars = elements.flatMap((element) =>
      splitTextChars(element, charClass)
    );
    if (!allChars.length) return;

    const charStagger =
      FADE_UP_DURATION / Math.max(allChars.length * 2.5, 1);

    gsap.set(allChars, { opacity: 0, y: 40 });

    gsap.to(allChars, {
      opacity: 1,
      y: 0,
      duration: FADE_UP_DURATION,
      ease: 'power3.out',
      stagger: allChars.length > 1 ? charStagger : 0,
      scrollTrigger: {
        trigger,
        start: 'top 90%',
        once: true,
      },
      onComplete: () => {
        gsap.set(allChars, { clearProps: 'will-change' });
      },
    });
  };

  const initHeatingMatTechHero = () => {
    if (typeof window.initTechHero !== 'function') return;
    window.initTechHero('heating-mat-tech-hero');
  };

  const initHeatingMatTechProductOverview = () => {
    const section = document.querySelector('.heating-mat-tech-product-overview');
    if (!section) return;

    const title = section.querySelector('.heating-mat-tech-product-overview__title');
    const desc = section.querySelector('.heating-mat-tech-product-overview__desc');
    if (!title || !desc) return;

    const TITLE_FADE_UP_DURATION = 1.6;
    const charClass = 'heating-mat-tech-product-overview__char';
    const titleChars = splitTextChars(title, charClass);
    const descChars = splitTextChars(desc, charClass);
    if (!titleChars.length && !descChars.length) return;

    const titleStagger =
      TITLE_FADE_UP_DURATION / Math.max(titleChars.length * 2.5, 1);
    const descStagger =
      FADE_UP_DURATION / Math.max(descChars.length * 2.5, 1);

    let pinTrigger = null;
    let fadeTl = null;
    let hasPlayed = false;
    let hasCompleted = false;

    const setInitialVisualState = () => {
      gsap.set([...titleChars, ...descChars], { opacity: 0, y: 40 });
    };

    const setFinalVisualState = () => {
      if (fadeTl) {
        fadeTl.kill();
        fadeTl = null;
      }

      gsap.set([...titleChars, ...descChars], {
        opacity: 1,
        y: 0,
        clearProps: 'will-change',
      });
    };

    const holdAtPinStart = () => {
      if (!pinTrigger || hasCompleted) return;
      pinTrigger.scroll(pinTrigger.start);
    };

    const releasePinForNaturalScroll = () => {
      if (!pinTrigger) return;

      const scrollY = window.scrollY;
      const beforeTop = section.getBoundingClientRect().top;

      pinTrigger.kill(true);
      pinTrigger = null;
      ScrollTrigger.refresh();

      const afterTop = section.getBoundingClientRect().top;
      window.scrollTo(0, scrollY + (afterTop - beforeTop));
      window.removeEventListener('wheel', onWheel);
    };

    const playFadeUp = () => {
      if (hasPlayed || hasCompleted) return;
      hasPlayed = true;
      setInitialVisualState();

      fadeTl = gsap.timeline({
        onComplete: () => {
          hasCompleted = true;
          gsap.set([...titleChars, ...descChars], { clearProps: 'will-change' });
          releasePinForNaturalScroll();
        },
      });

      if (titleChars.length) {
        fadeTl.to(titleChars, {
          opacity: 1,
          y: 0,
          duration: TITLE_FADE_UP_DURATION,
          ease: 'power3.out',
          stagger: titleChars.length > 1 ? titleStagger : 0,
        });
      }

      if (descChars.length) {
        fadeTl.to(descChars, {
          opacity: 1,
          y: 0,
          duration: FADE_UP_DURATION,
          ease: 'power3.out',
          stagger: descChars.length > 1 ? descStagger : 0,
        });
      }
    };

    const onWheel = (event) => {
      if (hasCompleted || !pinTrigger) return;
      if (event.deltaY <= 0) return;

      const isPinned = pinTrigger.isActive;
      const approaching = section.getBoundingClientRect().top <= 1;
      if (!isPinned && !approaching) return;

      event.preventDefault();
      holdAtPinStart();
      playFadeUp();
    };

    setInitialVisualState();

    pinTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=1',
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onEnter: () => {
        if (hasCompleted) {
          setFinalVisualState();
          return;
        }

        playFadeUp();
        holdAtPinStart();
      },
      onEnterBack: () => {
        if (hasCompleted) {
          setFinalVisualState();
        }
      },
      onLeave: (self) => {
        if (hasCompleted) return;
        self.scroll(self.start);
        playFadeUp();
      },
      onUpdate: (self) => {
        if (hasCompleted) return;
        if (self.scroll() > self.start) {
          self.scroll(self.start);
        }
      },
    });

    window.addEventListener('wheel', onWheel, { passive: false });

    const refreshWhenReady = () => {
      if (hasCompleted) return;
      ScrollTrigger.refresh();
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(refreshWhenReady);
    });

    if (document.fonts?.ready) {
      document.fonts.ready.then(refreshWhenReady);
    }

    window.addEventListener('load', refreshWhenReady, { once: true });
  };

  const PRODUCT_IMAGES = [
    '../../assets/images/about/heating-mat-tech/heating-mat-tech-product_img01.webp',
    '../../assets/images/about/heating-mat-tech/heating-mat-tech-product_img02.webp',
    '../../assets/images/about/heating-mat-tech/heating-mat-tech-product_img03.webp',
  ];

  const initHeatingMatTechProduct = () => {
    window.initScrollFeature({
      sectionSelector: '.heating-mat-tech-product',
      images: PRODUCT_IMAGES,
    });
  };

  const initHeatingMatTechTechnology = () => {
    const section = document.querySelector('.heating-mat-tech-technology');
    if (!section) return;

    const sticky = section.querySelector('.heating-mat-tech-technology__sticky');
    const intro = section.querySelector('.heating-mat-tech-technology__intro');
    const introFrame = section.querySelector(
      '.heating-mat-tech-technology__intro-frame'
    );
    const content = section.querySelector('.heating-mat-tech-technology__content');
    const swiperEl = section.querySelector('.heating-mat-tech-technology__swiper');
    const trackEl = section.querySelector(
      '.heating-mat-tech-technology__swiper .swiper-wrapper'
    );
    const copyItems = Array.from(
      section.querySelectorAll('.heating-mat-tech-technology__copy-item')
    );
    const prevEl = section.querySelector(
      '.heating-mat-tech-technology__nav--prev'
    );
    const nextEl = section.querySelector(
      '.heating-mat-tech-technology__nav--next'
    );
    const paginationEl = section.querySelector(
      '.heating-mat-tech-technology__pagination'
    );

    if (
      !sticky ||
      !intro ||
      !introFrame ||
      !content ||
      !swiperEl ||
      !trackEl ||
      !copyItems.length
    ) {
      return;
    }

    const SHRINK_PORTION = 0.45;
    const COOLDOWN_MS = 1000;
    const ENTRY_LOCK_MS = 800;

    let pinTrigger = null;
    let currentIndex = 0;
    let lastSwitchTime = 0;
    let entryLockUntil = 0;
    let isSliding = false;
    let introComplete = false;
    let slideTimer = null;

    const SLIDE_SPEED = 900;
    const slides = Array.from(swiperEl.querySelectorAll('.swiper-slide'));
    const swiperArea = section.querySelector(
      '.heating-mat-tech-technology__swiper-area'
    );
    const compactMq = window.matchMedia('(max-width: 63.9375rem)');
    const isCompactView = () => compactMq.matches;

    const CIRCLE_ACTIVE = 600;
    const CIRCLE_OFFSET_Y = 60;

    const getCircleSize = () => {
      if (isCompactView() && swiperArea) {
        return swiperArea.clientWidth || CIRCLE_ACTIVE;
      }
      return CIRCLE_ACTIVE;
    };

    const getCircleTarget = () => {
      const stickyRect = sticky.getBoundingClientRect();

      if (isCompactView() && swiperArea) {
        const mediaRect = swiperArea.getBoundingClientRect();
        return {
          x: mediaRect.left - stickyRect.left + mediaRect.width / 2,
          y: mediaRect.top - stickyRect.top + mediaRect.height / 2,
          width: stickyRect.width,
          height: stickyRect.height,
        };
      }

      return {
        x: stickyRect.width / 2,
        y: stickyRect.height / 2 - CIRCLE_OFFSET_Y,
        width: stickyRect.width,
        height: stickyRect.height,
      };
    };

    const getCoverCircleSize = (target) => {
      const distances = [
        Math.hypot(target.x, target.y),
        Math.hypot(target.x - target.width, target.y),
        Math.hypot(target.x, target.y - target.height),
        Math.hypot(target.x - target.width, target.y - target.height),
      ];

      return Math.max(...distances) * 2;
    };

    const updateIntroFrame = (progress) => {
      const size = getCircleSize();
      const target = getCircleTarget();
      const p = gsap.utils.clamp(0, 1, progress);
      const coverSize = getCoverCircleSize(target);
      const currentSize = gsap.utils.interpolate(coverSize, size, p);

      gsap.set(introFrame, {
        width: currentSize,
        height: currentSize,
        left: target.x - currentSize / 2,
        top: target.y - currentSize / 2,
        borderRadius: '50%',
      });
    };

    const setActiveCopy = (index) => {
      copyItems.forEach((item, i) => {
        const isActive = i === index;
        item.classList.toggle('is-active', isActive);
        item.hidden = !isActive;
      });
      playCopyItemFadeUp(copyItems[index]);
    };

    const COPY_CHAR_CLASS = 'heating-mat-tech-technology__char';
    const copyItemChars = new WeakMap();
    let copyFadeTl = null;

    const getCopyItemChars = (item) => {
      if (!item) return [];
      if (copyItemChars.has(item)) return copyItemChars.get(item);

      const title = item.querySelector('.heating-mat-tech-technology__title');
      const desc = item.querySelector('.heating-mat-tech-technology__desc');
      const chars = [
        ...(title ? splitTextChars(title, COPY_CHAR_CLASS) : []),
        ...(desc ? splitTextChars(desc, COPY_CHAR_CLASS) : []),
      ];
      copyItemChars.set(item, chars);
      return chars;
    };

    const playCopyItemFadeUp = (item) => {
      if (!item || !content.classList.contains('is-visible')) return;

      const chars = getCopyItemChars(item);
      if (!chars.length) return;

      if (copyFadeTl) {
        copyFadeTl.kill();
        copyFadeTl = null;
      }

      const charStagger =
        FADE_UP_DURATION / Math.max(chars.length * 2.5, 1);

      gsap.set(chars, { opacity: 0, y: 40, willChange: 'transform, opacity' });

      copyFadeTl = gsap.to(chars, {
        opacity: 1,
        y: 0,
        duration: FADE_UP_DURATION,
        ease: 'power3.out',
        stagger: chars.length > 1 ? charStagger : 0,
        onComplete: () => {
          gsap.set(chars, { clearProps: 'will-change' });
          copyFadeTl = null;
        },
      });
    };

    const setIntroPhase = (progress) => {
      if (progress < SHRINK_PORTION) {
        updateIntroFrame(progress / SHRINK_PORTION);
        intro.style.opacity = '1';
        content.classList.remove('is-visible');
        introComplete = false;
        return;
      }

      updateIntroFrame(1);
      intro.style.opacity = '0';
      const wasVisible = content.classList.contains('is-visible');
      content.classList.add('is-visible');
      introComplete = true;

      if (!wasVisible) {
        playCopyItemFadeUp(copyItems[currentIndex]);
      }
    };

    const getShrinkScroll = () => {
      if (!pinTrigger) return window.scrollY;
      return pinTrigger.start + (pinTrigger.end - pinTrigger.start) * SHRINK_PORTION;
    };

    const isInCooldown = () =>
      lastSwitchTime > 0 && Date.now() - lastSwitchTime < COOLDOWN_MS;

    const isEntryLocked = () => Date.now() < entryLockUntil;

    const startEntryLock = () => {
      entryLockUntil = Date.now() + ENTRY_LOCK_MS;
    };

    const getTrackStep = () => {
      if (isCompactView()) {
        return swiperArea?.clientWidth || sticky?.clientWidth || window.innerWidth;
      }
      return sticky?.clientWidth || window.innerWidth;
    };

    const getTrackOffset = (index) => {
      const step = isCompactView() ? getTrackStep() : getTrackStep() * 0.5;
      if (isCompactView()) return -index * step;
      return (0.5 - index) * step;
    };

    const syncTrackLayout = (animate = false) => {
      const step = isCompactView() ? getTrackStep() : getTrackStep() * 0.5;

      slides.forEach((slide) => {
        slide.style.width = `${step}px`;
      });

      updateTrackPosition(currentIndex, animate);
    };

    const updateTrackPosition = (index, animate = true) => {
      const offsetX = getTrackOffset(index);

      trackEl.style.transition = animate
        ? `transform ${SLIDE_SPEED}ms ease`
        : 'none';
      trackEl.style.transform = `translate3d(${offsetX}px, 0, 0)`;
    };

    const updatePagination = (index) => {
      if (!paginationEl) return;
      const current = String(index + 1).padStart(2, '0');
      const total = String(slides.length).padStart(2, '0');
      paginationEl.innerHTML = `<span class="swiper-pagination-current">${current}</span> / <span class="swiper-pagination-total">${total}</span>`;
    };

    const updateSlideState = (index, animate = true) => {
      currentIndex = index;

      slides.forEach((slide, i) => {
        slide.classList.remove(
          'swiper-slide-active',
          'swiper-slide-prev',
          'swiper-slide-next'
        );

        if (i === index) {
          slide.classList.add('swiper-slide-active');
        } else if (i === index - 1) {
          slide.classList.add('swiper-slide-prev');
        } else if (i === index + 1) {
          slide.classList.add('swiper-slide-next');
        }
      });

      updateTrackPosition(index, animate);
      setActiveCopy(index);
      updatePagination(index);

      if (prevEl) {
        prevEl.classList.toggle('swiper-button-disabled', index === 0);
        prevEl.disabled = index === 0;
      }

      if (nextEl) {
        nextEl.classList.toggle(
          'swiper-button-disabled',
          index === slides.length - 1
        );
        nextEl.disabled = index === slides.length - 1;
      }

      if (!animate) {
        isSliding = false;
        lastSwitchTime = 0;
        if (slideTimer) {
          clearTimeout(slideTimer);
          slideTimer = null;
        }
        return;
      }

      isSliding = true;
      if (slideTimer) clearTimeout(slideTimer);
      slideTimer = setTimeout(() => {
        isSliding = false;
        lastSwitchTime = Date.now();
        slideTimer = null;
      }, SLIDE_SPEED);
    };

    const goToSlide = (index) => {
      if (index < 0 || index >= slides.length || index === currentIndex) return;
      if (isSliding || isInCooldown()) return;
      updateSlideState(index, true);
    };

    setActiveCopy(0);
    updateIntroFrame(0);
    syncTrackLayout(false);
    updateSlideState(0, false);

    if (prevEl) {
      prevEl.addEventListener('click', () => goToSlide(currentIndex - 1));
    }

    if (nextEl) {
      nextEl.addEventListener('click', () => goToSlide(currentIndex + 1));
    }

    let touchStartX = 0;
    let touchStartY = 0;

    swiperEl.addEventListener(
      'touchstart',
      (event) => {
        if (!isCompactView() || !content.classList.contains('is-visible')) return;
        touchStartX = event.changedTouches[0].clientX;
        touchStartY = event.changedTouches[0].clientY;
      },
      { passive: true },
    );

    swiperEl.addEventListener(
      'touchend',
      (event) => {
        if (!isCompactView() || !content.classList.contains('is-visible')) return;

        const deltaX = event.changedTouches[0].clientX - touchStartX;
        const deltaY = event.changedTouches[0].clientY - touchStartY;
        if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return;

        if (deltaX < 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
      },
      { passive: true },
    );

    const LAST_INDEX = slides.length - 1;

    const shouldLockSwiperScroll = () => {
      if (!introComplete) return false;
      if (currentIndex < LAST_INDEX) return true;
      return isInCooldown();
    };

    const clampSwiperScroll = () => {
      if (!shouldLockSwiperScroll()) return;
      const targetY = getShrinkScroll();
      if (Math.abs(window.scrollY - targetY) > 2) {
        window.scrollTo(0, targetY);
      }
    };

    const onWheel = (event) => {
      if (!pinTrigger || !pinTrigger.isActive) return;

      if (!introComplete) return;

      const goingDown = event.deltaY > 0;

      if (isEntryLocked()) {
        event.preventDefault();
        return;
      }

      if (isSliding) {
        event.preventDefault();
        return;
      }

      if (goingDown && currentIndex === LAST_INDEX) {
        if (isInCooldown()) {
          event.preventDefault();
        }
        return;
      }

      if (!goingDown && currentIndex === 0) {
        return;
      }

      event.preventDefault();
      if (isInCooldown()) return;

      if (goingDown) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(currentIndex - 1);
      }
    };

    pinTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=200%',
      pin: sticky,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (self.progress < SHRINK_PORTION) {
          setIntroPhase(self.progress);
          return;
        }

        setIntroPhase(SHRINK_PORTION);
        clampSwiperScroll();
      },
      onEnter: () => {
        updateSlideState(0, false);
        startEntryLock();
      },
      onEnterBack: () => {
        updateSlideState(LAST_INDEX, false);
        startEntryLock();
      },
      onRefresh: () => {
        updateIntroFrame(introComplete ? 1 : 0);
        syncTrackLayout(false);
      },
    });

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', () => {
      updateIntroFrame(introComplete ? 1 : 0);
      syncTrackLayout(false);
    });
    compactMq.addEventListener('change', () => {
      syncTrackLayout(false);
      updateIntroFrame(introComplete ? 1 : 0);
      ScrollTrigger.refresh();
    });
  };

  const initHeatingMatTechController = () => {
    const section = document.querySelector('.heating-mat-tech-controller');
    if (!section) return;

    const title = section.querySelector('.heating-mat-tech-controller__title');
    const desc = section.querySelector('.heating-mat-tech-controller__desc');
    const callouts = Array.from(
      section.querySelectorAll('.heating-mat-tech-controller__callout')
    );
    const hotspots = Array.from(
      section.querySelectorAll('.heating-mat-tech-controller__hotspots .sleep-fit-structure__hotspot')
    );
    const slides = Array.from(
      section.querySelectorAll('.heating-mat-tech-controller__slide')
    );
    const dots = Array.from(
      section.querySelectorAll('.heating-mat-tech-controller__dot')
    );
    const slidesViewport = section.querySelector(
      '.heating-mat-tech-controller__slides'
    );
    const slidesTrack = section.querySelector(
      '.heating-mat-tech-controller__slides-track'
    );
    if (!title || !desc || !callouts.length) return;

    const compactMq = window.matchMedia('(max-width: 63.9375rem)');
    const isCompactView = () => compactMq.matches;

    const charClass = 'heating-mat-tech-controller__char';
    const headingChars = [
      ...splitTextChars(title, charClass),
      ...splitTextChars(desc, charClass),
    ];
    if (!headingChars.length) return;

    const headingStagger =
      FADE_UP_DURATION / Math.max(headingChars.length * 2.5, 1);

    const DOT_DURATION = 0.4;
    const LINE_DURATION = 0.7;
    const CONTENT_DURATION = 0.9;
    const CALLOUT_DURATION = DOT_DURATION + LINE_DURATION + CONTENT_DURATION;
    const NEXT_CALLOUT_AT = 0.4;

    let sequenceTl = null;
    let slideTween = null;
    let hasPlayed = false;
    let currentIndex = 0;
    let startX = 0;
    let startY = 0;

    const SLIDE_DURATION = 0.65;
    const SLIDE_EASE = 'power3.inOut';

    const getSlideOffset = () => {
      if (!slidesViewport) return 0;
      return -currentIndex * slidesViewport.clientWidth;
    };

    const calloutData = callouts.map((callout) => {
      const dot = callout.querySelector(
        '.heating-mat-tech-controller__callout-dot'
      );
      const line = callout.querySelector(
        '.heating-mat-tech-controller__callout-line'
      );
      const content = callout.querySelector(
        '.heating-mat-tech-controller__callout-content'
      );
      const isLeft = callout.classList.contains(
        'heating-mat-tech-controller__callout--left'
      );

      gsap.set(dot, { opacity: 0 });
      gsap.set(line, {
        scaleX: 0,
        yPercent: -50,
        transformOrigin: isLeft ? 'right center' : 'left center',
      });
      gsap.set(content, { opacity: 0, y: 40 });

      return { dot, line, content };
    });

    const setFinalVisualState = () => {
      gsap.set(headingChars, { opacity: 1, y: 0, clearProps: 'will-change' });
      calloutData.forEach(({ dot, line, content }) => {
        gsap.set(dot, { opacity: 1 });
        gsap.set(line, { scaleX: 1, yPercent: -50 });
        gsap.set(content, { opacity: 1, y: 0 });
      });
    };

    const goToCompact = (index, animate = true) => {
      if (!slides.length || !slidesTrack) return;

      const nextIndex = (index + slides.length) % slides.length;
      if (nextIndex === currentIndex && animate) return;

      currentIndex = nextIndex;

      hotspots.forEach((hotspot, hotspotIndex) => {
        hotspot.classList.toggle('is-active', hotspotIndex === currentIndex);
      });

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === currentIndex);
        slide.setAttribute('aria-hidden', slideIndex === currentIndex ? 'false' : 'true');
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === currentIndex);
      });

      if (slideTween) {
        slideTween.kill();
        slideTween = null;
      }

      const targetX = getSlideOffset();

      if (animate && isCompactView()) {
        slideTween = gsap.to(slidesTrack, {
          x: targetX,
          duration: SLIDE_DURATION,
          ease: SLIDE_EASE,
          overwrite: true,
          onComplete: () => {
            slideTween = null;
          },
        });
      } else {
        gsap.set(slidesTrack, { x: targetX });
      }
    };

    const playSequence = () => {
      if (hasPlayed) return;
      hasPlayed = true;

      if (isCompactView()) {
        gsap.to(headingChars, {
          opacity: 1,
          y: 0,
          duration: FADE_UP_DURATION,
          ease: 'power3.out',
          stagger: headingChars.length > 1 ? headingStagger : 0,
          onComplete: () => {
            gsap.set(headingChars, { clearProps: 'will-change' });
          },
        });
        goToCompact(0, false);
        return;
      }

      sequenceTl = gsap.timeline({
        delay: 1,
        onComplete: () => {
          gsap.set(headingChars, { clearProps: 'will-change' });
        },
      });

      sequenceTl.to(headingChars, {
        opacity: 1,
        y: 0,
        duration: FADE_UP_DURATION,
        ease: 'power3.out',
        stagger: headingChars.length > 1 ? headingStagger : 0,
      });

      const calloutStart = FADE_UP_DURATION * NEXT_CALLOUT_AT;

      calloutData.forEach((item, index) => {
        const start =
          calloutStart + index * CALLOUT_DURATION * NEXT_CALLOUT_AT;

        sequenceTl.to(
          item.dot,
          {
            opacity: 1,
            duration: DOT_DURATION,
            ease: 'power2.out',
          },
          start
        );

        sequenceTl.to(
          item.line,
          {
            scaleX: 1,
            yPercent: -50,
            duration: LINE_DURATION,
            ease: 'power2.out',
          },
          start + DOT_DURATION
        );

        sequenceTl.to(
          item.content,
          {
            opacity: 1,
            y: 0,
            duration: CONTENT_DURATION,
            ease: 'power3.out',
          },
          start + DOT_DURATION + LINE_DURATION
        );
      });
    };

    const showFinalState = () => {
      if (sequenceTl) {
        sequenceTl.kill();
        sequenceTl = null;
      }

      if (isCompactView()) {
        gsap.set(headingChars, { opacity: 1, y: 0, clearProps: 'will-change' });
        goToCompact(currentIndex, false);
      } else {
        setFinalVisualState();
      }

      hasPlayed = true;
    };

    gsap.set(headingChars, { opacity: 0, y: 40 });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 90%',
      once: true,
      onEnter: playSequence,
    });

    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      onEnterBack: () => {
        if (hasPlayed) showFinalState();
      },
    });

    hotspots.forEach((hotspot) => {
      hotspot.addEventListener('click', () => {
        if (!isCompactView()) return;
        const index = Number(hotspot.dataset.index);
        if (Number.isNaN(index)) return;
        goToCompact(index);
      });
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        if (!isCompactView()) return;
        const index = Number(dot.dataset.index);
        if (Number.isNaN(index)) return;
        goToCompact(index);
      });
    });

    if (slidesViewport) {
      slidesViewport.addEventListener(
        'touchstart',
        (event) => {
          if (!isCompactView()) return;
          startX = event.changedTouches[0].clientX;
          startY = event.changedTouches[0].clientY;
        },
        { passive: true }
      );

      slidesViewport.addEventListener(
        'touchend',
        (event) => {
          if (!isCompactView()) return;

          const endX = event.changedTouches[0].clientX;
          const endY = event.changedTouches[0].clientY;
          const deltaX = endX - startX;
          const deltaY = endY - startY;

          if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) {
            return;
          }

          if (deltaX < 0) {
            goToCompact(currentIndex + 1);
          } else {
            goToCompact(currentIndex - 1);
          }
        },
        { passive: true }
      );
    }

    compactMq.addEventListener('change', () => {
      if (isCompactView()) {
        if (sequenceTl) {
          sequenceTl.kill();
          sequenceTl = null;
        }
        gsap.set(headingChars, { opacity: 1, y: 0, clearProps: 'will-change' });
        goToCompact(currentIndex, false);
        hasPlayed = true;
      } else if (hasPlayed) {
        setFinalVisualState();
        if (slidesTrack) gsap.set(slidesTrack, { x: 0 });
      }
      ScrollTrigger.refresh();
    });

    window.addEventListener('resize', () => {
      if (!isCompactView() || !slidesTrack) return;
      gsap.set(slidesTrack, { x: getSlideOffset() });
    });

    if (isCompactView()) {
      goToCompact(0, false);
    }
  };

  const initHeatingMatTechCertification = () => {
    const title = document.querySelector(
      '.heating-mat-tech-certification__title'
    );
    if (!title) return;

    initFadeUp(title, [title], 'heating-mat-tech-certification__char');
  };

  const initHeatingMatTechSafety = () => {
    const heading = document.querySelector(
      '.heating-mat-tech-safety__heading'
    );
    if (!heading) return;

    const title = heading.querySelector('.heating-mat-tech-safety__title');
    const desc = heading.querySelector('.heating-mat-tech-safety__desc');
    const targets = [title, desc].filter(Boolean);
    if (!targets.length) return;

    initFadeUp(heading, targets, 'heating-mat-tech-safety__char');
  };

  const initHeatingMatTechProblemSlider = () => {
    const section = document.querySelector('.heating-mat-tech-problem');
    if (!section) return;

    const track = section.querySelector('.heating-mat-tech-problem__cards');
    const cards = [...section.querySelectorAll('.heating-mat-tech-problem__card')];
    const dots = [...section.querySelectorAll('.heating-mat-tech-problem__dot')];
    if (!track || !cards.length) return;

    const mobileQuery = window.matchMedia('(max-width: 47.9375rem)');
    let currentIndex = 0;
    let startX = 0;
    let startY = 0;

    const isMobile = () => mobileQuery.matches;

    const goTo = (index) => {
      currentIndex = (index + cards.length) % cards.length;

      if (isMobile()) {
        track.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;
      } else {
        track.style.transform = '';
      }

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === currentIndex);
      });
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        if (!isMobile()) return;
        goTo(index);
      });
    });

    track.addEventListener(
      'touchstart',
      (event) => {
        if (!isMobile()) return;
        startX = event.changedTouches[0].clientX;
        startY = event.changedTouches[0].clientY;
      },
      { passive: true },
    );

    track.addEventListener(
      'touchend',
      (event) => {
        if (!isMobile()) return;

        const deltaX = event.changedTouches[0].clientX - startX;
        const deltaY = event.changedTouches[0].clientY - startY;
        if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return;

        if (deltaX < 0) {
          goTo(currentIndex + 1);
        } else {
          goTo(currentIndex - 1);
        }
      },
      { passive: true },
    );

    mobileQuery.addEventListener('change', () => goTo(isMobile() ? currentIndex : 0));
    goTo(0);
  };

  const start = () => {
    const init = () => {
      initHeatingMatTechHero();
      initHeatingMatTechProblemSlider();
      initHeatingMatTechProductOverview();
      initHeatingMatTechProduct();
      initHeatingMatTechTechnology();
      initHeatingMatTechController();
      initHeatingMatTechCertification();
      initHeatingMatTechSafety();
      ScrollTrigger.refresh();
    };

    if (!window.equilLibsReady) {
      init();
      return;
    }

    window.equilLibsReady.then(init).catch((error) => {
      console.error('[heating-mat-tech] GSAP init failed:', error);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
