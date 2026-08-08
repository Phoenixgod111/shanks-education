import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const generatedAt = "2026-08-09";
const version = "1.0.0-beta.1";

const grade10 = [
  ["Числа и вычисления", [
    ["g10-n01", "Действительные числа: рациональные и иррациональные числа, операции и сравнение."],
    ["g10-n02", "Степень с действительным показателем. Свойства степеней и преобразование выражений."],
    ["g10-n03", "Корень n-й степени и его свойства. Арифметический корень нечётной и чётной степени."],
    ["g10-n04", "Проценты, пропорции и приближённые вычисления в практических задачах."]
  ]],
  ["Алгебраические выражения", [
    ["g10-e01", "Многочлены от одной переменной. Деление многочлена на многочлен."],
    ["g10-e02", "Теорема Безу и следствия. Разложение многочленов на множители."],
    ["g10-e03", "Рациональные выражения: область допустимых значений и преобразования."],
    ["g10-e04", "Иррациональные выражения и равносильные преобразования."]
  ]],
  ["Функции и графики", [
    ["g10-f01", "Функция, область определения и множество значений. Способы задания функции."],
    ["g10-f02", "Чётность, нечётность, периодичность, нули и промежутки знакопостоянства функции."],
    ["g10-f03", "Монотонность, экстремумы, наибольшее и наименьшее значения функции."],
    ["g10-f04", "Преобразования графиков: сдвиги, растяжения, сжатия и отражения."],
    ["g10-f05", "Степенная функция и её свойства. Обратная функция."]
  ]],
  ["Тригонометрия", [
    ["g10-t01", "Радианная мера угла. Поворот точки на единичной окружности."],
    ["g10-t02", "Синус, косинус, тангенс и котангенс произвольного угла."],
    ["g10-t03", "Основные тригонометрические тождества и формулы приведения."],
    ["g10-t04", "Формулы сложения, двойного и половинного угла."],
    ["g10-t05", "Преобразование сумм и произведений тригонометрических выражений."],
    ["g10-t06", "Графики и свойства тригонометрических функций."],
    ["g10-t07", "Простейшие тригонометрические уравнения и отбор корней."]
  ]],
  ["Уравнения и неравенства", [
    ["g10-u01", "Рациональные уравнения и неравенства. Метод интервалов."],
    ["g10-u02", "Иррациональные уравнения и неравенства. Равносильность и проверка корней."],
    ["g10-u03", "Системы уравнений и неравенств с двумя переменными."],
    ["g10-u04", "Уравнения и неравенства с параметром: базовые случаи."]
  ]],
  ["Геометрия в пространстве", [
    ["g10-g01", "Аксиомы стереометрии и следствия. Взаимное расположение точек, прямых и плоскостей."],
    ["g10-g02", "Параллельность прямых и плоскостей в пространстве."],
    ["g10-g03", "Перпендикулярность прямых и плоскостей. Теорема о трёх перпендикулярах."],
    ["g10-g04", "Угол между прямыми, прямой и плоскостью, двумя плоскостями."],
    ["g10-g05", "Расстояния в пространстве. Ортогональное проектирование."],
    ["g10-g06", "Многогранники: призма, параллелепипед, пирамида и их сечения."],
    ["g10-g07", "Площади поверхностей многогранников. Практические задачи."]
  ]],
  ["Вероятность и статистика", [
    ["g10-p01", "События и операции над ними. Условная вероятность и независимость."],
    ["g10-p02", "Формулы сложения и умножения вероятностей."],
    ["g10-p03", "Комбинаторные правила, перестановки, размещения и сочетания."],
    ["g10-p04", "Схема Бернулли и биномиальная вероятность."],
    ["g10-p05", "Выборка, среднее, медиана, дисперсия и стандартное отклонение."]
  ]]
];

