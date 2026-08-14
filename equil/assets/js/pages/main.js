(() => {
  const initMainHero = () => {
    const hero = document.querySelector('.main-hero');
    if (!hero) return;

    const fill = hero.querySelector('.main-hero__fill');
    if (!fill) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fill.style.webkitMaskImage = 'none';
      fill.style.maskImage = 'none';
      return;
    }

    /* feather: 채움 경계 안티앨리어싱 (글자 윤곽 깨짐 완화) */
    const FEATHER = 2.5;

    const setFillProgress = (progress) => {
      const p = Math.max(0, Math.min(1, progress));

      if (p >= 1) {
        fill.style.webkitMaskImage = 'none';
        fill.style.maskImage = 'none';
        return;
      }

      const pct = p * 100;
      const solidEnd = Math.max(0, pct - FEATHER);
      const mask = `linear-gradient(to bottom, #000 0%, #000 ${solidEnd}%, transparent ${Math.max(pct, solidEnd)}%)`;
      fill.style.webkitMaskImage = mask;
      fill.style.maskImage = mask;
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
