/**
 * Статические данные в духе макетов subjects.pen (V8 Moon / SHARP).
 */
window.SHANKS_DATA = {
  grades: [5, 6, 7, 8, 9, 10, 11],
  defaultGrade: 5,
  home: {
    overallPct: 15,
    taskDay: {
      title: "Реши 5 задач по алгебре и получи +50 XP",
      xp: "+50 XP",
    },
    quiz: {
      text: "Проверь знания за 2 минуты! Варианты ответов ждут.",
      cta: "Играть 🎮",
    },
    subjects: [
      {
        id: "math",
        label: "Математика",
        sub: "7 класс · алгебра",
        icon: "calculator",
        pct: 18,
      },
      {
        id: "lit",
        label: "Литература",
        sub: "Чтение и анализ",
        icon: "book-open",
        pct: 0,
      },
      {
        id: "phys",
        label: "Физика",
        sub: "Механика",
        icon: "atom",
        pct: 0,
      },
      {
        id: "hist",
        label: "История",
        sub: "Древний мир",
        icon: "landmark",
        pct: 0,
      },
      {
        id: "lang",
        label: "Английский",
        sub: "Грамматика",
        icon: "languages",
        pct: 0,
      },
    ],
  },
  subjectsScreen: {
    favorites: [
      { id: "phys", name: "Физика", pct: 30, icon: "atom" },
      { id: "hist2", name: "История", pct: 25, icon: "book-marked" },
    ],
    rows: [
      { id: "rus", name: "Русский язык", pct: 45, dot: "#111111", favorite: false },
      { id: "phys", name: "Физика", pct: 30, dot: "#6b7280", favorite: true },
      { id: "chem", name: "Химия", pct: 60, dot: "#6b7280", favorite: false },
      { id: "hist2", name: "История", pct: 25, dot: "#9ca3af", favorite: true },
    ],
  },
  /** По id строки предмета / id с главной → ключ деталки */
  subjectRoute: {
    math: "math",
    lit: "lit",
    phys: "phys",
    hist: "hist",
    lang: "lang",
    rus: "rus",
    chem: "chem",
    hist2: "hist",
  },
  subjectDetail: {
    math: {
      classLabel: "КЛАСС 7",
      title: "Математика",
      heroPct: 35,
      topics: [
        { id: "t1", title: "Алгебраические выражения", pct: 72 },
        { id: "t2", title: "Уравнения и неравенства", pct: 45 },
        { id: "t3", title: "Функции и графики", pct: 18 },
        { id: "t4", title: "Геометрия", pct: 90 },
      ],
    },
    rus: {
      classLabel: "КЛАСС 5",
      title: "Русский язык",
      heroPct: 45,
      topics: [
        { id: "r1", title: "Лексика и фразеология", pct: 40 },
        { id: "r2", title: "Синтаксис", pct: 55 },
        { id: "r3", title: "Сочинение", pct: 20 },
      ],
    },
    phys: {
      classLabel: "КЛАСС 8",
      title: "Физика",
      heroPct: 30,
      topics: [
        { id: "p1", title: "Механика", pct: 35 },
        { id: "p2", title: "Термодинамика", pct: 15 },
        { id: "p3", title: "Электричество", pct: 10 },
      ],
    },
    chem: {
      classLabel: "КЛАСС 8",
      title: "Химия",
      heroPct: 60,
      topics: [
        { id: "c1", title: "Периодическая таблица", pct: 70 },
        { id: "c2", title: "Реакции", pct: 50 },
      ],
    },
    hist: {
      classLabel: "КЛАСС 9",
      title: "История",
      heroPct: 25,
      topics: [
        { id: "h1", title: "Древний мир", pct: 30 },
        { id: "h2", title: "Средневековье", pct: 20 },
      ],
    },
    lit: {
      classLabel: "КЛАСС 7",
      title: "Литература",
      heroPct: 12,
      topics: [
        { id: "l1", title: "Лирика XIX века", pct: 10 },
        { id: "l2", title: "Роман", pct: 5 },
      ],
    },
    lang: {
      classLabel: "КЛАСС 7",
      title: "Английский язык",
      heroPct: 8,
      topics: [
        { id: "g1", title: "Present Simple", pct: 25 },
        { id: "g2", title: "Местоимения", pct: 15 },
      ],
    },
  },
  topic: {
    title: "Алгебраические выражения",
    subjectLine: "Математика · 7 класс",
    progressPct: 72,
    barWidthPct: 63,
    practice: [
      { title: "Задача 1: упростить выражение", sub: "Лёгкая · 3 мин" },
      { title: "Задача 2: подставить значение", sub: "Средняя · 5 мин" },
      { title: "Задача 3: доказать тождество", sub: "Сложная · 10 мин" },
    ],
    theory: [
      {
        kind: "done",
        title: "Что такое выражение",
        sub: "Прочитано · 3 мин",
      },
      {
        kind: "current",
        title: "Операции с выражениями",
        sub: "Читаем",
        readPct: 55,
      },
      {
        kind: "todo",
        title: "Упрощение выражений",
        sub: "Ещё не начали · 4 мин",
      },
    ],
  },
  notes: {
    bubbles: [
      { id: "m7", subject: "Математика", grade: "7 класс", icon: "calculator" },
      { id: "h9", subject: "История", grade: "9 класс", icon: "book-marked" },
      { id: "p8", subject: "Физика", grade: "8 класс", icon: "atom" },
    ],
    dock:
      "Загрузи фото или сканируй задание — ИИ-агент объяснит ход решения и поможет дойти до ответа.",
  },
  /** Плейсхолдеры для CTA без бэкенда */
  copy: {
    challenge: "Челлендж дня: открываем практику по математике.",
    quiz: "Режим QUIZ скоро будет с таймером и вариантами ответов.",
    aiChat: "Диалог с AI-агентом подключим к API позже.",
    camera: "Камера: сканирование задания — в следующей версии.",
    settings: "Настройки профиля появятся здесь.",
  },
};
