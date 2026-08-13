(() => {
  const initBrandStoryName = () => {
    const section = document.querySelector('.brand-story-name');
    const pin = section?.querySelector('.brand-story-name__pin');
    const circle = section?.querySelector('.brand-story-name__circle');
    const content = section?.querySelector('.brand-story-name__circle-content');
    const eq = section?.querySelector('.brand-story-name__eq');
    const uil = section?.querySelector('.brand-story-name__uil');
    const message = section?.querySelector('.brand-story-name__message');
    const messageInner = section?.querySelector('.brand-story-name__message-inner');
    const messageA = section?.querySelector('.brand-story-name__message-part--a');
    const messageB = section?.querySelector('.brand-story-name__message-part--b');

    if (
      !section ||
      !pin ||
      !circle ||
      !content ||
      !eq ||
      !uil ||
      !message ||
      !messageInner ||
      !messageA ||
      !messageB
    ) {
      return;
    }
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const SIDE_GAP = 24;

    const getCoverRadius = () => {
      const w = pin.offsetWidth;
      const h = pin.offsetHeight;
      return Math.ceil(Math.hypot(w, h) / 2) + 24;
    };

    const getAvailableMessageWidth = () =>
      Math.max(0, content.clientWidth - eq.offsetWidth - uil.offsetWidth - SIDE_GAP * 2);

    const getPartWidth = (partEl) => {
      const available = getAvailableMessageWidth();
      return Math.min(partEl.scrollWidth, available);
    };

    const getFullMessageWidth = () => {
      const available = getAvailableMessageWidth();
      return Math.min(messageInner.scrollWidth, available);
    };

    gsap.set(circle, { clipPath: 'circle(0px at 50% 50%)' });
    gsap.set([eq, uil], { opacity: 1 });
    gsap.set(message, { width: 0, marginLeft: 0, marginRight: 0 });
    gsap.set([messageA, messageB], { opacity: 0 });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: '+=620%',
        pin: true,
        scrub: 1.25,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });

    // 1) 원 확대
    tl.to(
      circle,
      {
        duration: 0.34,
        clipPath: () => `circle(${getCoverRadius()}px at 50% 50%)`,
      },
      0
    );

    // 2) 문구 폭을 앞구간 → 전체로 이어서 펼침 (끊김 완화)
    tl.to(
      message,
      {
        duration: 0.22,
        width: () => getPartWidth(messageA),
        marginLeft: SIDE_GAP,
        marginRight: SIDE_GAP,
      },
      0.3
    );
    tl.to(
      messageA,
      {
        duration: 0.16,
        opacity: 1,
      },
      0.34
    );

    tl.to(
      message,
      {
        duration: 0.24,
        width: () => getFullMessageWidth(),
      },
      0.52
    );
    tl.to(
      messageB,
      {
        duration: 0.2,
        opacity: 1,
      },
      0.54
    );
    tl.to(
      [eq, uil],
      {
        duration: 0.2,
        opacity: 0.2,
      },
      0.54
    );

    // 3) 로고 소멸
    tl.to(
      [eq, uil],
      {
        duration: 0.16,
        opacity: 0,
      },
      0.82
    );
  };

  const start = () => {
    const init = () => {
      initBrandStoryName();
      ScrollTrigger.refresh();
    };

    if (!window.equilLibsReady) {
      init();
      return;
    }

    window.equilLibsReady.then(init).catch((error) => {
      console.error('[brand-story] GSAP init failed:', error);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
