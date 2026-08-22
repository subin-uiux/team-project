(() => {
  const STATIC_SLIDE_DURATION = 3;
  const LAST_SLIDE_INDEX = 3;
  const FADE_UP_DURATION = 1.26;

  const padPage = (index) => String(index + 1).padStart(2, '0');

  const splitChars = (element, charClass) => {
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

  const initMattressTechCopyFadeUp = () => {
    const copy = document.querySelector('.mattress-tech-copy');
    if (!copy) return;

    const POST_HERO_FADE_UP_DURATION = 2;

    const targets = [
      copy.querySelector('.mattress-tech-copy__eng-title'),
      copy.querySelector('.mattress-tech-copy__title'),
      copy.querySelector('.mattress-tech-copy__desc'),
    ].filter(Boolean);
    if (!targets.length) return;

    const charClass = 'mattress-tech-copy__char';
    const allChars = targets.flatMap((element) =>
      splitChars(element, charClass)
    );
    if (!allChars.length) return;

    const charStagger =
      POST_HERO_FADE_UP_DURATION / Math.max(allChars.length * 2.5, 1);

    gsap.set(allChars, { opacity: 0, y: 40 });

    gsap.to(allChars, {
      opacity: 1,
      y: 0,
      duration: POST_HERO_FADE_UP_DURATION,
      ease: 'power3.out',
      stagger: allChars.length > 1 ? charStagger : 0,
      scrollTrigger: {
        trigger: copy,
        start: 'top 90%',
        once: true,
      },
      onComplete: () => {
        gsap.set(allChars, { clearProps: 'will-change' });
      },
    });
  };

  const initMattressTechHero = () => {
    if (typeof window.initTechHero !== 'function') return;
    window.initTechHero('mattress-tech-hero');
  };

  const initMattressTechResearch = () => {
    const section = document.querySelector('.mattress-tech-research');
    if (!section) return;

    const slides = Array.from(
      section.querySelectorAll('.mattress-tech-research__slide')
    );
    const video = section.querySelector('video.mattress-tech-research__media');
    const gauge = section.querySelector('.mattress-tech-research__gauge');
    const currentEl = section.querySelector('.mattress-tech-research__current');
    const dots = Array.from(
      section.querySelectorAll('.mattress-tech-research__dot')
    );
    if (!slides.length || !video || !gauge || !currentEl) return;

    const RESEARCH_SLIDE_DURATION = 2;
    const RESEARCH_SLIDE_EASE = 'power2.inOut';
    const compactQuery = window.matchMedia('(max-width: 63.9375rem)');
    const isHorizontal = () => compactQuery.matches;

    let currentIndex = 0;
    let isAnimating = false;
    let isLocked = false;
    let isTextAnimating = false;
    let gaugeTween = null;
    let autoTimer = null;
    let stopVideoSync = null;
    let pinTrigger = null;
    let textTween = null;
    let hasEnteredOnce = false;
    let skipTextAnimation = false;

    const contentCharsBySlide = slides.map((slide) => {
      const content = slide.querySelector('.mattress-tech-research__content');
      if (!content) return [];

      const targets = [
        content.querySelector('.mattress-tech-research__subtitle'),
        content.querySelector('.mattress-tech-research__desc'),
        content.querySelector('.mattress-tech-research__label'),
      ].filter(Boolean);

      const chars = targets.flatMap((element) =>
        splitChars(element, 'mattress-tech-research__char')
      );
      gsap.set(chars, { opacity: 0, y: 40 });
      return chars;
    });

    const getVisibleChars = (chars) =>
      chars.filter((char) => char.getClientRects().length > 0);

    const resetSlideText = (index) => {
      const chars = contentCharsBySlide[index] || [];
      gsap.killTweensOf(chars);
      gsap.set(chars, { opacity: 0, y: 40 });
    };

    const resetAllSlideText = () => {
      if (textTween) {
        textTween.kill();
        textTween = null;
      }
      isTextAnimating = false;
      contentCharsBySlide.forEach((_, index) => resetSlideText(index));
    };

    const showSlideTextComplete = (index) => {
      if (textTween) {
        textTween.kill();
        textTween = null;
      }
      isTextAnimating = false;
      contentCharsBySlide.forEach((chars, i) => {
        gsap.killTweensOf(chars);
        if (i !== index) {
          gsap.set(chars, { opacity: 0, y: 40 });
          return;
        }

        const visibleChars = getVisibleChars(chars);
        gsap.set(chars, { opacity: 0, y: 40 });
        gsap.set(visibleChars, { opacity: 1, y: 0 });
      });
    };

    const animateSlideText = (index) => {
      const chars = getVisibleChars(contentCharsBySlide[index] || []);
      if (!chars.length) {
        isTextAnimating = false;
        return;
      }

      if (textTween) {
        textTween.kill();
        textTween = null;
      }

      contentCharsBySlide.forEach((_, i) => {
        if (i !== index) resetSlideText(i);
      });

      gsap.set(chars, { opacity: 0, y: 40 });

      const charStagger =
        FADE_UP_DURATION / Math.max(chars.length * 2.5, 1);

      isTextAnimating = true;
      textTween = gsap.to(chars, {
        opacity: 1,
        y: 0,
        duration: FADE_UP_DURATION,
        ease: 'power3.out',
        stagger: chars.length > 1 ? charStagger : 0,
        onComplete: () => {
          textTween = null;
          isTextAnimating = false;
          gsap.set(chars, { clearProps: 'will-change' });
        },
      });
    };

    const updatePager = (index) => {
      currentEl.textContent = padPage(index);
      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === index;
        dot.classList.toggle('is-active', isActive);
        if (isActive) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    };

    const getSlideAxis = () => (isHorizontal() ? 'x' : 'y');
    const getOffAxis = () => (isHorizontal() ? 'y' : 'x');

    const stopTimers = () => {
      if (autoTimer) {
        autoTimer.kill();
        autoTimer = null;
      }
      if (gaugeTween) {
        gaugeTween.kill();
        gaugeTween = null;
      }
      if (stopVideoSync) {
        stopVideoSync();
        stopVideoSync = null;
      }
    };

    const resetGauge = () => {
      gsap.set(gauge, { scaleX: 0, transformOrigin: 'left center' });
    };

    const getVideoDuration = () =>
      new Promise((resolve) => {
        const read = () => {
          if (
            video.duration &&
            Number.isFinite(video.duration) &&
            video.duration > 0
          ) {
            resolve(video.duration);
            return true;
          }
          return false;
        };

        if (read()) return;

        const onMeta = () => {
          if (read()) {
            video.removeEventListener('loadedmetadata', onMeta);
          }
        };

        video.addEventListener('loadedmetadata', onMeta);
      });

    const resetSlides = (activeIndex) => {
      currentIndex = activeIndex;
      const axis = getSlideAxis();
      const offAxis = getOffAxis();
      slides.forEach((slide, index) => {
        const isActive = index === activeIndex;
        slide.classList.toggle('is-active', isActive);
        gsap.set(slide, {
          [axis]: isActive ? '0%' : '100%',
          [offAxis]: '0%',
          zIndex: isActive ? 2 : 1,
        });
      });
      updatePager(activeIndex);
    };

    const startSlideTimers = (index) => {
      stopTimers();
      resetGauge();
      if (skipTextAnimation) {
        showSlideTextComplete(index);
      } else {
        animateSlideText(index);
      }

      if (index === 0) {
        const onTimeUpdate = () => {
          if (
            video.duration &&
            Number.isFinite(video.duration) &&
            video.duration > 0
          ) {
            gsap.set(gauge, {
              scaleX: video.currentTime / video.duration,
              transformOrigin: 'left center',
            });
          }
        };

        const onEnded = () => {
          gsap.set(gauge, { scaleX: 1, transformOrigin: 'left center' });
          goTo(1);
        };

        stopVideoSync = () => {
          video.removeEventListener('timeupdate', onTimeUpdate);
          video.removeEventListener('ended', onEnded);
          video.pause();
        };

        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('ended', onEnded);
        video.playbackRate = 1.8;
        video.currentTime = 0;

        getVideoDuration().then(() => {
          if (currentIndex !== 0) return;
          const playPromise = video.play();
          if (playPromise) {
            playPromise.catch(() => {});
          }
        });

        return;
      }

      gaugeTween = gsap.to(gauge, {
        scaleX: 1,
        duration: STATIC_SLIDE_DURATION,
        ease: 'none',
        transformOrigin: 'left center',
      });

      autoTimer = gsap.delayedCall(STATIC_SLIDE_DURATION, () => {
        if (index < LAST_SLIDE_INDEX) {
          goTo(index + 1);
          return;
        }
        finishForward();
      });
    };

    const goTo = (nextIndex) => {
      if (isAnimating) return;
      if (nextIndex === currentIndex) return;
      if (nextIndex < 0 || nextIndex > LAST_SLIDE_INDEX) return;

      isAnimating = true;
      stopTimers();
      if (textTween) {
        textTween.kill();
        textTween = null;
      }
      isTextAnimating = false;

      const currentSlide = slides[currentIndex];
      const nextSlide = slides[nextIndex];
      const isForward = nextIndex > currentIndex;
      const axis = getSlideAxis();
      const offAxis = getOffAxis();
      const currentTo = isForward ? '-100%' : '100%';
      const nextFrom = isForward ? '100%' : '-100%';

      currentSlide.classList.remove('is-active');
      nextSlide.classList.add('is-active');
      updatePager(nextIndex);
      if (skipTextAnimation) {
        showSlideTextComplete(nextIndex);
      } else {
        resetSlideText(nextIndex);
      }

      gsap.set(nextSlide, { [axis]: nextFrom, [offAxis]: '0%', zIndex: 2 });
      gsap.set(currentSlide, { [offAxis]: '0%', zIndex: 1 });

      gsap
        .timeline({
          onComplete: () => {
            gsap.set(currentSlide, { [axis]: nextFrom, [offAxis]: '0%' });
            resetSlideText(currentIndex);
            currentIndex = nextIndex;
            isAnimating = false;
            startSlideTimers(nextIndex);
          },
        })
        .to(
          currentSlide,
          {
            [axis]: currentTo,
            duration: RESEARCH_SLIDE_DURATION,
            ease: RESEARCH_SLIDE_EASE,
          },
          0
        )
        .fromTo(
          nextSlide,
          { [axis]: nextFrom },
          {
            [axis]: '0%',
            duration: RESEARCH_SLIDE_DURATION,
            ease: RESEARCH_SLIDE_EASE,
          },
          0
        );
    };

    const activate = (startIndex) => {
      isLocked = true;
      isAnimating = false;
      skipTextAnimation = hasEnteredOnce;
      stopTimers();
      if (skipTextAnimation) {
        if (textTween) {
          textTween.kill();
          textTween = null;
        }
        resetSlides(startIndex);
        showSlideTextComplete(startIndex);
      } else {
        resetAllSlideText();
        resetSlides(startIndex);
      }
      resetGauge();
      startSlideTimers(startIndex);
    };

    const deactivate = () => {
      hasEnteredOnce = true;
      isLocked = false;
      isAnimating = false;
      isTextAnimating = false;
      stopTimers();
      if (textTween) {
        textTween.kill();
        textTween = null;
      }
      video.pause();
    };

    const finishForward = () => {
      isLocked = false;
      stopTimers();
    };

    const finishBackward = () => {
      isLocked = false;
      stopTimers();
      video.pause();
    };

    const onWheel = (event) => {
      if (!pinTrigger || !pinTrigger.isActive) return;

      if (isAnimating || isTextAnimating) {
        event.preventDefault();
        return;
      }

      const goingDown = event.deltaY > 0;

      if (!isLocked) return;

      if (goingDown && currentIndex === LAST_SLIDE_INDEX) {
        finishForward();
        return;
      }

      if (!goingDown && currentIndex === 0) {
        finishBackward();
        return;
      }

      event.preventDefault();

      if (goingDown) {
        goTo(currentIndex + 1);
        return;
      }

      goTo(currentIndex - 1);
    };

    resetAllSlideText();

    pinTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=100%',
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onEnter: () => activate(0),
      onEnterBack: () => activate(LAST_SLIDE_INDEX),
      onLeave: deactivate,
      onLeaveBack: deactivate,
    });

    section.addEventListener('wheel', onWheel, { passive: false });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        if (isAnimating || isTextAnimating) return;
        goTo(index);
      });
    });

    const onCompactChange = () => {
      resetSlides(currentIndex);
    };

    if (typeof compactQuery.addEventListener === 'function') {
      compactQuery.addEventListener('change', onCompactChange);
    } else if (typeof compactQuery.addListener === 'function') {
      compactQuery.addListener(onCompactChange);
    }
  };

  const initMattressTechStructureOverview = () => {
    const section = document.querySelector('.mattress-tech-structure-overview');
    const title = section?.querySelector('.mattress-tech-structure-overview__title');
    const image = section?.querySelector('.mattress-tech-structure-overview__image');
    if (!section || !title) return;

    const IMAGE_REVEAL_DURATION = 1.2;
    const TEXT_OVERLAP_AT = 0.5;

    const chars = splitChars(
      title,
      'mattress-tech-structure-overview__char'
    );
    const charStagger =
      FADE_UP_DURATION / Math.max(chars.length * 2.5, 1);
    const textDuration =
      chars.length <= 1
        ? FADE_UP_DURATION
        : FADE_UP_DURATION + charStagger * (chars.length - 1);

    gsap.set(chars, { opacity: 0, y: 40 });
    if (image) {
      gsap.set(image, {
        opacity: 0,
        scale: 0.96,
        y: 16,
        filter: 'blur(3px)',
      });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: title,
        start: 'top 90%',
        once: true,
      },
      onComplete: () => {
        gsap.set(chars, { clearProps: 'will-change' });
        if (image) {
          gsap.set(image, { clearProps: 'will-change' });
        }
      },
    });

    tl.to(chars, {
      opacity: 1,
      y: 0,
      duration: FADE_UP_DURATION,
      ease: 'power3.out',
      stagger: chars.length > 1 ? charStagger : 0,
    });

    if (image) {
      tl.to(
        image,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: IMAGE_REVEAL_DURATION,
          ease: 'power3.out',
        },
        textDuration * TEXT_OVERLAP_AT
      );
    }
  };

  const TOP_LAYER_IMAGES = [
    '../../assets/images/about/mattress-tech/mattress-tech-top-layer_char01.webp',
    '../../assets/images/about/mattress-tech/mattress-tech-top-layer_char02.webp',
    '../../assets/images/about/mattress-tech/mattress-tech-top-layer_char03.webp',
  ];

  const initMattressTechTopLayer = () => {
    if (typeof window.initScrollFeature !== 'function') return;

    window.initScrollFeature({
      sectionSelector: '.mattress-tech-top-layer',
      images: TOP_LAYER_IMAGES,
      imageTransition: 'crossfade',
      pinOnCompact: true,
    });
  };

  const initMattressTechSupportLayersOverview = () => {
    const section = document.querySelector('.mattress-tech-support-layers-overview');
    const stage = section?.querySelector('.mattress-tech-support-layers-overview__stage');
    const phrase = section?.querySelector('.mattress-tech-support-layers-overview__phrase');
    const leftText = section?.querySelector(
      '.mattress-tech-support-layers-overview__text--left'
    );
    const rightText = section?.querySelector(
      '.mattress-tech-support-layers-overview__text--right'
    );
    const spacer = section?.querySelector('.mattress-tech-support-layers-overview__spacer');
    const dot = section?.querySelector('.mattress-tech-support-layers-overview__dot');
    const line = section?.querySelector('.mattress-tech-support-layers-overview__line');
    if (
      !section ||
      !stage ||
      !phrase ||
      !leftText ||
      !rightText ||
      !spacer ||
      !dot ||
      !line
    ) {
      return;
    }

    const SPLIT_GAP = 564;
    const SPLIT_GAP_TABLET = 232;
    const SPLIT_DURATION = 1;
    const DOT_DURATION = 0.45;
    const AFTER_HOLD = 1.5;
    const INITIAL_SPACER = 12;
    const MIN_PADDING_PC = 60;
    const compactQuery = window.matchMedia('(max-width: 63.9375rem)');
    const tabletQuery = window.matchMedia(
      '(min-width: 48rem) and (max-width: 63.9375rem)'
    );

    const getContentWidth = () => {
      if (!compactQuery.matches) {
        return window.innerWidth - MIN_PADDING_PC * 2;
      }

      const style = getComputedStyle(stage);
      const paddingInline =
        parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      return stage.clientWidth - paddingInline;
    };

    const getSplitGap = () => {
      const leftWidth = leftText.getBoundingClientRect().width;
      const rightWidth = rightText.getBoundingClientRect().width;
      const paddingLimitedSpacer = Math.max(
        INITIAL_SPACER,
        getContentWidth() - leftWidth - rightWidth
      );

      if (!compactQuery.matches) {
        return Math.min(SPLIT_GAP, paddingLimitedSpacer);
      }

      if (tabletQuery.matches) {
        return Math.min(SPLIT_GAP_TABLET, paddingLimitedSpacer);
      }

      return paddingLimitedSpacer;
    };

    const updateSpacerLayout = () => {
      if (!sequenceStarted && !hasCompleted) return;
      gsap.set(spacer, { width: getSplitGap() });
    };

    let sequenceStarted = false;
    let hasCompleted = false;
    let pinTrigger = null;
    let sequenceTl = null;
    let holdCall = null;

    const leftChars = splitChars(leftText, 'mattress-tech-support-layers-overview__char');
    const rightChars = splitChars(
      rightText,
      'mattress-tech-support-layers-overview__char'
    );
    const chars = [...leftChars, ...rightChars];
    const charStagger =
      FADE_UP_DURATION / Math.max(chars.length * 2.5, 1);

    const setInitialVisualState = () => {
      gsap.set(chars, { opacity: 0, y: 40 });
      gsap.set(spacer, { width: INITIAL_SPACER });
      gsap.set(dot, { opacity: 0 });
      gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
    };

    const setFinalVisualState = () => {
      gsap.set(chars, { opacity: 1, y: 0, clearProps: 'will-change' });
      gsap.set(spacer, { width: getSplitGap() });
      gsap.set(dot, { opacity: 1 });
      gsap.set(line, { scaleX: 1, transformOrigin: 'left center' });
    };

    const releasePinForNaturalScroll = () => {
      if (!pinTrigger) return;

      setFinalVisualState();

      const scrollY = window.scrollY;
      const beforeTop = section.getBoundingClientRect().top;

      pinTrigger.kill(true);
      pinTrigger = null;
      ScrollTrigger.refresh();

      const afterTop = section.getBoundingClientRect().top;
      window.scrollTo(0, scrollY + (afterTop - beforeTop));
      window.removeEventListener('wheel', onWheel);
    };

    const freezeCompletedState = () => {
      hasCompleted = true;
      setFinalVisualState();
      // 사라지는 페이드아웃(또는 여유 딜레이)을 제거하고
      // 애니메이션 완료 직후 pin만 해제합니다.
      releasePinForNaturalScroll();
    };

    const playSequence = () => {
      if (sequenceStarted || hasCompleted) return;
      sequenceStarted = true;

      if (sequenceTl) {
        sequenceTl.kill();
      }

      setInitialVisualState();

      sequenceTl = gsap.timeline({
        onComplete: () => {
          holdCall = gsap.delayedCall(AFTER_HOLD, () => {
            holdCall = null;
            freezeCompletedState();
          });
        },
      });

      sequenceTl.to(chars, {
        opacity: 1,
        y: 0,
        duration: FADE_UP_DURATION,
        ease: 'power3.out',
        stagger: chars.length > 1 ? charStagger : 0,
        onComplete: () => {
          gsap.set(chars, { clearProps: 'will-change' });
        },
      });

      sequenceTl.add(() => {
        gsap.set(line, { scaleX: 1, transformOrigin: 'left center' });
      });

      sequenceTl.to(spacer, {
        width: getSplitGap(),
        duration: SPLIT_DURATION,
        ease: 'power2.inOut',
      });

      sequenceTl.to(
        dot,
        {
          opacity: 1,
          duration: DOT_DURATION,
          ease: 'power2.out',
        },
        '<'
      );
    };

    const onWheel = (event) => {
      if (!pinTrigger || !pinTrigger.isActive) return;
      event.preventDefault();
    };

    setInitialVisualState();

    pinTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=100%',
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onEnter: playSequence,
      onEnterBack: () => {
        if (hasCompleted) {
          setFinalVisualState();
        }
      },
    });

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', updateSpacerLayout);
    if (typeof compactQuery.addEventListener === 'function') {
      compactQuery.addEventListener('change', updateSpacerLayout);
    } else if (typeof compactQuery.addListener === 'function') {
      compactQuery.addListener(updateSpacerLayout);
    }
    if (typeof tabletQuery.addEventListener === 'function') {
      tabletQuery.addEventListener('change', updateSpacerLayout);
    } else if (typeof tabletQuery.addListener === 'function') {
      tabletQuery.addListener(updateSpacerLayout);
    }
  };

  const SUPPORT_LAYERS_TABS = [
    {
      cards: [
        {
          image:
            '../../assets/images/about/mattress-tech/mattress-tech-support-layer_soft01.webp',
          engTitle: 'Soft Memory Foam',
          title: '소프트 메모리폼',
          text: '몸의 굴곡을 부드럽게 감싸며 어깨와 골반처럼<br>압력이 집중되는 부위의 부담을 분산해 줍니다.',
        },
        {
          image:
            '../../assets/images/about/mattress-tech/mattress-tech-support-layer_soft02.webp',
          engTitle: 'High-Resilience Support Foam',
          title: '고탄성 지지폼',
          text: '몸이 지나치게 가라앉지 않도록 안정적으로 받쳐주며,<br>부드러운 착와감과 균형 잡힌 지지력을 유지합니다.',
        },
        {
          image:
            '../../assets/images/about/mattress-tech/mattress-tech-support-layer_soft03.webp',
          engTitle: 'Soft Zoned Pocket Spring',
          title: '소프트 존 포켓스프링',
          text: '독립 포켓스프링이 신체 움직임과 부위별 하중에 유연하게 반응해,<br>부드러운 반발력과 안정적인 지지를 제공합니다.',
        },
      ],
    },
    {
      cards: [
        {
          image:
            '../../assets/images/about/mattress-tech/mattress-tech-support-layer_balance01.webp',
          engTitle: 'Responsive Comfort Foam',
          title: '반응형 컴포트폼',
          text: '몸의 움직임과 하중 변화에 빠르게 반응해<br>신체 굴곡을 자연스럽게 따라가며 편안하게 밀착됩니다.',
        },
        {
          image:
            '../../assets/images/about/mattress-tech/mattress-tech-support-layer_balance02.webp',
          engTitle: 'Balance HR Foam',
          title: '밸런스 고탄성폼',
          text: '적당한 탄성과 복원력으로 몸을 안정적으로 받쳐주며,<br>부드러운 착와감과 탄탄한 지지감의 균형을 잡아줍니다.',
        },
        {
          image:
            '../../assets/images/about/mattress-tech/mattress-tech-support-layer_balance03.webp',
          engTitle: 'Medium Zoned Pocket Spring',
          title: '미디엄 존 포켓스프링',
          text: '부위별 하중에 세밀하게 반응해 어깨와 골반을 안정적으로 받치며,<br>수면 중에도 균형 잡힌 자세를 유지하도록 돕습니다.',
        },
      ],
    },
    {
      cards: [
        {
          image:
            '../../assets/images/about/mattress-tech/mattress-tech-support-layer_firm01.webp',
          engTitle: 'High-Resilience Comfort Foam',
          title: '고탄성 컴포트폼',
          text: '몸의 움직임과 압력에 탄력 있게 반응해 단단하면서도<br>지나치게 딱딱하지 않은 착와감을 제공합니다.',
        },
        {
          image:
            '../../assets/images/about/mattress-tech/mattress-tech-support-layer_firm02.webp',
          engTitle: 'High-Density Support Foam',
          title: '고밀도 서포트폼',
          text: '높은 밀도의 폼이 신체 하중을 견고하게 받쳐 깊은 꺼짐을 줄이고,<br>오랜 시간 안정적인 지지감과 구조적 균형을 유지합니다.',
        },
        {
          image:
            '../../assets/images/about/mattress-tech/mattress-tech-support-layer_firm03.webp',
          engTitle: 'Firm Zoned Pocket Spring',
          title: '펌 존 포켓스프링',
          text: '단단한 독립 포켓스프링이 허리와 골반을 안정적으로 지지하며,<br>탄탄한 반발력으로 균형 잡힌 수면 자세를 유지합니다.',
        },
      ],
    },
  ];

  const initMattressTechSupportLayers = () => {
    const section = document.querySelector('.mattress-tech-support-layers');
    if (!section) return;

    const heading = section.querySelector(
      '.mattress-tech-support-layers__heading'
    );
    const tabs = Array.from(
      section.querySelectorAll('.mattress-tech-support-layers__tab')
    );
    const cards = Array.from(
      section.querySelectorAll('.mattress-tech-support-layers__card')
    );
    const dots = Array.from(
      section.querySelectorAll('.mattress-tech-support-layers__dot')
    );
    const slider = section.querySelector('.mattress-tech-support-layers__slider');
    if (!heading || !tabs.length || cards.length !== 3 || !slider) return;

    const FADE_DURATION = 0.35;
    const SWIPE_THRESHOLD = 40;
    const compactQuery = window.matchMedia('(max-width: 63.9375rem)');
    const mobileQuery = window.matchMedia('(max-width: 47.9375rem)');
    let currentIndex = 0;
    let currentCardIndex = 0;
    let isTransitioning = false;
    let transitionTl = null;
    let cardTransitionTl = null;
    let touchStartX = null;
    let touchGestureHandled = false;

    const headingTargets = [
      heading.querySelector('.heading-3tier__sub-title'),
      heading.querySelector('.heading-3tier__title'),
      heading.querySelector('.heading-3tier__desc'),
    ].filter(Boolean);

    const headingChars = headingTargets.flatMap((element) =>
      splitChars(element, 'heading-3tier__char')
    );

    if (headingChars.length) {
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
          trigger: heading,
          start: 'top 90%',
          once: true,
        },
        onComplete: () => {
          gsap.set(headingChars, { clearProps: 'will-change' });
        },
      });
    }

    const cardNodes = cards.map((card) => ({
      image: card.querySelector('.mattress-tech-support-layers__card-image'),
      engTitle: card.querySelector('.card-material__eng-title'),
      title: card.querySelector('.card-material__title'),
      text: card.querySelector('.card-material__text'),
    }));

    if (cardNodes.some((node) => !node.image || !node.engTitle || !node.title || !node.text)) {
      return;
    }

    const applyTabContent = (index) => {
      const tabData = SUPPORT_LAYERS_TABS[index];
      if (!tabData) return;

      tabData.cards.forEach((item, cardIndex) => {
        const node = cardNodes[cardIndex];
        if (!node) return;

        node.image.setAttribute('src', item.image);
        node.engTitle.textContent = item.engTitle;
        node.title.textContent = item.title;
        node.text.innerHTML = item.text;
      });
    };

    const setActiveTab = (index) => {
      tabs.forEach((tab, tabIndex) => {
        const isActive = tabIndex === index;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    };

    const updateCardVisibility = () => {
      cards.forEach((card, cardIndex) => {
        const isActive = !compactQuery.matches || cardIndex === currentCardIndex;
        card.classList.toggle('is-active', isActive);
        if (!compactQuery.matches) {
          gsap.set(card, { clearProps: 'opacity' });
        } else {
          gsap.set(card, { opacity: isActive ? 1 : 0 });
        }
      });

      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === currentCardIndex;
        dot.classList.toggle('is-active', isActive);
        if (isActive) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    };

    const goToCard = (index) => {
      if (!mobileQuery.matches || isTransitioning) return;

      const nextIndex = Math.max(0, Math.min(cards.length - 1, index));
      if (nextIndex === currentCardIndex) return;

      isTransitioning = true;
      const outgoing = cards[currentCardIndex];
      const incoming = cards[nextIndex];

      incoming.classList.add('is-active');
      gsap.set(incoming, { opacity: 0 });

      if (cardTransitionTl) {
        cardTransitionTl.kill();
      }

      cardTransitionTl = gsap.timeline({
        onComplete: () => {
          outgoing.classList.remove('is-active');
          gsap.set(outgoing, { opacity: 0 });
          currentCardIndex = nextIndex;
          isTransitioning = false;
          cardTransitionTl = null;
          updateCardVisibility();
        },
      });

      cardTransitionTl.to(
        outgoing,
        {
          opacity: 0,
          duration: FADE_DURATION,
          ease: 'power2.out',
        },
        0
      );

      cardTransitionTl.to(
        incoming,
        {
          opacity: 1,
          duration: FADE_DURATION,
          ease: 'power2.out',
        },
        0
      );
    };

    const onTouchStart = (event) => {
      if (!mobileQuery.matches || !event.touches?.length) return;
      touchStartX = event.touches[0].clientX;
      touchGestureHandled = false;
    };

    const onTouchMove = (event) => {
      if (
        touchStartX === null ||
        !mobileQuery.matches ||
        isTransitioning ||
        !event.touches?.length
      ) {
        return;
      }

      const deltaX = event.touches[0].clientX - touchStartX;
      if (touchGestureHandled || Math.abs(deltaX) < SWIPE_THRESHOLD) return;

      touchGestureHandled = true;
      if (deltaX < 0) {
        goToCard(currentCardIndex + 1);
      } else {
        goToCard(currentCardIndex - 1);
      }
    };

    const onTouchEnd = () => {
      touchStartX = null;
      touchGestureHandled = false;
    };

    const cardsWrap = section.querySelector(
      '.mattress-tech-support-layers__cards'
    );
    if (!cardsWrap) return;

    const switchTab = (index) => {
      if (
        index === currentIndex ||
        isTransitioning ||
        !SUPPORT_LAYERS_TABS[index]
      ) {
        return;
      }

      isTransitioning = true;
      setActiveTab(index);

      if (transitionTl) {
        transitionTl.kill();
      }

      transitionTl = gsap.timeline({
        onComplete: () => {
          isTransitioning = false;
          transitionTl = null;
        },
      });

      transitionTl.to(cardsWrap, {
        opacity: 0,
        duration: FADE_DURATION,
        ease: 'power2.out',
        onComplete: () => {
          applyTabContent(index);
          currentIndex = index;
          currentCardIndex = 0;
          updateCardVisibility();
        },
      });

      transitionTl.to(cardsWrap, {
        opacity: 1,
        duration: FADE_DURATION,
        ease: 'power2.out',
      });
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const index = Number(tab.dataset.index);
        if (Number.isNaN(index)) return;
        switchTab(index);
      });
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        goToCard(index);
      });
    });

    slider.addEventListener('touchstart', onTouchStart, { passive: true });
    slider.addEventListener('touchmove', onTouchMove, { passive: true });
    slider.addEventListener('touchend', onTouchEnd, { passive: true });
    slider.addEventListener('touchcancel', onTouchEnd, { passive: true });

    compactQuery.addEventListener('change', () => {
      if (!compactQuery.matches) {
        currentCardIndex = 0;
      }
      updateCardVisibility();
    });
    updateCardVisibility();
  };

  const PRESSURE_DESCS = [
    '어깨와 골반의 압력을 부드럽게 분산합니다.',
    '몸 전체의 지지와 움직임을 균형 있게 연결합니다.',
    '허리와 골반을 중심으로 탄탄하게 받칩니다.',
  ];

  const PRESSURE_BG_KEYS = ['soft', 'balance', 'firm'];

  const initMattressTechPressure = () => {
    const section = document.querySelector('.mattress-tech-pressure');
    if (!section) return;

    const title = section.querySelector('.mattress-tech-pressure__title');
    const desc = section.querySelector('.mattress-tech-pressure__desc');
    const line = section.querySelector('.mattress-tech-pressure__line');
    const tabs = Array.from(
      section.querySelectorAll('.mattress-tech-pressure__tab')
    );
    const bgOrigin = section.querySelector(
      '.mattress-tech-pressure__bg--origin'
    );
    const bgLayers = {
      soft: section.querySelector('.mattress-tech-pressure__bg--soft'),
      balance: section.querySelector('.mattress-tech-pressure__bg--balance'),
      firm: section.querySelector('.mattress-tech-pressure__bg--firm'),
    };
    if (!title || !desc || !line || !tabs.length || !bgOrigin) return;
    if (!bgLayers.soft || !bgLayers.balance || !bgLayers.firm) return;

    const TITLE_HOLD = 1;
    const TITLE_FADE_OUT = 0.6;
    const LINE_DURATION = 1.6;
    const BG_INTRO_DURATION = 3.2;
    const BG_FADE_OUT_DURATION = 0.6;
    const BG_ORIGIN_HOLD = 0.25;
    const BG_FADE_IN_DURATION = 3;
    const BG_INTRO_DELAY = 1.1;
    const compactQuery = window.matchMedia('(max-width: 63.9375rem)');
    let currentIndex = 0;
    let lineTween = null;
    let bgTween = null;
    let introPlayed = false;
    let softRevealed = false;

    const titleChars = splitChars(title, 'mattress-tech-pressure__char');
    const titleStagger =
      FADE_UP_DURATION / Math.max(titleChars.length * 2.5, 1);

    gsap.set(titleChars, { opacity: 0, y: 40 });
    gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(bgOrigin, { opacity: 1 });
    gsap.set([bgLayers.soft, bgLayers.balance, bgLayers.firm], {
      opacity: 0,
      scale: 1,
    });

    /* soft / balance / firm 프리로드 */
    Object.values(bgLayers).forEach((img) => {
      if (!img.complete) {
        const preload = new Image();
        preload.src = img.currentSrc || img.src;
      }
    });

    const playLine = () => {
      if (lineTween) {
        lineTween.kill();
      }

      const origin = compactQuery.matches ? 'center' : 'left center';
      gsap.set(line, { scaleX: 0, transformOrigin: origin });
      lineTween = gsap.to(line, {
        scaleX: 1,
        duration: LINE_DURATION,
        ease: 'power2.out',
      });
    };

    const setActiveTab = (index) => {
      tabs.forEach((tab, tabIndex) => {
        const isActive = tabIndex === index;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    };

    const getLayerByIndex = (index) => bgLayers[PRESSURE_BG_KEYS[index]];

    const transitionBgViaOrigin = (nextIndex) => {
      const nextLayer = getLayerByIndex(nextIndex);
      if (!nextLayer) return;

      if (bgTween) {
        bgTween.kill();
        bgTween = null;
      }

      const stateLayers = [bgLayers.soft, bgLayers.balance, bgLayers.firm];

      Object.entries(bgLayers).forEach(([key, layer]) => {
        layer.classList.toggle('is-active', key === PRESSURE_BG_KEYS[nextIndex]);
      });

      bgTween = gsap.timeline({
        onComplete: () => {
          bgTween = null;
        },
      });

      /* 1) 현재 상태 이미지 내려 origin만 보이게 */
      bgTween.to(stateLayers, {
        opacity: 0,
        scale: 1,
        duration: BG_FADE_OUT_DURATION,
        ease: 'sine.inOut',
      });

      /* 2) 기본 사진 유지 텀 */
      bgTween.to({}, { duration: BG_ORIGIN_HOLD });

      /* 3) 선택한 탭 이미지 다시 페이드인 */
      bgTween.fromTo(
        nextLayer,
        { opacity: 0, scale: 1 },
        {
          opacity: 1,
          scale: 1.02,
          duration: BG_FADE_IN_DURATION,
          ease: 'sine.inOut',
        }
      );
    };

    const revealSoftIntro = () => {
      if (softRevealed) return;
      softRevealed = true;

      if (bgTween) {
        bgTween.kill();
        bgTween = null;
      }

      bgLayers.soft.classList.add('is-active');
      bgTween = gsap.to(bgLayers.soft, {
        opacity: 1,
        scale: 1.02,
        duration: BG_INTRO_DURATION,
        ease: 'sine.inOut',
        onComplete: () => {
          bgTween = null;
        },
      });
    };

    const switchTab = (index) => {
      if (index === currentIndex || !PRESSURE_DESCS[index]) return;
      if (!softRevealed) {
        softRevealed = true;
      }

      transitionBgViaOrigin(index);
      currentIndex = index;
      setActiveTab(index);
      desc.textContent = PRESSURE_DESCS[index];
      playLine();
    };

    const playIntro = () => {
      if (introPlayed) return;
      introPlayed = true;

      const introTl = gsap.timeline();

      introTl.to(titleChars, {
        opacity: 1,
        y: 0,
        duration: FADE_UP_DURATION,
        ease: 'power3.out',
        stagger: titleChars.length > 1 ? titleStagger : 0,
        onComplete: () => {
          gsap.set(titleChars, { clearProps: 'will-change' });
        },
      });

      introTl.add(revealSoftIntro, BG_INTRO_DELAY);

      if (!compactQuery.matches) {
        introTl.to(
          title,
          {
            opacity: 0,
            duration: TITLE_FADE_OUT,
            ease: 'power1.out',
          },
          `+=${TITLE_HOLD}`
        );
      }

      playLine();
    };

    compactQuery.addEventListener('change', () => {
      if (compactQuery.matches) {
        gsap.set(title, { opacity: 1 });
        return;
      }

      if (introPlayed) {
        gsap.set(title, { opacity: 0 });
      }
    });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 90%',
      once: true,
      onEnter: playIntro,
    });

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const index = Number(tab.dataset.index);
        if (Number.isNaN(index)) return;
        switchTab(index);
      });
    });
  };

  const initMattressTechProcess = () => {
    const section = document.querySelector('.mattress-tech-process');
    if (!section) return;

    const heading = section.querySelector('.mattress-tech-process__heading');
    const items = Array.from(
      section.querySelectorAll('.mattress-tech-process__item')
    );
    const dots = Array.from(
      section.querySelectorAll('.mattress-tech-process__dot')
    );
    if (!heading || !items.length) return;

    const IMAGE_REVEAL_DURATION = 2.4;
    const PROCESS_FADE_UP_DURATION = FADE_UP_DURATION * 2;
    const NEXT_ITEM_AT = 0.1;
    const FADE_DURATION = 0.35;
    const mobileQuery = window.matchMedia('(max-width: 47.9375rem)');
    let itemsStarted = false;
    let currentItemIndex = 0;
    let isTransitioning = false;
    let itemTween = null;

    const headingTargets = [
      heading.querySelector('.heading-3tier__sub-title'),
      heading.querySelector('.heading-3tier__title'),
      heading.querySelector('.heading-3tier__desc'),
    ].filter(Boolean);

    const headingChars = headingTargets.flatMap((element) =>
      splitChars(element, 'heading-3tier__char')
    );
    const headingStagger =
      FADE_UP_DURATION / Math.max(headingChars.length * 2.5, 1);

    const itemData = items.map((item) => {
      const image = item.querySelector('.mattress-tech-process__image');
      const title = item.querySelector('.mattress-tech-process__item-title');
      const desc = item.querySelector('.mattress-tech-process__item-desc');
      const chars = [title, desc]
        .filter(Boolean)
        .flatMap((element) =>
          splitChars(element, 'mattress-tech-process__char')
        );

      if (image) {
        gsap.set(image, { clipPath: 'inset(100% 0 0 0)' });
      }
      gsap.set(chars, { opacity: 0, y: 40 });

      return { image, chars };
    });

    const getTextTweenDuration = (chars) => {
      const stagger = PROCESS_FADE_UP_DURATION / Math.max(chars.length * 2.5, 1);
      if (chars.length <= 1) return PROCESS_FADE_UP_DURATION;
      return PROCESS_FADE_UP_DURATION + stagger * (chars.length - 1);
    };

    const getItemDuration = (chars) =>
      Math.max(IMAGE_REVEAL_DURATION, getTextTweenDuration(chars));

    const revealItems = () => {
      itemData.forEach((item) => {
        if (item.image) {
          gsap.set(item.image, { clipPath: 'inset(0% 0 0 0)' });
        }
        gsap.set(item.chars, { opacity: 1, y: 0, clearProps: 'will-change' });
      });
    };

    const updateItemVisibility = () => {
      items.forEach((item, index) => {
        const isActive = !mobileQuery.matches || index === currentItemIndex;
        item.classList.toggle('is-active', isActive);
        if (!mobileQuery.matches) {
          gsap.set(item, { clearProps: 'opacity' });
        } else {
          gsap.set(item, { opacity: isActive ? 1 : 0 });
        }
      });

      dots.forEach((dot, index) => {
        const isActive = index === currentItemIndex;
        dot.classList.toggle('is-active', isActive);
        if (isActive) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    };

    const goToItem = (index) => {
      if (!mobileQuery.matches || isTransitioning) return;

      const nextIndex = Math.max(0, Math.min(items.length - 1, index));
      if (nextIndex === currentItemIndex) return;

      isTransitioning = true;
      const outgoing = items[currentItemIndex];
      const incoming = items[nextIndex];

      incoming.classList.add('is-active');
      gsap.set(incoming, { opacity: 0 });

      if (itemTween) {
        itemTween.kill();
      }

      itemTween = gsap.timeline({
        onComplete: () => {
          outgoing.classList.remove('is-active');
          gsap.set(outgoing, { opacity: 0 });
          currentItemIndex = nextIndex;
          isTransitioning = false;
          itemTween = null;
          updateItemVisibility();
        },
      });

      itemTween.to(
        outgoing,
        {
          opacity: 0,
          duration: FADE_DURATION,
          ease: 'power2.out',
        },
        0
      );

      itemTween.to(
        incoming,
        {
          opacity: 1,
          duration: FADE_DURATION,
          ease: 'power2.out',
        },
        0
      );
    };

    const playItems = () => {
      if (itemsStarted) return;
      itemsStarted = true;

      if (mobileQuery.matches) {
        revealItems();
        return;
      }

      const itemsTl = gsap.timeline();

      itemData.forEach((item, index) => {
        const textStagger =
          PROCESS_FADE_UP_DURATION / Math.max(item.chars.length * 2.5, 1);
        const startPos =
          index === 0
            ? 0
            : `-=${
                getItemDuration(itemData[index - 1].chars) * (1 - NEXT_ITEM_AT)
              }`;

        if (item.image) {
          itemsTl.to(
            item.image,
            {
              clipPath: 'inset(0% 0 0 0)',
              duration: IMAGE_REVEAL_DURATION,
              ease: 'power2.out',
            },
            startPos
          );
        } else {
          itemsTl.to({}, { duration: IMAGE_REVEAL_DURATION }, startPos);
        }

        itemsTl.to(
          item.chars,
          {
            opacity: 1,
            y: 0,
            duration: PROCESS_FADE_UP_DURATION,
            ease: 'power3.out',
            stagger: item.chars.length > 1 ? textStagger : 0,
            onComplete: () => {
              gsap.set(item.chars, { clearProps: 'will-change' });
            },
          },
          '<'
        );
      });
    };

    if (headingChars.length) {
      gsap.set(headingChars, { opacity: 0, y: 40 });
      gsap.to(headingChars, {
        opacity: 1,
        y: 0,
        duration: FADE_UP_DURATION,
        ease: 'power3.out',
        stagger: headingChars.length > 1 ? headingStagger : 0,
        scrollTrigger: {
          trigger: heading,
          start: 'top 90%',
          once: true,
          onEnter: playItems,
        },
        onComplete: () => {
          gsap.set(headingChars, { clearProps: 'will-change' });
        },
      });
    } else {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 90%',
        once: true,
        onEnter: playItems,
      });
    }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        goToItem(index);
      });
    });

    mobileQuery.addEventListener('change', () => {
      if (!mobileQuery.matches) {
        currentItemIndex = 0;
      }
      updateItemVisibility();
    });
    updateItemVisibility();
  };

  const start = () => {
    const init = () => {
      initMattressTechHero();
      initMattressTechCopyFadeUp();
      initMattressTechResearch();
      initMattressTechStructureOverview();
      initMattressTechTopLayer();
      initMattressTechSupportLayersOverview();
      initMattressTechSupportLayers();
      initMattressTechPressure();
      initMattressTechProcess();
      ScrollTrigger.refresh();
    };

    if (!window.equilLibsReady) {
      init();
      return;
    }

    window.equilLibsReady.then(init).catch((error) => {
      console.error('[mattress-tech] GSAP init failed:', error);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