const grade11 = [
  ["Показательные и логарифмические функции", [
    ["g11-f01", "Показательная функция: свойства, график и моделирование роста и убывания."],
    ["g11-f02", "Логарифм числа. Основное логарифмическое тождество и свойства логарифмов."],
    ["g11-f03", "Логарифмическая функция: свойства, график и область определения."],
    ["g11-f04", "Преобразование показательных и логарифмических выражений."]
  ]],
  ["Уравнения и неравенства", [
    ["g11-u01", "Показательные уравнения и системы уравнений."],
    ["g11-u02", "Показательные неравенства и метод замены переменной."],
    ["g11-u03", "Логарифмические уравнения с учётом области допустимых значений."],
    ["g11-u04", "Логарифмические неравенства и равносильные переходы."],
    ["g11-u05", "Смешанные уравнения и неравенства. Функционально-графический метод."],
    ["g11-u06", "Уравнения и неравенства с параметром: исследование числа решений."]
  ]],
  ["Начала математического анализа", [
    ["g11-a01", "Предел последовательности и функции: интуитивное понимание и вычисление."],
    ["g11-a02", "Непрерывность функции и точки разрыва."],
    ["g11-a03", "Производная функции: определение, геометрический и физический смысл."],
    ["g11-a04", "Правила дифференцирования. Производные элементарных функций."],
    ["g11-a05", "Касательная к графику функции."],
    ["g11-a06", "Исследование функции с помощью производной: монотонность и экстремумы."],
    ["g11-a07", "Наибольшее и наименьшее значения. Задачи оптимизации."],
    ["g11-a08", "Первообразная и неопределённый интеграл. Основные свойства."],
    ["g11-a09", "Определённый интеграл и формула Ньютона — Лейбница."],
    ["g11-a10", "Площадь криволинейной трапеции и прикладные задачи."]
  ]],
  ["Координаты и векторы в пространстве", [
    ["g11-v01", "Декартовы координаты в пространстве. Расстояние между точками."],
    ["g11-v02", "Векторы в пространстве и действия над ними."],
    ["g11-v03", "Скалярное произведение и угол между векторами."],
    ["g11-v04", "Координатно-векторный метод решения геометрических задач."]
  ]],
  ["Тела и поверхности", [
    ["g11-g01", "Цилиндр и конус: элементы, сечения и площади поверхностей."],
    ["g11-g02", "Сфера и шар. Сечения сферы плоскостью и касательная плоскость."],
    ["g11-g03", "Объёмы призмы, цилиндра, пирамиды и конуса."],
    ["g11-g04", "Объём шара и частей шара. Площадь сферы."],
    ["g11-g05", "Комбинации многогранников и тел вращения."]
  ]],
  ["Вероятность и статистика", [
    ["g11-p01", "Случайная величина и закон распределения."],
    ["g11-p02", "Математическое ожидание и дисперсия дискретной случайной величины."],
    ["g11-p03", "Нормальное распределение и интерпретация статистических данных."],
    ["g11-p04", "Статистические выводы, корреляция и ограничения интерпретации данных."]
  ]],
  ["Повторение и итоговая аттестация", [
    ["g11-z01", "Комплексное повторение алгебры, функций, уравнений и неравенств."],
    ["g11-z02", "Комплексное повторение планиметрии и стереометрии."],
    ["g11-z03", "Моделирование и задачи с практическим содержанием."]
  ]]
];

