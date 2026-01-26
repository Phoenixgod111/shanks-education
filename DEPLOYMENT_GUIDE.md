# 🚀 Руководство по развертыванию Shanks Education

**Полная инструкция по установке проекта на Ubuntu/Debian сервер**

## 📋 Предварительные требования

- Ubuntu/Debian сервер (рекомендуется Ubuntu 20.04+)
- Root-доступ или sudo-права
- Минимум 1GB RAM, 10GB диск
- Доступ к интернету

## 🔧 Полная последовательность команд

### Шаг 1: Подключение к серверу
```bash
# Подключитесь к серверу через SSH
ssh root@ВАШ_IP_АДРЕС

# Пример:
ssh root@155.212.132.62
```

### Шаг 2: Обновление системы
```bash
# Обновите список пакетов
sudo apt update

# Обновите систему
sudo apt upgrade -y

# Установите необходимые пакеты
sudo apt install -y git nginx curl
```

### Шаг 3: Установка Node.js и PM2 (опционально)
```bash
# Добавьте репозиторий Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Установите Node.js
sudo apt-get install -y nodejs

# Установите PM2 глобально
sudo npm install -g pm2
```

### Шаг 4: Настройка директорий
```bash
# Создайте необходимые директории
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled
sudo mkdir -p /var/www

# Проверьте структуру
ls -la /etc/nginx/
ls -la /var/www/
```

### Шаг 5: Создание конфигурации nginx
```bash
# Создайте конфигурацию для сайта
cat > /etc/nginx/sites-available/shanks-education << 'EOF'
server {
    listen 80;
    server_name ВАШ_IP_АДРЕС;

    root /var/www/shanks-education;
    index index.html;

    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Основной location для SPA
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Telegram Web App headers
    add_header X-Frame-Options "ALLOWALL" always;
    add_header Content-Security-Policy "frame-ancestors *;" always;
}
EOF
```

### Шаг 6: Активация сайта
```bash
# Активируйте сайт
sudo ln -sf /etc/nginx/sites-available/shanks-education /etc/nginx/sites-enabled/

# Удалите дефолтный сайт (опционально)
sudo rm -f /etc/nginx/sites-enabled/default

# Проверьте активацию
ls -la /etc/nginx/sites-enabled/
```

### Шаг 7: Проверка и запуск nginx
```bash
# Проверьте конфигурацию
sudo nginx -t

# Перезапустите nginx
sudo systemctl reload nginx

# Проверьте статус
sudo systemctl status nginx

# Включите автозапуск
sudo systemctl enable nginx
```

### Шаг 8: Клонирование проекта
```bash
# Перейдите в директорию www
cd /var/www

# Клонируйте проект
sudo git clone https://github.com/Phoenixgod111/shanks-education.git

# Установите правильные права
sudo chown -R www-data:www-data shanks-education

# Проверьте файлы
ls -la shanks-education/
```

### Шаг 9: Настройка firewall
```bash
# Разрешите HTTP (порт 80)
sudo ufw allow 80

# Разрешите SSH (порт 22)
sudo ufw allow 22

# Включите firewall
sudo ufw --force enable

# Проверьте статус
sudo ufw status
```

### Шаг 10: Финальное тестирование
```bash
# Тестируйте локально
curl -I http://localhost

# Тестируйте по IP
curl -I http://ВАШ_IP_АДРЕС

# Проверьте логи при ошибках
sudo tail -f /var/log/nginx/error.log
```

## 🎯 Проверка установки

