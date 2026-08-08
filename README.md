# Shanks

**PWA для школьников** — интерфейс V8 (Moon / SHARP / Editorial Navy) по макетам Pencil: главная с прогрессом, предметы, карточка темы, AI-заметки, профиль.

## Локальный запуск

```bash
python -m http.server 8000
```

Откройте http://localhost:8000

## Проверки

```bash
npm run check
npm run test:e2e
```

Команда детерминированно пересобирает data/content и embed, валидирует curriculum 5–11,
21 учебниковую линейку и universal-траекторию, canonical mapping, AI-beta content packets,
rights registry, манифест `learning-slice-ids.json` и богатый пилотный контент
`g8-u01..g8-u06`, затем запускает `lint`, тесты, инварианты пилота и smoke-check.

Основные команды конвейера:

```bash
npm run generate:data
npm run validate:data
```

Источник истины — `curriculum/math/*.json`; canonical registry, каталог, trajectories,
компактные fallback-пакеты и `js/math-content-data-embed.js` создаются без внешнего API.
Пакеты имеют статус `beta` и provenance `ai-beta-unreviewed`; для `g8-u01..g8-u06`
приоритет остаётся у существующего `js/math-learning-content.js`.

## Pre-demo (перед показом)

1. `npm run check`.
2. `python -m http.server 8000` → в браузере **`http://localhost:8000`** или **`http://127.0.0.1:8000`**. Не открывать по **LAN-IP** хоста или **публичному домену** — там `__SHANKS_QA__` не создаётся (см. ниже).
3. При необходимости сбросить только прогресс тем: консоль → **`__SHANKS_QA__.resetPilotTopicProgress()`** → перезагрузка (**`__SHANKS_QA__.reload()`** или F5). Работает **только** на **`localhost`** и **`127.0.0.1`**; на других hostname `__SHANKS_QA__` нет.
4. Путь показа: **8 класс → Математика → g8-u01 → теория → практика 3/4 → тест → 100% → F5** (сохранение прогресса).
5. Быстро открыть **g8-u02..g8-u06** — интерактив и экраны на месте.

## Demo run log (шаблон перед показом)

Скопируй и заполни перед прогоном; после — краткие заметки по UX.

```
Дата/время:
npm run check: [ ] ok  [ ] fail
Браузер:
URL:
Сброс через __SHANKS_QA__: [ ] да  [ ] нет  [ ] n/a (не localhost/127.0.0.1)
g8-u01 до 100% (теория → практика 3/4 → тест): [ ] да  [ ] нет
После reload прогресс g8-u01 сохранён: [ ] да  [ ] нет
g8-u02..g8-u06 открываются без блокеров: [ ] да  [ ] нет
UX / замечания:
```

## QA: холодный старт → пилот g8-u01 (ручной)

Цель: убедиться, что путь **8 класс → Математика → «Квадратные уравнения» → g8-u01 → теория → практика 3/4 → тест → 100% → перезагрузка сохраняет прогресс**.

1. Сбрось прогресс пилота (см. ниже) или полный ключ `shanks_prefs_v2`, перезагрузи страницу.
2. Онбординг: укажи имя/ник → **8 класс** → Математика → учебник → текущая тема.
3. **Предметы** → Математика → модуль «Квадратные уравнения» → тема **g8-u01** (карточка с бейджем «Интерактив»).
4. **Теория**: прочитай блоки → «Отметить теорию прочитанной».
5. **Практика**: ответь верно минимум на **3 из 4** карточек; тест остаётся закрыт до зачёта.
6. **Тест**: ответь верно на **все** вопросы; на карточке темы **100%**.
7. **Перезагрузка** (F5): снова открой g8-u01 — **100%** и галочки сохранены.

Автоматические инварианты: `npm run qa:pilot` проверяет **весь модуль** `g8-u01..g8-u06` (curriculum, manifest, learning, `practicePassRule`, `topicPct` → 100%, `isTestUnlocked` после практики). Пошаговый UX вручную достаточно пройти на **g8-u01**.

## Cache-busting

В `index.html` у `css/app.css` и у скриптов один query-параметр версии, синхронизированный с `curriculumMathVersion` в `js/data.js` (при правках curriculum/manifest/стилей увеличивайте оба, чтобы сбросить кэш браузера).

## GitHub Pages: deploy и parity

**GitHub Pages отдаёт статику из репозитория** (ветка/папка задаются в *Settings → Pages*). Это **не** то же самое, что «несохранённая копия на диске»: пока изменения не **закоммичены и не запушены** в источник Pages, сайт останется на старом снимке.

Краткий parity-check после публикации:

1. В репозитории на GitHub открой сырой `index.html` выбранной для Pages ветки (например `https://raw.githubusercontent.com/Phoenixgod111/shanks-education/master/index.html`) и сравни с локальным `index.html`.
2. На живом сайте «Просмотр кода страницы»: все локальные `?v=` должны совпадать с `curriculumMathVersion` в **`js/data.js` того же коммита**; для пилота должны быть теги `math-learning-content.js`, `progress.js`, `math-learning-kpi.js` (если их нет — это старая сборка).
3. Локально перед пушем: `npm run check`.
4. Если HTML уже новый, а интерфейс «старый» — проверь жёсткое обновление (Ctrl+F5) и кэш CDN/браузера.

Workflow `.github/workflows/ci.yml` запускает генерацию, валидацию, unit/smoke и
браузерный Playwright-сценарий. `.github/workflows/pages.yml` публикует `master`
в GitHub Pages только после успешного `npm run check`; в настройках Pages источником
должен быть выбран **GitHub Actions**.

## Supabase

Без конфигурации приложение безопасно работает локально. Для аккаунтов, синхронизации
прогресса и голосов выполните инструкцию [`docs/supabase-setup.md`](docs/supabase-setup.md).
В браузере разрешён только publishable/anon key; `service_role` запрещён.

## QA: сброс прогресса

- **Только темы пилота (`topicProgress`)**, без смены `storageKey` и без удаления избранного/класса: открой страницу с хостом **`localhost`** или **`127.0.0.1`** (например `http://localhost:8000/`). В консоли: `__SHANKS_QA__.resetPilotTopicProgress()`, затем `__SHANKS_QA__.reload()` или F5. **На любом другом hostname объект `__SHANKS_QA__` не создаётся** (в т.ч. при доступе по LAN-IP к той же машине).
- **Полный «холодный старт»**: DevTools → Application → Local Storage → удали ключ **`shanks_prefs_v2`**, перезагрузи страницу.

## Структура

```
Shanks/
├── index.html
├── manifest.json
├── icon.svg
├── css/app.css
├── js/
│   ├── app.js                  # навигация и экраны
│   ├── data.js                 # демо-данные
│   ├── progress.js             # правила % по теме
│   ├── math-learning-kpi.js    # KPI allowlist (чистые функции)
│   └── math-learning-content.js
├── curriculum/
│   ├── math/                   # программы 5–11
│   ├── canonical/              # canonical topic registry
│   ├── catalog/                # 21 линий + universal
│   ├── schema/
│   └── trajectories/
├── content/
│   ├── math/                   # AI-beta packets 5–11
│   └── rights/
└── scripts/                    # generators, validators, tests and smoke checks
```

## Технологии

- HTML / CSS / ES-модули не используются — клиентские скрипты подключаются как IIFE
- Иконки: [Lucide](https://lucide.dev) (CDN)
- Шрифт: Inter (Google Fonts)

## PWA

В Chrome: меню → «Установить приложение» / «Добавить на главный экран».
