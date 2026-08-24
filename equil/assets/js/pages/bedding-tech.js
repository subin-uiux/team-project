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

  const initBeddingTechHero = () => {
    if (typeof window.initTechHero !== 'function') return;
    window.initTechHero('bedding-tech-hero');
  };

  const initBeddingTechOverview = () => {
    const section = document.querySelector('.bedding-tech-overview');
    if (!section) return;
    if (window.matchMedia('(min-width: 64rem)').matches) return;

    const title = section.querySelector('.bedding-tech-overview__title');
    if (!title) return;

    const TITLE_FADE_UP_DURATION = 1.6;
    const charClass = 'bedding-tech-overview__char';
    const titleChars = splitTextChars(title, charClass);
    if (!titleChars.length) return;

    const titleStagger =
      TITLE_FADE_UP_DURATION / Math.max(titleChars.length * 2.5, 1);

    gsap.set(titleChars, { opacity: 0, y: 40 });

    gsap.to(titleChars, {
      opacity: 1,
      y: 0,
      duration: TITLE_FADE_UP_DURATION,
      ease: 'power3.out',
      stagger: titleChars.length > 1 ? titleStagger : 0,
      scrollTrigger: {
        trigger: section,
        start: 'top 90%',
        once: true,
      },
      onComplete: () => {
        gsap.set(titleChars, { clearProps: 'will-change' });
      },
    });
  };

  const initBeddingTechDesign = () => {
    const section = document.querySelector('.bedding-tech-design');
    if (!section) return;

    const overlay = section.querySelector('.bedding-tech-design__overlay');
    const title = section.querySelector('.bedding-tech-design__title');
    const mobileQuery = window.matchMedia('(max-width: 47.9375rem)');
    const bodyMobile = section.querySelector('.bedding-tech-design__body-mobile');
    const descs = mobileQuery.matches && bodyMobile
      ? [bodyMobile]
      : Array.from(
          section.querySelectorAll('.bedding-tech-design__body-pc .bedding-tech-design__desc')
        );
    if (!overlay || !title || !descs.length) return;

    const POST_HERO_FADE_UP_DURATION = 2;
    const isCompact = window.matchMedia('(max-width: 63.9375rem)').matches;

    const charClass = 'bedding-tech-design__char';
    const titleChars = isCompact ? [] : splitTextChars(title, charClass);
    const descChars = descs.flatMap((desc) => splitTextChars(desc, charClass));
    const allChars = [...titleChars, ...descChars];
    const charStagger =
      POST_HERO_FADE_UP_DURATION / Math.max(allChars.length * 2.5, 1);

    gsap.set(overlay, { opacity: 0 });
    gsap.set(allChars, { opacity: 0, y: 40 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        once: true,
      },
    });

    tl.to(overlay, {
      opacity: 0.4,
      duration: 0.6,
      ease: 'power1.out',
    }).to(
      allChars,
      {
        opacity: 1,
        y: 0,
        duration: POST_HERO_FADE_UP_DURATION,
        ease: 'power3.out',
        stagger: allChars.length > 1 ? charStagger : 0,
        onComplete: () => {
          gsap.set(allChars, { clearProps: 'will-change' });
        },
      },
      '+=0.1'
    );
  };

  const PROCESS_IMAGES = [
    'assets/images/about/bedding-tech/bedding-tech-process_img01.webp',
    'assets/images/about/bedding-tech/bedding-tech-process_img02.webp',
    'assets/images/about/bedding-tech/bedding-tech-process_img03.webp',
    'assets/images/about/bedding-tech/bedding-tech-process_img04.webp',
  ];

  const initBeddingTechProcess = () => {
    window.initScrollFeature({
      sectionSelector: '.bedding-tech-process',
      images: PROCESS_IMAGES,
      pinOnCompact: true,
      pinOnMobile: false,
    });
  };

  const initBeddingTechWool = () => {
    const section = document.querySelector('.bedding-tech-wool');
    if (!section) return;

    const brandEq = section.querySelector('.bedding-tech-wool__brand-part--eq');
    const brandUil = section.querySelector(
      '.bedding-tech-wool__brand-part--uil'
    );
    const image = section.querySelector('.bedding-tech-wool__image');
    const title = section.querySelector('.bedding-tech-wool__title');
    if (!brandEq || !brandUil || !image || !title) return;

    const FADE_UP_DURATION = 1.26;
    const SPLIT_DURATION = 1.7;
    const SPLIT_EASE = 'power2.inOut';
    const COOLDOWN_MS = 1200;
    const ENTRY_LOCK_MS = 800;
    const MOBILE_AUTO_HOLD_MS = 400;
    const LAST_STEP = 2;
    const charClass = 'bedding-tech-wool__char';
    const titleChars = splitTextChars(title, charClass);
    const charStagger =
      FADE_UP_DURATION / Math.max(titleChars.length * 2.5, 1);
    const mobileQuery = window.matchMedia('(max-width: 47.9375rem)');

    let currentStep = 0;
    let pinTrigger = null;
    let lastSwitchTime = 0;
    let entryLockUntil = 0;
    let isTransitioning = false;
    let transitionTl = null;
    let mobileAutoTimer = null;
    let mobileAutoPlayed = false;
    let mobileAutoComplete = false;

    const isInCooldown = () =>
      lastSwitchTime > 0 && Date.now() - lastSwitchTime < COOLDOWN_MS;
    const isEntryLocked = () => Date.now() < entryLockUntil;
    const startEntryLock = () => {
      entryLockUntil = Date.now() + ENTRY_LOCK_MS;
    };

    const getSplitX = () => window.innerWidth * 0.28;

    const setStep = (step, animate = true, onDone) => {
      if (step === currentStep && animate) {
        onDone?.();
        return;
      }

      if (transitionTl) {
        transitionTl.kill();
        transitionTl = null;
      }

      currentStep = step;

      if (!animate) {
        if (step === 0) {
          gsap.set([brandEq, brandUil], { x: 0, opacity: 1 });
          gsap.set(image, {
            opacity: 0,
            scale: 0.2,
            xPercent: -50,
            yPercent: -50,
          });
          gsap.set(titleChars, { opacity: 0, y: 40 });
          gsap.set(section, {
            backgroundColor: 'var(--color-brand-light-1)',
          });
        } else if (step === 1) {
          const splitX = getSplitX();
          gsap.set(brandEq, { x: -splitX, opacity: 1 });
          gsap.set(brandUil, { x: splitX, opacity: 1 });
          gsap.set(image, {
            opacity: 1,
            scale: 1,
            xPercent: -50,
            yPercent: -50,
          });
          gsap.set(titleChars, { opacity: 0, y: 40 });
          gsap.set(section, {
            backgroundColor: 'var(--color-brand-light-1)',
          });
        } else {
          gsap.set([brandEq, brandUil, image], { opacity: 0 });
          gsap.set(titleChars, { opacity: 1, y: 0 });
          gsap.set(section, {
            backgroundColor: 'var(--color-brand-light-1)',
          });
        }

        isTransitioning = false;
        lastSwitchTime = 0;
        onDone?.();
        return;
      }

      isTransitioning = true;
      transitionTl = gsap.timeline({
        onComplete: () => {
          isTransitioning = false;
          transitionTl = null;
          // 최종 화면은 끝나자마자 스크롤 통과 가능
          lastSwitchTime = currentStep === LAST_STEP ? 0 : Date.now();
          onDone?.();
        },
      });

      if (step === 1) {
        const splitX = getSplitX();
        gsap.set(titleChars, { opacity: 0, y: 40 });
        gsap.set([brandEq, brandUil], { opacity: 1 });

        transitionTl
          .to(
            brandEq,
            {
              x: -splitX,
              duration: SPLIT_DURATION,
              ease: SPLIT_EASE,
            },
            0
          )
          .to(
            brandUil,
            {
              x: splitX,
              duration: SPLIT_DURATION,
              ease: SPLIT_EASE,
            },
            0
          )
          .fromTo(
            image,
            { opacity: 0, scale: 0.2, xPercent: -50, yPercent: -50 },
            {
              opacity: 1,
              scale: 1,
              duration: SPLIT_DURATION,
              ease: SPLIT_EASE,
            },
            0
          );
        return;
      }

      if (step === 2) {
        transitionTl
          .to([brandEq, brandUil, image], {
            opacity: 0,
            duration: 0.55,
            ease: 'power1.in',
          })
          .to(titleChars, {
            opacity: 1,
            y: 0,
            duration: FADE_UP_DURATION,
            ease: 'power3.out',
            stagger: titleChars.length > 1 ? charStagger : 0,
          });
        return;
      }

      // step 0 — reverse to brand only
      transitionTl
        .to(titleChars, {
          opacity: 0,
          y: 40,
          duration: 0.35,
          ease: 'power1.in',
        })
        .to(
          [brandEq, brandUil],
          {
            opacity: 1,
            x: 0,
            duration: SPLIT_DURATION,
            ease: SPLIT_EASE,
          },
          0.1
        )
        .to(
          image,
          {
            opacity: 0,
            scale: 0.2,
            duration: SPLIT_DURATION,
            ease: SPLIT_EASE,
          },
          0.1
        );
    };

    setStep(0, false);

    const clearMobileAutoTimer = () => {
      if (mobileAutoTimer) {
        window.clearTimeout(mobileAutoTimer);
        mobileAutoTimer = null;
      }
    };

    const playMobileAutoSequence = () => {
      if (!mobileQuery.matches || mobileAutoPlayed) return;

      clearMobileAutoTimer();
      mobileAutoPlayed = true;
      mobileAutoComplete = false;
      setStep(0, false);
      startEntryLock();

      mobileAutoTimer = window.setTimeout(() => {
        mobileAutoTimer = null;
        if (!pinTrigger?.isActive) return;

        setStep(1, true, () => {
          if (!pinTrigger?.isActive) return;

          setStep(2, true, () => {
            mobileAutoComplete = true;
          });
        });
      }, MOBILE_AUTO_HOLD_MS);
    };

    const shouldBlockMobileScroll = () =>
      mobileQuery.matches &&
      pinTrigger?.isActive &&
      (!mobileAutoComplete || isTransitioning || isEntryLocked());

    const onWheel = (event) => {
      if (!pinTrigger || !pinTrigger.isActive) return;

      if (mobileQuery.matches) {
        if (shouldBlockMobileScroll()) {
          event.preventDefault();
        }
        return;
      }

      const goingDown = event.deltaY > 0;

      if (isEntryLocked()) {
        event.preventDefault();
        return;
      }

      if (isTransitioning) {
        event.preventDefault();
        return;
      }

      if (goingDown && currentStep === LAST_STEP) {
        return;
      }

      if (!goingDown && currentStep === 0) {
        return;
      }

      event.preventDefault();
      if (isInCooldown()) return;

      setStep(goingDown ? currentStep + 1 : currentStep - 1, true);
    };

    pinTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=120%',
      pin: true,
      pinSpacing: true,
      anticipatePin: mobileQuery.matches ? 0 : 1,
      invalidateOnRefresh: true,
      onEnter: () => {
        if (mobileQuery.matches) {
          mobileAutoPlayed = false;
          mobileAutoComplete = false;
          playMobileAutoSequence();
          return;
        }

        setStep(0, false);
        startEntryLock();
      },
      onEnterBack: () => {
        clearMobileAutoTimer();

        if (mobileQuery.matches) {
          setStep(LAST_STEP, false);
          mobileAutoPlayed = true;
          mobileAutoComplete = true;
          startEntryLock();
          return;
        }

        setStep(LAST_STEP, false);
        startEntryLock();
      },
      onLeaveBack: () => {
        clearMobileAutoTimer();
        mobileAutoPlayed = false;
        mobileAutoComplete = false;
      },
    });

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener(
      'touchmove',
      (event) => {
        if (shouldBlockMobileScroll()) {
          event.preventDefault();
        }
      },
      { passive: false }
    );
  };

  const initBeddingTechSeasonal = () => {
    const section = document.querySelector('.bedding-tech-seasonal');
    if (!section) return;

    const heading = section.querySelector('.bedding-tech-seasonal__heading');
    const cards = Array.from(
      section.querySelectorAll('.bedding-tech-seasonal__card')
    );
    const medias = Array.from(
      section.querySelectorAll('.bedding-tech-seasonal__media')
    );
    const dots = Array.from(
      section.querySelectorAll('.bedding-tech-seasonal__dot')
    );
    if (!medias.length) return;

    const compactMq = window.matchMedia('(max-width: 63.9375rem)');
    const isCompact = () => compactMq.matches;
    const LAST_INDEX = cards.length - 1;
    const SWIPE_THRESHOLD = 40;
    const TRANSITION_DURATION = 1;
    const FADE_OUT_RATIO = 0.55;
    const fadeOutDuration = TRANSITION_DURATION * FADE_OUT_RATIO;
    let currentIndex = 0;
    let mediaStarted = false;
    let compactRevealed = !compactMq.matches;
    let compactCover = null;
    let isTransitioning = false;
    let transitionTl = null;
    let pointerStartX = null;
    let pointerStartY = null;

    const getCopy = (card) =>
      card.querySelector('.bedding-tech-seasonal__copy');

    const showCard = (index) => {
      currentIndex = index;
      cards.forEach((card, i) => {
        card.classList.toggle('is-active', i === index);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === index);
      });
    };

    const goTo = (index) => {
      if (!isCompact() || !compactRevealed || isTransitioning) return;
      const nextIndex = Math.max(0, Math.min(LAST_INDEX, index));
      if (nextIndex === currentIndex) return;

      const prevCopy = getCopy(cards[currentIndex]);
      const nextCopy = getCopy(cards[nextIndex]);

      if (transitionTl) {
        transitionTl.kill();
        transitionTl = null;
      }

      isTransitioning = true;
      showCard(nextIndex);

      transitionTl = gsap.timeline({
        onComplete: () => {
          isTransitioning = false;
          transitionTl = null;
        },
      });

      if (prevCopy) {
        transitionTl.to(
          prevCopy,
          {
            opacity: 0,
            y: -8,
            duration: fadeOutDuration,
            ease: 'power2.in',
            onComplete: () => {
              gsap.set(prevCopy, { y: 0 });
            },
          },
          0
        );
      }

      if (nextCopy) {
        transitionTl.fromTo(
          nextCopy,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: TRANSITION_DURATION,
            ease: 'power2.out',
          }
        );
      }
    };

    const coverActiveMedia = () => {
      if (compactCover) return compactCover;

      const card = cards[currentIndex];
      const media = medias[currentIndex];
      if (!card || !media) return null;

      const coverHeight = card.offsetHeight;
      const copy = getCopy(card);
      const restTop = copy ? copy.offsetHeight : 0;
      const restHeight = media.offsetHeight;

      gsap.set(card, { minHeight: coverHeight });
      gsap.set(media, {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: coverHeight,
      });

      compactCover = { card, media, restTop, restHeight };
      return compactCover;
    };

    if (isCompact()) {
      showCard(0);
      cards.forEach((card, index) => {
        const copy = getCopy(card);
        if (!copy) return;
        gsap.set(copy, {
          opacity: index === 0 ? 1 : 0,
          y: 0,
        });
      });
      coverActiveMedia();
    } else {
      /* PC — 카드 사진을 위에서 덮은 뒤 순차 하강 */
      gsap.set(medias, { top: '0%' });
    }

    const playMediaReveal = () => {
      if (isCompact()) {
        const cover = coverActiveMedia();
        if (!cover) {
          compactRevealed = true;
          return;
        }

        gsap.to(cover.media, {
          top: cover.restTop,
          height: cover.restHeight,
          duration: 1,
          ease: 'power2.inOut',
          onComplete: () => {
            gsap.set(cover.media, {
              clearProps: 'position,top,left,width,height',
            });
            gsap.set(cover.card, { clearProps: 'minHeight' });
            compactRevealed = true;
          },
        });
        return;
      }

      gsap.to(medias, {
        top: '35%',
        duration: 1,
        ease: 'power2.inOut',
        stagger: 0.5,
      });
    };

    const playMediaRevealOnce = () => {
      if (mediaStarted) return;
      mediaStarted = true;
      playMediaReveal();
    };

    section.addEventListener('click', (event) => {
      if (!isCompact()) return;
      const dot = event.target.closest('.bedding-tech-seasonal__dot');

      if (dot) {
        const index = dots.indexOf(dot);
        if (index >= 0) goTo(index);
      }
    });

    const cardsEl = section.querySelector('.bedding-tech-seasonal__cards');
    if (cardsEl) {
      cardsEl.addEventListener('pointerdown', (event) => {
        if (!isCompact()) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
      });

      cardsEl.addEventListener('pointerup', (event) => {
        if (!isCompact() || pointerStartX === null) return;
        const deltaX = event.clientX - pointerStartX;
        const deltaY = event.clientY - pointerStartY;
        pointerStartX = null;
        pointerStartY = null;
        if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
        if (Math.abs(deltaX) <= Math.abs(deltaY)) return;
        if (deltaX < 0) goTo(currentIndex + 1);
        if (deltaX > 0) goTo(currentIndex - 1);
      });

      cardsEl.addEventListener('pointercancel', () => {
        pointerStartX = null;
        pointerStartY = null;
      });
    }

    if (!heading) {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        once: true,
        onEnter: playMediaRevealOnce,
      });
      return;
    }

    const targets = [
      heading.querySelector('.heading-3tier__sub-title'),
      heading.querySelector('.heading-3tier__title'),
      heading.querySelector('.heading-3tier__desc'),
    ].filter(Boolean);

    const headingChars = targets.flatMap((element) =>
      splitTextChars(element, 'heading-3tier__char')
    );
    const charStagger =
      FADE_UP_DURATION / Math.max(headingChars.length * 2.5, 1);

    gsap.set(headingChars, { opacity: 0, y: 40 });

    gsap.to(headingChars, {
      opacity: 1,
      y: 0,
      duration: FADE_UP_DURATION,
      ease: 'power3.out',
      stagger: headingChars.length > 1 ? charStagger : 0,
      scrollTrigger: {
        trigger: heading.closest('section') || section,
        start: 'top 90%',
        once: true,
        invalidateOnRefresh: true,
      },
      onUpdate() {
        if (this.progress() >= 0.5) playMediaRevealOnce();
      },
      onComplete: () => {
        gsap.set(headingChars, { clearProps: 'will-change' });
        playMediaRevealOnce();
      },
    });
  };

  const start = () => {
    const init = () => {
      initBeddingTechHero();
      initBeddingTechOverview();
      initBeddingTechDesign();
      initBeddingTechProcess();
      initBeddingTechWool();
      initBeddingTechSeasonal();
      ScrollTrigger.refresh();
    };

    if (!window.equilLibsReady) {
      init();
      return;
    }

    window.equilLibsReady.then(init).catch((error) => {
      console.error('[bedding-tech] GSAP init failed:', error);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
