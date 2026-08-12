(() => {
  /* ---------- Hero gallery (Swiper) ---------- */
  const mainEl = document.querySelector('.store-hero__main');
  const thumbsEl = document.querySelector('.store-hero__thumbs');

  if (mainEl && thumbsEl && typeof Swiper !== 'undefined') {
    const galleryThumbs = new Swiper(thumbsEl, {
      spaceBetween: 10,
      slidesPerView: 3,
      freeMode: true,
      watchSlidesProgress: true,
      loop: true,
      loopedSlides: 4,
    });

    new Swiper(mainEl, {
      spaceBetween: 10,
      loop: true,
      loopedSlides: 4,
      navigation: {
        nextEl: '.store-hero__nav--next',
        prevEl: '.store-hero__nav--prev',
      },
      thumbs: {
        swiper: galleryThumbs,
      },
    });
  }

  /* ---------- Info panel: open once on panel hover, stay open ---------- */
  const mapPanel = document.querySelector('.store-map__panel');

  if (mapPanel) {
    mapPanel.addEventListener('mouseenter', () => {
      mapPanel.classList.add('is-open');
    });
  }

  /* ---------- Kakao Map (placeholder — 추후 APP KEY 교체) ---------- */
  const STORE_MAP = {
    appKey: 'EQUIL_KAKAO_APP_KEY',
    lat: 37.5446,
    lng: 127.0559,
    level: 3,
    title: 'EQUIL POP-UP STORE 성수',
  };

  const initKakaoMap = () => {
    const container = document.getElementById('store-kakao-map');
    if (!container || typeof kakao === 'undefined' || !kakao.maps) return;

    const center = new kakao.maps.LatLng(STORE_MAP.lat, STORE_MAP.lng);
    const map = new kakao.maps.Map(container, {
      center,
      level: STORE_MAP.level,
    });

    const marker = new kakao.maps.Marker({
      position: center,
      map,
      title: STORE_MAP.title,
    });

    return { map, marker };
  };

  window.STORE_MAP_CONFIG = STORE_MAP;
  window.initStoreKakaoMap = initKakaoMap;

  if (typeof kakao !== 'undefined' && kakao.maps) {
    kakao.maps.load(initKakaoMap);
  }
})();
