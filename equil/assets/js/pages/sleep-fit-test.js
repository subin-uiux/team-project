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
    const panels = section ? [...section.querySelectorAll('.sleep-fit-test__panel')] : [];
    const steps = section ? [...section.querySelectorAll('.sleep-fit-test__step')] : [];
    const choices = section?.querySelectorAll('.sleep-fit-test__choice');
    const prevButton = section?.querySelector('.sleep-fit-test__prev');
    const nextButton = section?.querySelector('.sleep-fit-test__next');
    if (!section || !startButton || !questions || !panels.length) return;

    let currentStep = 0;

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

    const updatePreview = (choice) => {
      const panel = choice.closest('.sleep-fit-test__panel');
      const preview = panel?.querySelector('.sleep-fit-test__preview-image');
      const imageSrc = choice.dataset.image;
      if (!preview || !imageSrc) return;
      preview.src = imageSrc;
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

      const selectedChoice = panels[currentStep]?.querySelector(
        '.sleep-fit-test__choice.is-selected',
      );
      if (selectedChoice) {
        updatePreview(selectedChoice);
      }

      updateProgress();
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
        updatePreview(choice);

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
      if (!answers[QUESTION_KEYS[currentStep]]) return;

      if (currentStep >= panels.length - 1) {
        const result = calculateSleepFitResult(answers);
        root.sleepFitResult = result;
        console.log(result);
        return;
      }

      showStep(currentStep + 1);
    });
  };

  initSleepFitTest();
})();
