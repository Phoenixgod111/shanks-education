/**
 * Per-topic learning (математика 8 класс, модуль «Квадратные уравнения»).
 * Ключи — topic.id из curriculum/math/8.json; allowlist — curriculum/math/learning-slice-ids.json.
 */
(function () {
  "use strict";

  window.SHANKS_MATH_LEARNING = {
    byTopicId: {
            "g8-u01": {
        schemaVersion: 2,
        lessonHero: {
          eyebrow: "Интерактивный урок · 8 класс",
          title: "Неполные квадратные уравнения",
          subtitle: "Сведём задачи к виду x² = d и к вынесению x — без потери второго корня и нуля.",
          lead: "Сегодня научимся решать уравнения, где не хватает части обычной формулы. Главное — не потерять второй корень и ноль."
        },
        objective: "Уметь решать неполные квадратные уравнения вида x² = d и ax² + bx = 0, не теряя корни по знаку и ноль при вынесении x.",
        skillTagCatalog: [
          "recognize_quadratic",
          "identify_incomplete_type",
          "solve_x2_equals_d",
          "handle_root_count",
          "isolate_x_squared",
          "factor_common_x",
          "zero_product_rule",
          "preserve_zero_root",
          "sign_accuracy",
          "verify_roots",
          "answer_notation"
        ],
        misconceptions: [
          {
            id: "lost_negative_root",
            text: "Ученик потерял отрицательный корень при x² = d.",
            skillTags: ["handle_root_count", "answer_notation"],
            theoryBlockId: "root-cases"
          },
          {
            id: "negative_square_fake_roots",
            text: "Ученик считает, что x² = −d при d > 0 имеет действительные корни «как у положительного».",
            skillTags: ["handle_root_count"],
            theoryBlockId: "root-cases"
          },
          {
            id: "lost_zero_root",
            text: "Ученик потерял x = 0 при вынесении общего множителя x.",
            skillTags: ["factor_common_x", "zero_product_rule", "preserve_zero_root"],
            theoryBlockId: "factor-x"
          },
          {
            id: "sign_transfer_error",
            text: "Ученик ошибся в знаке при переносе слагаемого или при умножении на −1 и получил неверное x² = d.",
            skillTags: ["sign_accuracy", "isolate_x_squared"],
            theoryBlockId: "x2-equals-d"
          }
        ],
        theory: [
          {
            id: "intro",
            title: "Что такое квадратное уравнение",
            body: "Уравнение вида ax² + bx + c = 0, где a ≠ 0, называют квадратным. В этой теме — неполные случаи: когда удобно свести к x² = d или к вынесению x.",
            keyIdeas: ["a ≠ 0", "Неполное ≠ «простое» — всё равно квадратное"]
          },
          {
            id: "x2-equals-d",
            title: "Как решать x² = d",
            body: "Изолируй x². Если d > 0, в ℝ два корня: x = √d и x = −√d. Если d = 0 — один корень x = 0. Если d < 0 — в ℝ нет решений.",
            keyIdeas: ["Два знака при d > 0", "Проверка подстановкой"]
          },
          {
            id: "root-cases",
            title: "Случаи d > 0, d = 0, d < 0",
            body: "d > 0: два различных корня. d = 0: один (кратный) корень 0. d < 0: квадрат неотрицателен — действительных корней нет.",
            keyIdeas: ["Не терять −√d", "Не придумывать корни при d < 0"]
          },
          {
            id: "factor-x",
            title: "Уравнения вида ax² + bx = 0",
            body: "Вынеси x: x(ax + b) = 0. Произведение ноль, если x = 0 или ax + b = 0. Ноль — полноценный корень, его часто «теряют».",
            keyIdeas: ["Вынесение x", "Правило произведения ноль", "Сохранить x = 0"]
          },
          {
            id: "mistakes",
            title: "Типичные ошибки",
            body: "Потерян минус у корня; забыли x = 0 после вынесения x; перепутали знак при переносе — и получилось неверное x² = d; решили x² = −9 в ℝ.",
            keyIdeas: ["Проверка корней в исходнике", "Смысл знака d", "Перенос слагаемых меняет знак"]
          }
        ],
        workedExample: {
          title: "Краткий разбор (классика)",
          lines: [
            "Пример x² − 9 = 0: x² = 9 ⇒ x = 3 или x = −3.",
            "Ниже — пошаговый разобранный пример и задание с пропусками."
          ]
        },
        workedExamples: [
          {
            id: "x2-minus-9",
            title: "Пример: x² − 9 = 0",
            skillTags: ["solve_x2_equals_d", "handle_root_count", "answer_notation"],
            steps: [
              { text: "x² − 9 = 0", rationale: "Сначала изолируем x²." },
              { text: "x² = 9", rationale: "Перенесли −9 вправо." },
              { text: "x = ±√9", rationale: "При положительном d два корня." },
              { text: "x = 3 или x = −3", rationale: "Оба числа дают квадрат 9." }
            ],
            selfExplanationPrompts: [
              "Почему корня два?",
              "Почему нельзя оставить только x = 3?"
            ]
          }
        ],
        fadedExamples: [
          {
            id: "x2-minus-16-faded",
            title: "Заполни шаги: x² − 16 = 0",
            steps: [
              { mode: "full", text: "x² − 16 = 0" },
              { mode: "faded", prompt: "Перенеси −16 вправо", answer: "x² = 16" },
              { mode: "faded", prompt: "Сколько корней и какие?", answer: "x = 4 или x = −4" }
            ]
          }
        ],
        lessonDialog: [
          {
            id: "intro-01",
            blockId: "intro",
            kind: "message",
            speaker: "tutor",
            text: "Смотри на уравнение как детектив: если главный герой x², это уже подозрение на квадратное. Но есть условие: коэффициент при x² не ноль.",
            turns: [
              { speaker: "tutor", text: "Смотри на уравнение как детектив: если главный герой x², это уже подозрение на квадратное." },
              { speaker: "student_prompt", text: "То есть сначала ищу самую большую степень?" },
              { speaker: "tutor", text: "Да. Не считаем количество иксов, смотрим именно степень и проверяем, что при x² коэффициент не ноль." }
            ],
            visual: {
              kind: "equation_parts",
              title: "Квадратное уравнение как конструктор",
              parts: [
                { expr: "ax²", label: "обязательная часть", required: true },
                { expr: "bx", label: "может пропасть" },
                { expr: "c", label: "может пропасть" }
              ],
              caption: "Если пропал ax², это уже не квадратное уравнение."
            },
            nextStudentText: "Окей, проверим на примерах?"
          },
          {
            id: "intro-02",
            blockId: "intro",
            kind: "checkpoint",
            type: "mcq",
            mentorText: "Сначала проверим, что ты узнаёшь квадратное уравнение среди других записей.",
            prompt: "Какое из уравнений точно квадратное?",
            options: ["3x² − 5 = 0", "2x + 1 = 0", "x³ − 1 = 0"],
            answerIndex: 0,
            hint: "Подсказка: главная степень неизвестной должна быть 2, и нужен ненулевой коэффициент при x².",
            hints: [
              "Подсказка: главная степень неизвестной должна быть 2, и нужен ненулевой коэффициент при x².",
              "Если сомневаешься — сравни, где есть только x или x³."
            ],
            feedback: {
              correct: "Да. Есть x² и a ≠ 0.",
              wrong: "Проверь степень: квадратное уравнение содержит x², а не только x или x³."
            },
            supportiveCorrect: "Отлично: ты отделяешь квадратное уравнение от линейного и кубического.",
            nextStudentText: "Понял. А что значит неполное?",
            fullSolution: [
              "Квадратное уравнение в стандартном виде: ax² + bx + c = 0 с a ≠ 0.",
              "3x² − 5 = 0: есть x², коэффициент при x² не ноль — это квадратное.",
              "2x + 1 = 0 — линейное (нет x²). x³ − 1 = 0 — кубическое (старшая степень 3)."
            ],
            skillTags: ["recognize_quadratic"]
          },
          {
            id: "intro-03",
            blockId: "intro",
            kind: "message",
            speaker: "tutor",
            text: "Слово «неполное» не значит «совсем лёгкое». Просто один кусок пропал: либо нет bx, либо нет c. От этого выбираем приём решения.",
            turns: [
              { speaker: "tutor", text: "Слово «неполное» не значит «совсем лёгкое». Просто один кусок пропал: либо нет bx, либо нет c." },
              { speaker: "student_prompt", text: "А x² обязан остаться?" },
              { speaker: "tutor", text: "Обязан. Если нет x², это уже другая история, не квадратное уравнение." }
            ],
            summary: {
              title: "Как выбирать приём",
              bullets: [
                "Нет bx: сводим к x² = d.",
                "Нет c: выносим x и не теряем x = 0.",
                "x² должен остаться: иначе это не квадратное."
              ]
            },
            nextStudentText: "Давай отличу квадратное от кубического"
          },
          {
            id: "intro-04",
            blockId: "intro",
            kind: "checkpoint",
            type: "mcq",
            mentorText: "Теперь отличим «степень 2» от «степени 3» на примере.",
            prompt: "Какое уравнение квадратное (старшая степень неизвестной 2), а не кубическое?",
            options: ["3x² − 5 = 0", "x³ − 1 = 0", "x⁴ + 1 = 0"],
            answerIndex: 0,
            hint: "Спроси себя: какая самая высокая степень x в записи?",
            hints: [
              "Спроси себя: какая самая высокая степень x в записи?",
              "Кубическое уравнение обязательно содержит x³ как старшую степень."
            ],
            feedback: {
              correct: "Да: главная степень по x — 2 (есть x², нет обязательного x³ как у кубического).",
              wrong: "Смотри на старшую степень: при x³ это уже уравнение третьей степени, не квадратное."
            },
            supportiveCorrect: "Хорошо: старшая степень — надёжный ориентир.",
            nextStudentText: "Окей, покажи пример с корнями",
            fullSolution: [
              "Старшая степень по x в 3x² − 5 = 0 равна 2 — уравнение квадратное.",
              "В x³ − 1 = 0 старшая степень 3 — это кубическое уравнение.",
              "x⁴ + 1 = 0 — уравнение четвёртой степени (тоже не «квадратное» в школьном смысле определения)."
            ],
            skillTags: ["recognize_quadratic"]
          },
          {
            id: "lesson-we-01",
            blockId: "intro",
            kind: "worked_example",
            mentorText: "Разобранный пример: разберём целиком один классический случай — так проще переносить схему на свои задачи.",
            turns: [
              { speaker: "student_prompt", text: "А почему ответ не просто 3?" },
              { speaker: "tutor", text: "Вот это главный вопрос урока. Потому что (-3)² тоже равно 9." }
            ],
            title: "Пример: x² − 9 = 0",
            lines: [
              "x² − 9 = 0 — изолируем x².",
              "x² = 9 — перенесли −9 вправо.",
              "В ℝ при d > 0 два корня: x = √9 и x = −√9.",
              "Ответ: x = 3 или x = −3. Оба подходят при подстановке."
            ],
            visual: {
              kind: "number_line",
              title: "Почему появляются два корня",
              points: [
                { label: "−3", pos: 20 },
                { label: "3", pos: 80 }
              ],
              note: "Обе точки при возведении в квадрат дают 9."
            },
            mistake: {
              title: "Потерянный минус",
              wrong: "x² = 9 ⇒ x = 3",
              fix: "Правильно: x = 3 или x = −3."
            },
            nextStudentText: "А как понять, сколько корней?"
          },
          {
            id: "x2-01",
            blockId: "x2-equals-d",
            kind: "message",
            speaker: "tutor",
            text: "Теперь схема x² = d: главный вопрос не «как извлечь корень», а сколько ответов не потерять.",
            turns: [
              { speaker: "tutor", text: "Теперь схема x² = d: главный вопрос не «как извлечь корень», а сколько ответов не потерять." },
              { speaker: "griffon", text: "Гав-гав, я всегда сначала нюхаю знак d. Положительный, ноль или отрицательный?" }
            ],
            visual: {
              kind: "root_cases",
              title: "Светофор для x² = d",
              cases: [
                { label: "d > 0", roots: "x = ±√d", mood: "two", note: "два симметричных корня" },
                { label: "d = 0", roots: "x = 0", mood: "one", note: "один корень" },
                { label: "d < 0", roots: "нет корней в ℝ", mood: "none", note: "квадрат не бывает отрицательным" }
              ],
              caption: "Сначала знак d, потом ответ. Это экономит ошибки."
            },
            nextStudentText: "Хочу потренироваться на таком"
          },
          {
            id: "lesson-fe-01",
            blockId: "x2-equals-d",
            kind: "faded_example",
            mentorText: "Подсказки по шагам: сначала видно опору, затем попробуй дорисовать шаг сам — ответ можно раскрыть.",
            title: "Мини-практика: x² − 16 = 0",
            fadedSteps: [
              { mode: "full", text: "x² − 16 = 0" },
              { mode: "faded", prompt: "Перенеси −16 вправо", answer: "x² = 16" },
              { mode: "faded", prompt: "Сколько корней в ℝ и какие?", answer: "x = 4 или x = −4" }
            ],
            nextStudentText: "Проверим, почему корня два?"
          },
          {
            id: "x2-01b",
            blockId: "x2-equals-d",
            kind: "checkpoint",
            type: "mcq",
            mentorText: "Self-explanation: сформулируй причину словами, выбрав лучшее объяснение.",
            prompt: "Почему у x² = 9 в ℝ два различных корня?",
            options: [
              "Потому что 9 > 0 и оба числа 3 и −3 в квадрате дают 9",
              "Потому что у любого квадратного уравнения всегда ровно два корня в ℝ",
              "Потому что √9 — одно число, второго корня нет"
            ],
            answerIndex: 0,
            hint: "Подумай про знак ± и про то, что квадрат «убирает» знак у числа.",
            hints: [
              "Подумай про знак ± и про то, что квадрат «убирает» знак у числа.",
              "В ℝ число корней у x² = d зависит от d: при d > 0 — два, при d = 0 — один, при d < 0 — ноль."
            ],
            feedback: {
              correct: "Верно: при d > 0 симметрия ± даёт два различных действительных корня.",
              wrong: "В ℝ число корней зависит от d и вида уравнения; для x² = d при d > 0 важны оба знака ±."
            },
            supportiveCorrect: "Сильное объяснение: ты связываешь d > 0 с двумя симметричными корнями.",
            nextStudentText: "Окей. А если справа 9?",
            fullSolution: [
              "Уравнение x² = 9 означает: какое действительное число в квадрате даёт 9?",
              "И 3, и −3 дают 9, поэтому в ℝ два различных корня.",
              "Если бы мы ошибочно взяли только +3, потеряли бы второй корень — типичная ловушка."
            ],
            skillTags: ["handle_root_count", "solve_x2_equals_d"]
          },
          {
            id: "x2-02",
            blockId: "x2-equals-d",
            kind: "checkpoint",
            type: "mcq",
            mentorText: "Закрепим подсчёт корней в ℝ для x² = d.",
            prompt: "Сколько действительных корней у x² = 9 в ℝ?",
            options: ["два", "одно", "ни одного"],
            answerIndex: 0,
            hint: "d положительно — значит, √d и −√d оба подходят.",
            hints: ["d положительно — значит, √d и −√d оба подходят.", "Не путай «два корня» с «дважды один и тот же корень» — здесь два различных числа."],
            feedback: {
              correct: "Верно: d > 0 ⇒ два корня ±3.",
              wrong: "Вспомни: при положительной правой части корня два — положительный и отрицательный."
            },
            supportiveCorrect: "Да, d > 0 ⇒ два симметричных корня.",
            nextStudentText: "А если справа минус?",
            fullSolution: ["x² = 9, d = 9 > 0 ⇒ в ℝ два корня: x = 3 и x = −3."],
            skillTags: ["solve_x2_equals_d", "handle_root_count"]
          },
          {
            id: "x2-03",
            blockId: "x2-equals-d",
            kind: "checkpoint",
            type: "mcq",
            mentorText: "И последняя проверка на знак d — без паники, это частый фильтр на контрольных.",
            prompt: "Сколько действительных корней у x² = −4 в ℝ?",
            options: ["ни одного", "два", "одно"],
            answerIndex: 0,
            hint: "Квадрат действительного числа неотрицателен — сравни левую и правую части.",
            hints: [
              "Квадрат действительного числа неотрицателен — сравни левую и правую части.",
              "Можно ли подобрать x ∈ ℝ, чтобы x² стало −4?"
            ],
            feedback: {
              correct: "Да: квадрат неотрицателен, отрицательная правая часть в ℝ не даёт решений.",
              wrong: "Подумай: может ли x² стать отрицательным числом при действительном x?"
            },
            supportiveCorrect: "Верно: в ℝ у x² = −4 решений нет.",
            nextStudentText: "А что с вынесением x?",
            fullSolution: [
              "Для любого x ∈ ℝ величина x² ≥ 0.",
              "Правая часть −4 < 0, равенство x² = −4 в ℝ невозможно.",
              "В комплексных числах появятся мнимые корни — в этой теме мы в ℝ."
            ],
            skillTags: ["handle_root_count"]
          },
          {
            id: "factor-01",
            blockId: "factor-x",
            kind: "message",
            speaker: "tutor",
            text: "Второй тип неполного квадратного: в каждом слагаемом есть x. Хочется разделить на x, но так можно стереть корень x = 0.",
            turns: [
              { speaker: "tutor", text: "Теперь другая ловушка: x² − 3x = 0. В каждом слагаемом есть x." },
              { speaker: "student_prompt", text: "Можно просто разделить на x?" },
              { speaker: "griffon", text: "Р-р-р, стоп! Так чаще всего теряют ноль." },
              { speaker: "tutor", text: "Не делим на x. Выносим его: x(x − 3) = 0, а потом раскрываем две ветки." }
            ],
            visual: {
              kind: "factor_split",
              title: "Произведение равно нулю",
              start: "x(x − 3) = 0",
              branches: ["x = 0", "x − 3 = 0 → x = 3"],
              caption: "Ноль — не мусорный корень. Это полноценная ветка решения."
            },
            mistake: {
              title: "Опасное деление на x",
              wrong: "x² − 3x = 0 → делим на x → x = 3",
              fix: "Правильно: x(x − 3) = 0 → x = 0 или x = 3."
            },
            nextStudentText: "Проверим, не потеряю ли ноль?"
          },
          {
            id: "factor-02",
            blockId: "factor-x",
            kind: "checkpoint",
            type: "mcq",
            mentorText: "Проверим ловушку: какой корень чаще всего теряют, если делят на x?",
            prompt: "Корни у x² − 3x = 0:",
            options: ["0 и 3", "только 3", "только 0"],
            answerIndex: 0,
            hint: "Вынеси x за скобку и посмотри на две ветки произведения.",
            hints: [
              "Вынеси x за скобку и посмотри на две ветки произведения.",
              "Если x(x − 3) = 0, то нулём может быть первый множитель или второй."
            ],
            feedback: {
              correct: "Да: x = 0 или x = 3.",
              wrong: "Не дели на x сразу: так можно потерять ветку x = 0."
            },
            supportiveCorrect: "Отлично. Ты сохранил ноль — это самая частая ловушка в этом типе.",
            nextStudentText: "Окей, хочу задать вопрос",
            fullSolution: [
              "x² − 3x = 0",
              "x(x − 3) = 0",
              "Первая ветка: x = 0.",
              "Вторая ветка: x − 3 = 0 → x = 3."
            ],
            skillTags: ["factor_common_x", "preserve_zero_root", "zero_product_rule"]
          },
          {
            id: "lesson-ai-01",
            blockId: "mistakes",
            kind: "ai_question",
            mentorText: "Перед практикой поймай одну мысль: что именно тебе сейчас мутно — знак, два корня или ноль при вынесении?",
            text: "Запиши короткий вопрос по теме — одного предложения достаточно.",
            placeholder: "Например: почему нельзя делить на x?",
            summary: {
              title: "Перед практикой держи в голове",
              bullets: [
                "Квадратное уравнение держится на x².",
                "Для x² = d знак d решает число корней.",
                "При вынесении x не теряем корень x = 0."
              ]
            },
            nextStudentText: "Окей, к практике"
          }
        ],
        practicePassRule: { required: 8, total: 10 },
        practiceByDifficulty: {
          easy: [
            { id: "g8-u01-e01", title: "Неполное квадратное", prompt: "Неполное квадратное: в ax² + bx + c = 0 отсутствует b или c. Какой вариант подходит?", options: ["3x² − 5 = 0", "x³ − 1 = 0", "2x + 1 = 0", "x + x² + x³ = 0"], answerIndex: 0, explanation: "3x² − 5 = 0: есть x², a ≠ 0, нет линейного члена bx, значит это неполное квадратное.", skillTags: ["recognize_quadratic", "identify_incomplete_type"], theoryRefs: [{ blockId: "intro", label: "Определение и неполные случаи" }], misconceptionsRefIds: [], hints: ["Ищи x² и отсутствие bx при b = 0."], workedSolution: ["Есть x², a ≠ 0, нет линейного члена"] },
            { id: "g8-u01-e02", title: "x² = d", prompt: "Сколько действительных корней у x² = 25?", options: ["два", "один", "ни одного", "бесконечно"], answerIndex: 0, explanation: "d > 0 ⇒ два корня ±5.", skillTags: ["solve_x2_equals_d", "handle_root_count", "identify_incomplete_type"], theoryRefs: [{ blockId: "root-cases", label: "Случаи d" }], misconceptionsRefIds: ["lost_negative_root"], hints: ["d положительно.", "Уравнение уже в виде x² = d — это неполный квадратный случай."], workedSolution: ["x = ±5"] },
            { id: "g8-u01-e03", title: "Знак корня", prompt: "Корни x² = 7 в ℝ:", options: ["√7 и −√7", "только √7", "только −√7", "нет"], answerIndex: 0, explanation: "Два симметричных корня.", skillTags: ["answer_notation", "handle_root_count"], theoryRefs: [{ blockId: "x2-equals-d", label: "x² = d" }], misconceptionsRefIds: ["lost_negative_root"], hints: ["Не забудь минус перед корнем."], workedSolution: ["x = ±√7"] },
            { id: "g8-u01-e04", title: "d = 0", prompt: "Корни x² = 0:", options: ["x = 0", "x = ±1", "нет корней", "два различных"], answerIndex: 0, explanation: "Один корень (кратности 2) x = 0.", skillTags: ["handle_root_count", "identify_incomplete_type"], theoryRefs: [{ blockId: "root-cases", label: "d = 0" }], misconceptionsRefIds: [], hints: ["Ноль — единственное решение.", "Вид x² = d при d = 0 — частный случай неполного квадратного."], workedSolution: ["x = 0"] },
            { id: "g8-u01-e05", title: "d < 0", prompt: "x² = −4 в ℝ:", options: ["нет корней", "x = ±2", "x = 2", "x = −2"], answerIndex: 0, explanation: "Квадрат неотрицателен.", skillTags: ["handle_root_count"], theoryRefs: [{ blockId: "root-cases", label: "d < 0" }], misconceptionsRefIds: ["negative_square_fake_roots"], hints: ["Может ли x² быть отрицательным?"], workedSolution: ["В ℝ решений нет"] },
            { id: "g8-u01-e06", title: "Вынесение x", prompt: "Корни x² − 3x = 0:", options: ["0 и 3", "только 3", "только 0", "±3"], answerIndex: 0, explanation: "x(x−3)=0.", skillTags: ["factor_common_x", "preserve_zero_root", "zero_product_rule"], theoryRefs: [{ blockId: "factor-x", label: "Вынесение x" }], misconceptionsRefIds: ["lost_zero_root"], hints: ["Вынеси x."], workedSolution: ["x = 0 или x = 3"] }
          ],
          med: [
            {
              id: "g8-u01-med-01",
              kind: "steps",
              difficulty: "med",
              title: "Решите 2x² − 18 = 0",
              prompt: "Решите уравнение пошагово (выбери верный следующий шаг).",
              skillTags: ["isolate_x_squared", "solve_x2_equals_d", "answer_notation"],
              theoryRefs: [{ blockId: "x2-equals-d", label: "Схема x² = d" }],
              misconceptionsRefIds: ["lost_negative_root"],
              steps: [
                { id: "normalize", prompt: "Вырази x².", choices: ["x² = 9", "x² = 18", "x = 9"], correctIndex: 0, hints: ["Перенеси −18 вправо и раздели на 2."] },
                { id: "roots", prompt: "Запиши корни.", choices: ["x = 3 или x = −3", "x = 3", "x = ±9"], correctIndex: 0, hints: ["При d > 0 два корня; в ответе обязательно оба знака ± (не только положительный)."] }
              ],
              workedSolution: ["2x² − 18 = 0", "2x² = 18", "x² = 9", "x = 3 или x = −3"]
            },
            {
              id: "g8-u01-med-02",
              kind: "steps",
              difficulty: "med",
              title: "3x² = 27",
              prompt: "Пошагово:",
              skillTags: ["isolate_x_squared", "solve_x2_equals_d"],
              theoryRefs: [{ blockId: "x2-equals-d", label: "x² = d" }],
              steps: [
                { id: "s1", prompt: "x² после деления на 3:", choices: ["x² = 9", "x² = 27", "x = 9"], correctIndex: 0, hints: ["Раздели обе части на 3."] },
                {
                  id: "s2",
                  prompt: "Корни:",
                  choices: ["x = ±3", "x = 3", "нет корней"],
                  correctIndex: 0,
                  hints: ["При d > 0 в ℝ два корня; запиши оба знака ± перед числом."]
                }
              ],
              workedSolution: ["x² = 9", "x = ±3"]
            },
            {
              id: "g8-u01-med-03",
              kind: "steps",
              difficulty: "med",
              title: "x² − 7 = 0",
              prompt: "Шаги:",
              skillTags: ["solve_x2_equals_d", "answer_notation"],
              theoryRefs: [{ blockId: "x2-equals-d", label: "x² = d" }],
              steps: [
                { id: "a1", prompt: "x² = ?", choices: ["7", "−7", "√7"], correctIndex: 0, hints: ["Перенеси −7."] },
                {
                  id: "a2",
                  prompt: "Ответ в ℝ:",
                  choices: ["x = ±√7", "x = √7", "нет корней"],
                  correctIndex: 0,
                  hints: ["Два симметричных корня: обязательно ± перед √d при d > 0."]
                }
              ],
              workedSolution: ["x² = 7", "x = ±√7"]
            },
            {
              id: "g8-u01-med-04",
              kind: "steps",
              difficulty: "med",
              title: "5x² = 5x",
              prompt: "Приведи к произведению и реши:",
              skillTags: ["factor_common_x", "preserve_zero_root", "zero_product_rule"],
              theoryRefs: [{ blockId: "factor-x", label: "Вынесение x" }],
              misconceptionsRefIds: ["lost_zero_root"],
              steps: [
                { id: "b1", prompt: "Перенеси всё в одну сторону и вынеси x:", choices: ["5x(x − 1) = 0", "5x² = 0", "x = 5"], correctIndex: 0, hints: ["5x² − 5x = 0"] },
                {
                  id: "b2",
                  prompt: "Корни:",
                  choices: ["x = 0 и x = 1", "только 1", "только 0"],
                  correctIndex: 0,
                  hints: ["Произведение = 0, если хотя бы один множитель 0; не теряй x = 0.", "Правило: из x·(ax+b)=0 следуют оба случая."]
                }
              ],
              workedSolution: ["5x² − 5x = 0", "5x(x − 1) = 0", "x = 0 или x = 1"]
            }
          ],
          hard: [
            {
              id: "g8-u01-h01",
              title: "Ловушка со знаком",
              prompt: "Решите −x² + 4 = 0 в ℝ.",
              options: ["x = ±2", "x = 2", "нет корней", "x = ±4"],
              answerIndex: 0,
              explanation: "x² = 4 после умножения на −1 (или перенос).",
              skillTags: ["sign_accuracy", "solve_x2_equals_d"],
              theoryRefs: [{ blockId: "x2-equals-d", label: "x² = d" }],
              hints: ["Приведи к x² = …", "Проверь знак при переносе через равенство."],
              workedSolution: ["x² = 4", "x = ±2"],
              misconceptionsRefIds: ["lost_negative_root", "sign_transfer_error"]
            },
            {
              id: "g8-u01-h02",
              title: "Смешанная форма",
              prompt: "2x² − 8 = x² + 1",
              options: ["x = ±3", "x = 3", "нет корней", "x = ±1"],
              answerIndex: 0,
              explanation: "x² = 9.",
              skillTags: ["isolate_x_squared", "verify_roots"],
              theoryRefs: [{ blockId: "intro", label: "Введение" }],
              hints: ["Перенеси в одну сторону.", "Следи за знаками при переносе x² и свободного члена."],
              workedSolution: ["x² = 9", "x = ±3"],
              misconceptionsRefIds: ["sign_transfer_error"]
            },
            {
              id: "g8-u01-h03",
              title: "Расширение: не квадратное, та же техника",
              stretch: true,
              prompt: "Обобщение (не базовый вид ax²+bx+c=0): x³ − 4x² = 0 в ℝ. Вынеси x² и примени «произведение = 0».",
              options: ["x = 0 (двойной) и x = 4", "только 4", "только 0", "x = ±2"],
              answerIndex: 0,
              explanation: "x²(x−4)=0 ⇒ x = 0 или x = 4; это тренировка вынесения и нуля, не определение темы.",
              skillTags: ["factor_common_x", "preserve_zero_root", "zero_product_rule"],
              theoryRefs: [{ blockId: "factor-x", label: "Вынесение" }],
              misconceptionsRefIds: ["lost_zero_root"],
              hints: ["x² — общий множитель; дальше как у неполного квадратного с вынесением x."],
              workedSolution: ["x²(x−4)=0", "x = 0 или x = 4"]
            }
          ]
        },
        testByDifficulty: {
          easy: [
            { id: "g8-u01-te01", title: "База", prompt: "Неполное квадратное?", options: ["5x² − 1 = 0", "x + 1 = 0", "x³ = 1", "0 = 0"], answerIndex: 0, explanation: "Есть x², нет x.", skillTags: ["recognize_quadratic", "identify_incomplete_type"] },
            { id: "g8-u01-te02", title: "Корни x²=36", prompt: "В ℝ:", options: ["6 и −6", "6", "36", "нет"], answerIndex: 0, explanation: "±6.", skillTags: ["handle_root_count", "solve_x2_equals_d"] },
            { id: "g8-u01-te03", title: "x²=0", prompt: "Корень:", options: ["0", "нет", "±1", "2"], answerIndex: 0, explanation: "Один корень 0.", skillTags: ["handle_root_count"] }
          ],
          med: [
            { id: "g8-u01-tm01", title: "Шаг", prompt: "Первый шаг для 4x² = 64:", options: ["x² = 16", "x = 16", "x² = 64", "x = 4"], answerIndex: 0, explanation: "Разделить на 4.", skillTags: ["isolate_x_squared", "solve_x2_equals_d"] },
            { id: "g8-u01-tm02", title: "Корни", prompt: "x² = 16 ⇒", options: ["±4", "4", "−4", "8"], answerIndex: 0, explanation: "Два корня.", skillTags: ["answer_notation", "solve_x2_equals_d"] },
            { id: "g8-u01-tm03", title: "Ноль", prompt: "x² − 5x = 0 ⇒ один из корней:", options: ["0", "5", "−5", "1"], answerIndex: 0, explanation: "x(x−5)=0.", skillTags: ["preserve_zero_root", "zero_product_rule"] },
            { id: "g8-u01-tm04", title: "Отрицательная правая часть", prompt: "x² = −9 в ℝ", options: ["нет корней", "±3", "3", "−3"], answerIndex: 0, explanation: "d < 0.", skillTags: ["handle_root_count"], misconceptionsRefIds: ["negative_square_fake_roots"] }
          ],
          hard: [
            {
              id: "g8-u01-th01",
              title: "Перенос (не базовый вид x² = d)",
              prompt: "Сложнее базовой схемы: из (x−2)² = 9 следует x−2 = ±3, затем два линейных уравнения. Итог:",
              options: ["x = 5 или x = −1", "только 5", "±3", "x = 2"],
              answerIndex: 0,
              explanation: "x−2=±3 ⇒ две точки на прямой.",
              skillTags: ["verify_roots", "answer_notation", "isolate_x_squared"],
              theoryRefs: [{ blockId: "x2-equals-d", label: "Идея двух корней" }],
              misconceptionsRefIds: ["lost_negative_root"]
            },
            {
              id: "g8-u01-th02",
              title: "Знаки",
              prompt: "−2x² + 50 = 0",
              options: ["x = ±5", "x = 5", "нет", "±25"],
              answerIndex: 0,
              explanation: "x²=25.",
              skillTags: ["sign_accuracy", "isolate_x_squared"],
              misconceptionsRefIds: ["sign_transfer_error"]
            },
            { id: "g8-u01-th03", title: "Вынесение", prompt: "3x² − 12x = 0", options: ["0 и 4", "только 4", "±2", "12"], answerIndex: 0, explanation: "3x(x−4)=0.", skillTags: ["preserve_zero_root", "factor_common_x"], misconceptionsRefIds: ["lost_zero_root"] }
          ]
        },
        practice: [
          {
            title: "Задание 1 (fallback)",
            prompt: "Решите уравнение x² − 9 = 0.",
            options: ["x = ±3", "x = 3", "x = −3", "корней нет"],
            answerIndex: 0,
            explanation: "x² = 9 ⇒ два корня.",
            hints: ["Перенеси −9.", "Два знака."],
            theoryRefs: [{ label: "Схема x² = d", blockIndex: 1 }],
            workedSolution: ["x² = 9", "x = ±3"],
            misconceptionsByWrongIndex: { 1: "Нужны оба знака.", 2: "Только −3 — неполно.", 3: "Корни есть." }
          },
          {
            title: "Задание 2",
            prompt: "Сколько действительных корней у 2x² + 8 = 0?",
            options: ["ни одного", "два", "один", "много"],
            answerIndex: 0,
            explanation: "x² = −4.",
            hints: ["Вырази x²."],
            workedSolution: ["x² = −4", "В ℝ нет"],
            theoryRefs: [{ label: "Случаи d", blockIndex: 2 }]
          },
          {
            title: "Задание 3",
            prompt: "Корни x² − 5x = 0:",
            options: ["x = 0 и x = 5", "x = 5", "x = 0", "±5"],
            answerIndex: 0,
            explanation: "x(x−5)=0.",
            hints: ["Вынеси x."],
            workedSolution: ["x = 0 или x = 5"],
            theoryRefs: [{ label: "Вынесение x", blockIndex: 3 }]
          },
          {
            title: "Задание 4",
            prompt: "Решите (x − 1)² = 4.",
            options: ["x = 3 и x = −1", "x = 3", "x = 1", "x = ±2"],
            answerIndex: 0,
            explanation: "x−1 = ±2.",
            hints: ["Два линейных уравнения."],
            workedSolution: ["x = 3 или x = −1"],
            theoryRefs: [{ label: "x² = d", blockIndex: 1 }]
          }
        ],
        test: [
          {
            title: "Вопрос 1",
            prompt: "Какое уравнение — неполное квадратное (a ≠ 0)?",
            options: ["3x² − 7 = 0", "x³ + x = 0", "2x + 5 = 0", "x² + x + x³ = 0"],
            answerIndex: 0,
            explanation: "Нет bx.",
            skillTags: ["recognize_quadratic"]
          },
          {
            title: "Вопрос 2",
            prompt: "Корни x² = 16:",
            options: ["±4", "4", "−4", "256"],
            answerIndex: 0,
            explanation: "±4.",
            misconceptionsByWrongIndex: { 1: "Нужны оба знака.", 2: "Только −4 — мало.", 3: "256 — не корни." }
          },
          {
            title: "Вопрос 3",
            prompt: "x² + 4x = 0. Один из корней:",
            options: ["0", "4", "−4", "1"],
            answerIndex: 0,
            explanation: "x(x+4)=0.",
            skillTags: ["preserve_zero_root"]
          },
          {
            title: "Вопрос 4",
            prompt: "x² = −1 в ℝ:",
            options: ["нет корней", "x = 1", "x = −1", "x = ±1"],
            answerIndex: 0,
            explanation: "d < 0.",
            misconceptionsRefIds: ["negative_square_fake_roots"]
          }
        ]
      },

"g8-u02": {
        objective: "Уметь по коэффициентам a, b, c найти дискриминант D, определить число действительных корней и применить формулу x = (−b ± √D) / (2a).",
        workedExample: {
          title: "Пример: x² − 5x + 6 = 0",
          lines: [
            "Приведём к виду ax² + bx + c = 0: a = 1, b = −5, c = 6.",
            "D = b² − 4ac = 25 − 24 = 1 > 0 ⇒ два различных действительных корня.",
            "x = (−b ± √D) / (2a) = (5 ± 1) / 2.",
            "x₁ = 3, x₂ = 2. Проверка подстановкой: 9 − 15 + 6 = 0 и 4 − 10 + 6 = 0.",
          ],
        },
        practicePassRule: { required: 3, total: 4 },
        theory: [
          {
            title: "Дискриминант",
            body: "D = b² − 4ac показывает, сколько действительных корней у ax² + bx + c = 0: два при D > 0, один при D = 0, ни одного при D < 0.",
          },
          {
            title: "Формула корней",
            body: "x = (−b ± √D) / (2a) при D > 0. При D = 0 один (двойной) корень: x = −b / (2a) — не делите только на 2, знаменатель именно 2a.",
          },
          {
            title: "Перед подсчётом",
            body: "Убедись, что уравнение приведено к виду «= 0» и что a не обнулилось при переносе слагаемых. Знак b влияет на −b в формуле, знак c входит в D через −4ac.",
          },
          {
            title: "Сумма и произведение корней",
            body: "Для ax² + bx + c = 0 (a ≠ 0) при действительных корнях x₁ + x₂ = −b/a и x₁·x₂ = c/a. Полная «теорема Виета» в стандартном виде для x² + px + q будет в следующей теме — здесь эти равенства помогают проверять подбор корней.",
          },
        ],
        practice: [
          {
            title: "Задание 1",
            prompt: "Для x² − 5x + 6 = 0 найдите D.",
            options: ["1", "0", "25", "−1"],
            answerIndex: 0,
            explanation: "D = b² − 4ac = (−5)² − 4·1·6 = 25 − 24 = 1.",
            hints: [
              "Запиши a = 1, b = −5, c = 6; в D входит b², значит (−5)² = 25.",
              "D = 25 − 4ac = 25 − 24.",
              "Сравни знак D с нулём: D > 0 ⇒ два корня.",
            ],
            theoryRefs: [{ label: "Дискриминант", blockIndex: 0 }],
            workedSolution: ["a = 1, b = −5, c = 6", "D = (−5)² − 4·1·6", "D = 25 − 24 = 1"],
            misconceptionsByWrongIndex: {
              1: "D = 0 был бы только при других коэффициентах; пересчитай b² − 4ac.",
              2: "25 — это только b²; из него нужно вычесть 4ac.",
              3: "D отрицательным здесь не получится: проверь знаки в формуле дискриминанта.",
            },
          },
          {
            title: "Задание 2",
            prompt: "Сколько различных действительных корней при D = 0?",
            options: ["один", "два", "ни одного", "три"],
            answerIndex: 0,
            explanation: "При D = 0 один действительный корень (кратности 2): x = −b / (2a).",
            hints: [
              "Вспомни смысл D: граница между двумя и «слипшимися» корнями.",
              "При D = 0 график касается оси x в одной точке.",
              "Ответ — одно значение x, даже если корень «двойной».",
            ],
            theoryRefs: [{ label: "Дискриминант", blockIndex: 0 }],
            workedSolution: ["D = 0", "Два совпадающих действительных корня считают как один различный корень в ℝ", "Ответ: один"],
            misconceptionsByWrongIndex: {
              1: "Два различных корня были бы при D > 0.",
              2: "При D = 0 в ℝ корни не «пропадают» — есть ровно одна точка касания.",
              3: "Три корня у квадратного в ℂ не порядок дня; здесь речь о действительных.",
            },
          },
          {
            title: "Задание 3",
            prompt: "Корни x² − 2x + 1 = 0:",
            options: ["x = 1 (двойной)", "x = ±1", "нет корней", "x = 0 и 2"],
            answerIndex: 0,
            explanation: "D = 0 ⇒ один корень x = −b / (2a) = −(−2) / (2·1) = 1.",
            hints: [
              "Сначала D = (−2)² − 4·1·1 = 0.",
              "При D = 0 используй x = −b / (2a), не путай со случаем D > 0.",
              "Знаменатель 2a = 2, числитель −b = 2 ⇒ x = 1.",
            ],
            theoryRefs: [{ label: "Формула корней", blockIndex: 1 }],
            workedSolution: ["D = 4 − 4 = 0", "x = −b / (2a) = 2 / 2 = 1", "Разложение (x − 1)² = 0 подтверждает двойной корень 1"],
            misconceptionsByWrongIndex: {
              1: "±1 — это ошибка: при D = 0 нет двух разных корней, формула даёт одно значение.",
              2: "Корни есть: D = 0 — один действительный корень.",
              3: "0 и 2 не подходят: подставь в уравнение и проверь.",
            },
          },
          {
            title: "Задание 4",
            prompt: "D для 3x² + x + 1 = 0:",
            options: ["отрицательный", "положительный", "ноль", "не существует"],
            answerIndex: 0,
            explanation: "D = 1² − 4·3·1 = 1 − 12 = −11 < 0 — действительных корней нет.",
            hints: [
              "Здесь a = 3, b = 1, c = 1 — все знаки важны.",
              "D = b² − 4ac = 1 − 12.",
              "Сравни результат с нулём.",
            ],
            theoryRefs: [{ label: "Дискриминант", blockIndex: 0 }],
            workedSolution: ["a = 3, b = 1, c = 1", "D = 1 − 12 = −11", "D < 0 ⇒ корней в ℝ нет"],
            misconceptionsByWrongIndex: {
              1: "Положительный D получился бы при ошибке в знаке или в 4ac.",
              2: "D = 0 здесь не получается — пересчитай.",
              3: "Дискриминант существует всегда; вопрос про его знак.",
            },
          },
        ],
        test: [
          {
            title: "Вопрос 1",
            prompt: "x² + 2x − 3 = 0. D равен:",
            options: ["16", "4", "0", "−8"],
            answerIndex: 0,
            explanation: "D = 2² − 4·1·(−3) = 4 + 12 = 16. Повтори: c отрицательное даёт + в −4ac.",
            misconceptionsByWrongIndex: {
              1: "4 — часто забывают, что −4ac при c = −3 даёт +12, а не −12.",
              2: "D = 0 не для этих коэффициентов.",
              3: "−8 не сходится: проверь b² и знак 4ac.",
            },
          },
          {
            title: "Вопрос 2",
            prompt: "При каком D уравнение имеет два различных действительных корня?",
            options: ["D > 0", "D = 0", "D < 0", "D = 1 только"],
            answerIndex: 0,
            explanation: "Два различных действительных корня ⇔ D > 0. При D = 0 корень один (двойной), при D < 0 в ℝ корней нет.",
            misconceptionsByWrongIndex: {
              1: "D = 0 даёт один действительный корень, не два различных.",
              2: "D < 0 ⇒ в ℝ корней нет.",
              3: "D = 1 — лишь пример положительного D, условие общее: D > 0.",
            },
          },
          {
            title: "Вопрос 3",
            prompt: "Сумма корней x² − 7x + 10 = 0 (используй связь x₁ + x₂ = −b/a):",
            options: ["7", "10", "−7", "−10"],
            answerIndex: 0,
            explanation: "x₁ + x₂ = −b/a = −(−7)/1 = 7. Это согласуется с блоком «Сумма и произведение корней»; полный аппарат теоремы Виета — в теме g8-u03.",
            misconceptionsByWrongIndex: {
              1: "10 — это произведение корней c/a, не сумма.",
              2: "−7 — типичная путаница знака: сумма = −b/a, при b = −7 получается +7.",
              3: "−10 не выводится из −b/a для этих коэффициентов.",
            },
          },
          {
            title: "Вопрос 4",
            prompt: "Если a = 2, b = −8, c = 8, то число корней в ℝ:",
            options: ["один", "два", "ни одного", "три"],
            answerIndex: 0,
            explanation: "D = (−8)² − 4·2·8 = 64 − 64 = 0 ⇒ один действительный корень x = −b/(2a) = 8/4 = 2.",
            misconceptionsByWrongIndex: {
              1: "Два корня были бы при D > 0.",
              2: "D = 0, значит в ℝ не «ни одного».",
              3: "У квадратного уравнения не три действительных корня.",
            },
          },
        ],
      },
      "g8-u03": {
        objective: "Подбирать целые корни по сумме и произведению и всегда проверять их подстановкой в уравнение.",
        workedExample: {
          title: "Пример: x² − 5x + 6 = 0",
          lines: [
            "Ищем два числа с суммой 5 и произведением 6: подходят 2 и 3.",
            "Проверка: 2 + 3 = 5 = −(−5)/1 — согласуется с −p; 2·3 = 6 = q.",
            "Подстановка: 4 − 10 + 6 = 0 и 9 − 15 + 6 = 0 — оба корня верны.",
          ],
        },
        practicePassRule: { required: 3, total: 4 },
        theory: [
          {
            title: "Теорема Виета",
            body: "Если x₁ и x₂ — корни x² + px + q = 0 (старший коэффициент 1), то x₁ + x₂ = −p и x₁·x₂ = q.",
          },
          {
            title: "Обратная теорема",
            body: "Если числа m и n таковы, что m + n = −p и mn = q, то они — корни x² + px + q = 0.",
          },
          {
            title: "Зачем это",
            body: "Иногда корни угадываются по подбору быстрее, чем через дискриминант — особенно с целыми коэффициентами.",
          },
          {
            title: "Проверка подстановкой",
            body: "Пара чисел может случайно дать нужную сумму и произведение, но не быть корнями. Всегда подставляй кандидатов в исходное уравнение и убедись, что получается 0.",
          },
        ],
        practice: [
          {
            title: "Задание 1",
            prompt: "Для x² − 5x + 6 = 0 подберите корни по Виету.",
            options: ["2 и 3", "1 и 6", "−2 и −3", "0 и 5"],
            answerIndex: 0,
            explanation: "Сумма 5 и произведение 6 ⇒ 2 и 3; проверка: 4−10+6=0, 9−15+6=0.",
            hints: [
              "Ищи два числа, которые в сумме дают 5, а в произведении — 6.",
              "Перебери пары делителей 6: 1 и 6, 2 и 3…",
              "После подбора обязательно подставь оба числа в уравнение.",
            ],
            theoryRefs: [{ label: "Теорема Виета", blockIndex: 0 }],
            workedSolution: ["Нужны u+v=5, uv=6", "Пара 2 и 3: 2+3=5, 2·3=6", "Проверка: 2²−5·2+6=0, 3²−5·3+6=0"],
            misconceptionsByWrongIndex: {
              1: "1 и 6 дают сумму 7, не 5 — перепутана сумма с произведением.",
              2: "−2 и −3 дают сумму −5 и произведение 6 — знак суммы не тот.",
              3: "0 и 5: произведение 0, не 6.",
            },
          },
          {
            title: "Задание 2",
            prompt: "Произведение корней x² + 4x − 5 = 0:",
            options: ["−5", "5", "4", "−4"],
            answerIndex: 0,
            explanation: "x₁x₂ = c/a = −5/1 = −5. Проверка корней 1 и −5: 1·(−5) = −5.",
            hints: ["Для x² + bx + c произведение корней равно c при a = 1.", "Здесь c = −5.", "Не путай с суммой корней."],
            theoryRefs: [{ label: "Теорема Виета", blockIndex: 0 }],
            workedSolution: ["Стандартный вид x² + 4x − 5", "x₁x₂ = c/a = −5"],
            misconceptionsByWrongIndex: {
              1: "5 — это было бы при c = 5, у нас c = −5.",
              2: "4 — это коэффициент b, не произведение корней.",
              3: "−4 не совпадает с c/a.",
            },
          },
          {
            title: "Задание 3",
            prompt: "Сумма корней 2x² − 10x + 8 = 0:",
            options: ["5", "−5", "10", "4"],
            answerIndex: 0,
            explanation: "x₁ + x₂ = −b/a = −(−10)/2 = 5. Проверка: корни 1 и 4 дают сумму 5.",
            hints: ["Сумма корней = −b/a, не забывай про a ≠ 1.", "b = −10, a = 2.", "−b/a = 10/2."],
            theoryRefs: [{ label: "Теорема Виета", blockIndex: 0 }],
            workedSolution: ["x₁ + x₂ = −b/a", "−(−10) / 2 = 5"],
            misconceptionsByWrongIndex: {
              1: "−5 — перепутан знак: в числителе −b, при b = −10 получается +10.",
              2: "10 — это −b без деления на a.",
              3: "4 — не сумма корней этого уравнения.",
            },
          },
          {
            title: "Задание 4",
            prompt: "Корни x² − x − 2 = 0:",
            options: ["2 и −1", "1 и −2", "1 и 2", "−1 и −2"],
            answerIndex: 0,
            explanation: "Сумма 1, произведение −2 ⇒ 2 и −1; проверка: 4−2−2=0 и 1+1−2=0.",
            hints: ["Нужны сумма 1 и произведение −2.", "Попробуй делители −2.", "Подставь пару в уравнение."],
            theoryRefs: [{ label: "Проверка подстановкой", blockIndex: 3 }],
            workedSolution: ["Ищем p = −1, q = −2 в x² − x − 2", "Пара 2 и −1: 2+(−1)=1, 2·(−1)=−2", "Проверка подстановкой обоих"],
            misconceptionsByWrongIndex: {
              1: "1 и −2 дают сумму −1, не 1.",
              2: "1 и 2: произведение 2, не −2.",
              3: "−1 и −2: сумма −3, произведение 2 — не подходит.",
            },
          },
        ],
        test: [
          {
            title: "Вопрос 1",
            prompt: "x² − 8x + 15 = 0. Корни:",
            options: ["3 и 5", "1 и 15", "4 и 4", "−3 и −5"],
            answerIndex: 0,
            explanation: "3+5=8, 3·5=15; проверка: 9−24+15=0 и 25−40+15=0.",
            misconceptionsByWrongIndex: {
              1: "1 и 15: сумма 16, не 8.",
              2: "4 и 4: произведение 16, не 15.",
              3: "−3 и −5: сумма −8 — знак не тот для −p.",
            },
          },
          {
            title: "Вопрос 2",
            prompt: "Для x² + px + q = 0 произведение корней равно:",
            options: ["q", "−q", "p", "−p"],
            answerIndex: 0,
            explanation: "При старшем коэффициенте 1: x₁x₂ = q. Сумма x₁ + x₂ = −p — не путай роли.",
            misconceptionsByWrongIndex: {
              1: "−q — лишний минус для стандартного x²+px+q.",
              2: "p участвует в сумме корней как −p, не в произведении.",
              3: "−p относится к сумме, не к произведению.",
            },
          },
          {
            title: "Вопрос 3",
            prompt: "Сумма корней 3x² + 6x − 9 = 0:",
            options: ["−2", "2", "−6", "6"],
            answerIndex: 0,
            explanation: "x₁ + x₂ = −b/a = −6/3 = −2. Проверь: для корней 1 и −3 сумма −2, произведение −3 = c/a.",
            misconceptionsByWrongIndex: {
              1: "2 — знак: −b при b = 6 даёт −6, делим на 3.",
              2: "−6 — это −b без деления на a.",
              3: "6 — не −b/a для этих коэффициентов.",
            },
          },
          {
            title: "Вопрос 4",
            prompt: "Если корни 1 и −4, то уравнение со старшим коэффициентом 1:",
            options: ["x² + 3x − 4 = 0", "x² − 3x − 4 = 0", "x² + 3x + 4 = 0", "x² − 4 = 0"],
            answerIndex: 0,
            explanation: "(x−1)(x+4)=x²+3x−4; проверка суммы 1+(−4)=−3=−p и произведения −4=q.",
            misconceptionsByWrongIndex: {
              1: "x²−3x−4 — неверные знаки при разложении (x+1)(x−4) и т.п.",
              2: "x²+3x+4 — неверный свободный член.",
              3: "x²−4 — потеряли линейный член.",
            },
          },
        ],
      },
      "g8-u04": {
        objective: "Уметь вводить замену, решать квадратное по новой переменной и корректно возвращаться к x с учётом ОДЗ (например t = x² ≥ 0).",
        workedExample: {
          title: "Пример: x⁴ − 5x² + 4 = 0",
          lines: [
            "Положим t = x², тогда x⁴ = t² и уравнение: t² − 5t + 4 = 0.",
            "Корни t: (t−1)(t−4)=0 ⇒ t = 1 или t = 4 (оба ≥ 0 — допустимы для x²).",
            "Возврат: x² = 1 ⇒ x = ±1; x² = 4 ⇒ x = ±2.",
            "Итого до четырёх действительных x; каждый подставь в исходник для проверки.",
          ],
        },
        practicePassRule: { required: 3, total: 4 },
        theory: [
          {
            title: "Сведение к квадратному",
            body: "Уравнения с x⁴, √(выражение), (выражение) в дробной степени часто сводят заменой t = … к квадратному по t.",
          },
          {
            title: "Проверка корней",
            body: "После замены решай квадратное уравнение, затем вернись к x. Если t = x², в действительных числах нужно t ≥ 0; лишние t отбрось до возврата к x.",
          },
          {
            title: "Пример идеи",
            body: "Если везде x² встречается как блок, положи t = x² (при x² ≥ 0) и получи квадратное от t. Не путай шаг «x⁴ = (x²)²» с неверной записью x² = ±1 без контекста: из (x²)² = 1 следует x² = 1 или x² = −1; в ℝ второе отбрасывается.",
          },
        ],
        practice: [
          {
            title: "Задание 1",
            prompt: "Замена t = x² в x⁴ − 5x² + 4 = 0 даёт:",
            options: ["t² − 5t + 4 = 0", "t − 5t + 4 = 0", "t² + 5t + 4 = 0", "t² − 5t − 4 = 0"],
            answerIndex: 0,
            explanation: "(x²)² − 5x² + 4 = t² − 5t + 4.",
            hints: ["Замени x⁴ на квадрат от t.", "x⁴ = (x²)² = t².", "Остальные члены перепиши через t."],
            theoryRefs: [{ label: "Сведение к квадратному", blockIndex: 0 }],
            workedSolution: ["t = x²", "x⁴ = t²", "t² − 5t + 4 = 0"],
            misconceptionsByWrongIndex: {
              1: "Линейное t − 5t — пропущена степень у t².",
              2: "Плюс перед 5t — ошибка знака при переносе.",
              3: "Лишний минус у свободного члена — перепроверь исходное уравнение.",
            },
          },
          {
            title: "Задание 2",
            prompt: "Корни t² − 5t + 4 = 0:",
            options: ["1 и 4", "2 и 2", "−1 и −4", "0 и 5"],
            answerIndex: 0,
            explanation: "(t−1)(t−4)=0 ⇒ t = 1 или t = 4.",
            hints: ["Разложи квадратный трёхчлен на множители.", "Ищи два числа с суммой 5 и произведением 4.", "Проверь дискриминант или подбор."],
            theoryRefs: [{ label: "Сведение к квадратному", blockIndex: 0 }],
            workedSolution: ["t² − 5t + 4 = 0", "(t − 1)(t − 4) = 0", "t = 1 или t = 4"],
            misconceptionsByWrongIndex: {
              1: "2 и 2 дают сумму 4 и произведение 4 — не то уравнение.",
              2: "Отрицательные t здесь не корни этого квадратного.",
              3: "0 и 5 не дают произведение 4.",
            },
          },
          {
            title: "Задание 3",
            prompt: "Если t = x² и t = 4, то x:",
            options: ["±2", "2", "4", "±4"],
            answerIndex: 0,
            explanation: "x² = 4 ⇒ в ℝ x = 2 или x = −2.",
            hints: ["Вернись от t к x: x² = t.", "При t = 4 извлеки квадратный корень с двумя знаками.", "Не путай x и t."],
            theoryRefs: [{ label: "Проверка корней", blockIndex: 1 }],
            workedSolution: ["x² = 4", "x = 2 или x = −2"],
            misconceptionsByWrongIndex: {
              1: "Только +2 — забыт отрицательный корень.",
              2: "4 — это значение t, не x.",
              3: "±4 соответствовало бы x² = 16.",
            },
          },
          {
            title: "Задание 4",
            prompt: "Уравнение (x² − 1)² = 0 после замены u = x² − 1:",
            options: ["u² = 0", "u = 0", "u² = 1", "u = 1"],
            answerIndex: 0,
            explanation: "Левая часть — квадрат выражения: u² = 0.",
            hints: ["Вырази скобку через u.", "Квадрат нуля — ноль.", "Не раскрывай лишний раз до четвёртой степени без замены."],
            theoryRefs: [{ label: "Сведение к квадратному", blockIndex: 0 }],
            workedSolution: ["u = x² − 1", "(x² − 1)² = u²", "u² = 0"],
            misconceptionsByWrongIndex: {
              1: "u = 0 — это следствие, но первый шаг записи — именно u² = 0.",
              2: "u² = 1 не следует из «квадрат равен нулю».",
              3: "u = 1 не из того уравнения.",
            },
          },
        ],
        test: [
          {
            title: "Вопрос 1",
            prompt: "Сколько действительных x даёт x⁴ = 1?",
            options: ["2", "1", "4", "0"],
            answerIndex: 0,
            explanation: "Пишем аккуратно: x⁴ = 1 ⇒ (x²)² = 1 ⇒ x² = 1 или x² = −1. В ℝ второе невозможно, остаётся x² = 1 ⇒ x = ±1 — два решения.",
            misconceptionsByWrongIndex: {
              1: "1 решение — забыли отрицательный корень при x² = 1.",
              2: "4 — это степень уравнения, не число действительных корней.",
              3: "0 неверно: x = ±1 подходят.",
            },
          },
          {
            title: "Вопрос 2",
            prompt: "t = x² в биквадратном обычно требует:",
            options: ["t ≥ 0 при возврате к x", "t < 0", "t = 1 всегда", "ничего"],
            answerIndex: 0,
            explanation: "x² = t в ℝ имеет смысл только при t ≥ 0; отрицательные t отбрасывают до поиска x.",
            misconceptionsByWrongIndex: {
              1: "t < 0 — тогда в ℝ нет x.",
              2: "t = 1 не всегда — зависит от уравнения по t.",
              3: "«Ничего» — опасно: условие t ≥ 0 обязательно.",
            },
          },
          {
            title: "Вопрос 3",
            prompt: "x⁴ − 10x² + 9 = 0. Пусть t = x². Тогда:",
            options: ["t² − 10t + 9 = 0", "t − 10t + 9 = 0", "t² + 10t + 9 = 0", "t² = 10"],
            answerIndex: 0,
            explanation: "Стандартная замена: t² − 10t + 9 = 0.",
            misconceptionsByWrongIndex: {
              1: "Линейное по t — неверная степень.",
              2: "Плюс у 10t — ошибка знака.",
              3: "t² = 10 не эквивалентно исходному уравнению.",
            },
          },
          {
            title: "Вопрос 4",
            prompt: "Если по t получили t = 9 и t = −1, в ℝ по x:",
            options: ["только t = 9", "оба t", "только t = −1", "нет решений"],
            answerIndex: 0,
            explanation: "x² = −1 в ℝ нет; x² = 9 ⇒ x = ±3. Используем только t ≥ 0.",
            misconceptionsByWrongIndex: {
              1: "Оба t — если подставить t = −1, в ℝ не найдётся x.",
              2: "Только t = −1 — как раз не даёт действительных x.",
              3: "«Нет решений» неверно: t = 9 даёт два x.",
            },
          },
        ],
      },
      "g8-u05": {
        objective: "Решать дробно-рациональные уравнения с явной ОДЗ, аккуратным умножением на знаменатель и обязательной проверкой корней в исходном уравнении.",
        workedExample: {
          title: "Пример: 2/(x−2) = 1",
          lines: [
            "ОДЗ: x − 2 ≠ 0 ⇒ x ≠ 2.",
            "Умножаем обе части на (x − 2): 2 = 1·(x − 2) ⇒ x = 4.",
            "Проверка: x = 4 не обнуляет знаменатель; 2/(4−2) = 1 — верно.",
            "Если бы получилось x = 2, корень отбросили бы как посторонний (знаменатель 0).",
          ],
        },
        practicePassRule: { required: 3, total: 4 },
        theory: [
          {
            title: "Дробное рациональное уравнение",
            body: "Уравнение, где неизвестное в знаменателе, — дробно-рациональное. Сначала находят ОДЗ: знаменатели ≠ 0.",
          },
          {
            title: "Метод решения",
            body: "Умножают на общий знаменатель (не обнуляющийся на ОДЗ) или приводят к одной дроби = 0 и числитель = 0 с учётом ОДЗ. Нельзя «сокращать» множители, не проверив точки, где выражение не было определено.",
          },
          {
            title: "Проверка",
            body: "Каждый корень подставляют в исходное уравнение и проверяют знаменатели — «паразитические» корни отбрасывают.",
          },
        ],
        practice: [
          {
            title: "Задание 1",
            prompt: "ОДЗ для 1/(x−2) = … :",
            options: ["x ≠ 2", "x ≠ 0", "любое x", "x > 2"],
            answerIndex: 0,
            explanation: "Знаменатель x − 2 ≠ 0 ⇒ x ≠ 2 — это первый шаг до любых преобразований.",
            hints: ["Найди все знаменатели с x.", "Приравняй каждый к нулю и исключи эти x из ОДЗ.", "ОДЗ записывают до умножения."],
            theoryRefs: [{ label: "Дробное рациональное уравнение", blockIndex: 0 }],
            workedSolution: ["Знаменатель x − 2", "x − 2 = 0 ⇒ x = 2", "ОДЗ: x ≠ 2"],
            misconceptionsByWrongIndex: {
              1: "x ≠ 0 — не тот линейный множитель в знаменателе.",
              2: "«Любое x» опасно: при x = 2 левая часть не определена.",
              3: "x > 2 сужает область лишним образом.",
            },
          },
          {
            title: "Задание 2",
            prompt: "После умножения на (x−2) обязательно:",
            options: ["проверить корни по ОДЗ", "забыть про ОДЗ", "умножить на 0", "удалить корни"],
            answerIndex: 0,
            explanation: "Умножение могло дать корни вне ОДЗ или лишние — проверка в исходнике обязательна.",
            hints: ["Подставь каждый кандидат в исходное уравнение.", "Смотри знаменатели.", "Сравни с ОДЗ, записанной в начале."],
            theoryRefs: [{ label: "Проверка", blockIndex: 2 }],
            workedSolution: [
              "Домножение допустимо только с учётом ОДЗ; после преобразований нужна проверка корней в исходном уравнении.",
              "Подставь кандидаты в исходное уравнение и сверь с записанной ОДЗ.",
            ],
            misconceptionsByWrongIndex: {
              1: "Забыть ОДЗ — частая причина лишних «решений».",
              2: "Умножение на 0 ломает равенство.",
              3: "Удалять корни без проверки нельзя.",
            },
          },
          {
            title: "Задание 3",
            prompt: "Для 2/x = 1 удобно сначала:",
            options: ["x ≠ 0, затем x = 2", "x = 0", "x любое", "x = 1"],
            answerIndex: 0,
            explanation: "ОДЗ x ≠ 0; 2 = x ⇒ x = 2, подходит ОДЗ.",
            hints: ["Сначала где не определена дробь?", "Потом умножь на x или перенеси.", "Проверь знаменатель."],
            theoryRefs: [{ label: "Метод решения", blockIndex: 1 }],
            workedSolution: ["ОДЗ: x ≠ 0", "2 = x", "x = 2 — проверка ОДЗ ок"],
            misconceptionsByWrongIndex: {
              1: "x = 0 обнуляет знаменатель.",
              2: "x = 1 не удовлетворяет 2/x = 1.",
              3: "«Любое x» неверно из-за ОДЗ.",
            },
          },
          {
            title: "Задание 4",
            prompt: "Если получился корень x = 2 в уравнении с знаменателем (x−2), он:",
            options: ["посторонний, если обнуляет знаменатель", "всегда подходит", "всегда лишний", "равен 0"],
            answerIndex: 0,
            explanation: "Если после преобразований x = 2 обнуляет знаменатель исходного уравнения — это не корень, а посторонний корень.",
            hints: ["Подставь 2 в исходные знаменатели.", "Сравни с ОДЗ.", "Не путай с числителем = 0 в другой форме."],
            theoryRefs: [{ label: "Проверка", blockIndex: 2 }],
            workedSolution: ["Проверка x = 2 в исходнике", "Знаменатель (x−2) обнуляется", "Корень посторонний"],
            misconceptionsByWrongIndex: {
              1: "Не всегда подходит — смотри ОДЗ.",
              2: "Не всегда лишний — если знаменатель не 0, может быть решением.",
              3: "«Равен 0» — не критерий посторонности.",
            },
          },
        ],
        test: [
          {
            title: "Вопрос 1",
            prompt: "ОДЗ для 3/(x+1) + x = 0:",
            options: ["x ≠ −1", "x ≠ 1", "x > 0", "нет ограничений"],
            answerIndex: 0,
            explanation: "Знаменатель x + 1 ≠ 0 ⇒ x ≠ −1. Дальше — преобразования с учётом этого.",
            misconceptionsByWrongIndex: {
              1: "x ≠ 1 — не тот корень линейного знаменателя.",
              2: "x > 0 — лишнее ограничение.",
              3: "Ограничения есть всегда, где есть дробь.",
            },
          },
          {
            title: "Вопрос 2",
            prompt: "Почему нельзя просто «сократить» (x−3) в числителе и знаменателе без анализа?",
            options: [
              "можно потерять значение x = 3 или нарушить ОДЗ",
              "можно всегда",
              "это запрещено законом",
              "только если x чётное",
            ],
            answerIndex: 0,
            explanation: "Точка x = 3 могла быть исключена из области; нужно отдельно проверить исходное уравнение и ОДЗ.",
            misconceptionsByWrongIndex: {
              1: "«Можно всегда» — риск потерять смысл уравнения в отдельной точке.",
              2: "Юридический ответ не математический.",
              3: "Чётность x ни при чём.",
            },
          },
          {
            title: "Вопрос 3",
            prompt: "1/x = 1/2 ⇒",
            options: ["x = 2", "x = 1/2", "x = 0", "нет решений"],
            answerIndex: 0,
            explanation: "ОДЗ x ≠ 0; перекрёстно x = 2 — подходит.",
            misconceptionsByWrongIndex: {
              1: "1/2 — это значение правой части, не x.",
              2: "x = 0 запрещён ОДЗ.",
              3: "Решение есть.",
            },
          },
          {
            title: "Вопрос 4",
            prompt: "После решения дробно-рационального финальный шаг:",
            options: [
              "подставить корни в исходное уравнение",
              "ничего не проверять",
              "умножить на 0",
              "удалить отрицательные корни",
            ],
            answerIndex: 0,
            explanation: "Только подстановка в исходник и проверка знаменателей отсекает посторонние корни.",
            misconceptionsByWrongIndex: {
              1: "«Ничего не проверять» — частая ошибка после умножения.",
              2: "Умножение на 0 недопустимо.",
              3: "Знак корня сам по себе не критерий допустимости.",
            },
          },
        ],
      },
      "g8-u06": {
        objective: "Переводить текст задачи на уравнение, решать его и отбирать корни по смыслу (положительность, целость, соответствие формулировке).",
        workedExample: {
          title: "Пример: площадь прямоугольника",
          lines: [
            "Обозначим неизвестную: x — меньшая сторона (см), другая (x+2) по условию.",
            "Площадь: x(x+2) = 15 ⇒ x² + 2x − 15 = 0.",
            "Корни: x = 3 или x = −5; по смыслу длина > 0 ⇒ x = 3.",
            "Проверка площади: 3·5 = 15 — ок.",
          ],
        },
        practicePassRule: { required: 3, total: 4 },
        theory: [
          {
            title: "От текста к уравнению",
            body: "Сначала обозначь неизвестное буквой, переведи условие на язык равенств и связей. Удобно кратко записать, что дано и что найти.",
          },
          {
            title: "Решение и проверка смысла",
            body: "После решения квадратного (или сводимого к нему) уравнения проверь корни по ОДЗ и по смыслу задачи: длина не может быть отрицательной, количество — дробным, если речь о целых предметах.",
          },
          {
            title: "Интерпретация ответа",
            body: "Если корней два, выясни, какой подходит по контексту. Иногда один корень отбрасывают как несоответствующий реальности.",
          },
        ],
        practice: [
          {
            title: "Задание 1",
            prompt: "Прямоугольник со сторонами x и (x+2) имеет площадь 15. Какое уравнение на x корректно?",
            options: ["x(x+2)=15", "x+(x+2)=15", "2x+2=15", "x²+2=15"],
            answerIndex: 0,
            explanation: "Площадь — произведение сторон: x(x+2)=15 ⇒ x²+2x−15=0. Дальше решаем и отбираем корень по смыслу (x > 0).",
            hints: [
              "Сначала определи, что означает «площадь» для двух сторон.",
              "Запиши произведение x и (x+2).",
              "Не складывай стороны, если речь о площади.",
            ],
            theoryRefs: [{ label: "От текста к уравнению", blockIndex: 0 }],
            workedSolution: ["Пусть x — одна сторона", "Вторая x+2", "x(x+2) = 15"],
            misconceptionsByWrongIndex: {
              1: "Сумма сторон — это периметр / часть периметра, не площадь.",
              2: "2x+2 — периметр при смежных сторонах x и x+2, не площадь.",
              3: "x²+2 — неверная модель условия.",
            },
          },
          {
            title: "Задание 2",
            prompt: "Товар дорожал на 10%, потом новая цена дешевела на 10%. По сравнению с началом цена:",
            options: ["стала ниже", "не изменилась", "стала выше", "нельзя сказать"],
            answerIndex: 0,
            explanation: "Множители 1,1 и 0,9 дают 0,99 — чуть ниже исходной. Повтори проценты как множители к цене.",
            hints: [
              "Обозначь исходную цену P.",
              "После +10%: 1,1P; после −10% от новой: 0,9·(1,1P).",
              "Перемножь коэффициенты.",
            ],
            theoryRefs: [{ label: "От текста к уравнению", blockIndex: 0 }],
            workedSolution: ["Пусть цена P", "1,1P затем −10%: ×0,9", "1,1·0,9 = 0,99 < 1"],
            misconceptionsByWrongIndex: {
              1: "«Не изменилась» — ловушка: проценты от разных баз.",
              2: "«Выше» — только если бы порядок и проценты были другими.",
              3: "Здесь однозначно ниже на 1%.",
            },
          },
          {
            title: "Задание 3",
            prompt: "Число и его квадрат в сумме дают 20. Если x — число, то уравнение:",
            options: ["x+x²=20", "x²=20", "2x=20", "x²−x=20"],
            answerIndex: 0,
            explanation: "Сумма числа и квадрата: x + x² = 20. Порядок слагаемых не важен, но оба слагаемых нужны.",
            hints: [
              "Переведи слово «сумма» на +.",
              "«Квадрат числа» — это x².",
              "Не делай лишних предположений про чётность.",
            ],
            theoryRefs: [{ label: "От текста к уравнению", blockIndex: 0 }],
            workedSolution: ["x + x² = 20", "Или x² + x − 20 = 0"],
            misconceptionsByWrongIndex: {
              1: "Только x² — потеряно слагаемое x.",
              2: "2x — это удвоение числа, не сумма с квадратом.",
              3: "x²−x — другой знак у линейного члена.",
            },
          },
          {
            title: "Задание 4",
            prompt: "После решения текстовой задачи про скорость обязательно:",
            options: [
              "проверить, что скорость неотрицательна и ответ логичен по условию",
              "игнорировать единицы измерения",
              "взять любой корень уравнения",
              "удалить проверку",
            ],
            answerIndex: 0,
            explanation: "Смысл задачи и физические ограничения отсекают лишние корни — подставь в условие словами.",
            hints: [
              "Сопоставь корни с реальностью (≥0, целое число людей и т.д.).",
              "Перечитай вопрос задачи.",
              "Не доверяй только формуле без смысла.",
            ],
            theoryRefs: [{ label: "Интерпретация ответа", blockIndex: 2 }],
            workedSolution: ["Решение уравнения — кандидаты", "Проверка по смыслу и ОДЗ", "Один ответ в контексте"],
            misconceptionsByWrongIndex: {
              1: "Единицы и размерности важны для интерпретации.",
              2: "«Любой корень» — риск взять математически верный, но бессмысленный.",
              3: "Проверку убирать нельзя.",
            },
          },
        ],
        test: [
          {
            title: "Вопрос 1",
            prompt: "Катет прямоугольного треугольника на 3 длиннее другого, гипотенуза 5. Если короткий катет x, то:",
            options: ["x²+(x+3)²=25", "x+(x+3)=5", "x(x+3)=5", "2x+3=25"],
            answerIndex: 0,
            explanation: "Пифагор: сумма квадратов катетов равна квадрату гипотенузы. Затем решаем и отбираем x > 0.",
            misconceptionsByWrongIndex: {
              1: "Сумма катетов не равна гипотенузе.",
              2: "Произведение катетов — не теорема Пифагора.",
              3: "2x+3 — не модель квадратов сторон.",
            },
          },
          {
            title: "Вопрос 2",
            prompt: "Работа выполнена за t часов при производительности 1/t. Если вместе двое за 2 ч закончили работу, удобная модель — про:",
            options: ["сумму долей работы или совместную скорость", "только периметр", "только площадь круга", "модуль числа"],
            answerIndex: 0,
            explanation:
              "Текстовые задачи на совместную работу сводят к долям 1/t или к скоростям (вся работа удобно считается за единицу 1); остальные варианты не по теме.",
            misconceptionsByWrongIndex: {
              1: "Периметр — геометрия другого типа.",
              2: "Площадь круга здесь неуместна.",
              3: "Модуль числа не задаёт модель работы.",
            },
          },
          {
            title: "Вопрос 3",
            prompt: "Если по уравнению получили x=5 и x=−1 для длины отрезка (в см), в ответ берут:",
            options: ["5", "−1", "оба", "0"],
            answerIndex: 0,
            explanation: "Длина неотрицательна — x = 5; отрицательный корень отбрасываем по смыслу.",
            misconceptionsByWrongIndex: {
              1: "−1 см не имеет смысла как длина.",
              2: "Оба — если бы не было ограничения смысла.",
              3: "0 не следует из условия.",
            },
          },
          {
            title: "Вопрос 4",
            prompt: "Перевод «на 2 больше произведения числа x на x−1» в выражение:",
            options: ["2+x(x−1)", "2x(x−1)", "(x+2)(x−1)", "x²−2"],
            answerIndex: 0,
            explanation: "Сначала произведение x(x−1), затем «на 2 больше»: 2 + x(x−1). Раскрывать не обязательно.",
            misconceptionsByWrongIndex: {
              1: "2x(x−1) — удвоено не то выражение.",
              2: "(x+2)(x−1) — другая фраза («на 2 больше одного из множителей»).",
              3: "x²−2 — потеряно линейное слагаемое −x.",
            },
          },
        ],
      },
    },
  };
})();
