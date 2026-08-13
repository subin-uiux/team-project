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
        tab.classList.toggle('is-active', isActive);
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
    { left: '32%', top: '62%' },
    { left: '60%', top: '75%' },
    { left: '90%', top: '58%' },
  ];

  const initPillowTechStructure = () => {
    const section = document.querySelector('.pillow-tech-structure');
    if (!section) return;

    const features = Array.from(
      section.querySelectorAll('.scroll-feature__feature')
    );
    const hotspot = section.querySelector('.scroll-feature__hotspot');
    if (!features.length || !hotspot) return;

    const LAST_INDEX = features.length - 1;
    const COOLDOWN_MS = 1000;
    const ENTRY_LOCK_MS = 1000;
    const TRANSITION_DURATION = 1.2;
    const FADE_OUT_DURATION = TRANSITION_DURATION * 0.55;
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
      const pos = HOTSPOT_POSITIONS[index];

      if (!animate) {
        features.forEach((feature, i) => {
          const isActive = i === index;
          feature.classList.toggle('is-active', isActive);

          const indicator = feature.querySelector(
            '.scroll-feature__indicator'
          );
          const desc = feature.querySelector(
            '.scroll-feature__feature-desc'
          );

          if (indicator) gsap.set(indicator, { opacity: isActive ? 1 : 0 });
          if (desc) {
            desc.hidden = !isActive;
            gsap.set(desc, { opacity: isActive ? 1 : 0, y: 0 });
          }
        });

        if (pos) gsap.set(hotspot, { left: pos.left, top: pos.top });
        lastSwitchTime = 0;
        isTransitioning = false;
        return;
      }

      if (transitionTl) {
        transitionTl.kill();
        transitionTl = null;
      }

      isTransitioning = true;

      transitionTl = gsap.timeline({
        onComplete: () => {
          isTransitioning = false;
          transitionTl = null;
          lastSwitchTime = Date.now();
        },
      });

      // 1) 이전 항목 종료
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

      // 2) 이전 종료 후 새 항목 시작
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

      if (pos) {
        transitionTl.to(
          hotspot,
          {
            left: pos.left,
            top: pos.top,
            duration: TRANSITION_DURATION,
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

      // 섹션 진입 직후 대기
      if (isEntryLocked()) {
        event.preventDefault();
        return;
      }

      // 전환 중에는 이탈·다음 전환 차단
      if (isTransitioning) {
        event.preventDefault();
        return;
      }

      // 마지막 특징에서 아래 스크롤: 쿨다운 후 자연 스크롤로 다음 섹션
      if (goingDown && currentIndex === LAST_INDEX) {
        if (isInCooldown()) {
          event.preventDefault();
        }
        return;
      }

      // 첫 특징에서 위 스크롤: 자연 스크롤로 이전 섹션
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
        // 위에서 진입 / 첫 진입 → 01 기준 1-2-3
        activateFeature(0, false);
        startEntryLock();
      },
      onEnterBack: () => {
        // 아래에서 재진입 → 마지막 기준 역순
        activateFeature(LAST_INDEX, false);
        startEntryLock();
      },
    });

    window.addEventListener('wheel', onWheel, { passive: false });
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
