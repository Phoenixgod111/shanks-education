# Shanks

**PWA для школьников** — интерфейс V8 (Moon / SHARP / Editorial Navy) по макетам Pencil: главная с прогрессом, предметы, карточка темы, AI-заметки, профиль.

## Локальный запуск

```bash
python -m http.server 8000
```

Откройте http://localhost:8000

## Структура

```
Shanks/
├── index.html
├── manifest.json
├── icon.svg
├── css/app.css
├── js/
│   ├── app.js      # навигация и экраны
│   └── data.js     # демо-данные (можно заменить на API/JSON)
└── design/         # .pen и экспорты макетов (опционально)
```

## Технологии

- HTML / CSS / ES-модули не используются — один IIFE в `app.js`
- Иконки: [Lucide](https://lucide.dev) (CDN)
- Шрифт: Inter (Google Fonts)

## PWA

В Chrome: меню → «Установить приложение» / «Добавить на главный экран».
