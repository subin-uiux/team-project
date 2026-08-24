(() => {
  const IMAGE_BASE = 'assets/images/product/';

  const HERO_IMAGES = {
    mattress: `${IMAGE_BASE}product-hero_mattress-bg.webp`,
    pillow: `${IMAGE_BASE}product-hero_pillow-bg.webp`,
    bedding: `${IMAGE_BASE}product-hero_bedding-bg.webp`,
    'heating-mat': `${IMAGE_BASE}product-hero_heatingmat-bg.webp`,
  };

  const heroImage = document.querySelector('[data-product-hero]');
  const tabs = document.querySelectorAll('[data-product-tab]');
  const panels = document.querySelectorAll('[data-product-panel]');

  if (!tabs.length || !panels.length) return;

  const CATEGORY_IDS = ['mattress', 'pillow', 'bedding', 'heating-mat'];

  const setActiveTab = (tabId) => {
    tabs.forEach((tab) => {
      const isActive = tab.getAttribute('data-product-tab') === tabId;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    panels.forEach((panel) => {
      const isActive = panel.getAttribute('data-product-panel') === tabId;
      panel.classList.toggle('is-active', isActive);
      panel.toggleAttribute('hidden', !isActive);
    });

    if (heroImage && HERO_IMAGES[tabId]) {
      heroImage.src = HERO_IMAGES[tabId];
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-product-tab');
      if (!tabId) return;
      setActiveTab(tabId);
    });
  });

  const params = new URLSearchParams(window.location.search);
  const requested = params.get('category');
  if (requested && CATEGORY_IDS.includes(requested)) {
    setActiveTab(requested);
  }
})();
