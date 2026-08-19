(() => {
  const PRODUCTS = ['soft', 'balance', 'firm'];

  const sleepFitConfig = {
    products: {
      soft: 'Soft Relief',
      balance: 'Balance Move',
      firm: 'Firm Support',
    },
    questions: {
      weight: {
        options: {
          'under-60': {
            text: '60kg 미만',
            label: '60kg 미만',
            scores: { soft: 2 },
          },
          '60-85': {
            text: '60kg 이상에서 85kg미만',
            label: '60–85kg',
            scores: { balance: 2 },
          },
          '85-plus': {
            text: '85kg 이상',
            label: '85kg 이상',
            scores: { firm: 2 },
          },
        },
      },
      posture: {
        options: {
          side: {
            text: '옆으로 누워서 자요',
            label: '옆으로 누워 자는 편',
            scores: { soft: 2 },
          },
          change: {
            text: '자세를 자주 바꾸며 자요',
            label: '자세를 자주 바꾸는 편',
            scores: { balance: 2 },
          },
          still: {
            text: '한 자세로 가만히 자는 편이에요',
            label: '한 자세로 자는 편',
            scores: { firm: 2 },
          },
          prone: {
            text: '엎드려서 자요',
            label: '엎드려 자는 편',
            scores: { firm: 2 },
          },
        },
      },
      discomfort: {
        options: {
          shoulder: {
            text: '어깨가 자주 눌리거나 뻐근해요',
            label: '어깨가 불편함',
            scores: { soft: 2 },
          },
          waist: {
            text: '허리나 골반이 불편해요',
            label: '허리·골반이 불편함',
            scores: { firm: 2 },
          },
          neck: {
            text: '목이 불편해요',
            label: '목이 불편함',
            scores: {},
            pillowRecommend: true,
          },
          none: {
            text: '특별히 불편한 부위는 없어요',
            label: '특별한 불편 없음',
            scores: {},
          },
        },
      },
      preference: {
        options: {
          soft: {
            text: '체압분산 (몸의 부담감 감소)',
            scores: { soft: 3 },
            product: 'soft',
          },
          balance: {
            text: '편안한 움직임과 균형 (부드러운 느낌)',
            scores: { balance: 3 },
            product: 'balance',
          },
          firm: {
            text: '탄탄한 중심 지지 (허리 지지)',
            scores: { firm: 3 },
            product: 'firm',
          },
          heat: {
            text: '온도 조절 (온열, 부위별 따뜻함)',
            scores: {},
            heatingRecommend: true,
          },
        },
      },
    },
  };

  const createEmptyScores = () => ({
    soft: 0,
    balance: 0,
    firm: 0,
  });

  const getOption = (questionKey, answerValue) => {
    const question = sleepFitConfig.questions[questionKey];
    if (!question || answerValue == null || answerValue === '') return null;

    const byKey = question.options[answerValue];
    if (byKey) {
      return { key: answerValue, ...byKey };
    }

    const matched = Object.entries(question.options).find(([, option]) => option.text === answerValue);
    if (!matched) return null;

    return { key: matched[0], ...matched[1] };
  };

  const addScores = (scores, optionScores = {}) => {
    PRODUCTS.forEach((product) => {
      scores[product] += optionScores[product] || 0;
    });
  };

  const pickResult = (scores, preferenceProduct) => {
    const maxScore = Math.max(...PRODUCTS.map((product) => scores[product]));
    const tied = PRODUCTS.filter((product) => scores[product] === maxScore);

    if (tied.length === 1) return tied[0];
    if (preferenceProduct && tied.includes(preferenceProduct)) return preferenceProduct;
    if (maxScore === 0) return '';

    return tied[0];
  };

  const calculateSleepFitResult = (answers = {}) => {
    const scores = createEmptyScores();
    let pillowRecommend = false;
    let heatingRecommend = false;
    let preferenceProduct = '';

    Object.keys(sleepFitConfig.questions).forEach((questionKey) => {
      const option = getOption(questionKey, answers[questionKey]);
      if (!option) return;

      addScores(scores, option.scores);

      if (option.pillowRecommend) {
        pillowRecommend = true;
      }

      if (option.heatingRecommend) {
        heatingRecommend = true;
      }

      if (questionKey === 'preference' && option.product) {
        preferenceProduct = option.product;
      }
    });

    return {
      scores,
      result: pickResult(scores, preferenceProduct),
      pillowRecommend,
      heatingRecommend,
      resultLabels: {
        weight: getOption('weight', answers.weight)?.label || '',
        posture: getOption('posture', answers.posture)?.label || '',
        discomfort: getOption('discomfort', answers.discomfort)?.label || '',
      },
    };
  };

  const answers = {
    weight: '',
    posture: '',
    discomfort: '',
    preference: '',
  };

  const testAnswers = {
    weight: 'under-60',
    posture: 'side',
    discomfort: 'neck',
    preference: 'soft',
  };

  const root = typeof window !== 'undefined' ? window : globalThis;
  root.sleepFitConfig = sleepFitConfig;
  root.calculateSleepFitResult = calculateSleepFitResult;
  root.sleepFitAnswers = answers;

  console.log(calculateSleepFitResult(testAnswers));

  const QUESTION_KEYS = ['weight', 'posture', 'discomfort', 'preference'];

  const initSleepFitTest = () => {
    const section = document.querySelector('.sleep-fit-test');
    const startButton = section?.querySelector('.sleep-fit-test__button');
    const questions = section?.querySelector('.sleep-fit-test__questions');
    const loading = section?.querySelector('.sleep-fit-test__loading');
    const loadingBar = loading?.querySelector('.sleep-fit-test__loading-bar');
    const loadingFill = loading?.querySelector('.sleep-fit-test__loading-bar-fill');
    const transitionSection = document.querySelector('.sleep-fit-transition');
    const resultSection = document.querySelector('.sleep-fit-result');
    const structureSection = document.querySelector('.sleep-fit-structure');
    const ctaSection = document.querySelector('.sleep-fit-cta');
    const structureImage = structureSection?.querySelector('.sleep-fit-structure__image--pc');
    const panels = section ? [...section.querySelectorAll('.sleep-fit-test__panel')] : [];
    const steps = section ? [...section.querySelectorAll('.sleep-fit-test__step')] : [];
    const choices = section?.querySelectorAll('.sleep-fit-test__choice');
    const prevButton = section?.querySelector('.sleep-fit-test__prev');
    const nextButton = section?.querySelector('.sleep-fit-test__next');
    if (!section || !startButton || !questions || !panels.length) return;

    const LOADING_DURATION = 2500;
    let currentStep = 0;
    let isAnalyzing = false;
    let resultTransitionScrollTrigger = null;

    if (resultSection) {
      resultSection.hidden = true;
    }

    if (structureSection) {
      structureSection.hidden = true;
    }

    if (transitionSection) {
      transitionSection.hidden = true;
    }

    if (ctaSection) {
      ctaSection.hidden = true;
    }

    const STRUCTURE_DATA = {
      soft: {
        subTitle: 'Your Sleep Match',
        title: 'Soft Relief',
        desc: '이러한 부드러운 지지감은 서로 다른 역할을\n가진 세 가지 내부층의 조합에서 완성됩니다.',
        features: [
          { title: 'Soft Memory Foam', text: '어깨와 골반의 체압을 부드럽게 분산시킵니다.' },
          { title: 'High-Resilience Support Foam', text: '몸이 지나치게 가라앉지 않도록 지지합니다.' },
          { title: 'Soft Zoned Pocket Spring', text: '어깨는 부드럽게, 허리와 골반은 안정적으로 받쳐줍니다.' },
        ],
      },
      balance: {
        subTitle: 'Your Sleep Match',
        title: 'Balance Move',
        desc: '이러한 균형적인 지지감은 서로 다른 역할을\n가진 세 가지 내부층의 조합에서 완성됩니다.',
        features: [
          { title: 'Responsive Latex Foam', text: '자세를 바꿀 때 빠르게 복원합니다.' },
          { title: 'Balance HR Foam', text: '쿠션감과 지지감의 균형 유지합니다.' },
          { title: 'Medium Zoned Pocket Spring', text: '움직임에 맞춰 몸 전체를 고르게 지지합니다.' },
        ],
      },
      firm: {
        subTitle: 'Firm Support',
        title: 'Balance Move',
        desc: '이러한 단단한 지지감은 서로 다른 역할을\n가진 세 가지 내부층의 조합에서 완성됩니다.',
        features: [
          { title: 'High-Resilience Comfort Foam', text: '탄탄함 속에 기본적인 쿠션감 제공합니다.' },
          { title: 'High-Density Support Foam', text: '몸이 지나치게 가라앉지 않도록 지지합니다.' },
          { title: 'Firm Zoned Pocket Spring', text: '높은 하중에도 몸의 중심을 안정적으로 지지합니다.' },
        ],
      },
    };

    const updateStructureContent = (resultKey) => {
      if (!structureSection) return;
      const data = STRUCTURE_DATA[resultKey];
      if (!data) return;

      const subTitle = structureSection.querySelector('.heading-3tier__sub-title');
      const title = structureSection.querySelector('.heading-3tier__title');
      const desc = structureSection.querySelector('.heading-3tier__desc');

      if (subTitle) subTitle.textContent = data.subTitle;
      if (title) title.textContent = data.title;
      if (desc) desc.innerHTML = data.desc.replace(/\n/g, '<br>');

      const features = structureSection.querySelectorAll('.sleep-fit-structure__feature');
      data.features.forEach((item, i) => {
        if (!features[i]) return;
        const ft = features[i].querySelector('.sleep-fit-structure__feature-title');
        const fx = features[i].querySelector('.sleep-fit-structure__feature-text');
        if (ft) ft.textContent = item.title;
        if (fx) fx.textContent = item.text;
      });

      if (structureImage) {
        const src = structureImage.dataset[`image${resultKey.charAt(0).toUpperCase() + resultKey.slice(1)}`];
        if (src) structureImage.src = src;
      }

      setStructureLayer(0);
    };

    let setStructureLayer = () => {};

    const initStructureGallery = () => {
      if (!structureSection) return;

      const hotspots = [...structureSection.querySelectorAll('.sleep-fit-structure__hotspot')];
      const thumbs = [...structureSection.querySelectorAll('.sleep-fit-structure__thumb')];
      const layerFeatures = [...structureSection.querySelectorAll('.sleep-fit-structure__feature')];
      const prevArrow = structureSection.querySelector('.sleep-fit-structure__arrow--prev');
      const nextArrow = structureSection.querySelector('.sleep-fit-structure__arrow--next');
      const layerCount = layerFeatures.length;
      let currentLayer = 0;

      const setLayer = (index) => {
        currentLayer = ((index % layerCount) + layerCount) % layerCount;

        [hotspots, thumbs, layerFeatures].forEach((group) => {
          group.forEach((el, i) => {
            el.classList.toggle('is-active', i === currentLayer);
          });
        });
      };

      hotspots.forEach((el) => {
        el.addEventListener('click', () => setLayer(Number(el.dataset.index)));
      });
      thumbs.forEach((el) => {
        el.addEventListener('click', () => setLayer(Number(el.dataset.index)));
      });
      prevArrow?.addEventListener('click', () => setLayer(currentLayer - 1));
      nextArrow?.addEventListener('click', () => setLayer(currentLayer + 1));

      setStructureLayer = setLayer;
      setLayer(0);
    };

    const initResultStructureTransition = (resultKey) => {
      if (!transitionSection || !window.gsap || !window.ScrollTrigger) return;

      updateStructureContent(resultKey);

      if (window.matchMedia('(max-width: 63.9375rem)').matches) {
        return;
      }

      if (resultTransitionScrollTrigger) {
        resultTransitionScrollTrigger.kill();
        resultTransitionScrollTrigger = null;
      }

      const activeResultPanel = resultSection?.querySelector(
        `.sleep-fit-result__panel[data-result="${resultKey}"]`,
      );
      const resultFadeTargets = activeResultPanel
        ? [
          activeResultPanel.querySelector('.sleep-fit-result__content'),
          activeResultPanel.querySelector('.sleep-fit-result__media'),
        ].filter(Boolean)
        : [];
      const structureFadeTargets = [
        structureSection?.querySelector('.sleep-fit-structure__content'),
        structureSection?.querySelector('.sleep-fit-structure__image--pc'),
      ].filter(Boolean);
      const structureFeatures = structureSection
        ? [...structureSection.querySelectorAll('.sleep-fit-structure__feature')]
        : [];

      if (!resultFadeTargets.length || !structureFadeTargets.length) return;

      gsap.set(resultFadeTargets, { autoAlpha: 1, y: 0 });
      gsap.set(structureSection, { autoAlpha: 0 });
      gsap.set(structureFadeTargets, { autoAlpha: 0, y: 40 });
      gsap.set(structureFeatures, { autoAlpha: 0, y: 40 });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: transitionSection,
          start: 'top top',
          end: '+=100%',
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          snap: { snapTo: 1, duration: { min: 0.4, max: 0.7 }, ease: 'power2.inOut' },
        },
      });

      tl.to(
        resultFadeTargets,
        { autoAlpha: 0, y: -36, duration: 0.35, ease: 'power2.out' },
        0,
      )
        .to(structureSection, { autoAlpha: 1, duration: 0.01 }, 0.3)
        .to(structureFadeTargets, { autoAlpha: 1, y: 0, duration: 0.35 }, 0.3)
        .to(structureFeatures[0], { autoAlpha: 1, y: 0, duration: 0.2 }, 0.55)
        .to(structureFeatures[1], { autoAlpha: 1, y: 0, duration: 0.2 }, 0.65)
        .to(structureFeatures[2], { autoAlpha: 1, y: 0, duration: 0.2 }, 0.75);

      resultTransitionScrollTrigger = tl.scrollTrigger || null;
      ScrollTrigger.refresh();
    };

    const updateProgress = () => {
      steps.forEach((step, index) => {
        const isCurrent = index === currentStep;
        const isComplete = index < currentStep && Boolean(answers[QUESTION_KEYS[index]]);

        step.classList.toggle('is-active', isCurrent);
        step.classList.toggle('is-complete', isComplete);

        if (isCurrent) {
          step.setAttribute('aria-current', 'step');
        } else {
          step.removeAttribute('aria-current');
        }
      });
    };

    const showStep = (index) => {
      currentStep = Math.max(0, Math.min(panels.length - 1, index));

      panels.forEach((panel, panelIndex) => {
        panel.hidden = panelIndex !== currentStep;
      });

      if (prevButton) {
        prevButton.hidden = currentStep === 0;
      }

      if (nextButton) {
        nextButton.disabled = !answers[QUESTION_KEYS[currentStep]];
        nextButton.textContent = currentStep === panels.length - 1 ? '결과보기' : '다음';
      }

      updateProgress();
    };

    const setLoadingProgress = (value) => {
      if (loadingBar) {
        loadingBar.setAttribute('aria-valuenow', String(Math.round(value)));
      }
    };

    const showResult = (result) => {
      root.sleepFitResult = result;
      if (loading) loading.hidden = true;
      section.hidden = true;
      if (transitionSection) transitionSection.hidden = false;

      if (!resultSection) return;

      const resultKey = result.result || 'soft';
      resultSection.hidden = false;
      resultSection.querySelectorAll('.sleep-fit-result__panel').forEach((panel) => {
        panel.hidden = panel.dataset.result !== resultKey;
      });

      if (structureImage) {
        const nextSrc = structureImage.dataset[`image${resultKey.charAt(0).toUpperCase()}${resultKey.slice(1)}`];
        if (nextSrc) structureImage.src = nextSrc;
      }

      if (structureSection) {
        structureSection.hidden = false;
      }

      if (ctaSection) {
        ctaSection.hidden = false;
      }

      initResultStructureTransition(resultKey);

      window.scrollTo(0, 0);
    };

    const startLoading = (result) => {
      if (!loading || !loadingFill) {
        showResult(result);
        return;
      }

      isAnalyzing = true;
      questions.hidden = true;
      loading.hidden = false;
      window.scrollTo(0, 0);

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const duration = reduceMotion ? 0 : LOADING_DURATION;

      loadingFill.style.transition = 'none';
      loadingFill.style.width = '0%';
      setLoadingProgress(0);
      void loadingFill.offsetWidth;

      if (duration === 0) {
        loadingFill.style.width = '100%';
        setLoadingProgress(100);
        isAnalyzing = false;
        showResult(result);
        return;
      }

      loadingFill.style.transition = `width ${duration}ms ease-in-out`;
      loadingFill.style.width = '100%';
      setLoadingProgress(100);

      window.setTimeout(() => {
        isAnalyzing = false;
        showResult(result);
      }, duration);
    };

    startButton.addEventListener('click', () => {
      section.classList.add('is-started');
      questions.hidden = false;
      showStep(0);
      window.scrollTo(0, 0);
    });

    choices?.forEach((choice) => {
      choice.addEventListener('click', () => {
        const questionKey = choice.dataset.question;
        const value = choice.dataset.value;
        if (!questionKey || !value) return;

        const group = section.querySelectorAll(
          `.sleep-fit-test__choice[data-question="${questionKey}"]`,
        );
        group.forEach((item) => item.classList.remove('is-selected'));
        choice.classList.add('is-selected');
        answers[questionKey] = value;

        if (nextButton && questionKey === QUESTION_KEYS[currentStep]) {
          nextButton.disabled = false;
        }

        updateProgress();
      });
    });

    prevButton?.addEventListener('click', () => {
      showStep(currentStep - 1);
    });

    nextButton?.addEventListener('click', () => {
      if (isAnalyzing || !answers[QUESTION_KEYS[currentStep]]) return;

      if (currentStep >= panels.length - 1) {
        startLoading(calculateSleepFitResult(answers));
        return;
      }

      showStep(currentStep + 1);
    });

    initStructureGallery();
  };

  initSleepFitTest();
})();