const textbookLines = {
  "5": [
    ["g5-vilenkin", "Математика, 5 класс", ["Н. Я. Виленкин", "В. И. Жохов", "А. С. Чесноков", "С. И. Шварцбурд"], "Просвещение"],
    ["g5-merzlyak", "Математика, 5 класс", ["А. Г. Мерзляк", "В. Б. Полонский", "М. С. Якир"], "Просвещение"],
    ["g5-dorofeev", "Математика, 5 класс", ["Г. В. Дорофеев", "И. Ф. Шарыгин"], "Просвещение"]
  ],
  "6": [
    ["g6-vilenkin", "Математика, 6 класс", ["Н. Я. Виленкин", "В. И. Жохов", "А. С. Чесноков", "С. И. Шварцбурд"], "Просвещение"],
    ["g6-merzlyak", "Математика, 6 класс", ["А. Г. Мерзляк", "В. Б. Полонский", "М. С. Якир"], "Просвещение"],
    ["g6-dorofeev", "Математика, 6 класс", ["Г. В. Дорофеев", "И. Ф. Шарыгин"], "Просвещение"]
  ],
  "7": [
    ["g7-makarychev", "Алгебра, 7 класс", ["Ю. Н. Макарычев", "Н. Г. Миндюк", "К. И. Нешков", "С. Б. Суворова"], "Просвещение"],
    ["g7-merzlyak", "Алгебра, 7 класс", ["А. Г. Мерзляк", "В. Б. Полонский", "М. С. Якир"], "Просвещение"],
    ["g7-dorofeev", "Алгебра, 7 класс", ["Г. В. Дорофеев", "С. Б. Суворова", "Е. А. Бунимович"], "Просвещение"]
  ],
  "8": [
    ["g8-makarychev", "Алгебра, 8 класс", ["Ю. Н. Макарычев", "Н. Г. Миндюк", "К. И. Нешков", "С. Б. Суворова"], "Просвещение"],
    ["g8-merzlyak", "Алгебра, 8 класс", ["А. Г. Мерзляк", "В. Б. Полонский", "М. С. Якир"], "Просвещение"],
    ["g8-dorofeev", "Алгебра, 8 класс", ["Г. В. Дорофеев", "С. Б. Суворова", "Е. А. Бунимович"], "Просвещение"]
  ],
  "9": [
    ["g9-makarychev", "Алгебра, 9 класс", ["Ю. Н. Макарычев", "Н. Г. Миндюк", "К. И. Нешков", "С. Б. Суворова"], "Просвещение"],
    ["g9-merzlyak", "Алгебра, 9 класс", ["А. Г. Мерзляк", "В. Б. Полонский", "М. С. Якир"], "Просвещение"],
    ["g9-dorofeev", "Алгебра, 9 класс", ["Г. В. Дорофеев", "С. Б. Суворова", "Е. А. Бунимович"], "Просвещение"]
  ],
  "10": [
    ["g10-kolmogorov", "Алгебра и начала математического анализа, 10 класс", ["А. Н. Колмогоров", "А. М. Абрамов", "Ю. П. Дудницын"], "Просвещение"],
    ["g10-mordkovich", "Алгебра и начала математического анализа, 10 класс", ["А. Г. Мордкович", "П. В. Семёнов"], "Мнемозина"],
    ["g10-nikolsky", "Алгебра и начала математического анализа, 10 класс", ["С. М. Никольский", "М. К. Потапов", "Н. Н. Решетников", "А. В. Шевкин"], "Просвещение"]
  ],
  "11": [
    ["g11-kolmogorov", "Алгебра и начала математического анализа, 11 класс", ["А. Н. Колмогоров", "А. М. Абрамов", "Ю. П. Дудницын"], "Просвещение"],
    ["g11-mordkovich", "Алгебра и начала математического анализа, 11 класс", ["А. Г. Мордкович", "П. В. Семёнов"], "Мнемозина"],
    ["g11-nikolsky", "Алгебра и начала математического анализа, 11 класс", ["С. М. Никольский", "М. К. Потапов", "Н. Н. Решетников", "А. В. Шевкин"], "Просвещение"]
  ]
};

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const curriculumFrom = (blocks) => ({
  title: "Математика",
  topics: blocks.map(([title, items]) => ({
    title,
    items: items.map(([id, title]) => ({ id, title, pct: 0 }))
  }))
});

async function writeJson(relative, value) {
  const target = path.join(root, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, json(value), "utf8");
}

await writeJson("curriculum/math/10.json", curriculumFrom(grade10));
await writeJson("curriculum/math/11.json", curriculumFrom(grade11));

const grades = {};
for (let grade = 5; grade <= 11; grade += 1) {
  grades[String(grade)] = JSON.parse(await readFile(path.join(root, "curriculum", "math", `${grade}.json`), "utf8"));
}

const canonicalTopics = [];
for (const [grade, curriculum] of Object.entries(grades)) {
  curriculum.topics.forEach((unit, unitIndex) => {
    unit.items.forEach((item, topicIndex) => canonicalTopics.push({
      id: item.id,
      subject: "math",
      grade: Number(grade),
      unitId: `g${grade}-unit-${String(unitIndex + 1).padStart(2, "0")}`,
      unitTitle: unit.title,
      order: topicIndex + 1,
      title: item.title,
      status: "beta"
    }));
  });
}

await writeJson("curriculum/schema/canonical-topic.schema.json", {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://shanks.local/schema/canonical-topic.schema.json",
  title: "Shanks canonical mathematics topic registry",
  type: "object",
  required: ["schemaVersion", "version", "status", "topics"],
  properties: {
    schemaVersion: { const: 1 },
    version: { type: "string" },
    status: { enum: ["beta", "stable", "deprecated"] },
    generatedAt: { type: "string", format: "date" },
    topics: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "subject", "grade", "unitId", "unitTitle", "order", "title", "status"],
        properties: {
          id: { type: "string", pattern: "^g(?:[5-9]|10|11)-[a-z][a-z0-9]*[0-9]{2}$" },
          subject: { const: "math" },
          grade: { type: "integer", minimum: 5, maximum: 11 },
          unitId: { type: "string" },
          unitTitle: { type: "string", minLength: 1 },
          order: { type: "integer", minimum: 1 },
          title: { type: "string", minLength: 1 },
          status: { enum: ["beta", "stable", "deprecated"] }
        },
        additionalProperties: false
      }
    }
  },
  additionalProperties: false
});