### Автоматическая проверка:
```bash
#!/bin/bash
echo "=== Проверка установки Shanks Education ==="

# Проверить nginx
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx: работает"
else
    echo "❌ Nginx: не работает"
fi

# Проверить файлы проекта
if [ -f "/var/www/shanks-education/index.html" ]; then
    echo "✅ Проект: установлен"
else
    echo "❌ Проект: не найден"
fi

# Проверить HTTP
if curl -s --head http://localhost | grep "200 OK" > /dev/null; then
    echo "✅ HTTP: отвечает"
else
    echo "❌ HTTP: не отвечает"
fi

# Проверить права
if [ "$(stat -c '%U:%G' /var/www/shanks-education)" = "www-data:www-data" ]; then
    echo "✅ Права: правильные"
else
    echo "❌ Права: неправильные"
fi

echo "=== Проверка завершена ==="
```

### Ручная проверка:
1. **Откройте браузер** и перейдите по адресу: `http://ВАШ_IP_АДРЕС`
2. **Должна загрузиться** образовательная платформа в стиле Apple
3. **Проверьте логи** при проблемах: `sudo tail -f /var/log/nginx/error.log`

## 📱 Интеграция с Telegram

### Настройка Mini App:
1. Зайдите в **@BotFather** в Telegram
2. Создайте нового бота: `/newbot`
3. Создайте Mini App: `/newapp`
4. Укажите URL: `http://ВАШ_IP_АДРЕС`
5. Готово! Приложение доступно в Telegram

### Тестирование Mini App:
- Откройте бота в Telegram
- Нажмите кнопку "Открыть приложение"
- Должна загрузиться ваша образовательная платформа

## 🛠️ Устранение неисправностей

### Nginx не запускается:
```bash
# Проверьте конфигурацию
sudo nginx -t

# Посмотрите ошибки
sudo systemctl status nginx
sudo journalctl -u nginx -n 50
```

### Сайт не загружается:
```bash
# Проверьте логи
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Проверьте порты
netstat -tlnp | grep :80
```

### Проблемы с правами:
```bash
# Исправьте права
sudo chown -R www-data:www-data /var/www/shanks-education

# Проверьте
ls -la /var/www/shanks-education/
```

### Firewall блокирует:
```bash
# Проверьте статус firewall
sudo ufw status

# Разрешите HTTP
sudo ufw allow 80
sudo ufw reload
```

## 📊 Мониторинг

### Проверка статуса сервисов:
```bash
# Nginx
sudo systemctl status nginx

# Память и CPU
htop

# Дисковое пространство
df -h
```

### Логи:
```bash
# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Nginx error log
sudo tail -f /var/log/nginx/error.log

# System log
sudo journalctl -f
```

## 🔄 Обновление проекта

### Обновление с GitHub:
```bash
cd /var/www/shanks-education

# Получите обновления
sudo git pull origin main

# Исправьте права
sudo chown -R www-data:www-data .

# Перезапустите nginx
sudo systemctl reload nginx
```

## 📋 Сводка команд (быстрый старт)

```bash
# 1. Подключение
ssh root@ВАШ_IP

# 2. Установка
sudo apt update && sudo apt install -y nginx git curl

# 3. Клонирование
cd /var/www && sudo git clone https://github.com/Phoenixgod111/shanks-education.git

# 4. Права
sudo chown -R www-data:www-data shanks-education

# 5. Конфигурация nginx
cat > /etc/nginx/sites-available/shanks-education << 'EOF'
server {
    listen 80;
    server_name ВАШ_IP;
    root /var/www/shanks-education;
    index index.html;
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    add_header X-Frame-Options "ALLOWALL" always;
    add_header Content-Security-Policy "frame-ancestors *;" always;
}
EOF

# 6. Активация
sudo ln -sf /etc/nginx/sites-available/shanks-education /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 7. Firewall
sudo ufw allow 80 && sudo ufw allow 22 && sudo ufw --force enable

# 8. Тест
curl -I http://localhost
```

## ✅ Финальный результат

После выполнения всех команд ваш сайт будет доступен по адресу:
**http://ВАШ_IP_АДРЕС**

🎉 **Поздравляем! Установка завершена успешно!**

---
*Создано для проекта Shanks Education - Telegram Mini App для образования в стиле Apple* 🍎📚