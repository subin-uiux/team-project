(() => {
  const initMainHero = () => {
    const hero = document.querySelector('.main-hero');
    if (!hero) return;

    const fill = hero.querySelector('.main-hero__fill');
    if (!fill) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fill.style.clipPath = 'inset(0% 0% 0% 0%)';
      return;
    }

    const setFillProgress = (progress) => {
      const bottom = Math.max(0, (1 - progress) * 100);
      fill.style.clipPath = `inset(0% 0% ${bottom}% 0%)`;
    };

    setFillProgress(0);

    ScrollTrigger.create({
      trigger: hero,
      start: 'top top+=80',
      end: 'bottom bottom',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => setFillProgress(self.progress),
      onLeave: () => setFillProgress(1),
    });
  };

  const start = () => {
    const init = () => {
      initMainHero();
      ScrollTrigger.refresh();
    };

    if (!window.equilLibsReady) {
      init();
      return;
    }

    window.equilLibsReady.then(init).catch((error) => {
      console.error('[main] GSAP init failed:', error);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