await writeJson("curriculum/canonical/topics.json", {
  schemaVersion: 1,
  version,
  status: "beta",
  generatedAt,
  topics: canonicalTopics
});

const catalogLines = Object.entries(textbookLines).flatMap(([grade, lines]) =>
  lines.map(([id, title, authors, publisher]) => ({
    id,
    kind: "textbook-line",
    subject: "math",
    grade: Number(grade),
    title,
    authors,
    publisher,
    status: "beta",
    metadataScope: "bibliographic-identification-only",
    omittedMetadata: ["isbn", "edition", "pageRanges"],
    rightsRef: "bibliographic-metadata"
  }))
);
const universal = {
  id: "math-universal-5-11",
  kind: "universal",
  subject: "math",
  grades: [5, 6, 7, 8, 9, 10, 11],
  title: "Универсальная каноническая траектория 5–11",
  status: "beta",
  metadataScope: "project-authored",
  rightsRef: "shanks-original"
};
await writeJson("curriculum/schema/catalog.schema.json", {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://shanks.local/schema/catalog.schema.json",
  title: "Shanks textbook line catalog",
  type: "object",
  required: ["schemaVersion", "version", "status", "lines", "universal"],
  properties: {
    schemaVersion: { const: 1 },
    version: { type: "string" },
    status: { enum: ["beta", "stable", "deprecated"] },
    note: { type: "string" },
    lines: {
      type: "array",
      minItems: 21,
      maxItems: 21,
      items: {
        type: "object",
        required: ["id", "kind", "subject", "grade", "title", "authors", "publisher", "status", "metadataScope", "omittedMetadata", "rightsRef"]
      }
    },
    universal: {
      type: "object",
      required: ["id", "kind", "subject", "grades", "title", "status", "metadataScope", "rightsRef"]
    }
  }
});
await writeJson("curriculum/catalog/textbook-lines.json", {
  schemaVersion: 1,
  version,
  status: "beta",
  note: "Каталог фиксирует только проверяемые библиографические поля. ISBN, редакции и страницы намеренно не указаны.",
  lines: catalogLines,
  universal
});

const topicIdsByGrade = Object.fromEntries(
  Object.keys(grades).map((grade) => [grade, canonicalTopics.filter((topic) => topic.grade === Number(grade)).map((topic) => topic.id)])
);

for (const line of catalogLines) {
  const ids = topicIdsByGrade[String(line.grade)];
  await writeJson(`curriculum/trajectories/${line.id}.json`, {
    schemaVersion: 1,
    id: `${line.id}-trajectory`,
    catalogId: line.id,
    subject: "math",
    grade: line.grade,
    version,
    status: "beta",
    mappingMethod: "canonical-order-beta",
    mapping: ids.map((canonicalTopicId, index) => ({
      sourcePosition: index + 1,
      canonicalTopicId,
      confidence: "editorial-beta"
    }))
  });
}
await writeJson("curriculum/trajectories/math-universal-5-11.json", {
  schemaVersion: 1,
  id: "math-universal-5-11-trajectory",
  catalogId: universal.id,
  subject: "math",
  grades: universal.grades,
  version,
  status: "beta",
  mappingMethod: "canonical-order",
  mapping: canonicalTopics.map((topic, index) => ({
    sourcePosition: index + 1,
    canonicalTopicId: topic.id,
    confidence: "canonical"
  }))
});

