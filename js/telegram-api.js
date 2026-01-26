// Telegram Web App API Manager
class TelegramAPIManager {
    constructor() {
        this.webApp = null;
        this.init();
    }

    init() {
        if (window.Telegram?.WebApp) {
            this.webApp = window.Telegram.WebApp;

            // Initialize Web App
            this.webApp.ready();

            // Expand to full height
            this.webApp.expand();


            // Setup viewport change listener
            this.webApp.onEvent('viewportChanged', this.handleViewportChange.bind(this));

            // Setup back button (if available)
            if (this.webApp.BackButton) {
                this.webApp.BackButton.onClick(this.handleBackButton.bind(this));
            }

            console.log('Telegram Web App initialized');
        } else {
            console.warn('Telegram Web App not available');
        }
    }


    handleViewportChange() {
        // Handle viewport changes (keyboard, etc.)
        const viewportHeight = this.webApp.viewportHeight;
        const isExpanded = this.webApp.isExpanded;

        console.log('Viewport changed:', { viewportHeight, isExpanded });
    }

    handleBackButton() {
        // Handle back button press
        if (window.app && window.app.currentScreen !== 'home') {
            window.app.switchScreen('home');
            this.showBackButton(false);
        }
    }

    showBackButton(show) {
        if (this.webApp?.BackButton) {
            if (show) {
                this.webApp.BackButton.show();
            } else {
                this.webApp.BackButton.hide();
            }
        }
    }

    // Haptic feedback
    impactOccurred(style = 'light') {
        if (this.webApp?.HapticFeedback) {
            this.webApp.HapticFeedback.impactOccurred(style);
        }
    }

    notificationOccurred(type = 'success') {
        if (this.webApp?.HapticFeedback) {
            this.webApp.HapticFeedback.notificationOccurred(type);
        }
    }

    // Popup dialogs
    showPopup(params) {
        if (this.webApp?.showPopup) {
            return this.webApp.showPopup(params);
        } else {
            // Fallback for web browsers
            const message = params.title ? `${params.title}\n\n${params.message}` : params.message;
            alert(message);
        }
    }

    showConfirm(message) {
        return new Promise((resolve) => {
            if (this.webApp?.showPopup) {
                this.webApp.showPopup({
                    title: 'Подтверждение',
                    message: message,
                    buttons: [
                        { id: 'ok', type: 'default', text: 'OK' },
                        { id: 'cancel', type: 'destructive', text: 'Отмена' }
                    ]
                }, (buttonId) => {
                    resolve(buttonId === 'ok');
                });
            } else {
                resolve(confirm(message));
            }
        });
    }

    showAlert(title, message) {
        if (this.webApp?.showPopup) {
            this.webApp.showPopup({
                title: title,
                message: message,
                buttons: [{ type: 'ok' }]
            });
        } else {
            alert(`${title}\n\n${message}`);
        }
    }

    // Main button (bottom right button)
    showMainButton(show = true) {
        if (this.webApp?.MainButton) {
            if (show) {
                this.webApp.MainButton.show();
            } else {
                this.webApp.MainButton.hide();
            }
        }
    }

    setMainButtonText(text) {
        if (this.webApp?.MainButton) {
            this.webApp.MainButton.setText(text);
        }
    }

    setMainButtonColor(color) {
        if (this.webApp?.MainButton) {
            this.webApp.MainButton.setParams({ color: color });
        }
    }

    onMainButtonClick(callback) {
        if (this.webApp?.MainButton) {
            this.webApp.MainButton.onClick(callback);
        }
    }

    // Close Web App
    close() {
        if (this.webApp?.close) {
            this.webApp.close();
        }
    }

    // Get user data
    getUser() {
        return this.webApp?.initDataUnsafe?.user || null;
    }

    // Get init data
    getInitData() {
        return this.webApp?.initData || '';
    }

    // Check if running in Telegram
    isInTelegram() {
        return !!this.webApp;
    }

    // Get color scheme
    getColorScheme() {
        return this.webApp?.colorScheme || 'light';
    }

    // Send data to bot
    sendData(data) {
        if (this.webApp?.sendData) {
            this.webApp.sendData(JSON.stringify(data));
        }
    }

    // Share URL
    openLink(url) {
        if (this.webApp?.openLink) {
            this.webApp.openLink(url);
        } else {
            window.open(url, '_blank');
        }
    }

    // Open Telegram link
    openTelegramLink(url) {
        if (this.webApp?.openTelegramLink) {
            this.webApp.openTelegramLink(url);
        } else {
            this.openLink(url);
        }
    }

    // Switch to inline query
    switchInlineQuery(query = '') {
        if (this.webApp?.switchInlineQuery) {
            this.webApp.switchInlineQuery(query);
        }
    }
}

// Initialize Telegram API Manager
window.telegramAPI = new TelegramAPIManager();