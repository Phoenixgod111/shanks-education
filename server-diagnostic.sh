#!/bin/bash

echo "🔍 Server Diagnostic Script for Shanks Education"
echo "=================================================="
echo ""

echo "📍 Current directory: $(pwd)"
echo "👤 Current user: $(whoami)"
echo "🖥️  OS: $(uname -a)"
echo ""

echo "📁 Checking project directory..."
if [ -d "/var/www/shanks-education" ]; then
    echo "✅ Project directory exists"
    cd /var/www/shanks-education
    echo "📍 Changed to: $(pwd)"

    if [ -d ".git" ]; then
        echo "✅ Git repository found"
        echo "📊 Git status:"
        git status --porcelain || echo "❌ Git status failed"
        echo ""
        echo "📋 Recent commits:"
        git log --oneline -3 || echo "❌ Git log failed"
        echo ""
        echo "🌿 Available branches:"
        git branch -a || echo "❌ Git branch failed"
    else
        echo "❌ No git repository found"
        ls -la
    fi
else
    echo "❌ Project directory does not exist"
    echo "📁 Available in /var/www/:"
    ls -la /var/www/ 2>/dev/null || echo "Cannot list /var/www/"
fi

echo ""
echo "🌐 Checking web server..."
if command -v nginx >/dev/null 2>&1; then
    echo "✅ Nginx is installed"
    echo "📊 Nginx status:"
    sudo systemctl status nginx --no-pager -l | head -5 || echo "❌ Cannot check nginx status"
    echo ""
    echo "🔍 Nginx config test:"
    sudo nginx -t 2>&1 || echo "❌ Nginx config test failed"
else
    echo "❌ Nginx is not installed"
fi

echo ""
echo "🌐 Testing website..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost 2>/dev/null || echo "000")
if [ "$RESPONSE" = "200" ]; then
    echo "✅ Website is UP (HTTP $RESPONSE)"
else
    echo "❌ Website is DOWN (HTTP $RESPONSE)"
fi

echo ""
echo "🔐 Checking permissions..."
if [ -d "/var/www/shanks-education" ]; then
    echo "📁 Project directory permissions:"
    ls -ld /var/www/shanks-education
    echo ""
    echo "📄 Sample file permissions:"
    ls -la /var/www/shanks-education/ | head -5
fi

echo ""
echo "💾 Disk space:"
df -h /var/www 2>/dev/null || echo "Cannot check disk space"

echo ""
echo "🎯 Diagnostic completed at: $(date)"