function packetFor(topic) {
  const richLegacy = topic.grade === 8 && /^g8-u0[1-6]$/.test(topic.id);
  const focus = topic.title.replace(/\.$/, "");
  return {
    schemaVersion: 1,
    topicId: topic.id,
    grade: topic.grade,
    version,
    status: "beta",
    provenance: {
      method: "deterministic-template",
      reviewStatus: "ai-beta-unreviewed",
      rightsRef: "shanks-ai-beta",
      legacyOverlay: richLegacy ? "js/math-learning-content.js" : null
    },
    theory: [
      {
        stepId: `${topic.id}-theory-01`,
        title: "Цель урока",
        body: `Разобраться в теме «${focus}»: научиться узнавать тип задачи, выбирать подход и объяснять каждый шаг решения.`
      },
      {
        stepId: `${topic.id}-theory-02`,
        title: "Язык темы",
        body: `Выпиши новые определения, обозначения и ограничения из темы «${focus}». Рядом с каждым термином запиши своими словами, что он означает и когда применяется.`
      },
      {
        stepId: `${topic.id}-theory-03`,
        title: "Ключевая идея",
        body: "Математическое решение связывает условие и цель через известное правило. Перед вычислениями определи, какие данные уже есть, что нужно найти и какое правило связывает эти величины."
      },
      {
        stepId: `${topic.id}-theory-04`,
        title: "Разобранный пример",
        body: `Для типового задания по теме «${focus}» сначала запиши условие и ограничения, затем назови выбранное правило, выполни один переход за раз и после каждого перехода проверяй его равносильность.`
      },
      {
        stepId: `${topic.id}-theory-05`,
        title: "Самостоятельный шаг",
        body: "Возьми похожее задание и до вычислений составь план из трёх пунктов: данные, правило, проверка. Если план не получается объяснить, вернись к определениям."
      },
      {
        stepId: `${topic.id}-theory-06`,
        title: "Главное",
        body: "Не начинай со случайной формулы. Сначала классифицируй задачу, учитывай ограничения, обосновывай преобразования и проверяй результат по исходному условию."
      }
    ],
    practice: [
      {
        stepId: `${topic.id}-practice-01`,
        type: "single-choice",
        prompt: `Какой первый шаг наиболее надёжен при работе с темой «${topic.title}»?`,
        options: ["Уточнить данные, обозначения и условия применимости", "Сразу записать случайный ответ", "Игнорировать ограничения"],
        answerIndex: 0,
        explanation: "Осмысленная запись условий снижает риск неверного применения формулы."
      },
      {
        stepId: `${topic.id}-practice-02`,
        type: "single-choice",
        prompt: "Как понять, что выбранное правило подходит к задаче?",
        options: ["Оно выглядит знакомым", "Выполнены его условия применимости", "Оно самое короткое"],
        answerIndex: 1,
        explanation: "Правило применимо только тогда, когда выполнены все его условия."
      }
    ],
    test: [
      {
        stepId: `${topic.id}-test-01`,
        type: "single-choice",
        prompt: "Что обязательно сделать после получения ответа?",
        options: ["Проверить ответ по исходному условию", "Удалить промежуточные условия", "Считать любой результат верным"],
        answerIndex: 0,
        explanation: "Проверка выявляет вычислительные ошибки и недопустимые значения."
      },
      {
        stepId: `${topic.id}-test-02`,
        type: "single-choice",
        prompt: "Какой план решения математической задачи наиболее надёжен?",
        options: [
          "Ответ → случайная формула → условие",
          "Формула → ответ без проверки",
          "Данные и цель → правило → шаги → проверка"
        ],
        answerIndex: 2,
        explanation: "Такой порядок делает решение проверяемым и снижает число случайных ошибок."
      }
    ]
  };
}

for (const grade of Object.keys(grades)) {
  const packets = canonicalTopics.filter((topic) => topic.grade === Number(grade)).map(packetFor);
  await writeJson(`content/math/${grade}/packets.json`, {
    schemaVersion: 1,
    version,
    status: "beta",
    grade: Number(grade),
    contentPolicy: "compact-ai-beta",
    packets
  });
}

await writeJson("content/manifest.json", {
  schemaVersion: 1,
  version,
  status: "beta",
  subject: "math",
  grades: Object.fromEntries(Object.keys(grades).map((grade) => [grade, `content/math/${grade}/packets.json`])),
  legacyRichContent: {
    topicIds: ["g8-u01", "g8-u02", "g8-u03", "g8-u04", "g8-u05", "g8-u06"],
    source: "js/math-learning-content.js",
    precedence: "legacy-over-generated-fallback"
  }
});

await writeJson("content/rights/registry.json", {
  schemaVersion: 1,
  version,
  status: "beta",
  entries: [
    {
      id: "shanks-original",
      assetKinds: ["canonical-curriculum", "universal-trajectory"],
      owner: "Shanks project",
      usage: "project-authored",
      redistribution: "project-policy",
      status: "beta"
    },
    {
      id: "shanks-ai-beta",
      assetKinds: ["theory", "practice", "test"],
      owner: "Shanks project",
      usage: "AI-assisted deterministic draft; human review required before stable release",
      redistribution: "project-policy",
      status: "beta"
    },
    {
      id: "bibliographic-metadata",
      assetKinds: ["title", "author-names", "publisher-name"],
      owner: "respective publishers and authors",
      usage: "bibliographic identification and trajectory label only; no textbook text, tasks, ISBN or page mapping copied",
      redistribution: "metadata-only",
      status: "beta"
    }
  ]
});

console.log(`content data: ${canonicalTopics.length} canonical topics, ${catalogLines.length} textbook lines, ${catalogLines.length + 1} trajectories, ${canonicalTopics.length} packets`);
