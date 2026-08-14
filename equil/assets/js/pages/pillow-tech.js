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

    const TRANSITION_DURATION = 0.75;
    const FADE_OUT_DURATION = TRANSITION_DURATION * 0.55;
    const IMAGE_REVEAL_DURATION = 1;

    let currentIndex = 0;
    let isTransitioning = false;
    let transitionTl = null;
    let imageTween = null;
    let revealImage = null;

    const media = section.querySelector('.pillow-tech-sleep-position__media');

    const cleanupRevealImage = () => {
      if (revealImage) {
        revealImage.remove();
        revealImage = null;
      }
    };

    const setImage = (index) => {
      const nextSrc = SLEEP_POSITION_IMAGES[index];
      if (!nextSrc || image.getAttribute('src') === nextSrc) return;
      if (!media) return;

      if (imageTween) {
        imageTween.kill();
        imageTween = null;
      }
      cleanupRevealImage();

      const nextRevealImage = document.createElement('img');
      nextRevealImage.className = 'pillow-tech-sleep-position__image-reveal';
      nextRevealImage.alt = image.alt || '';
      revealImage = nextRevealImage;

      const startReveal = () => {
        if (revealImage !== nextRevealImage) return;

        gsap.set(nextRevealImage, { xPercent: 100 });
        media.appendChild(nextRevealImage);

        imageTween = gsap.to(nextRevealImage, {
          xPercent: 0,
          duration: IMAGE_REVEAL_DURATION,
          ease: 'power2.inOut',
          onComplete: () => {
            if (revealImage !== nextRevealImage) return;
            image.src = nextSrc;
            cleanupRevealImage();
            imageTween = null;
          },
        });
      };

      nextRevealImage.src = nextSrc;
      if (nextRevealImage.complete) {
        startReveal();
      } else {
        nextRevealImage.addEventListener('load', startReveal, { once: true });
        nextRevealImage.addEventListener('error', startReveal, { once: true });
      }
    };

    const activateTab = (index, animate = true) => {
      if (index === currentIndex) return;
      if (animate && isTransitioning) return;

      const prevIndex = currentIndex;
      currentIndex = index;

      tabs.forEach((tab, tabIndex) => {
        const isActive = tabIndex === index;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
      });

      const prevPanel = panels[prevIndex];
      const nextPanel = panels[index];

      if (!animate) {
        if (transitionTl) {
          transitionTl.kill();
          transitionTl = null;
        }
        if (imageTween) {
          imageTween.kill();
          imageTween = null;
        }
        cleanupRevealImage();

        panels.forEach((panel, panelIndex) => {
          const isActive = panelIndex === index;
          panel.classList.toggle('is-active', isActive);
          panel.hidden = !isActive;
          gsap.set(panel, { opacity: 1, y: 0, clearProps: 'will-change' });
        });

        image.src = SLEEP_POSITION_IMAGES[index];
        gsap.set(image, { opacity: 1 });
        isTransitioning = false;
        return;
      }

      if (transitionTl) {
        transitionTl.kill();
        transitionTl = null;
      }

      isTransitioning = true;
      setImage(index);

      transitionTl = gsap.timeline({
        onComplete: () => {
          isTransitioning = false;
          transitionTl = null;
          gsap.set(nextPanel, { clearProps: 'will-change' });
        },
      });

      if (prevPanel && prevIndex !== index) {
        prevPanel.classList.remove('is-active');

        transitionTl.to(
          prevPanel,
          {
            opacity: 0,
            y: -8,
            duration: FADE_OUT_DURATION,
            ease: 'power2.in',
            onComplete: () => {
              prevPanel.hidden = true;
              gsap.set(prevPanel, { y: 0 });
            },
          },
          0
        );
      }

      transitionTl.add(() => {
        panels.forEach((panel, panelIndex) => {
          panel.classList.toggle('is-active', panelIndex === index);
        });
        nextPanel.hidden = false;
      });

      transitionTl.fromTo(
        nextPanel,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: TRANSITION_DURATION,
          ease: 'power2.out',
        }
      );
    };

    activateTab(0, false);

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const index = Number(tab.dataset.index);
        if (Number.isNaN(index)) return;
        activateTab(index, true);
      });
    });
  };

  const HOTSPOT_POSITIONS = [
    { left: '32%', top: '62%' },
    { left: '60%', top: '75%' },
    { left: '90%', top: '58%' },
  ];

  const initPillowTechStructure = () => {
    window.initScrollFeature({
      sectionSelector: '.pillow-tech-structure',
      hotspotPositions: HOTSPOT_POSITIONS,
    });
  };

  const initPillowTechZones = () => {
    const section = document.querySelector('.pillow-tech-zones');
    if (!section) return;

    const pillowIn = section.querySelector('.pillow-tech-zones__pillow-in');
    const callouts = Array.from(
      section.querySelectorAll('.pillow-tech-zones__callout')
    );
    if (!pillowIn || callouts.length !== 3) return;

    const FADE_UP_DURATION = 1.26;
    const IMAGE_FADE_DURATION = 1.6;
    const AFTER_IMAGE_DELAY = 1.2;
    const AFTER_CALLOUTS_HOLD = 2;
    const LEAVE_GRACE_MS = 500;
    const NEXT_CALLOUT_AT = 0.6; // 이전 텍스트 60% 지점
    const DOT_DURATION = 0.45;
    const LINE_DURATION = 0.75;

    let sequenceStarted = false;
    let canLeave = false;
    let hasCompleted = false;
    let leaveEnabledAt = 0;
    let pinTrigger = null;
    let calloutTl = null;
    let imageTween = null;
    let delayCall = null;
    let holdCall = null;

    const splitChars = (element) => {
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
            span.className = 'pillow-tech-zones__char';
            span.textContent = char;
            fragment.appendChild(span);
          });

          node.parentNode.replaceChild(fragment, node);
          return;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          Array.from(node.childNodes).forEach(walk);
        }
      };

      Array.from(element.childNodes).forEach(walk);
      return Array.from(element.querySelectorAll('.pillow-tech-zones__char'));
    };

    const calloutData = callouts.map((callout) => {
      const name = callout.querySelector('.pillow-tech-zones__callout-name');
      const desc = callout.querySelector('.pillow-tech-zones__callout-desc');
      const dot = callout.querySelector('.pillow-tech-zones__callout-dot');
      const line = callout.querySelector('.pillow-tech-zones__callout-line');
      const chars = [...splitChars(name), ...splitChars(desc)];

      gsap.set(dot, { opacity: 0 });
      gsap.set(line, { scaleY: 0, xPercent: -50, opacity: 1 });
      gsap.set(chars, { opacity: 0, y: 40 });

      return { callout, dot, line, chars };
    });

    const getTextTweenDuration = (chars) => {
      const stagger = FADE_UP_DURATION / Math.max(chars.length * 2.5, 1);
      if (chars.length <= 1) return FADE_UP_DURATION;
      return FADE_UP_DURATION + stagger * (chars.length - 1);
    };

    const setFinalVisualState = () => {
      gsap.set(pillowIn, { opacity: 1 });
      calloutData.forEach(({ dot, line, chars }) => {
        gsap.set(dot, { opacity: 1 });
        gsap.set(line, { scaleY: 1, xPercent: -50, opacity: 1 });
        gsap.set(chars, { opacity: 1, y: 0, clearProps: 'will-change' });
      });
    };

    const freezeCompletedState = () => {
      hasCompleted = true;
      canLeave = true;
      leaveEnabledAt = Date.now() + LEAVE_GRACE_MS;
      setFinalVisualState();

      // grace 후 pin만 해제 — 강제 scrollTo 없이 자연 스크롤로 이어짐
      gsap.delayedCall(LEAVE_GRACE_MS / 1000, releasePinForNaturalScroll);
    };

    const startSequence = () => {
      if (sequenceStarted || hasCompleted) return;
      sequenceStarted = true;

      imageTween = gsap.to(pillowIn, {
        opacity: 1,
        duration: IMAGE_FADE_DURATION,
        ease: 'none',
        onComplete: () => {
          imageTween = null;
          delayCall = gsap.delayedCall(AFTER_IMAGE_DELAY, playCallouts);
        },
      });
    };

    const playCallouts = () => {
      delayCall = null;

      if (calloutTl) {
        calloutTl.kill();
      }

      calloutData.forEach(({ dot, line, chars }) => {
        gsap.set(dot, { opacity: 0 });
        gsap.set(line, { scaleY: 0, xPercent: -50, opacity: 1 });
        gsap.set(chars, { opacity: 0, y: 40 });
      });

      calloutTl = gsap.timeline({
        onComplete: () => {
          holdCall = gsap.delayedCall(AFTER_CALLOUTS_HOLD, () => {
            holdCall = null;
            freezeCompletedState();
          });
        },
      });

      calloutData.forEach((item, index) => {
        const stagger =
          FADE_UP_DURATION / Math.max(item.chars.length * 2.5, 1);

        // 이전 텍스트 애니메이션 60% 지점에서 다음 콜아웃 시작
        const startPos =
          index === 0
            ? 0
            : `-=${
                getTextTweenDuration(calloutData[index - 1].chars) *
                (1 - NEXT_CALLOUT_AT)
              }`;

        calloutTl.to(
          item.dot,
          {
            opacity: 1,
            duration: DOT_DURATION,
            ease: 'power2.out',
          },
          startPos
        );

        calloutTl.to(item.line, {
          scaleY: 1,
          duration: LINE_DURATION,
          ease: 'power2.out',
        });

        calloutTl.to(item.chars, {
          opacity: 1,
          y: 0,
          duration: FADE_UP_DURATION,
          ease: 'power3.out',
          stagger: item.chars.length > 1 ? stagger : 0,
          onComplete: () => {
            gsap.set(item.chars, { clearProps: 'will-change' });
          },
        });
      });
    };

    const onWheel = (event) => {
      if (!pinTrigger || !pinTrigger.isActive) return;
      event.preventDefault();
    };

    const releasePinForNaturalScroll = () => {
      if (!pinTrigger) return;

      setFinalVisualState();
      pinTrigger.kill(true);
      pinTrigger = null;
      ScrollTrigger.refresh();
      window.scrollTo(0, section.offsetTop);
      window.removeEventListener('wheel', onWheel);
    };

    gsap.set(pillowIn, { opacity: 0 });

    pinTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=100%',
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onEnter: startSequence,
      onEnterBack: () => {
        if (hasCompleted) {
          setFinalVisualState();
        }
      },
    });

    window.addEventListener('wheel', onWheel, { passive: false });
  };

  const start = () => {
    const init = () => {
      initPillowTechHero();
      initPillowTechSleepPosition();
      initPillowTechStructure();
      initPillowTechZones();
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
