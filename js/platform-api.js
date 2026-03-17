// Platform API - работает в браузере и PWA (Android/iOS)
// Заменяет Telegram API (заблокирован в РФ)
(function() {
    // Полифилл для кода, который обращается к window.Telegram
    if (!window.Telegram) {
        window.Telegram = {
            WebApp: {
                ready: () => {},
                expand: () => {},
                HapticFeedback: {
                    impactOccurred: (s) => navigator.vibrate?.(s === 'medium' ? 20 : 10),
                    notificationOccurred: () => navigator.vibrate?.([10, 50, 10])
                },
                showPopup: (p, cb) => {
                    if (p.buttons && p.buttons.length > 1) {
                        const ok = confirm(p.message || p.title || '');
                        const okId = p.buttons.find(b => b.id !== 'cancel')?.id || 'ok';
                        cb?.(ok ? okId : 'cancel');
                    } else {
                        alert(p.message || p.title || '');
                        cb?.('ok');
                    }
                },
                initDataUnsafe: {},
                onEvent: () => {},
                BackButton: { show: () => {}, hide: () => {}, onClick: () => {} },
                MainButton: { show: () => {}, hide: () => {}, setText: () => {}, setParams: () => {}, onClick: () => {} },
                close: () => {},
                openLink: (url) => window.open(url, '_blank')
            }
        };
    }
})();

class PlatformAPIManager {
    constructor() {
        this.webApp = null;
        this.init();
    }

    init() {
        // Telegram заблокирован в РФ - используем нативные API браузера
        console.log('Platform API initialized (standalone mode)');
    }

    showBackButton(show) {
        // В PWA навигация через браузер
    }

    impactOccurred(style = 'light') {
        if (navigator.vibrate) {
            navigator.vibrate(style === 'medium' ? 20 : 10);
        }
    }

    notificationOccurred(type = 'success') {
        if (navigator.vibrate) {
            navigator.vibrate([10, 50, 10]);
        }
    }

    showPopup(params) {
        const message = params.title ? `${params.title}\n\n${params.message}` : params.message;
        alert(message);
    }

    showConfirm(message) {
        return Promise.resolve(confirm(message));
    }

    showAlert(title, message) {
        alert(`${title}\n\n${message}`);
    }

    showMainButton(show = true) {}
    setMainButtonText(text) {}
    setMainButtonColor(color) {}
    onMainButtonClick(callback) {}

    close() {
        // В PWA/браузере - ничего не делаем
        if (window.history.length > 1) {
            window.history.back();
        }
    }

    getUser() {
        return null;
    }

    getInitData() {
        return '';
    }

    isInTelegram() {
        return false;
    }

    getColorScheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    sendData(data) {}

    openLink(url) {
        window.open(url, '_blank');
    }

    openTelegramLink(url) {
        this.openLink(url);
    }

    switchInlineQuery(query = '') {}
}

window.telegramAPI = new PlatformAPIManager();
