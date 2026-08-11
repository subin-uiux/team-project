(() => {
  const SLIDE_DURATION = 1;
  const STATIC_SLIDE_DURATION = 3;
  const LAST_SLIDE_INDEX = 3;

  const padPage = (index) => String(index + 1).padStart(2, '0');

  const initMattressTechHero = () => {
    const hero = document.querySelector('.mattress-tech-hero');
    if (!hero) return;

    const image = hero.querySelector('.mattress-tech-hero__image');
    const overlay = hero.querySelector('.mattress-tech-hero__overlay');
    const content = hero.querySelector('.mattress-tech-hero__content');
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

  const initMattressTechResearch = () => {
    const section = document.querySelector('.mattress-tech-research');
    if (!section) return;

    const slides = Array.from(
      section.querySelectorAll('.mattress-tech-research__slide')
    );
    const video = section.querySelector('video.mattress-tech-research__media');
    const gauge = section.querySelector('.mattress-tech-research__gauge');
    const currentEl = section.querySelector('.mattress-tech-research__current');
    if (!slides.length || !video || !gauge || !currentEl) return;

    let currentIndex = 0;
    let isAnimating = false;
    let isLocked = false;
    let gaugeTween = null;
    let autoTimer = null;
    let stopVideoSync = null;
    let pinTrigger = null;

    const updatePager = (index) => {
      currentEl.textContent = padPage(index);
    };

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
          if (video.duration && Number.isFinite(video.duration) && video.duration > 0) {
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
      slides.forEach((slide, index) => {
        const isActive = index === activeIndex;
        slide.classList.toggle('is-active', isActive);
        gsap.set(slide, {
          x: isActive ? '0%' : '-100%',
          zIndex: isActive ? 2 : 1,
        });
      });
      updatePager(activeIndex);
    };

    const startSlideTimers = (index) => {
      stopTimers();
      resetGauge();

      if (index === 0) {
        const onTimeUpdate = () => {
          if (video.duration && Number.isFinite(video.duration) && video.duration > 0) {
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

      const currentSlide = slides[currentIndex];
      const nextSlide = slides[nextIndex];
      const isForward = nextIndex > currentIndex;
      const currentTo = isForward ? '100%' : '-100%';
      const nextFrom = isForward ? '-100%' : '100%';

      currentSlide.classList.remove('is-active');
      nextSlide.classList.add('is-active');
      updatePager(nextIndex);

      gsap.set(nextSlide, { x: nextFrom, zIndex: 2 });
      gsap.set(currentSlide, { zIndex: 1 });

      gsap
        .timeline({
          onComplete: () => {
            gsap.set(currentSlide, { x: nextFrom });
            currentIndex = nextIndex;
            isAnimating = false;
            startSlideTimers(nextIndex);
          },
        })
        .to(currentSlide, { x: currentTo, duration: SLIDE_DURATION, ease: 'none' }, 0)
        .fromTo(
          nextSlide,
          { x: nextFrom },
          { x: '0%', duration: SLIDE_DURATION, ease: 'none' },
          0
        );
    };

    const activate = (startIndex) => {
      isLocked = true;
      isAnimating = false;
      stopTimers();
      resetSlides(startIndex);
      resetGauge();
      startSlideTimers(startIndex);
    };

    const deactivate = () => {
      isLocked = false;
      isAnimating = false;
      stopTimers();
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

      if (isAnimating) {
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
  };

  const start = () => {
    const init = () => {
      initMattressTechHero();
      initMattressTechResearch();
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
