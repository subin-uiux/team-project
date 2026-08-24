(() => {
  const FADE_DURATION = 0.7;
  const FADE_EASE = 'power2.inOut';
  const SWIPE_THRESHOLD = 40;

  const initProductCompare = () => {
    const mobileQuery = window.matchMedia('(max-width: 47.9375rem)');
    const gsap = window.gsap;

    document.querySelectorAll('.product-compare').forEach((section) => {
      const slider = section.querySelector('.product-compare__slider');
      const cardsEl = section.querySelector('.product-compare__cards');
      const cards = Array.from(section.querySelectorAll('.product-compare__card'));
      const navItems = Array.from(
        section.querySelectorAll('.product-compare__nav-item')
      );

      if (!slider || !cardsEl || !cards.length || !navItems.length) return;

      let currentIndex = 0;
      let isTransitioning = false;
      let fadeTween = null;
      let touchStartX = 0;

      const updateNav = (index) => {
        navItems.forEach((item, itemIndex) => {
          const isActive = itemIndex === index;
          item.classList.toggle('is-active', isActive);
          if (isActive) {
            item.setAttribute('aria-current', 'true');
          } else {
            item.removeAttribute('aria-current');
          }
        });
      };

      const setActiveCard = (index) => {
        cards.forEach((card, cardIndex) => {
          card.classList.toggle('is-active', cardIndex === index);
        });
      };

      const syncMobileState = () => {
        setActiveCard(currentIndex);
        updateNav(currentIndex);

        cards.forEach((card, index) => {
          const isActive = index === currentIndex;

          if (!mobileQuery.matches) {
            if (gsap) {
              gsap.set(card, { clearProps: 'opacity,zIndex' });
            }
            return;
          }

          if (!gsap) {
            card.style.opacity = isActive ? '1' : '0';
            return;
          }

          gsap.set(card, {
            opacity: isActive ? 1 : 0,
            clearProps: isActive ? 'zIndex' : '',
          });
        });
      };

      const goTo = (index) => {
        if (!mobileQuery.matches || isTransitioning) return;

        const nextIndex = Math.max(0, Math.min(cards.length - 1, index));
        if (nextIndex === currentIndex) return;

        isTransitioning = true;
        const outgoing = cards[currentIndex];
        const incoming = cards[nextIndex];

        currentIndex = nextIndex;
        updateNav(nextIndex);
        setActiveCard(nextIndex);

        if (!gsap) {
          outgoing.style.opacity = '0';
          incoming.style.opacity = '1';
          isTransitioning = false;
          return;
        }

        if (fadeTween) {
          fadeTween.kill();
        }

        gsap.set(incoming, { opacity: 0, zIndex: 1 });
        gsap.set(outgoing, { opacity: 1, zIndex: 2 });

        fadeTween = gsap.timeline({
          onComplete: () => {
            gsap.set(outgoing, { opacity: 0, clearProps: 'zIndex' });
            gsap.set(incoming, { clearProps: 'zIndex' });
            isTransitioning = false;
            fadeTween = null;
          },
        });

        fadeTween.to(
          outgoing,
          {
            opacity: 0,
            duration: FADE_DURATION,
            ease: FADE_EASE,
          },
          0
        );

        fadeTween.to(
          incoming,
          {
            opacity: 1,
            duration: FADE_DURATION,
            ease: FADE_EASE,
          },
          0
        );
      };

      navItems.forEach((item) => {
        item.addEventListener('click', () => {
          const index = Number(item.dataset.index);
          if (Number.isNaN(index)) return;
          goTo(index);
        });
      });

      slider.addEventListener(
        'touchstart',
        (event) => {
          if (!mobileQuery.matches) return;
          touchStartX = event.touches[0]?.clientX ?? 0;
        },
        { passive: true }
      );

      slider.addEventListener(
        'touchend',
        (event) => {
          if (!mobileQuery.matches || isTransitioning) return;

          const touchEndX = event.changedTouches[0]?.clientX ?? 0;
          const deltaX = touchStartX - touchEndX;
          if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

          if (deltaX > 0) {
            goTo(currentIndex + 1);
          } else {
            goTo(currentIndex - 1);
          }
        },
        { passive: true }
      );

      mobileQuery.addEventListener('change', () => {
        if (fadeTween) {
          fadeTween.kill();
          fadeTween = null;
        }
        isTransitioning = false;
        currentIndex = 0;
        syncMobileState();
      });

      syncMobileState();
    });
  };

  const start = () => {
    if (window.equilLibsReady) {
      window.equilLibsReady.then(initProductCompare).catch(initProductCompare);
      return;
    }

    initProductCompare();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
