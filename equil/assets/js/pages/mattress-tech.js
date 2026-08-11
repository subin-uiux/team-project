(() => {
  const initMattressTechHero = () => {
    const hero = document.querySelector('.mattress-tech-hero');
    if (!hero) return;

    const overlay = hero.querySelector('.mattress-tech-hero__overlay');
    const content = hero.querySelector('.mattress-tech-hero__content');
    if (!overlay || !content) return;

    gsap.set(overlay, { opacity: 0 });
    gsap.set(content, { opacity: 0 });

    let isTextVisible = false;

    gsap
      .timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=40%',
          scrub: true,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (self.progress >= 1) {
              if (!isTextVisible) {
                isTextVisible = true;
                gsap.to(content, {
                  opacity: 1,
                  duration: 1,
                  overwrite: 'auto',
                });
              }
              return;
            }

            if (isTextVisible) {
              isTextVisible = false;
              gsap.to(content, {
                opacity: 0,
                duration: 0.3,
                overwrite: 'auto',
              });
            }
          },
        },
      })
      .to(
        hero,
        {
          height: 437,
          ease: 'none',
        },
        0
      )
      .to(
        overlay,
        {
          opacity: 0.3,
          ease: 'none',
        },
        0
      );
  };

  if (window.equilLibsReady) {
    window.equilLibsReady.then(initMattressTechHero);
    return;
  }

  initMattressTechHero();
})();
