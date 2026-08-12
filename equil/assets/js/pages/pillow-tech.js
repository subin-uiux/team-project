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
        tab.classList.toggle('is-selected', isActive);
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
      section.querySelectorAll('.pillow-tech-structure__feature')
    );
    const hotspot = section.querySelector('.pillow-tech-structure__hotspot');
    if (!features.length || !hotspot) return;

    const LAST_INDEX = features.length - 1;
    const COOLDOWN_MS = 1000;
    let currentIndex = 0;
    let pinTrigger = null;
    let lastSwitchTime = 0;

    const activateFeature = (index) => {
      currentIndex = index;
      lastSwitchTime = Date.now();

      features.forEach((feature, i) => {
        const isActive = i === index;
        feature.classList.toggle('is-active', isActive);

        const indicator = feature.querySelector('.pillow-tech-structure__indicator');
        const desc = feature.querySelector('.pillow-tech-structure__feature-desc');

        if (indicator) {
          indicator.style.opacity = isActive ? '1' : '0';
        }

        if (desc) {
          desc.hidden = !isActive;
        }
      });

      const pos = HOTSPOT_POSITIONS[index];
      if (pos) {
        hotspot.style.left = pos.left;
        hotspot.style.top = pos.top;
      }
    };

    activateFeature(0);

    const onWheel = (event) => {
      if (!pinTrigger || !pinTrigger.isActive) return;

      const goingDown = event.deltaY > 0;

      if (goingDown && currentIndex === LAST_INDEX) return;
      if (!goingDown && currentIndex === 0) return;

      event.preventDefault();

      if (Date.now() - lastSwitchTime < COOLDOWN_MS) return;

      activateFeature(goingDown ? currentIndex + 1 : currentIndex - 1);
    };

    pinTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=800%',
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    });

    section.addEventListener('wheel', onWheel, { passive: false });
  };

  const start = () => {
    const init = () => {
      initPillowTechHero();
      initPillowTechSleepPosition();
      initPillowTechStructure();
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
