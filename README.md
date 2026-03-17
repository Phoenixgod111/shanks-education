# Shanks Education

**Образовательное приложение для школьников — PWA для Android и браузера**

---

## Описание

Приложение для изучения школьных предметов с интерфейсом в стиле iOS:

- **Главная** — прогресс, ежедневные челленджи, QUIZ
- **Предметы** — 11 предметов, выбор класса (5–11)
- **Темы и уроки** — теория, практика, тесты
- **AI Заметки** — скоро
- **Профиль** — статистика, достижения, Premium

---

## Установка на Android

1. Откройте в Chrome: **https://phoenixgod111.github.io/shanks-education/**
2. Меню (⋮) → **«Добавить на главный экран»**
3. Готово — приложение установлено как PWA

---

## Локальный запуск

```bash
python -m http.server 8000
```

Откройте http://localhost:8000

---

## Структура проекта

```
Shanks/
├── index.html
├── manifest.json          # PWA манифест
├── icon.svg               # Иконка приложения
├── css/styles-apple.css
├── js/
│   ├── app.js
│   ├── platform-api.js    # API для PWA (вибрация, popup)
│   ├── subject-manager.js
│   ├── navigation.js
│   ├── content-generator.js
│   ├── data.js
│   └── subscription-manager.js
└── subjects/
```

---

## Технологии

- Vanilla JavaScript
- CSS3 (Apple-style)
- PWA (Progressive Web App)
- LocalStorage
- Material Icons

---

**Версия:** 3.0 (Android PWA)
