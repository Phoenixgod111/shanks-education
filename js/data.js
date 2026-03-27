/**
 * Данные Shanks V8. Каталог предметов по классам + маршруты в карточки деталей.
 * Прогресс по предмету задаётся в каталоге (стабильная «истина» для демо);
 * избранное хранится в localStorage отдельно для каждого класса.
 */
(function () {
  const G = [5, 6, 7, 8, 9, 10, 11];

  const META = {
    rus: { name: "Русский язык", dot: "#111111", icon: "book-text" },
    math: { name: "Математика", dot: "#111111", icon: "calculator" },
    lit: { name: "Литература", dot: "#6b7280", icon: "book-open" },
    phys: { name: "Физика", dot: "#6b7280", icon: "atom" },
    chem: { name: "Химия", dot: "#6b7280", icon: "flask-conical" },
    hist2: { name: "История", dot: "#9ca3af", icon: "book-marked" },
    lang: { name: "Английский", dot: "#6b7280", icon: "languages" },
    bio: { name: "Биология", dot: "#6b7280", icon: "leaf" },
    inf: { name: "Информатика", dot: "#9ca3af", icon: "monitor" },
    geo: { name: "География", dot: "#6b7280", icon: "globe" },
  };

  /** Порядок и проценты по классам (детерминированно, не «рандом») */
  const ROWS_BY_GRADE = {
    5: [
      ["rus", 45],
      ["math", 18],
      ["lit", 0],
      ["phys", 30],
      ["chem", 60],
      ["hist2", 25],
      ["lang", 0],
      ["bio", 0],
    ],
    6: [
      ["rus", 42],
      ["math", 35],
      ["lit", 28],
      ["phys", 15],
      ["chem", 10],
      ["hist2", 33],
      ["lang", 20],
      ["bio", 8],
    ],
    7: [
      ["rus", 40],
      ["math", 38],
      ["lit", 30],
      ["phys", 30],
      ["chem", 25],
      ["hist2", 25],
      ["lang", 24],
      ["bio", 18],
    ],
    8: [
      ["rus", 38],
      ["math", 55],
      ["lit", 25],
      ["phys", 40],
      ["chem", 45],
      ["hist2", 35],
      ["lang", 32],
      ["bio", 22],
    ],
    9: [
      ["rus", 48],
      ["math", 62],
      ["lit", 35],
      ["phys", 50],
      ["chem", 58],
      ["hist2", 52],
      ["lang", 40],
      ["bio", 30],
      ["inf", 15],
    ],
    10: [
      ["rus", 35],
      ["math", 58],
      ["lit", 42],
      ["phys", 48],
      ["chem", 55],
      ["hist2", 45],
      ["lang", 50],
      ["bio", 28],
      ["inf", 35],
    ],
    11: [
      ["rus", 32],
      ["math", 65],
      ["lit", 38],
      ["phys", 52],
      ["chem", 60],
      ["hist2", 48],
      ["lang", 55],
      ["bio", 25],
      ["inf", 42],
    ],
  };

  const catalogByGrade = {};
  G.forEach((g) => {
    const rows = ROWS_BY_GRADE[g] || ROWS_BY_GRADE[5];
    catalogByGrade[g] = rows.map(([id, pct]) => {
      const m = META[id];
      return {
        id,
        name: m.name,
        dot: m.dot,
        icon: m.icon,
        pct,
      };
    });
  });

  /** При первом запуске: избранные как в макете для 5 класса; остальные классы — пусто */
  const seedFavoritesByGrade = {
    5: ["phys", "hist2"],
    6: [],
    7: ["math"],
    8: [],
    9: [],
    10: [],
    11: [],
  };

  window.SHANKS_DATA = {
    grades: G,
    defaultGrade: 5,
    storageKey: "shanks_prefs_v2",
    catalogByGrade,
    seedFavoritesByGrade,
    home: {
      taskDay: {
        title: "Реши 5 задач по алгебре и получи +50 XP",
        xp: "+50 XP",
      },
      quiz: {
        text: "Проверь знания за 2 минуты! Варианты ответов ждут.",
        cta: "Играть 🎮",
      },
    },
    subjectRoute: {
      math: "math",
      lit: "lit",
      phys: "phys",
      hist: "hist",
      lang: "lang",
      rus: "rus",
      chem: "chem",
      hist2: "hist",
      bio: "bio",
      inf: "inf",
      geo: "hist",
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
      bio: {
        classLabel: "КЛАСС 8",
        title: "Биология",
        heroPct: 20,
        topics: [
          { id: "b1", title: "Клетка", pct: 40 },
          { id: "b2", title: "Генетика", pct: 15 },
        ],
      },
      inf: {
        classLabel: "КЛАСС 9",
        title: "Информатика",
        heroPct: 15,
        topics: [
          { id: "i1", title: "Алгоритмы и исполнители", pct: 35 },
          { id: "i2", title: "Кодирование", pct: 20 },
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
        { kind: "done", title: "Что такое выражение", sub: "Прочитано · 3 мин" },
        { kind: "current", title: "Операции с выражениями", sub: "Читаем", readPct: 55 },
        { kind: "todo", title: "Упрощение выражений", sub: "Ещё не начали · 4 мин" },
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
    copy: {
      challenge: "Челлендж дня: открываем практику по математике.",
      quiz: "Режим QUIZ скоро будет с таймером и вариантами ответов.",
      aiChat: "Диалог с AI-агентом подключим к API позже.",
      camera: "Камера: сканирование задания — в следующей версии.",
      settings: "Настройки профиля появятся здесь.",
      noFavorites: "Нет избранных для этого класса. Отметь сердечком предметы ниже.",
    },
  };
})();
