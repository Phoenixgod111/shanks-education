// Navigation Manager
class NavigationManager {
    constructor() {
        this.screenStack = [];
        this.init();
    }

    init() {
        // Handle browser back button
        window.addEventListener('popstate', (event) => {
            this.handleBrowserBack();
        });

        // Initialize with home screen
        this.pushScreen('home');
    }

    pushScreen(screenName, data = null) {
        // Hide current screen
        if (this.screenStack.length > 0) {
            const currentScreen = this.screenStack[this.screenStack.length - 1];
            this.hideScreen(currentScreen.name);
        }

        // Add new screen to stack
        this.screenStack.push({
            name: screenName,
            data: data,
            timestamp: Date.now()
        });

        // Show new screen
        this.showScreen(screenName);

        // Update URL
        this.updateURL(screenName, data);

        // Update back button
        this.updateBackButton();
    }

    popScreen() {
        if (this.screenStack.length > 1) {
            // Hide current screen
            const currentScreen = this.screenStack.pop();
            this.hideScreen(currentScreen.name);

            // Show previous screen
            const previousScreen = this.screenStack[this.screenStack.length - 1];
            this.showScreen(previousScreen.name);

            // Update URL
            this.updateURL(previousScreen.name, previousScreen.data);

            // Update back button
            this.updateBackButton();

            return true;
        }
        return false;
    }

    replaceScreen(screenName, data = null) {
        // Remove current screen
        if (this.screenStack.length > 0) {
            const currentScreen = this.screenStack.pop();
            this.hideScreen(currentScreen.name);
        }

        // Add new screen
        this.pushScreen(screenName, data);
    }

    showScreen(screenName) {
        // Switch screen content - удаляем active со всех экранов
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Добавляем active к нужному экрану
        const screenElement = document.getElementById(`${screenName}-screen`);
        if (screenElement) {
            screenElement.classList.add('active');
        }

        // Показываем нижнее меню на основных экранах
        const mainScreens = ['home', 'subjects', 'notes', 'profile'];
        if (mainScreens.includes(screenName)) {
            this.showBottomNav();
        } else {
            // Скрываем нижнее меню на других экранах (темы, уроки и т.д.)
            this.hideBottomNav();
        }

        // Update navigation
        this.updateNavigation(screenName);

        // Обновляем текущий экран
        this.currentScreen = screenName;
    }

    hideScreen(screenName) {
        const screenElement = document.getElementById(`${screenName}-screen`);
        if (screenElement) {
            screenElement.classList.remove('active');
        }
    }

    showBottomNav() {
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'flex';
        }
    }

    hideBottomNav() {
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            console.log('🔽 Hiding bottom navigation');
            bottomNav.style.display = 'none';
        } else {
            console.warn('⚠️ Bottom navigation element not found');
        }
    }

    showBottomNav() {
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            console.log('🔼 Showing bottom navigation');
            bottomNav.style.display = 'flex';
        } else {
            console.warn('⚠️ Bottom navigation element not found');
        }
    }

    updateNavigation(activeScreen) {
        // Update bottom navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNavItem = document.querySelector(`[data-screen="${activeScreen}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }

    updateBackButton() {
        // Show/hide Telegram back button
        if (window.telegramAPI) {
            window.telegramAPI.showBackButton(this.screenStack.length > 1);
        }
    }

    updateURL(screenName, data = null) {
        let url = `?screen=${screenName}`;

        if (data) {
            // Add data as URL parameters
            Object.keys(data).forEach(key => {
                url += `&${key}=${encodeURIComponent(data[key])}`;
            });
        }

        // Update browser URL without triggering navigation
        window.history.pushState({ screen: screenName, data: data }, '', url);
    }

    handleBrowserBack() {
        // Handle browser back button
        if (!this.popScreen()) {
            // If no screens to pop, close the Web App
            if (window.telegramAPI) {
                window.telegramAPI.close();
            }
        }
    }

    getCurrentScreen() {
        return this.screenStack.length > 0 ? this.screenStack[this.screenStack.length - 1] : null;
    }

    getScreenStack() {
        return [...this.screenStack];
    }

    clearStack() {
        // Keep only home screen
        while (this.screenStack.length > 1) {
            this.popScreen();
        }
    }

    // Utility methods for common navigation
    goHome() {
        this.clearStack();
    }

    goToSubject(subjectId) {
        this.pushScreen('subject', { subjectId: subjectId });
    }

    goToTest(testId) {
        this.pushScreen('test', { testId: testId });
    }

    goToAchievement(achievementId) {
        this.pushScreen('achievement', { achievementId: achievementId });
    }

    goToDailyChallenge() {
        this.pushScreen('daily-challenge');
    }

    goToSettings() {
        this.pushScreen('settings');
    }

    // Handle deep linking
    handleDeepLink(params) {
        const urlParams = new URLSearchParams(params);

        if (urlParams.has('screen')) {
            const screen = urlParams.get('screen');
            const data = {};

            // Extract other parameters
            for (let [key, value] of urlParams.entries()) {
                if (key !== 'screen') {
                    data[key] = value;
                }
            }

            this.pushScreen(screen, data);
        }
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new NavigationManager();

    // Handle initial URL parameters (deep linking)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('screen')) {
        window.navigation.handleDeepLink(window.location.search.substring(1));
    }
});