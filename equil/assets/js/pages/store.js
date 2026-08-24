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
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      navigation: {
        nextEl: '.store-hero__nav--next',
        prevEl: '.store-hero__nav--prev',
      },
      pagination: {
        el: '.store-hero__pagination',
        clickable: true,
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
      if (window.matchMedia('(max-width: 47.9375rem)').matches) return;
      mapPanel.classList.add('is-open');
    });
  }

  /* ---------- Kakao Map ---------- */
  const STORE_MAP = {
    lat: 37.5432858,
    lng: 127.0537459,
    level: 3,
    title: 'EQUIL POP-UP STORE 성수',
  };

  const initKakaoMap = () => {
    const container = document.getElementById('store-kakao-map');
    if (!container || typeof kakao === 'undefined' || !kakao.maps) return null;

    const center = new kakao.maps.LatLng(STORE_MAP.lat, STORE_MAP.lng);
    const map = new kakao.maps.Map(container, {
      center,
      level: STORE_MAP.level,
    });

    new kakao.maps.Marker({
      position: center,
      map,
      title: STORE_MAP.title,
    });

    map.relayout();
    window.storeKakaoMap = map;
    return map;
  };

  const bootKakaoMap = () => {
    if (typeof kakao === 'undefined' || !kakao.maps) return false;
    kakao.maps.load(initKakaoMap);
    return true;
  };

  const warnKakaoMapSetup = () => {
    console.error(
      '[EQUIL Store] 카카오맵을 불러오지 못했습니다.\n' +
        '1) 카카오 디벨로퍼스 → 제품 설정 → 카카오맵 → 활성화 ON\n' +
        '2) 플랫폼 키 → JavaScript 키 → JavaScript SDK 도메인 (접속 URL과 동일한 포트)\n' +
        '3) 저장 후 새로고침'
    );
  };

  window.STORE_MAP_CONFIG = STORE_MAP;
  window.initStoreKakaoMap = initKakaoMap;

  if (!bootKakaoMap()) {
    const sdkScript = document.querySelector('script[src*="dapi.kakao.com"]');
    if (sdkScript) {
      sdkScript.addEventListener(
        'load',
        () => {
          if (!bootKakaoMap()) warnKakaoMapSetup();
        },
        { once: true }
      );
      sdkScript.addEventListener('error', warnKakaoMapSetup, { once: true });
    } else {
      warnKakaoMapSetup();
    }
  }

  window.addEventListener('resize', () => {
    window.storeKakaoMap?.relayout();
  });
})();
