(() => {
  const IMAGE_BASE = '../../assets/images/community/events/';

  const EVENT_DATA = {
    '01': {
      title: 'Sleep Fit Test 체험 이벤트',
      date: '2026.08.10 — 2026.08.31',
      image: `${IMAGE_BASE}event1-popup.webp`,
      sections: [
        {
          title: '나에게 맞는 잠의 균형을 직접 경험해보세요.',
          text: '체중과 수면 습관, 평소 불편하게 느끼는 부위를 바탕으로\n나에게 알맞은 EQUIL 매트리스를 찾아보세요.\nSleep Fit Test 결과를 바탕으로 세 가지 매트리스를 직접 비교하고 체험할 수 있습니다.',
        },
        {
          title: '참여 방법',
          text: '① EQUIL 웹사이트에서 Sleep Fit Test 진행\n② 테스트 결과 확인\n③ 매장 방문 예약\n④ 매장에서 추천받은 매트리스 직접 체험',
        },
        {
          title: '이벤트 혜택',
          text: '이벤트 기간 내 Sleep Fit Test 완료 후 매장을 방문하신 분께\nEQUIL 수면 제품 구매 시 사용할 수 있는 10% 할인 혜택을 제공합니다.',
        },
        {
          title: '● 안내사항',
          text: '이벤트 혜택은 기간 내 1인 1회 제공되며, 일부 제품은 할인 대상에서 제외될 수 있습니다.',
          notice: true,
        },
      ],
    },
    '02': {
      title: 'EQUIL Opening Event',
      date: '2026.08.10 — 2026.09.06',
      image: `${IMAGE_BASE}event2-popup.webp`,
      sections: [
        {
          title: 'EQUIL의 첫 번째 공간을 만나보세요.',
          text: 'EQUIL의 세 가지 매트리스와 수면 제품을\n직접 보고, 만지고, 누워보며 나에게 맞는 편안함을 경험해보세요.\n첫 번째 EQUIL 공간의 시작을 기념해 특별한 혜택을 준비했습니다.',
          divided: true,
        },
        {
          title: '참여 방법',
          text: '① EQUIL 매장 방문 또는 사전 방문 예약\n② 매트리스 및 수면 제품 체험\n③ 이벤트 기간 내 대상 제품 구매',
        },
        {
          title: '오픈 기념 혜택',
          text: '매트리스 구매 시 EQUIL Pillow 증정\n침구 제품 구매 시 오픈 기념 10% 할인',
        },
        {
          title: '● 안내사항',
          text: '증정품은 준비된 수량 소진 시 조기 종료될 수 있으며, 이벤트 혜택은 중복 적용되지 않을 수 있습니다.',
          notice: true,
        },
      ],
    },
  };

  window.fillEventPopup = (eventId) => {
    const data = EVENT_DATA[eventId];
    if (!data) return;

    const titleEl = document.getElementById('popup-event-title');
    const dateEl = document.querySelector('#popup-event-layer .popup-event__date');
    const imageEl = document.querySelector('#popup-event-layer .popup-event__image');
    const bodyEl = document.querySelector('#popup-event-layer .popup-event__body');

    if (!titleEl || !dateEl || !imageEl || !bodyEl) return;

    titleEl.textContent = data.title;
    dateEl.textContent = data.date;
    imageEl.src = data.image;
    imageEl.alt = data.title;

    bodyEl.innerHTML = data.sections
      .map((section) => {
        const classNames = ['popup-event__section'];
        if (section.divided) classNames.push('popup-event__section--divided');
        if (section.notice) classNames.push('popup-event__section--notice');

        return `
          <section class="${classNames.join(' ')}">
            <h3 class="popup-event__body-title">${section.title}</h3>
            <p class="popup-event__body-text">${section.text}</p>
          </section>
        `;
      })
      .join('');

    const scrollEl = document.querySelector('#popup-event-layer .popup-event__inner');
    if (scrollEl) scrollEl.scrollTop = 0;
  };

  const tabGroup = document.querySelector('.event-list__tabs');
  const items = document.querySelectorAll('.event-list__item');
  if (!tabGroup || !items.length) return;

  const tabs = tabGroup.querySelectorAll('[data-event-filter]');

  const applyFilter = (filter) => {
    items.forEach((item) => {
      const status = item.getAttribute('data-event-status');
      const show =
        filter === 'all' ||
        (filter === 'ongoing' && status === 'ongoing') ||
        (filter === 'ended' && status === 'ended');

      item.classList.toggle('is-hidden', !show);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.getAttribute('data-event-filter');
      if (!filter) return;

      tabs.forEach((btn) => {
        const isActive = btn === tab;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      applyFilter(filter);
    });
  });
})();
