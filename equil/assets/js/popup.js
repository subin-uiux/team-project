(() => {
  const layers = document.querySelectorAll('.popup-layer');
  if (!layers.length) return;

  const openLayer = (layer) => {
    layer.classList.add('is-open');
    layer.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('is-popup-open');
    document.body.classList.add('is-popup-open');
  };

  const closeLayer = (layer) => {
    layer.classList.remove('is-open');
    layer.setAttribute('aria-hidden', 'true');

    if (!document.querySelector('.popup-layer.is-open')) {
      document.documentElement.classList.remove('is-popup-open');
      document.body.classList.remove('is-popup-open');
    }
  };

  layers.forEach((layer) => {
    layer.querySelectorAll('[data-popup-close]').forEach((trigger) => {
      trigger.addEventListener('click', () => closeLayer(layer));
    });
  });

  document.querySelectorAll('[data-popup-open]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      const targetId = trigger.getAttribute('data-popup-open');
      if (!targetId) return;

      const layer = document.getElementById(targetId);
      if (!layer) return;

      if (trigger.hasAttribute('data-news-id')) {
        event.preventDefault();
        const newsId = trigger.getAttribute('data-news-id');
        if (typeof window.fillNewsPopup === 'function') {
          window.fillNewsPopup(newsId);
        }
      }

      if (trigger.hasAttribute('data-event-id')) {
        event.preventDefault();
        const eventId = trigger.getAttribute('data-event-id');
        if (typeof window.fillEventPopup === 'function') {
          window.fillEventPopup(eventId);
        }
      }

      openLayer(layer);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    document.querySelectorAll('.popup-layer.is-open').forEach((layer) => {
      closeLayer(layer);
    });
  });
})();
