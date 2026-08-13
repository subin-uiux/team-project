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
    const hero = document.querySelector('.bedding-tech-hero');
    if (!hero) return;

    const image = hero.querySelector('.bedding-tech-hero__image');
    const overlay = hero.querySelector('.bedding-tech-hero__overlay');
    const content = hero.querySelector('.bedding-tech-hero__content');
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

  const initBeddingTechDesign = () => {
    const section = document.querySelector('.bedding-tech-design');
    if (!section) return;

    const overlay = section.querySelector('.bedding-tech-design__overlay');
    const title = section.querySelector('.bedding-tech-design__title');
    const descs = Array.from(
      section.querySelectorAll('.bedding-tech-design__desc')
    );
    if (!overlay || !title || !descs.length) return;

    const charClass = 'bedding-tech-design__char';
    const titleChars = splitTextChars(title, charClass);
    const descChars = descs.flatMap((desc) => splitTextChars(desc, charClass));
    const allChars = [...titleChars, ...descChars];
    const charStagger =
      FADE_UP_DURATION / Math.max(allChars.length * 2.5, 1);

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
        duration: FADE_UP_DURATION,
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
    '../../assets/images/about/bedding-tech/bedding-tech-process_img01.webp',
    '../../assets/images/about/bedding-tech/bedding-tech-process_img02.webp',
    '../../assets/images/about/bedding-tech/bedding-tech-process_img03.webp',
    '../../assets/images/about/bedding-tech/bedding-tech-process_img04.webp',
  ];

  const initBeddingTechProcess = () => {
    const section = document.querySelector('.bedding-tech-process');
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
      const nextSrc = PROCESS_IMAGES[index];
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
    const LAST_STEP = 2;
    const charClass = 'bedding-tech-wool__char';
    const titleChars = splitTextChars(title, charClass);
    const charStagger =
      FADE_UP_DURATION / Math.max(titleChars.length * 2.5, 1);

    let currentStep = 0;
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

    const getSplitX = () => window.innerWidth * 0.28;

    const setStep = (step, animate = true) => {
      if (step === currentStep && animate) return;

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
            backgroundColor: 'var(--color-brand-light-3)',
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
            backgroundColor: 'var(--color-brand-light-3)',
          });
        } else {
          gsap.set([brandEq, brandUil, image], { opacity: 0 });
          gsap.set(titleChars, { opacity: 1, y: 0 });
          gsap.set(section, {
            backgroundColor: 'var(--color-brand-light-2)',
          });
        }

        isTransitioning = false;
        lastSwitchTime = 0;
        return;
      }

      isTransitioning = true;
      transitionTl = gsap.timeline({
        onComplete: () => {
          isTransitioning = false;
          transitionTl = null;
          // 최종 화면은 끝나자마자 스크롤 통과 가능
          lastSwitchTime = currentStep === LAST_STEP ? 0 : Date.now();
        },
      });

      if (step === 1) {
        const splitX = getSplitX();
        gsap.set(titleChars, { opacity: 0, y: 40 });
        gsap.set(section, {
          backgroundColor: 'var(--color-brand-light-3)',
        });
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
          .to(
            section,
            {
              backgroundColor: 'var(--color-brand-light-2)',
              duration: 0.45,
              ease: 'power1.inOut',
            },
            '-=0.15'
          )
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
          section,
          {
            backgroundColor: 'var(--color-brand-light-3)',
            duration: 0.35,
            ease: 'power1.inOut',
          },
          0
        )
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
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onEnter: () => {
        setStep(0, false);
        startEntryLock();
      },
      onEnterBack: () => {
        setStep(LAST_STEP, false);
        startEntryLock();
      },
    });

    window.addEventListener('wheel', onWheel, { passive: false });
  };

  const initBeddingTechSeasonal = () => {
    const section = document.querySelector('.bedding-tech-seasonal');
    if (!section) return;

    const medias = Array.from(
      section.querySelectorAll('.bedding-tech-seasonal__media')
    );
    if (!medias.length) return;

    gsap.set(medias, { top: '0%' });

    gsap
      .timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerHeight * 2}`,
          scrub: true,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      .to(medias, {
        top: '35%',
        duration: 0.2,
        stagger: 0.1,
      });
  };

  const start = () => {
    const init = () => {
      initBeddingTechHero();
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
