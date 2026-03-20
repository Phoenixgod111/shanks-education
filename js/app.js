/**
 * Shanks Education App - главный класс приложения
 * Образовательное приложение для школьников (5-11 класс)
 */
class ShanksEducationApp {
    constructor() {
        this.subjects = [];
        this.selectedGrade = this.loadSelectedGrade();
        this.user = null;
        this.favoriteSubjects = this.loadFavoriteSubjects();
        this.init();
    }

    loadSelectedGrade() {
        try {
            const g = parseInt(localStorage.getItem('selectedGrade'), 10);
            return (g >= 5 && g <= 11) ? g : null;
        } catch (e) { return null; }
    }

    saveSelectedGrade() {
        try {
            if (this.selectedGrade) localStorage.setItem('selectedGrade', String(this.selectedGrade));
        } catch (e) {}
    }

    applyGradeRangeLayout() {
        const g = this.selectedGrade || 5;
        const range = (g >= 5 && g <= 8) ? '5-8' : '9-11';
        document.body.setAttribute('data-grade-range', range);
        document.querySelectorAll('.layout-switch-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.range === range);
        });
    }

    async init() {
        const loadingEl = document.getElementById('loading');
        const mainAppEl = document.getElementById('main-app');

        try {
            // Загружаем предметы из DataManager
            if (typeof DataManager !== 'undefined') {
                this.subjects = await DataManager.loadSubjects();
            }

            // Инициализируем subjectManager (должен быть загружен до app.js)
            if (window.subjectManager) {
                await window.subjectManager.loadSubjectsConfig();
            }

            // Синхронизируем NavigationManager с текущим экраном app.js
            if (window.navigation) {
                const params = new URLSearchParams(window.location.search);
                const screen = params.get('screen') || 'home';
                window.navigation.showScreen(screen);
                window.navigation.updateNavigation(screen);
            }

            this.setupGradeButtons();
            this.setupNavigation();
            this.setupChallengeAndQuiz();
            this.setupPremiumSection();
            this.applyGradeRangeLayout();
            this.updateSubjectsDisplay();
            this.updateProgressDisplay();
            this.updateSubscriptionStatus();
            this.setupNextStepButton();
            this.setupLayoutSwitcher();

            if (loadingEl) loadingEl.classList.add('hidden');
            if (mainAppEl) mainAppEl.classList.remove('hidden');

            console.log('Shanks Education App initialized');
        } catch (e) {
            console.error('App init error:', e);
            if (loadingEl) loadingEl.classList.add('hidden');
            if (mainAppEl) mainAppEl.classList.remove('hidden');
        }
    }

    setupGradeButtons() {
        const gradeButtonsContainer = document.getElementById('grade-buttons');
        const gradeModal = document.getElementById('grade-modal');
        const gradeSelectBtns = document.querySelectorAll('.grade-select-btn');

        if (!gradeButtonsContainer) return;

        const grades = [5, 6, 7, 8, 9, 10, 11];
        gradeButtonsContainer.innerHTML = grades.map(g => `
            <button class="grade-btn" data-grade="${g}">${g}</button>
        `).join('');

        gradeButtonsContainer.querySelectorAll('.grade-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectGrade(parseInt(btn.dataset.grade)));
        });

        gradeSelectBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const grade = parseInt(btn.dataset.grade);
                this.selectGrade(grade);
                if (gradeModal) gradeModal.classList.remove('show');
            });
        });

        const changeGradeBtn = document.getElementById('change-grade-btn');
        if (changeGradeBtn) {
            changeGradeBtn.addEventListener('click', () => {
                if (gradeModal) gradeModal.classList.add('show');
            });
        }

        if (gradeModal) {
            gradeModal.addEventListener('click', (e) => {
                if (e.target === gradeModal) gradeModal.classList.remove('show');
            });
        }
    }

    selectGrade(grade) {
        if (!grade || grade < 5 || grade > 11) return;
        const oldGrade = this.selectedGrade;
        this.selectedGrade = grade;
        this.saveSelectedGrade();
        this.applyGradeRangeLayout();

        if (window.subjectManager) {
            window.subjectManager.currentGrade = grade;
            window.subjectManager.currentSubject = null;
            window.subjectManager.currentTopic = null;
        }

        const gradeButtonsContainer = document.getElementById('grade-buttons');
        if (gradeButtonsContainer) {
            gradeButtonsContainer.querySelectorAll('.grade-btn').forEach(b => b.classList.remove('selected'));
            const activeBtn = gradeButtonsContainer.querySelector(`[data-grade="${grade}"]`);
            if (activeBtn) activeBtn.classList.add('selected');
        }

        this.updateSubjectsDisplay();
        this.updateProgressDisplay();

        if (oldGrade !== grade && window.subjectManager) {
            window.subjectManager.loadSubjectContent(grade).catch(e => console.warn('Load content:', e));
        }
    }

    setupNavigation() {
        document.querySelectorAll('.nav-item[data-screen]').forEach(item => {
            item.addEventListener('click', () => {
                const screen = item.dataset.screen;
                if (window.navigation) {
                    window.navigation.showScreen(screen);
                    window.navigation.updateNavigation(screen);
                }
            });
        });
    }

    setupChallengeAndQuiz() {
        const startChallenge = document.getElementById('start-challenge');
        const startQuiz = document.getElementById('start-quiz');

        if (startChallenge) {
            startChallenge.addEventListener('click', () => {
                if (window.QuizManager && window.QuizManager.showDailyChallengeModal) {
                    window.QuizManager.showDailyChallengeModal();
                } else {
                    this.showMessage('Челлендж дня скоро будет доступен');
                }
            });
        }

        if (startQuiz) {
            startQuiz.addEventListener('click', () => {
                if (window.QuizManager && window.app) {
                    window.QuizManager.showQuizModal(window.app);
                } else {
                    this.showMessage('Выберите предметы в разделе Предметы');
                }
            });
        }
    }

    setupPremiumSection() {
        const getPremiumBtn = document.getElementById('get-premium-btn');
        const manageBtn = document.getElementById('manage-subscription-btn');

        if (getPremiumBtn) {
            getPremiumBtn.addEventListener('click', () => this.manageSubscription());
        }
        if (manageBtn) {
            manageBtn.addEventListener('click', () => this.manageSubscription());
        }
    }

    updateSubjectsDisplay() {
        const heroTip = document.getElementById('hero-tip');
        const subjectsSection = document.getElementById('subjects-section');
        const currentGradeDisplay = document.getElementById('current-grade-display');
        const gradeNumber = document.getElementById('grade-number');
        const favoritesSection = document.getElementById('favorites-section');
        const favoritesGrid = document.getElementById('favorites-grid');
        const subjectsContainer = document.getElementById('subjects-container-subjects');

        if (!subjectsSection) return;

        if (!this.selectedGrade) {
            if (heroTip) heroTip.style.display = 'block';
            subjectsSection.style.display = 'none';
            return;
        }

        if (heroTip) heroTip.style.display = 'none';
        subjectsSection.style.display = 'block';

        if (currentGradeDisplay) currentGradeDisplay.textContent = `${this.selectedGrade} класс`;
        if (gradeNumber) gradeNumber.textContent = this.selectedGrade;

        const subjectsForGrade = this.getSubjectsForGrade(this.selectedGrade);
        const favoriteSubjects = subjectsForGrade.filter(s => this.isFavoriteSubject(s.id));

        if (favoritesSection && favoritesGrid) {
            if (favoriteSubjects.length > 0) {
                favoritesSection.style.display = 'block';
                favoritesGrid.innerHTML = favoriteSubjects.map(s => this.renderSubjectCard(s, true)).join('');
            } else {
                favoritesSection.style.display = 'none';
            }
        }

        if (subjectsContainer) {
            subjectsContainer.innerHTML = subjectsForGrade.map(s => this.renderSubjectCard(s, false)).join('');
            subjectsContainer.querySelectorAll('.subject-card').forEach(card => {
                const subjectId = card.dataset.subjectId;
                const grade = parseInt(card.dataset.grade);
                card.addEventListener('click', () => this.openSubject(subjectId, grade));
            });

            subjectsContainer.querySelectorAll('.favorite-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleFavorite(btn.dataset.subjectId);
                    this.updateSubjectsDisplay();
                    this.updateProgressDisplay();
                });
            });
        }
    }

    getSubjectsForGrade(grade) {
        if (window.subjectManager?.subjectsConfig) {
            return window.subjectManager.subjectsConfig
                .filter(s => (s.grades || s.classes || []).includes(grade))
                .map(s => ({ id: s.id, name: s.name, icon: s.icon, grade }));
        }
        return (this.subjects || []).filter(s => s.grade === grade);
    }

    renderSubjectCard(subject, isFavorite) {
        const icon = subject.icon || 'school';
        const favClass = this.isFavoriteSubject(subject.id) ? 'active' : '';
        return `
            <div class="subject-card" data-subject-id="${subject.id}" data-grade="${this.selectedGrade}">
                <div class="subject-icon" style="background: var(--subject-${subject.id}-color, #2196F3);">
                    <i class="material-icons">${icon}</i>
                </div>
                <div class="subject-info">
                    <h3>${subject.name}</h3>
                </div>
                <button class="favorite-btn ${favClass}" data-subject-id="${subject.id}" aria-label="Избранное">
                    <i class="material-icons">${this.isFavoriteSubject(subject.id) ? 'favorite' : 'favorite_border'}</i>
                </button>
            </div>
        `;
    }

    async openSubject(subjectId, grade) {
        grade = grade || this.selectedGrade;
        if (!grade) {
            this.showMessage('Выберите класс');
            return;
        }

        if (!window.subjectManager) {
            this.showError('Система управления контентом не загружена');
            return;
        }

        if (!window.subjectManager.subjectsConfig) {
            this.showMessage('Конфигурация предметов загружается...');
            return;
        }

        const subjectInfo = window.subjectManager.getSubjectInfo(subjectId);
        if (!subjectInfo) {
            this.showMessage(`Предмет не найден`);
            return;
        }

        window.subjectManager.currentSubject = subjectId;
        window.subjectManager.currentGrade = grade;
        await window.subjectManager.showTopicsList(subjectId, grade);
    }

    isFavoriteSubject(subjectId) {
        return this.favoriteSubjects.includes(subjectId);
    }

    toggleFavorite(subjectId) {
        const idx = this.favoriteSubjects.indexOf(subjectId);
        if (idx > -1) {
            this.favoriteSubjects.splice(idx, 1);
        } else {
            this.favoriteSubjects.push(subjectId);
        }
        this.saveFavoriteSubjects();
    }

    saveFavoriteSubjects() {
        try {
            localStorage.setItem('favoriteSubjects', JSON.stringify(this.favoriteSubjects));
        } catch (e) {}
    }

    loadFavoriteSubjects() {
        try {
            const saved = localStorage.getItem('favoriteSubjects');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    updateProgressDisplay() {
        const progressContainer = document.getElementById('progress-items');
        const progressPercentage = document.getElementById('progress-percentage');

        if (!progressContainer) return;

        const grade = this.selectedGrade || 5;
        const subjectsForGrade = this.getSubjectsForGrade(grade);
        const favoriteSubjects = subjectsForGrade.filter(s => this.isFavoriteSubject(s.id));

        if (!this.selectedGrade || favoriteSubjects.length === 0) {
            const emptySubjects = [
                { id: 'math', name: 'Математика', pct: 18 },
                { id: 'russian', name: 'Русский язык', pct: 0 },
                { id: 'history', name: 'История', pct: 0 },
                { id: 'physics', name: 'Физика', pct: 0 },
                { id: 'english', name: 'Английский', pct: 0 }
            ];
            const items = emptySubjects.map(s => this.renderProgressItem(s.name, s.pct));
            progressContainer.innerHTML = items.join('');
            if (progressPercentage) progressPercentage.textContent = '15%';
            this.updateNextStepText(null, 'Математика — Тема 3');
            return;
        }

        let totalProgress = 0;
        const items = favoriteSubjects.map(s => {
            let pct = 0;
            if (window.subjectManager) {
                const topics = window.subjectManager.getTopicsForSubject(s.id, grade) || [];
                const total = topics.length;
                if (total > 0) {
                    const completed = parseInt(localStorage.getItem(`progress_${s.id}_${grade}`) || '0');
                    pct = Math.min(100, Math.round((completed / total) * 100));
                }
            }
            totalProgress += pct;
            return this.renderProgressItem(s.name, pct);
        });

        const avgPct = favoriteSubjects.length ? Math.round(totalProgress / favoriteSubjects.length) : 0;
        progressContainer.innerHTML = items.join('');
        if (progressPercentage) progressPercentage.textContent = `${avgPct}%`;

        let nextSubject = null;
        let minPct = 101;
        favoriteSubjects.forEach(s => {
            const topics = window.subjectManager?.getTopicsForSubject(s.id, grade) || [];
            const total = topics.length;
            const completed = parseInt(localStorage.getItem(`progress_${s.id}_${grade}`) || '0');
            const pct = total > 0 ? (completed / total) * 100 : 0;
            if (pct < minPct && total > 0 && completed < total) {
                minPct = pct;
                nextSubject = { name: s.name, completed, total };
            }
        });
        if (!nextSubject && favoriteSubjects.length > 0) {
            nextSubject = { name: favoriteSubjects[0].name, completed: 0, total: 1 };
        }
        this.updateNextStepText(nextSubject, null);
    }

    /** Сокращения для макета 9-11 (как в Pencil) */
    getDisplayName(name) {
        if (document.body.getAttribute('data-grade-range') !== '9-11') return name;
        const short = { 'Математика': 'Мат.', 'Русский язык': 'Рус.', 'История': 'Ист.', 'Физика': 'Физ.', 'Английский': 'Англ.', 'Английский язык': 'Англ.' };
        return short[name] || name;
    }

    renderProgressItem(name, pct) {
        const displayName = this.getDisplayName(name);
        return `
            <div class="progress-item">
                <span class="progress-subject">${displayName}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${pct}%"></div>
                </div>
                <span class="progress-pct">${pct}%</span>
            </div>
        `;
    }

    updateNextStepText(nextSubject, fallback) {
        const el = document.getElementById('next-step-text');
        if (!el) return;
        if (fallback) {
            el.textContent = fallback;
            return;
        }
        if (nextSubject && nextSubject.total > 0 && nextSubject.completed < nextSubject.total) {
            const topicNum = nextSubject.completed + 1;
            el.textContent = `${nextSubject.name} — Тема ${topicNum}`;
        } else {
            el.textContent = nextSubject ? `${nextSubject.name} — Начать` : 'Выбери предмет';
        }
    }

    setupNextStepButton() {
        const btn = document.getElementById('next-step-btn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            if (window.navigation) {
                window.navigation.showScreen('subjects');
                window.navigation.updateNavigation('subjects');
            }
        });
    }

    setupLayoutSwitcher() {
        document.querySelectorAll('.layout-switch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const range = btn.dataset.range;
                document.body.setAttribute('data-grade-range', range);
                document.querySelectorAll('.layout-switch-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    showProgressExplanation() {
        this.showMessage(
            'Процент показывает, сколько тем вы изучили по выбранным предметам. ' +
            'Отметьте предметы сердечком в разделе "Предметы" для отслеживания.'
        );
    }

    showMessage(msg) {
        if (window.Telegram?.WebApp?.showPopup) {
            window.Telegram.WebApp.showPopup({ title: '', message: msg, buttons: [{ type: 'ok' }] });
        } else {
            alert(msg);
        }
    }

    showError(err) {
        this.showMessage(typeof err === 'string' ? err : (err?.message || 'Ошибка'));
    }

    manageSubscription() {
        if (window.subscriptionManager) {
            window.subscriptionManager.showSubscriptionPlans();
        }
    }

    updateSubscriptionStatus() {
        if (!window.subscriptionManager) return;

        const info = window.subscriptionManager.getSubscriptionInfo();
        const premiumSubtitle = document.getElementById('premium-subtitle');
        const lockedState = document.getElementById('premium-locked-state');
        const activeState = document.getElementById('premium-active-state');
        const subscriptionInfo = document.getElementById('subscription-info');

        if (premiumSubtitle) {
            premiumSubtitle.textContent = info.isPremium ? 'Подписка активна' : 'Разблокируй все возможности';
        }

        if (lockedState) lockedState.style.display = info.isPremium ? 'none' : 'block';
        if (activeState) activeState.style.display = info.isPremium ? 'block' : 'none';

        if (subscriptionInfo && info.isPremium) {
            let text = '';
            if (info.type === 'lifetime') text = 'Бессрочная подписка';
            else if (info.daysLeft !== null) text = `Осталось ${info.daysLeft} дн.`;
            subscriptionInfo.textContent = text;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new ShanksEducationApp();
});
