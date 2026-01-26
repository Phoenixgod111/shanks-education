// Subscription Manager - управление подпиской пользователя
class SubscriptionManager {
    constructor() {
        this.isPremium = false;
        this.subscriptionType = null; // 'monthly', 'yearly', 'lifetime'
        this.subscriptionEndDate = null;
        this.features = {
            hardProblems: false,
            aiHelper: false,
            unlimitedAttempts: false,
            detailedStats: false,
            offlineMode: false,
            prioritySupport: false
        };
        
        this.init();
    }

    init() {
        // Загружаем данные о подписке из localStorage
        this.loadSubscriptionData();
        
        console.log('📱 Subscription Manager initialized');
        console.log('Premium status:', this.isPremium);
    }

    // Загрузка данных подписки
    loadSubscriptionData() {
        const savedData = localStorage.getItem('subscription_data');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.isPremium = data.isPremium || false;
                this.subscriptionType = data.subscriptionType || null;
                this.subscriptionEndDate = data.subscriptionEndDate ? new Date(data.subscriptionEndDate) : null;
                
                // Проверяем, не истекла ли подписка
                if (this.subscriptionEndDate && this.subscriptionEndDate < new Date()) {
                    this.isPremium = false;
                    this.subscriptionType = null;
                    this.saveSubscriptionData();
                }
                
                // Устанавливаем доступные функции
                this.updateFeatures();
            } catch (error) {
                console.error('Error loading subscription data:', error);
            }
        }
    }

    // Сохранение данных подписки
    saveSubscriptionData() {
        const data = {
            isPremium: this.isPremium,
            subscriptionType: this.subscriptionType,
            subscriptionEndDate: this.subscriptionEndDate ? this.subscriptionEndDate.toISOString() : null
        };
        localStorage.setItem('subscription_data', JSON.stringify(data));
    }

    // Обновление доступных функций на основе подписки
    updateFeatures() {
        if (this.isPremium) {
            this.features = {
                hardProblems: true,
                aiHelper: true,
                unlimitedAttempts: true,
                detailedStats: true,
                offlineMode: true,
                prioritySupport: true
            };
        } else {
            this.features = {
                hardProblems: false,
                aiHelper: false,
                unlimitedAttempts: false,
                detailedStats: false,
                offlineMode: false,
                prioritySupport: false
            };
        }
    }

    // Проверка доступа к конкретной функции
    hasFeature(featureName) {
        return this.features[featureName] || false;
    }

    // Активация подписки
    activateSubscription(type = 'monthly') {
        this.isPremium = true;
        this.subscriptionType = type;
        
        // Устанавливаем дату окончания подписки
        const now = new Date();
        switch (type) {
            case 'monthly':
                this.subscriptionEndDate = new Date(now.setMonth(now.getMonth() + 1));
                break;
            case 'yearly':
                this.subscriptionEndDate = new Date(now.setFullYear(now.getFullYear() + 1));
                break;
            case 'lifetime':
                this.subscriptionEndDate = null; // Без ограничения
                break;
        }
        
        this.updateFeatures();
        this.saveSubscriptionData();
        
        // Показываем уведомление
        this.showSuccessMessage('🎉 Подписка успешно активирована!');
        
        console.log('✅ Subscription activated:', type);
    }

    // Отмена подписки
    cancelSubscription() {
        this.isPremium = false;
        this.subscriptionType = null;
        this.subscriptionEndDate = null;
        this.updateFeatures();
        this.saveSubscriptionData();
        
        this.showSuccessMessage('Подписка отменена');
        
        console.log('❌ Subscription cancelled');
    }

    // Получить информацию о подписке
    getSubscriptionInfo() {
        return {
            isPremium: this.isPremium,
            type: this.subscriptionType,
            endDate: this.subscriptionEndDate,
            daysLeft: this.getDaysLeft()
        };
    }

    // Получить количество оставшихся дней подписки
    getDaysLeft() {
        if (!this.subscriptionEndDate) return null;
        
        const now = new Date();
        const diffTime = this.subscriptionEndDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 0 ? diffDays : 0;
    }

    // Показать страницу с планами подписки
    showSubscriptionPlans() {
        // Создаем модальное окно с планами
        this.createSubscriptionModal();
    }

    // Создание модального окна с планами подписки
    createSubscriptionModal() {
        // Удаляем существующее модальное окно, если есть
        const existingModal = document.getElementById('subscription-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'subscription-modal';
        modal.className = 'subscription-modal';
        
        modal.innerHTML = `
            <div class="subscription-modal-overlay"></div>
            <div class="subscription-modal-content">
                <button class="subscription-close-btn">
                    <i class="material-icons">close</i>
                </button>
                
                <div class="subscription-header">
                    <div class="premium-icon">
                        <i class="material-icons">workspace_premium</i>
                    </div>
                    <h2>Получите Premium доступ</h2>
                    <p>Разблокируйте все возможности обучения</p>
                </div>

                <div class="subscription-features">
                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="material-icons">psychology</i>
                        </div>
                        <div class="feature-content">
                            <h4>Сложные задачи</h4>
                            <p>Доступ к задачам повышенной сложности для углубленного изучения</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="material-icons">support_agent</i>
                        </div>
                        <div class="feature-content">
                            <h4>AI-помощник</h4>
                            <p>Персональный помощник с подсказками и объяснениями</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="material-icons">all_inclusive</i>
                        </div>
                        <div class="feature-content">
                            <h4>Безлимитные попытки</h4>
                            <p>Решайте задачи без ограничений по количеству попыток</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="material-icons">insights</i>
                        </div>
                        <div class="feature-content">
                            <h4>Детальная статистика</h4>
                            <p>Подробная аналитика вашего прогресса и слабых мест</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="material-icons">cloud_download</i>
                        </div>
                        <div class="feature-content">
                            <h4>Офлайн-режим</h4>
                            <p>Скачивайте материалы для изучения без интернета</p>
                        </div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="material-icons">priority_high</i>
                        </div>
                        <div class="feature-content">
                            <h4>Приоритетная поддержка</h4>
                            <p>Быстрые ответы на ваши вопросы</p>
                        </div>
                    </div>
                </div>

                <div class="subscription-plans">
                    <div class="plan-card" data-plan="monthly">
                        <div class="plan-header">
                            <h3>Месячная</h3>
                            <div class="plan-price">
                                <span class="price-amount">299</span>
                                <span class="price-currency">₽</span>
                                <span class="price-period">/месяц</span>
                            </div>
                        </div>
                        <ul class="plan-features">
                            <li><i class="material-icons">check_circle</i> Все Premium функции</li>
                            <li><i class="material-icons">check_circle</i> Отменить в любой момент</li>
                        </ul>
                        <button class="plan-select-btn" data-plan="monthly">
                            Выбрать план
                        </button>
                    </div>

                    <div class="plan-card plan-popular" data-plan="yearly">
                        <div class="plan-badge">🔥 Популярный</div>
                        <div class="plan-header">
                            <h3>Годовая</h3>
                            <div class="plan-price">
                                <span class="price-amount">2990</span>
                                <span class="price-currency">₽</span>
                                <span class="price-period">/год</span>
                            </div>
                            <div class="plan-savings">Экономия 17%</div>
                        </div>
                        <ul class="plan-features">
                            <li><i class="material-icons">check_circle</i> Все Premium функции</li>
                            <li><i class="material-icons">check_circle</i> 2 месяца в подарок</li>
                            <li><i class="material-icons">check_circle</i> Приоритетная поддержка</li>
                        </ul>
                        <button class="plan-select-btn plan-select-popular" data-plan="yearly">
                            Выбрать план
                        </button>
                    </div>

                    <div class="plan-card" data-plan="lifetime">
                        <div class="plan-header">
                            <h3>Навсегда</h3>
                            <div class="plan-price">
                                <span class="price-amount">9990</span>
                                <span class="price-currency">₽</span>
                                <span class="price-period">один раз</span>
                            </div>
                            <div class="plan-savings">Лучшее предложение</div>
                        </div>
                        <ul class="plan-features">
                            <li><i class="material-icons">check_circle</i> Все Premium функции</li>
                            <li><i class="material-icons">check_circle</i> Навсегда</li>
                            <li><i class="material-icons">check_circle</i> Все будущие обновления</li>
                        </ul>
                        <button class="plan-select-btn" data-plan="lifetime">
                            Выбрать план
                        </button>
                    </div>
                </div>

                <div class="subscription-footer">
                    <p>💳 Безопасная оплата через Telegram Stars</p>
                    <p class="subscription-terms">Подписываясь, вы соглашаетесь с условиями использования</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Показываем модальное окно с анимацией
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Обработчики событий
        const closeBtn = modal.querySelector('.subscription-close-btn');
        const overlay = modal.querySelector('.subscription-modal-overlay');
        const selectButtons = modal.querySelectorAll('.plan-select-btn');

        closeBtn.addEventListener('click', () => this.closeSubscriptionModal());
        overlay.addEventListener('click', () => this.closeSubscriptionModal());

        selectButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const plan = btn.dataset.plan;
                this.selectPlan(plan);
            });
        });

        // Haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }
    }

    // Закрытие модального окна
    closeSubscriptionModal() {
        const modal = document.getElementById('subscription-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }

        // Haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    }

    // Выбор плана подписки
    selectPlan(planType) {
        console.log('Selected plan:', planType);

        const prices = {
            monthly: 299,
            yearly: 2990,
            lifetime: 9990
        };

        const price = prices[planType];

        // Haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }

        // Для демо-целей активируем подписку сразу
        // В продакшене здесь будет интеграция с Telegram Payment API
        if (window.Telegram?.WebApp?.showPopup) {
            window.Telegram.WebApp.showPopup({
                title: 'Демо-режим',
                message: `В продакшене здесь будет оплата через Telegram Stars (${price} ₽). Активировать подписку для демо?`,
                buttons: [
                    { id: 'cancel', type: 'cancel', text: 'Отмена' },
                    { id: 'activate', type: 'default', text: 'Активировать' }
                ]
            }, (buttonId) => {
                if (buttonId === 'activate') {
                    this.activateSubscription(planType);
                    this.closeSubscriptionModal();
                    
                    // Обновляем UI приложения
                    if (window.app) {
                        window.app.updateSubscriptionStatus();
                    }
                }
            });
        } else {
            // Для браузера
            if (confirm(`Активировать подписку "${planType}" для демо?`)) {
                this.activateSubscription(planType);
                this.closeSubscriptionModal();
                
                // Обновляем UI приложения
                if (window.app) {
                    window.app.updateSubscriptionStatus();
                }
            }
        }
    }

    // Показать сообщение об успехе
    showSuccessMessage(message) {
        if (window.Telegram?.WebApp?.showPopup) {
            window.Telegram.WebApp.showPopup({
                title: 'Успешно!',
                message: message,
                buttons: [{ type: 'ok' }]
            });
        }
        
        // Также показываем toast
        this.showToast(message, 'success');
    }

    // Показать toast-уведомление
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `subscription-toast ${type}`;
        toast.innerHTML = `
            <i class="material-icons">${type === 'success' ? 'check_circle' : 'info'}</i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Показать лок-экран для заблокированного контента
    showPremiumLock(title = 'Сложные задачи') {
        const lockScreen = document.createElement('div');
        lockScreen.className = 'premium-lock-screen';
        lockScreen.innerHTML = `
            <div class="lock-content">
                <div class="lock-icon">
                    <i class="material-icons">lock</i>
                </div>
                <h3>${title}</h3>
                <p>Эта функция доступна только подписчикам Premium</p>
                <button class="unlock-btn">
                    <i class="material-icons">workspace_premium</i>
                    Получить Premium
                </button>
                <button class="lock-close-btn">Закрыть</button>
            </div>
        `;

        document.body.appendChild(lockScreen);

        setTimeout(() => {
            lockScreen.classList.add('show');
        }, 10);

        // Обработчики
        const unlockBtn = lockScreen.querySelector('.unlock-btn');
        const closeBtn = lockScreen.querySelector('.lock-close-btn');

        unlockBtn.addEventListener('click', () => {
            lockScreen.remove();
            this.showSubscriptionPlans();
        });

        closeBtn.addEventListener('click', () => {
            lockScreen.classList.remove('show');
            setTimeout(() => {
                lockScreen.remove();
            }, 300);
        });

        // Haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }
    }
}

// Инициализация менеджера подписок
window.subscriptionManager = new SubscriptionManager();
