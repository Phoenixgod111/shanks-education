# 📦 Загрузка на GitHub - ИСПРАВЛЕНО!

## ✅ Приложение теперь в корне!

Все файлы перенесены из `web/` в корень проекта.

---

## 📁 Правильная структура:

```
Shanks/
├── index.html              ← Главный файл в корне!
├── css/
│   └── styles-apple.css
├── js/
│   ├── app.js
│   └── ...
├── subjects/
│   └── subjects-config.json
└── README.md
```

---

## 🚀 Загрузка на GitHub:

```bash
cd C:\Users\1\Desktop\Shanks

# Если уже есть git, удалите .git и начните заново
# Remove-Item -Path .git -Recurse -Force

git init
git add .
git commit -m "Telegram Mini App в стиле Apple"
git branch -M main
git remote add origin https://github.com/username/repo.git
git push -u origin main
```

---

## 🌐 GitHub Pages (ВАЖНО!):

1. Зайдите в **Settings** репозитория
2. Раздел **Pages**
3. Source: **Deploy from a branch**
4. Branch: **main**
5. Folder: **/ (root)** ← НЕ /web, а именно root!
6. Save

Через 1-2 минуты доступно по:
```
https://username.github.io/repo/
```

---

## 📱 Telegram Bot:

```
@BotFather
/newapp
Выберите бота
Название: Shanks Education
URL: https://username.github.io/repo/
```

---

**Теперь всё правильно!** 🎉
