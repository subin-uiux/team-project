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

  const initHeatingMatTechHero = () => {
    const hero = document.querySelector('.heating-mat-tech-hero');
    if (!hero) return;

    const image = hero.querySelector('.heating-mat-tech-hero__image');
    const overlay = hero.querySelector('.heating-mat-tech-hero__overlay');
    const content = hero.querySelector('.heating-mat-tech-hero__content');
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

  const initHeatingMatTechProductOverview = () => {
    const section = document.querySelector('.heating-mat-tech-product-overview');
    if (!section) return;

    const title = section.querySelector('.heating-mat-tech-product-overview__title');
    const desc = section.querySelector('.heating-mat-tech-product-overview__desc');
    if (!title || !desc) return;

    const charClass = 'heating-mat-tech-product-overview__char';
    const titleChars = splitTextChars(title, charClass);
    const descChars = splitTextChars(desc, charClass);
    const allChars = [...titleChars, ...descChars];
    if (!allChars.length) return;

    const charStagger =
      FADE_UP_DURATION / Math.max(allChars.length * 2.5, 1);

    let pinTrigger = null;
    let fadeTl = null;
    let hasPlayed = false;
    let isLocked = true;

    gsap.set(allChars, { opacity: 0, y: 40 });

    const playFadeUp = () => {
      if (hasPlayed) return;
      hasPlayed = true;

      fadeTl = gsap.timeline({
        delay: 1,
        onComplete: () => {
          isLocked = false;
          gsap.set(allChars, { clearProps: 'will-change' });
        },
      });

      fadeTl.to(allChars, {
        opacity: 1,
        y: 0,
        duration: FADE_UP_DURATION,
        ease: 'power3.out',
        stagger: allChars.length > 1 ? charStagger : 0,
      });
    };

    const showFinalState = () => {
      if (fadeTl) {
        fadeTl.kill();
        fadeTl = null;
      }

      gsap.set(allChars, { opacity: 1, y: 0, clearProps: 'will-change' });
      hasPlayed = true;
      isLocked = false;
    };

    const releasePin = () => {
      if (!pinTrigger) return;

      pinTrigger.kill(false);
      pinTrigger = null;
    };

    pinTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=50%',
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onEnter: () => {
        if (hasPlayed) {
          showFinalState();
          releasePin();
          return;
        }

        isLocked = true;
        playFadeUp();
      },
      onEnterBack: () => {
        showFinalState();
        releasePin();
      },
      onLeave: () => {
        if (hasPlayed) releasePin();
      },
      onLeaveBack: () => {
        if (hasPlayed) releasePin();
      },
    });

    const onWheel = (event) => {
      if (!pinTrigger || !pinTrigger.isActive) return;
      if (!isLocked) return;

      event.preventDefault();
    };

    window.addEventListener('wheel', onWheel, { passive: false });
  };

  const PRODUCT_IMAGES = [
    '../../assets/images/about/heating-mat-tech/heating-mat-tech-product_img01.webp',
    '../../assets/images/about/heating-mat-tech/heating-mat-tech-product_img02.webp',
    '../../assets/images/about/heating-mat-tech/heating-mat-tech-product_img03.webp',
  ];

  const initHeatingMatTechProduct = () => {
    const section = document.querySelector('.heating-mat-tech-product');
    if (!section) return;

    const features = Array.from(
      section.querySelectorAll('.scroll-feature__feature')
    );
    const image = section.querySelector('.scroll-feature__image');
    if (!features.length || !image) return;

    const LAST_INDEX = features.length - 1;
    const COOLDOWN_MS = 1000;
    const ENTRY_LOCK_MS = 1000;
    const TRANSITION_DURATION = 1.2;
    const FADE_OUT_DURATION = TRANSITION_DURATION * 0.55;
    const IMAGE_FADE_DURATION = 0.45;
    let currentIndex = 0;
    let pinTrigger = null;
    let lastSwitchTime = 0;
    let entryLockUntil = 0;
    let isTransitioning = false;
    let transitionTl = null;

    const isInCooldown = () =>
      lastSwitchTime > 0 && Date.now() - lastSwitchTime < COOLDOWN_MS;

    const isEntryLocked = () => Date.now() < entryLockUntil;

    const startEntryLock = () => {
      entryLockUntil = Date.now() + ENTRY_LOCK_MS;
    };

    const setImage = (index, animate = true) => {
      const nextSrc = PRODUCT_IMAGES[index];
      if (!nextSrc || image.getAttribute('src') === nextSrc) return;

      if (!animate) {
        image.src = nextSrc;
        gsap.set(image, { opacity: 1 });
        return;
      }

      gsap.to(image, {
        opacity: 0,
        duration: IMAGE_FADE_DURATION,
        ease: 'power1.in',
        onComplete: () => {
          image.src = nextSrc;
          gsap.to(image, {
            opacity: 1,
            duration: IMAGE_FADE_DURATION,
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
              duration: FADE_OUT_DURATION,
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
              duration: FADE_OUT_DURATION,
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
          transitionTl.to({}, { duration: FADE_OUT_DURATION });
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
            duration: TRANSITION_DURATION,
            ease: 'power2.out',
          }
        );
      }

      if (nextIndicator) {
        transitionTl.to(
          nextIndicator,
          {
            opacity: 1,
            duration: TRANSITION_DURATION,
            ease: 'power2.out',
          },
          nextDesc ? '<' : '>'
        );
      }
    };

    activateFeature(0, false);

    const isInPinnedZone = () => {
      const rect = section.getBoundingClientRect();
      return rect.top <= 1 && rect.bottom >= window.innerHeight;
    };

    const onWheel = (event) => {
      if (isInPinnedZone() && isEntryLocked()) {
        event.preventDefault();
        return;
      }

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

      activateFeature(goingDown ? currentIndex + 1 : currentIndex - 1);
    };

    pinTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=100%',
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

    const CIRCLE_ACTIVE = 600;
    const CIRCLE_OFFSET_Y = 60;

    const getCircleSize = () => CIRCLE_ACTIVE;

    const getCircleTarget = () => {
      if (sticky) {
        const stickyRect = sticky.getBoundingClientRect();
        return {
          x: stickyRect.width / 2,
          y: stickyRect.height / 2 - CIRCLE_OFFSET_Y,
          width: stickyRect.width,
          height: stickyRect.height,
        };
      }

      return {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 - CIRCLE_OFFSET_Y,
        width: window.innerWidth,
        height: window.innerHeight,
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
      content.classList.add('is-visible');
      introComplete = true;
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

    const getTrackStep = () => sticky?.clientWidth || window.innerWidth;

    const getTrackOffset = (index) => {
      const step = getTrackStep() * 0.5;
      return (0.5 - index) * step;
    };

    const syncTrackLayout = (animate = false) => {
      const step = getTrackStep() * 0.5;

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
  };

  const start = () => {
    const init = () => {
      initHeatingMatTechHero();
      initHeatingMatTechProductOverview();
      initHeatingMatTechProduct();
      initHeatingMatTechTechnology();
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
