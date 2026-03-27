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
  },
  topic: {
    title: "Алгебраические выражения",
    subjectLine: "Математика · 7 класс",
    progressPct: 72,
    barWidthPct: 63,
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
};
