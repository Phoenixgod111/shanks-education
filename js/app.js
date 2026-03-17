// Version: v=21.0
// Main App Class
class ShanksEducationApp {
    constructor() {
        this.currentScreen = 'home';
        this.selectedGrade = null;
        this.user = null;
        this.subjects = [];
        this.favoriteSubjects = this.loadFavoriteSubjects();
        this.init();
    }

    async init() {
        const hideLoading = () => {
            const el = document.getElementById('loading');
            const main = document.getElementById('main-app');
            if (el) el.classList.add('hidden');
            if (main) main.classList.remove('hidden');
        };
        setTimeout(hideLoading, 2500);

        // Сразу вешаем обработчики — иначе кнопки не работают, если async зависнет
        this.setupEventListeners();

        this.initTelegramWebApp();
        try {
            await this.loadSubjects();
        } catch (e) { console.error(e); }
        
        // ╨Ш╨╜╨╕╤Ж╨╕╨░╨╗╨╕╨╖╨╕╤А╤Г╨╡╨╝ subjectManager (╨┤╨╛╨╗╨╢╨╡╨╜ ╨▒╤Л╤В╤М ╨╖╨░╨│╤А╤Г╨╢╨╡╨╜ ╨┤╨╛ app.js)
        try {
            if (window.subjectManager) await window.subjectManager.init();
        } catch (e) { console.error('SubjectManager init:', e); }

        this.updateProgressDisplay();
        this.updateSubscriptionStatus();
        hideLoading();
    }

    initTelegramWebApp() {
        // Initialize Telegram Web App
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();

            // Get user info
            if (window.Telegram.WebApp.initDataUnsafe?.user) {
                this.user = window.Telegram.WebApp.initDataUnsafe.user;
                this.updateUserInfo();
            }

        }
    }

    updateUserInfo() {
        if (this.user) {
            const userNameElement = document.getElementById('user-name');
            if (userNameElement) {
                userNameElement.textContent = this.user.first_name || '╨Я╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╤М';
            }
        }
    }


    setupEventListeners() {
        // Bottom navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const screen = item.dataset.screen;
                if (screen) this.switchScreen(screen);
            });
        });

        // Setup subjects screen (в try/catch — не ломать остальные кнопки при ошибке)
        try {
            this.setupSubjectsScreen();
        } catch (e) { console.error('setupSubjectsScreen:', e); }

        // Grade selection modal
        document.querySelectorAll('.grade-select-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const grade = parseInt(btn.dataset.grade);
                this.selectGradeInModal(grade);
            });
        });


        // Daily challenge
        const startChallengeBtn = document.getElementById('start-challenge');
        if (startChallengeBtn) {
            startChallengeBtn.addEventListener('click', () => {
                this.startDailyChallenge();
            });
        }

        // QUIZ button
        const startQuizBtn = document.getElementById('start-quiz');
        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', () => {
                this.startQuiz();
            });
        }

        // Subject cards will be added dynamically

        // Premium subscription buttons
        const getPremiumBtn = document.getElementById('get-premium-btn');
        if (getPremiumBtn) {
            getPremiumBtn.addEventListener('click', () => {
                this.showPremiumPlans();
            });
        }

        const manageSubscriptionBtn = document.getElementById('manage-subscription-btn');
        if (manageSubscriptionBtn) {
            manageSubscriptionBtn.addEventListener('click', () => {
                this.manageSubscription();
            });
        }
    }

    switchScreen(screenName) {
        // ╨б╨╕╨╜╤Е╤А╨╛╨╜╨╕╨╖╨╕╤А╤Г╨╡╨╝ NavigationManager ╤Б ╤В╨╡╨║╤Г╤Й╨╕╨╝ ╤Н╨║╤А╨░╨╜╨╛╨╝ app.js
        if (window.navigation) {
            // ╨Х╤Б╨╗╨╕ ╤Б╤В╨╡╨║ ╨┐╤Г╤Б╤В╨╛╨╣ ╨╕╨╗╨╕ ╤В╨╡╨║╤Г╤Й╨╕╨╣ ╤Н╨║╤А╨░╨╜ ╨╜╨╡ ╤Б╨╛╨▓╨┐╨░╨┤╨░╨╡╤В, ╤Б╨╕╨╜╤Е╤А╨╛╨╜╨╕╨╖╨╕╤А╤Г╨╡╨╝
            const navCurrentScreen = window.navigation.getCurrentScreen();
            if (!navCurrentScreen || navCurrentScreen.name !== screenName) {
                // ╨Ю╤З╨╕╤Й╨░╨╡╨╝ ╤Б╤В╨╡╨║ ╨╕ ╤Г╤Б╤В╨░╨╜╨░╨▓╨╗╨╕╨▓╨░╨╡╨╝ ╤В╨╡╨║╤Г╤Й╨╕╨╣ ╤Н╨║╤А╨░╨╜
                window.navigation.clearStack();
                window.navigation.pushScreen(screenName);
            }
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const navBtn = document.querySelector(`[data-screen="${screenName}"]`);
        if (navBtn) navBtn.classList.add('active');

        // Switch screen content
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const screenEl = document.getElementById(`${screenName}-screen`);
        if (screenEl) screenEl.classList.add('active');

        this.currentScreen = screenName;

        // Special handling for subjects screen
        if (screenName === 'subjects') {
            this.updateSubjectsDisplay();
        }
    }

    selectGrade(grade) {
        console.log('ЁЯОп selectGrade called with grade:', grade);
        const oldGrade = this.selectedGrade;
        this.selectedGrade = grade;

        // ╨б╨╕╨╜╤Е╤А╨╛╨╜╨╕╨╖╨╕╤А╤Г╨╡╨╝ currentGrade ╨▓ subjectManager
        if (window.subjectManager) {
            window.subjectManager.currentGrade = grade;
            // ╨б╨▒╤А╨░╤Б╤Л╨▓╨░╨╡╨╝ ╤В╨╡╨║╤Г╤Й╨╕╨╣ ╨┐╤А╨╡╨┤╨╝╨╡╤В ╨╕ ╤В╨╡╨╝╤Г ╨┐╤А╨╕ ╤Б╨╝╨╡╨╜╨╡ ╨║╨╗╨░╤Б╤Б╨░
            window.subjectManager.currentSubject = null;
            window.subjectManager.currentTopic = null;
        }

        // Update displays
        this.updateProgressDisplay();
        this.updateSubjectsDisplay();

        // ╨Х╤Б╨╗╨╕ ╨┐╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╤М ╨╜╨░╤Е╨╛╨┤╨╕╤В╤Б╤П ╨▓ ╤А╨░╨╖╨┤╨╡╨╗╨╡ ╨┐╤А╨╡╨┤╨╝╨╡╤В╨╛╨▓, ╨┐╨╛╨╗╨╜╨╛╤Б╤В╤М╤О ╨┐╨╡╤А╨╡╤А╨╕╤Б╨╛╨▓╤Л╨▓╨░╨╡╨╝ ╤Н╨║╤А╨░╨╜
        const currentScreen = window.navigation?.getCurrentScreen();
        if (currentScreen && currentScreen.name === 'subjects') {
            console.log('ЁЯФД User is on subjects screen, forcing complete refresh');
            // ╨Я╤А╨╕╨╜╤Г╨┤╨╕╤В╨╡╨╗╤М╨╜╨╛ ╨┐╨╡╤А╨╡╤А╨╕╤Б╨╛╨▓╤Л╨▓╨░╨╡╨╝ ╨▓╤Б╨╡ ╤Б╨╡╨║╤Ж╨╕╨╕
            setTimeout(() => {
                this.updateSubjectsDisplay();
                this.updateFavoritesDisplay();
            }, 100);
        }

        // Show haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }

        console.log(`Grade ${grade} selected (was ${oldGrade})`);

        // Class selection completed
    }

    setupSubjectsScreen() {
        // Generate grade buttons
        this.generateGradeButtons();

        // Setup change grade button
        const changeGradeBtn = document.getElementById('change-grade-btn');
        if (changeGradeBtn) {
            changeGradeBtn.addEventListener('click', () => {
                this.showGradeSelectionModal();
            });
        }

        // Initial state
        this.updateSubjectsDisplay();
    }

    generateGradeButtons() {
        const gradeButtonsContainer = document.getElementById('grade-buttons');
        if (!gradeButtonsContainer) return;

        gradeButtonsContainer.innerHTML = '';

        for (let grade = 5; grade <= 11; grade++) {
            const button = document.createElement('button');
            button.className = 'grade-button';
            button.textContent = grade;
            button.dataset.grade = grade;

            button.addEventListener('click', () => {
                // Remove selected class from all buttons
                document.querySelectorAll('.grade-button').forEach(btn => {
                    btn.classList.remove('selected');
                });

                // Add selected class to clicked button
                button.classList.add('selected');

                // Select grade
                this.selectGrade(grade);
            });

            gradeButtonsContainer.appendChild(button);
        }

        // Mark current grade as selected
        if (this.selectedGrade) {
            const currentButton = gradeButtonsContainer.querySelector(`[data-grade="${this.selectedGrade}"]`);
            if (currentButton) {
                currentButton.classList.add('selected');
            }
        }
    }

    updateSubjectsDisplay() {
        console.log('ЁЯФД updateSubjectsDisplay called, selectedGrade:', this.selectedGrade);

        const heroSection = document.querySelector('.hero-section');
        const subjectsSection = document.getElementById('subjects-section');
        const heroTip = document.getElementById('hero-tip');

        if (!this.selectedGrade) {
            // No grade selected - show hero, hide subjects
            if (heroSection) heroSection.style.display = 'block';
            if (subjectsSection) subjectsSection.style.display = 'none';
            if (heroTip) heroTip.style.display = 'block';
        } else {
            // Grade selected - hide hero, show subjects
            if (heroSection) heroSection.style.display = 'none';
            if (heroTip) heroTip.style.display = 'none';
            if (subjectsSection) subjectsSection.style.display = 'block';

            // Update current grade display
            const currentGradeDisplay = document.getElementById('current-grade-display');
            const gradeNumber = document.getElementById('grade-number');

            if (currentGradeDisplay) {
                currentGradeDisplay.textContent = `${this.selectedGrade} ╨║╨╗╨░╤Б╤Б`;
            }

            if (gradeNumber) {
                gradeNumber.textContent = this.selectedGrade;
            }

            // ╨Я╨╛╨╗╨╜╨╛╤Б╤В╤М╤О ╨┐╨╡╤А╨╡╤А╨╕╤Б╨╛╨▓╤Л╨▓╨░╨╡╨╝ ╨▓╤Б╨╡ ╤Б╨╡╨║╤Ж╨╕╨╕
            console.log('ЁЯФД Force refreshing all sections');
            this.updateFavoritesDisplay();
            this.filterSubjectsByGrade(this.selectedGrade, 'subjects-container-subjects');
        }
    }

    updateFavoritesDisplay() {
        const favoritesSection = document.getElementById('favorites-section');
        const favoritesGrid = document.getElementById('favorites-grid');

        if (!favoritesSection || !favoritesGrid) return;

        // Get favorite subjects for current grade
        const gradeSubjects = this.subjects.filter(subject => subject.grade === this.selectedGrade);
        const favoriteGradeSubjects = gradeSubjects.filter(subject => this.isFavoriteSubject(subject.id));

        if (favoriteGradeSubjects.length === 0) {
            favoritesSection.style.display = 'none';
        } else {
            favoritesSection.style.display = 'block';
            favoritesGrid.innerHTML = '';

            favoriteGradeSubjects.forEach(subject => {
                const subjectCard = this.createFavoriteSubjectCard(subject);
                favoritesGrid.appendChild(subjectCard);
            });
        }
    }

    createFavoriteSubjectCard(subject) {
        const card = document.createElement('div');
        card.className = 'subject-card favorite-subject-card';
        const subjectGroup = this.getSubjectGroup(subject.name);
        card.classList.add(`subject-group-${subjectGroup}`);

        // Get consistent progress for this subject
        const progressPercent = this.getSubjectProgress(subject.id);
        const progressLevel = this.getProgressLevel(progressPercent);

        card.setAttribute('data-progress', progressLevel);

        // Add click handler for the entire card to open subject
        card.onclick = (event) => {
            console.log('ЁЯОп Subject card clicked!', subject);
            event.preventDefault();
            this.openSubject(subject);
        };

        card.innerHTML = `
            <div class="subject-icon">
                <i class="material-icons">${this.getSubjectIcon(subject.name)}</i>
            </div>
            <div class="subject-name">${subject.name}</div>
            <div class="subject-progress">
                <div class="subject-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <div class="subject-progress-text">${progressPercent}%</div>
            <button class="favorite-btn active" data-subject-id="${subject.id}">
                <i class="material-icons">favorite</i>
            </button>
        `;

        // Add click handler for favorite button
        const favoriteBtn = card.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            // Add instant visual feedback
            favoriteBtn.style.transform = 'scale(0.8)';
            setTimeout(() => {
                favoriteBtn.style.transform = '';
            }, 100);

            // Toggle favorite status
            this.toggleFavorite(subject.id);

            // Update all favorite buttons for this subject across the UI
            this.updateAllFavoriteButtons(subject.id);

            // Update progress display after changing favorites
            this.updateProgressDisplay();

            // Haptic feedback
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }

            // Favorite status updated
        });

        return card;
    }

    updateCurrentGradeDisplay() {
        const gradeDisplay = document.getElementById('current-grade-display');
        const countDisplay = document.getElementById('subjects-count-display');

        if (gradeDisplay && this.selectedGrade) {
            const gradeNames = {
                5: '5 ╨║╨╗╨░╤Б╤Б (╨Э╨░╤З╨░╨╗╤М╨╜╨░╤П ╤И╨║╨╛╨╗╨░)',
                6: '6 ╨║╨╗╨░╤Б╤Б (╨б╤А╨╡╨┤╨╜╤П╤П ╤И╨║╨╛╨╗╨░)',
                7: '7 ╨║╨╗╨░╤Б╤Б (╨б╤А╨╡╨┤╨╜╤П╤П ╤И╨║╨╛╨╗╨░)',
                8: '8 ╨║╨╗╨░╤Б╤Б (╨б╤А╨╡╨┤╨╜╤П╤П ╤И╨║╨╛╨╗╨░)',
                9: '9 ╨║╨╗╨░╤Б╤Б (╨Ю╤Б╨╜╨╛╨▓╨╜╨░╤П ╤И╨║╨╛╨╗╨░)',
                10: '10 ╨║╨╗╨░╤Б╤Б (╨б╤В╨░╤А╤И╨░╤П ╤И╨║╨╛╨╗╨░)',
                11: '11 ╨║╨╗╨░╤Б╤Б (╨б╤В╨░╤А╤И╨░╤П ╤И╨║╨╛╨╗╨░)'
            };
            gradeDisplay.textContent = gradeNames[this.selectedGrade] || '╨Т╤Л╨▒╨╡╤А╨╕╤В╨╡ ╨║╨╗╨░╤Б╤Б';

            // Count available subjects for selected grade
            const gradeSubjects = this.subjects.filter(subject => subject.grade === this.selectedGrade);
            if (countDisplay) {
                countDisplay.textContent = `╨Я╤А╨╡╨┤╨╝╨╡╤В╨╛╨▓: ${gradeSubjects.length}`;
            }
        } else {
            if (gradeDisplay) gradeDisplay.textContent = '╨Т╤Л╨▒╨╡╤А╨╕╤В╨╡ ╨║╨╗╨░╤Б╤Б ╨▓ ╨┐╤А╨╛╤Д╨╕╨╗╨╡';
            if (countDisplay) countDisplay.textContent = '╨Я╤А╨╡╨┤╨╝╨╡╤В╨╛╨▓: 0';
        }
    }

    async loadSubjects() {
        try {
            // Load subjects from data file
            this.subjects = await DataManager.loadSubjects();
            // Don't render subjects automatically - wait for grade selection
        } catch (error) {
            console.error('Error loading subjects:', error);
            this.showError('╨Э╨╡ ╤Г╨┤╨░╨╗╨╛╤Б╤М ╨╖╨░╨│╤А╤Г╨╖╨╕╤В╤М ╨┐╤А╨╡╨┤╨╝╨╡╤В╤Л');
        }
    }

    updateMyClassButton() {
        const myClassBtn = document.getElementById('my-class-btn');
        if (myClassBtn && this.selectedGrade) {
            // ╨Ю╨▒╨╜╨╛╨▓╨╗╤П╨╡╨╝ ╤В╨╡╨║╤Б╤В ╨║╨╜╨╛╨┐╨║╨╕ ╨╜╨░ ╨▓╤Л╨▒╤А╨░╨╜╨╜╤Л╨╣ ╨║╨╗╨░╤Б╤Б
            myClassBtn.innerHTML = `
                <i class="material-icons">edit</i>
                ${this.selectedGrade} ╨║╨╗╨░╤Б╤Б
            `;

            // ╨Ф╨╛╨▒╨░╨▓╨╗╤П╨╡╨╝ ╨┐╨╛╨┤╤Б╨║╨░╨╖╨║╤Г
            myClassBtn.title = '╨Э╨░╨╢╨╝╨╕╤В╨╡, ╤З╤В╨╛╨▒╤Л ╨╕╨╖╨╝╨╡╨╜╨╕╤В╤М ╨║╨╗╨░╤Б╤Б';
        }
    }


    renderSubjects(containerId = 'subjects-container') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        if (this.subjects.length === 0) {
            container.innerHTML = `
                <div class="no-subjects">
                    <i class="material-icons large-icon">school</i>
                    <h3>╨Т╤Л╨▒╨╡╤А╨╕ ╨║╨╗╨░╤Б╤Б</h3>
                    <p>╨з╤В╨╛╨▒╤Л ╤Г╨▓╨╕╨┤╨╡╤В╤М ╨┤╨╛╤Б╤В╤Г╨┐╨╜╤Л╨╡ ╨┐╤А╨╡╨┤╨╝╨╡╤В╤Л</p>
                </div>
            `;
            return;
        }

        this.subjects.forEach(subject => {
            const subjectCard = this.createSubjectCard(subject);
            container.appendChild(subjectCard);
        });
    }

    createSubjectCard(subject) {
        const card = document.createElement('div');
        const subjectGroup = this.getSubjectGroup(subject.name);
        card.className = `subject-card subject-group-${subjectGroup}`;
        card.onclick = (event) => {
            console.log('ЁЯОп Regular subject card clicked!', subject);
            event.preventDefault();
            this.openSubject(subject);
        };

        const isFavorite = this.isFavoriteSubject(subject.id);
        const heartIcon = isFavorite ? 'favorite' : 'favorite_border';

        // Get consistent progress for this subject
        const progressPercent = this.getSubjectProgress(subject.id);
        const progressLevel = this.getProgressLevel(progressPercent);

        card.setAttribute('data-progress', progressLevel);
        card.innerHTML = `
            <div class="subject-icon">
                <i class="material-icons">${this.getSubjectIcon(subject.name)}</i>
            </div>
            <div class="subject-name">${subject.name}</div>
            <div class="subject-progress">
                <div class="subject-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <div class="subject-progress-text">${progressPercent}%</div>
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-subject-id="${subject.id}">
                <i class="material-icons">${heartIcon}</i>
            </button>
        `;

        // Add event listener for favorite button
        const favoriteBtn = card.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            // Add instant visual feedback with animation
            favoriteBtn.style.transform = 'scale(0.8)';
            setTimeout(() => {
                favoriteBtn.style.transform = '';
            }, 100);

            // Toggle favorite status
            this.toggleFavorite(subject.id);

            // Update all favorite buttons for this subject across the UI
            this.updateAllFavoriteButtons(subject.id);

            // Update progress display after changing favorites
            this.updateProgressDisplay();

            // Update button appearance immediately with smooth transition
            const isFavorite = this.isFavoriteSubject(subject.id);
            const heartIcon = isFavorite ? 'favorite' : 'favorite_border';

            // Add pulse animation for favorite action
            favoriteBtn.classList.add('pulse-animation');
            setTimeout(() => {
                favoriteBtn.classList.remove('pulse-animation');
            }, 300);

            favoriteBtn.innerHTML = `<i class="material-icons">${heartIcon}</i>`;
            favoriteBtn.classList.toggle('active', isFavorite);

            // Haptic feedback for Telegram
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }

            // Favorite action completed
        });

        return card;
    }

    getProgressLevel(percent) {
        if (percent >= 100) return '100';
        if (percent >= 75) return '75';
        if (percent >= 50) return '50';
        if (percent >= 25) return '25';
        return '0';
    }

    // Get consistent progress for each subject
    getSubjectProgress(subjectId) {
        // Use localStorage to store consistent progress for each subject
        const key = `subject_progress_${subjectId}`;
        let progress = localStorage.getItem(key);

        if (progress === null) {
            // Generate progress only once per subject and store it
            progress = Math.floor(Math.random() * 101);
            localStorage.setItem(key, progress.toString());
        } else {
            progress = parseInt(progress);
        }

        return progress;
    }

    getSubjectIcon(subjectName) {
        const icons = {
            '╨Ь╨░╤В╨╡╨╝╨░╤В╨╕╨║╨░': 'functions',     // ╨б╨┐╨╡╤Ж╨╕╤Д╨╕╤З╨╜╨░╤П ╨╝╨░╤В╨╡╨╝╨░╤В╨╕╤З╨╡╤Б╨║╨░╤П ╨╕╨║╨╛╨╜╨║╨░
            '╨а╤Г╤Б╤Б╨║╨╕╨╣ ╤П╨╖╤Л╨║': 'text_fields',
            '╨Р╨╜╨│╨╗╨╕╨╣╤Б╨║╨╕╨╣ ╤П╨╖╤Л╨║': 'language',
            '╨д╨╕╨╖╨╕╨║╨░': 'flash_on',          // ╨Ь╨╛╨╗╨╜╨╕╤П ╨┤╨╗╤П ╤Д╨╕╨╖╨╕╨║╨╕
            '╨е╨╕╨╝╨╕╤П': 'flask',              // ╨е╨╕╨╝╨╕╤З╨╡╤Б╨║╨░╤П ╨║╨╛╨╗╨▒╨░
            '╨С╨╕╨╛╨╗╨╛╨│╨╕╤П': 'bug_report',      // ╨Э╨░╤Б╨╡╨║╨╛╨╝╨╛╨╡ ╨┤╨╗╤П ╨▒╨╕╨╛╨╗╨╛╨│╨╕╨╕
            '╨Ш╤Б╤В╨╛╤А╨╕╤П': 'account_balance',  // ╨Ш╤Б╤В╨╛╤А╨╕╤З╨╡╤Б╨║╨╛╨╡ ╨╖╨┤╨░╨╜╨╕╨╡
            '╨У╨╡╨╛╨│╤А╨░╤Д╨╕╤П': 'terrain',        // ╨а╨╡╨╗╤М╨╡╤Д ╨┤╨╗╤П ╨│╨╡╨╛╨│╤А╨░╤Д╨╕╨╕
            '╨Ы╨╕╤В╨╡╤А╨░╤В╤Г╤А╨░': 'auto_stories',  // ╨Ъ╨╜╨╕╨│╨░ ╤Б ╨╕╤Б╤В╨╛╤А╨╕╤П╨╝╨╕
            '╨Ш╨╜╤Д╨╛╤А╨╝╨░╤В╨╕╨║╨░': 'memory',
            '╨Ю╨▒╤Й╨╡╤Б╤В╨▓╨╛╨╖╨╜╨░╨╜╨╕╨╡': 'people'
        };

        return icons[subjectName] || 'school';
    }

    getSubjectGroup(subjectName) {
        const groups = {
            // ╨в╨╛╤З╨╜╤Л╨╡ ╨╜╨░╤Г╨║╨╕ (╤Б╨╕╨╜╨╕╨╣)
            'math': ['╨Ь╨░╤В╨╡╨╝╨░╤В╨╕╨║╨░', '╨Ш╨╜╤Д╨╛╤А╨╝╨░╤В╨╕╨║╨░'],
            // ╨Х╤Б╤В╨╡╤Б╤В╨▓╨╡╨╜╨╜╤Л╨╡ ╨╜╨░╤Г╨║╨╕ (╨╖╨╡╨╗╨╡╨╜╤Л╨╣)
            'science': ['╨д╨╕╨╖╨╕╨║╨░', '╨е╨╕╨╝╨╕╤П', '╨С╨╕╨╛╨╗╨╛╨│╨╕╤П'],
            // ╨У╤Г╨╝╨░╨╜╨╕╤В╨░╤А╨╜╤Л╨╡ (╤Д╨╕╨╛╨╗╨╡╤В╨╛╨▓╤Л╨╣)
            'humanities': ['╨Ш╤Б╤В╨╛╤А╨╕╤П', '╨Ы╨╕╤В╨╡╤А╨░╤В╤Г╤А╨░', '╨Ю╨▒╤Й╨╡╤Б╤В╨▓╨╛╨╖╨╜╨░╨╜╨╕╨╡'],
            // ╨п╨╖╤Л╨║╨╕ (╤А╨╛╨╖╨╛╨▓╤Л╨╣)
            'languages': ['╨а╤Г╤Б╤Б╨║╨╕╨╣ ╤П╨╖╤Л╨║', '╨Р╨╜╨│╨╗╨╕╨╣╤Б╨║╨╕╨╣ ╤П╨╖╤Л╨║', '╨Э╨╡╨╝╨╡╤Ж╨║╨╕╨╣ ╤П╨╖╤Л╨║', '╨д╤А╨░╨╜╤Ж╤Г╨╖╤Б╨║╨╕╨╣ ╤П╨╖╤Л╨║'],
            // ╨У╨╡╨╛╨│╤А╨░╤Д╨╕╤П (╨╛╤А╨░╨╜╨╢╨╡╨▓╤Л╨╣)
            'geography': ['╨У╨╡╨╛╨│╤А╨░╤Д╨╕╤П']
        };

        for (const [group, subjects] of Object.entries(groups)) {
            if (subjects.includes(subjectName)) {
                return group;
            }
        }
        return 'other';
    }

    filterSubjectsByGrade(grade, containerId = 'subjects-container') {
        const filteredSubjects = this.subjects.filter(subject => subject.grade === grade);
        this.renderFilteredSubjects(filteredSubjects, containerId);
    }

    renderFilteredSubjects(subjects, containerId = 'subjects-container') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        if (subjects.length === 0) {
            container.innerHTML = `
                <div class="no-subjects">
                    <i class="material-icons large-icon">school</i>
                    <h3>╨Т╤Л╨▒╨╡╤А╨╕ ╨║╨╗╨░╤Б╤Б</h3>
                    <p>╨Я╤А╨╡╨┤╨╝╨╡╤В╤Л ╨┤╨╗╤П ${this.selectedGrade} ╨║╨╗╨░╤Б╤Б╨░ ╨┐╨╛╨║╨░ ╨╜╨╡ ╨┤╨╛╨▒╨░╨▓╨╗╨╡╨╜╤Л</p>
                </div>
            `;
            return;
        }

        subjects.forEach(subject => {
            const subjectCard = this.createSubjectCard(subject);
            container.appendChild(subjectCard);
        });
    }

    openSubject(subject) {
        // Show haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }

        console.log('ЁЯОп openSubject called with:', subject);

        // ╨г╨▒╨╡╨╢╨┤╨░╨╡╨╝╤Б╤П, ╤З╤В╨╛ grade - ╤З╨╕╤Б╨╗╨╛
        const grade = parseInt(this.selectedGrade);
        if (isNaN(grade)) {
            console.log('тЭМ Invalid grade format');
            this.showMessage('╨Ю╤И╨╕╨▒╨║╨░: ╨╜╨╡╨┐╤А╨░╨▓╨╕╨╗╤М╨╜╤Л╨╣ ╤Д╨╛╤А╨╝╨░╤В ╨║╨╗╨░╤Б╤Б╨░');
            return;
        }

        // ╨Я╤А╨╛╨▓╨╡╤А╤П╨╡╨╝, ╨▓╤Л╨▒╤А╨░╨╜ ╨╗╨╕ ╨║╨╗╨░╤Б╤Б
        if (!this.selectedGrade) {
            console.log('тЭМ No grade selected');
            this.showMessage('╨б╨╜╨░╤З╨░╨╗╨░ ╨▓╤Л╨▒╨╡╤А╨╕╤В╨╡ ╨║╨╗╨░╤Б╤Б');
            return;
        }

        // ╨Я╤А╨╛╨▓╨╡╤А╤П╨╡╨╝, ╤З╤В╨╛ subjectManager ╨╕╨╜╨╕╤Ж╨╕╨░╨╗╨╕╨╖╨╕╤А╨╛╨▓╨░╨╜
        if (!window.subjectManager) {
            console.error('тЭМ subjectManager not found!');
            this.showMessage('╨Ю╤И╨╕╨▒╨║╨░: ╤Б╨╕╤Б╤В╨╡╨╝╨░ ╤Г╨┐╤А╨░╨▓╨╗╨╡╨╜╨╕╤П ╨║╨╛╨╜╤В╨╡╨╜╤В╨╛╨╝ ╨╜╨╡ ╨╖╨░╨│╤А╤Г╨╢╨╡╨╜╨░');
            return;
        }

        // ╨Я╤А╨╛╨▓╨╡╤А╤П╨╡╨╝ subjectsConfig
        if (!window.subjectManager.subjectsConfig) {
            console.error('тЭМ subjectsConfig not loaded!');
            this.showMessage('╨Ъ╨╛╨╜╤Д╨╕╨│╤Г╤А╨░╤Ж╨╕╤П ╨┐╤А╨╡╨┤╨╝╨╡╤В╨╛╨▓ ╨╜╨╡ ╨╖╨░╨│╤А╤Г╨╢╨╡╨╜╨░');
            return;
        }

        // ╨Я╨╛╨╗╤Г╤З╨░╨╡╨╝ ╨╕╨╜╤Д╨╛╤А╨╝╨░╤Ж╨╕╤О ╨╛ ╨┐╤А╨╡╨┤╨╝╨╡╤В╨╡
        console.log('ЁЯФН About to call getSubjectInfo with:', subject.id);
        const subjectInfo = window.subjectManager.getSubjectInfo(subject.id);
        console.log('ЁЯФН getSubjectInfo returned:', subjectInfo);

        if (!subjectInfo) {
            console.error('тЭМ Subject not found in subjectsConfig:', subject.id);
            console.error('тЭМ Available subjects:', window.subjectManager.subjectsConfig?.map(s => s.id));
            this.showMessage(`╨Я╤А╨╡╨┤╨╝╨╡╤В "${subject.name}" ╨╜╨╡ ╨╜╨░╨╣╨┤╨╡╨╜`);
            return;
        }

        // ╨Я╤А╨╛╨▓╨╡╤А╤П╨╡╨╝, ╨┤╨╛╤Б╤В╤Г╨┐╨╡╨╜ ╨╗╨╕ ╨┐╤А╨╡╨┤╨╝╨╡╤В ╨▓ ╨▓╤Л╨▒╤А╨░╨╜╨╜╨╛╨╝ ╨║╨╗╨░╤Б╤Б╨╡
        const availableGrades = subjectInfo.grades || subjectInfo.classes || [];
        if (!availableGrades.includes(grade)) {
            console.log(`Subject ${subject.id} not available for grade ${grade}`);
            this.showMessage(`╨Я╤А╨╡╨┤╨╝╨╡╤В "${subject.name}" ╨╜╨╡╨┤╨╛╤Б╤В╤Г╨┐╨╡╨╜ ╨▓ ${grade} ╨║╨╗╨░╤Б╤Б╨╡`);
            return;
        }

        // ╨Ъ╨╛╨╜╤В╨╡╨╜╤В ╨▒╤Г╨┤╨╡╤В ╨╖╨░╨│╤А╤Г╨╢╨╡╨╜ ╨┐╨╛ ╤В╤А╨╡╨▒╨╛╨▓╨░╨╜╨╕╤О ╨▓ showTopicsList

        // ╨б╨╛╤Е╤А╨░╨╜╤П╨╡╨╝ ╤В╨╡╨║╤Г╤Й╨╕╨╣ ╨┐╤А╨╡╨┤╨╝╨╡╤В ╨╕ ╨║╨╗╨░╤Б╤Б ╨┤╨╗╤П ╨╜╨░╨▓╨╕╨│╨░╤Ж╨╕╨╕
        window.subjectManager.currentSubject = subject.id;
        window.subjectManager.currentGrade = grade;

        // ╨Я╨╛╨║╨░╨╖╤Л╨▓╨░╨╡╨╝ ╤Б╨┐╨╕╤Б╨╛╨║ ╨▓╤Б╨╡╤Е ╤В╨╡╨╝ ╨┐╤А╨╡╨┤╨╝╨╡╤В╨░
        console.log(`ЁЯУЪ ========== APP.JS: CALLING SHOW TOPICS LIST ==========`);
        console.log(`ЁЯУЪ Showing topics list for subject: ${subject.id}, grade: ${grade}`);
        console.log(`ЁЯФН SubjectManager available:`, !!window.subjectManager);
        console.log(`ЁЯФН SubjectManager.showTopicsList method:`, typeof window.subjectManager?.showTopicsList);

        if (!window.subjectManager) {
            console.error('тЭМ CRITICAL: window.subjectManager is undefined!');
            return;
        }

        if (typeof window.subjectManager.showTopicsList !== 'function') {
            console.error('тЭМ CRITICAL: showTopicsList is not a function!');
            return;
        }

        try {
            window.subjectManager.showTopicsList(subject.id, grade);
            console.log('тЬЕ showTopicsList called successfully from app.js');
        } catch (error) {
            console.error('тЭМ ERROR calling showTopicsList:', error);
        }
    }

    startDailyChallenge() {
        // Show haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }

        if (window.QuizManager) window.QuizManager.showDailyChallengeModal(); else this.showMessage('╨Х╨╢╨╡╨┤╨╜╨╡╨▓╨╜╤Л╨╣ ╤З╨╡╨╗╨╗╨╡╨╜╨┤╨╢ ╤Б╨║╨╛╤А╨╛ ╨▒╤Г╨┤╨╡╤В ╨┤╨╛╤Б╤В╤Г╨┐╨╡╨╜!');

        // TODO: Navigate to daily challenge
    }

    startQuiz() {
        // Show haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }

        if (window.QuizManager) window.QuizManager.showQuizModal(this); else this.showMessage('QUIZ ╤Б╨║╨╛╤А╨╛ ╨▒╤Г╨┤╨╡╤В ╨┤╨╛╤Б╤В╤Г╨┐╨╡╨╜!');
    }

    isFavoriteSubject(subjectId) {
        return this.favoriteSubjects.includes(subjectId);
    }

    toggleFavorite(subjectId) {
        const index = this.favoriteSubjects.indexOf(subjectId);
        if (index > -1) {
            this.favoriteSubjects.splice(index, 1);
        } else {
            this.favoriteSubjects.push(subjectId);
        }
        this.saveFavoriteSubjects();

        // Show haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    }

    saveFavoriteSubjects() {
        localStorage.setItem('favoriteSubjects', JSON.stringify(this.favoriteSubjects));
    }

    loadFavoriteSubjects() {
        const saved = localStorage.getItem('favoriteSubjects');
        return saved ? JSON.parse(saved) : [];
    }

    getFavoriteSubjects() {
        return this.subjects.filter(subject => this.isFavoriteSubject(subject.id));
    }

    updateProgressDisplay() {
        const progressContainer = document.querySelector('.progress-items');

        if (!progressContainer) return;

        // If no grade selected, show message and set progress to 0%
        if (!this.selectedGrade) {
            progressContainer.innerHTML = `
                <div class="no-favorites">
                    <i class="material-icons large-icon">school</i>
                    <h3>╨Т╤Л╨▒╨╡╤А╨╕╤В╨╡ ╨║╨╗╨░╤Б╤Б</h3>
                    <p>╨Ч╨░╨╣╨┤╨╕ ╨▓ ╨┐╤А╨╡╨┤╨╝╨╡╤В╤Л ╨╕ ╨▓╤Л╨▒╨╡╤А╨╕ ╨┐╤А╨╡╨┤╨╝╨╡╤В, ╤З╤В╨╛╨▒ ╨╛╤В╤Б╨╗╨╡╨╢╨╕╨▓╨░╤В╤М ╤Б╨▓╨╛╨╣ ╨┐╤А╨╛╨│╤А╨╡╤Б╤Б</p>
                </div>
            `;
            // Set progress to 0% when no grade selected
            this.updateOverallProgress([]);
            return;
        }

        // Filter subjects by selected grade and then by favorites
        const gradeSubjects = this.subjects.filter(subject => subject.grade === this.selectedGrade);
        const favoriteGradeSubjects = gradeSubjects.filter(subject => this.isFavoriteSubject(subject.id));

        // If no favorites in this grade, show message and set progress to 0%
        if (favoriteGradeSubjects.length === 0) {
            progressContainer.innerHTML = `
                <div class="no-favorites">
                    <i class="material-icons large-icon">favorite_border</i>
                    <h3>╨Э╨╡╤В ╨╕╨╖╨▒╤А╨░╨╜╨╜╤Л╤Е ╨┐╤А╨╡╨┤╨╝╨╡╤В╨╛╨▓</h3>
                    <p>╨Т ╤А╨░╨╖╨┤╨╡╨╗╨╡ "╨Я╤А╨╡╨┤╨╝╨╡╤В╤Л" ╨╛╤В╨╝╨╡╤В╤М╤В╨╡ ╤Б╨╡╤А╨┤╨╡╤З╨║╨╛╨╝ ╨┐╤А╨╡╨┤╨╝╨╡╤В╤Л ${this.selectedGrade} ╨║╨╗╨░╤Б╤Б╨░</p>
                </div>
            `;
            // Set progress to 0% when no favorites in selected grade
            this.updateOverallProgress([]);
            return;
        }

        // Show progress for favorite subjects of selected grade (max 6 for 3x2 grid)
        const subjectsToShow = favoriteGradeSubjects.slice(0, 6);
        progressContainer.innerHTML = '';

        // ╨б╨╛╨▒╨╕╤А╨░╨╡╨╝ ╨┤╨░╨╜╨╜╤Л╨╡ ╨╛ ╨┐╤А╨╛╨│╤А╨╡╤Б╤Б╨╡ ╨┤╨╗╤П ╤А╨░╤Б╤З╨╡╤В╨░ ╨╛╨▒╤Й╨╡╨│╨╛ ╨┐╤А╨╛╤Ж╨╡╨╜╤В╨░
        const subjectProgresses = [];

        subjectsToShow.forEach(subject => {
            // Get consistent progress for this subject
            const progressPercent = this.getSubjectProgress(subject.id);
            const progressLevel = this.getProgressLevel(progressPercent);

            // ╨Ф╨╛╨▒╨░╨▓╨╗╤П╨╡╨╝ ╨▓ ╨╝╨░╤Б╤Б╨╕╨▓ ╨┤╨╗╤П ╤А╨░╤Б╤З╨╡╤В╨░ ╨╛╨▒╤Й╨╡╨│╨╛ ╨┐╤А╨╛╨│╤А╨╡╤Б╤Б╨░
            subjectProgresses.push({
                name: subject.name,
                progress: progressPercent
            });

            const progressItem = document.createElement('div');
            progressItem.className = 'progress-item';
            progressItem.setAttribute('data-progress', progressLevel);
            progressItem.innerHTML = `
                <span class="progress-subject">${subject.name}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    <span class="progress-text">${progressPercent}%</span>
                </div>
            `;
            progressContainer.appendChild(progressItem);
        });

        // ╨Ю╨▒╨╜╨╛╨▓╨╗╤П╨╡╨╝ ╨╛╨▒╤Й╨╕╨╣ ╨┐╤А╨╛╨│╤А╨╡╤Б╤Б ╨┐╨╛╤Б╨╗╨╡ ╨╛╤В╨╛╨▒╤А╨░╨╢╨╡╨╜╨╕╤П ╨▓╤Б╨╡╤Е ╨┐╤А╨╡╨┤╨╝╨╡╤В╨╛╨▓
        this.updateOverallProgress(subjectProgresses);
    }

    updateOverallProgress(subjectProgresses) {
        // ╨а╨░╤Б╤Б╤З╨╕╤В╤Л╨▓╨░╨╡╨╝ ╤Б╤А╨╡╨┤╨╜╨╕╨╣ ╨┐╤А╨╛╨│╤А╨╡╤Б╤Б ╨┐╨╛ ╨▓╤Б╨╡╨╝ ╨▓╤Л╨▒╤А╨░╨╜╨╜╤Л╨╝ ╨┐╤А╨╡╨┤╨╝╨╡╤В╨░╨╝
        let averageProgress = 0;

        if (subjectProgresses.length > 0) {
            const totalProgress = subjectProgresses.reduce((sum, subject) => sum + subject.progress, 0);
            averageProgress = Math.round(totalProgress / subjectProgresses.length);
        }

        // ╨Ю╨▒╨╜╨╛╨▓╨╗╤П╨╡╨╝ ╨┐╤А╨╛╤Ж╨╡╨╜╤В ╨▓ ╨╖╨░╨│╨╛╨╗╨╛╨▓╨║╨╡ (╨▓╤Б╨╡╨│╨┤╨░ ╨┐╨╛╨║╨░╨╖╤Л╨▓╨░╨╡╨╝, ╨┤╨░╨╢╨╡ 0%)
        const percentageElement = document.querySelector('.progress-percentage');
        if (percentageElement) {
            percentageElement.textContent = `${averageProgress}%`;
        }

        // ╨Ю╨▒╨╜╨╛╨▓╨╗╤П╨╡╨╝ tooltip ╤Б ╨┤╨╡╤В╨░╨╗╤П╨╝╨╕ ╨┐╨╛ ╨┐╤А╨╡╨┤╨╝╨╡╤В╨░╨╝
        const tooltipElement = document.querySelector('.progress-tooltip');
        if (tooltipElement) {
            const detailsHtml = subjectProgresses
                .map(subject => `тАв ${subject.name}: ${subject.progress}%`)
                .join('<br>');
            tooltipElement.innerHTML = `
                ╨Я╤А╨╛╨│╤А╨╡╤Б╤Б ╨┐╨╛ ╨▓╤Л╨▒╤А╨░╨╜╨╜╤Л╨╝ ╨┐╤А╨╡╨┤╨╝╨╡╤В╨░╨╝:<br>
                ${detailsHtml}
            `;
        }
    }

    showGradeSelectionModal() {
        const modal = document.getElementById('grade-modal');
        modal.classList.add('show');

        // Reset selection
        document.querySelectorAll('.grade-select-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.getElementById('confirm-grade-selection').disabled = true;

        // Show haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    }

    hideGradeSelectionModal() {
        const modal = document.getElementById('grade-modal');
        modal.classList.remove('show');

        // Show haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    }

    selectGradeInModal(grade) {
        console.log('ЁЯОп selectGradeInModal called with grade:', grade);

        // Select grade immediately and close modal
        this.selectGrade(grade);
        this.hideGradeSelectionModal();

        // ╨Я╤А╨╕╨╜╤Г╨┤╨╕╤В╨╡╨╗╤М╨╜╨╛ ╨╛╨▒╨╜╨╛╨▓╨╗╤П╨╡╨╝ ╨╛╤В╨╛╨▒╤А╨░╨╢╨╡╨╜╨╕╨╡ ╨┐╤А╨╡╨┤╨╝╨╡╤В╨╛╨▓ ╨┐╨╛╤Б╨╗╨╡ ╨▓╤Л╨▒╨╛╤А╨░ ╨║╨╗╨░╤Б╤Б╨░
        console.log('ЁЯФД Force updating subjects display after modal grade selection');
        setTimeout(() => {
            this.updateSubjectsDisplay();
            this.updateFavoritesDisplay();
        }, 200);

        // Show haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }

        console.log('тЬЕ Grade selection completed, display force updated');
    }

    confirmGradeSelection() {
        if (this.tempSelectedGrade) {
            this.selectGrade(this.tempSelectedGrade);
            this.hideGradeSelectionModal();
        }
    }

    updateSelectedGradeDisplay() {
        const selectedGradeCard = document.getElementById('selected-grade-subjects');

        if (this.selectedGrade && selectedGradeCard) {
            selectedGradeCard.style.display = 'block';
            this.filterSubjectsByGrade(this.selectedGrade, 'subjects-container-subjects');
        } else if (selectedGradeCard) {
            selectedGradeCard.style.display = 'none';
        }
    }

    showMessage(message) {
        // Use Telegram popup if available
        if (window.Telegram?.WebApp?.showPopup) {
            window.Telegram.WebApp.showPopup({
                title: '╨Ш╨╜╤Д╨╛╤А╨╝╨░╤Ж╨╕╤П',
                message: message,
                buttons: [{ type: 'ok' }]
            });
        } else {
            alert(message);
        }
    }

    updateAllFavoriteButtons(subjectId) {
        // Update favorite buttons for this subject in all locations
        const isFavorite = this.isFavoriteSubject(subjectId);

        // Update all favorite buttons with this subject ID
        const favoriteButtons = document.querySelectorAll(`[data-subject-id="${subjectId}"]`);
        favoriteButtons.forEach(btn => {
            const heartIcon = isFavorite ? 'favorite' : 'favorite_border';
            btn.innerHTML = `<i class="material-icons">${heartIcon}</i>`;
            btn.classList.toggle('active', isFavorite);

            // Add visual feedback
            btn.classList.add('pulse-animation');
            setTimeout(() => {
                btn.classList.remove('pulse-animation');
            }, 300);
        });

        // Update favorites section visibility and content
        this.updateFavoritesSection();
    }

    updateFavoritesSection() {
        const favoritesSection = document.getElementById('favorites-section');
        const favoritesGrid = document.getElementById('favorites-grid');

        if (!favoritesSection || !favoritesGrid) return;

        // Get favorite subjects for current grade
        const gradeSubjects = this.subjects.filter(subject => subject.grade === this.selectedGrade);
        const favoriteGradeSubjects = gradeSubjects.filter(subject => this.isFavoriteSubject(subject.id));

        if (favoriteGradeSubjects.length === 0) {
            favoritesSection.style.display = 'none';
        } else {
            favoritesSection.style.display = 'block';
            // Re-render favorites grid
            favoritesGrid.innerHTML = '';
            favoriteGradeSubjects.forEach(subject => {
                const subjectCard = this.createFavoriteSubjectCard(subject);
                favoritesGrid.appendChild(subjectCard);
            });
        }
    }

    showProgressExplanation() {
        // ╨Я╨╛╨╗╤Г╤З╨░╨╡╨╝ ╤В╨╡╨║╤Г╤Й╨╕╨╣ ╨┐╤А╨╛╨│╤А╨╡╤Б╤Б ╨┐╨╛ ╨┐╤А╨╡╨┤╨╝╨╡╤В╨░╨╝
        const favoriteSubjects = this.getFavoriteSubjects();
        const gradeSubjects = this.subjects.filter(subject => subject.grade === this.selectedGrade);
        const favoriteGradeSubjects = gradeSubjects.filter(subject => this.isFavoriteSubject(subject.id));

        if (favoriteGradeSubjects.length === 0) {
            this.showMessage('╨б╨╜╨░╤З╨░╨╗╨░ ╨▓╤Л╨▒╨╡╤А╨╕╤В╨╡ ╨┐╤А╨╡╨┤╨╝╨╡╤В╤Л ╨▓ ╤А╨░╨╖╨┤╨╡╨╗╨╡ "╨Я╤А╨╡╨┤╨╝╨╡╤В╤Л"');
            return;
        }

        // ╨б╨╛╨▒╨╕╤А╨░╨╡╨╝ ╨┤╨░╨╜╨╜╤Л╨╡ ╨╛ ╨┐╤А╨╛╨│╤А╨╡╤Б╤Б╨╡
        let totalProgress = 0;
        favoriteGradeSubjects.forEach(subject => {
            // Get consistent progress for this subject
            const progress = this.getSubjectProgress(subject.id);
            totalProgress += progress;
        });
        const averageProgress = Math.round(totalProgress / favoriteGradeSubjects.length);

        // ╨б╨╛╨╖╨┤╨░╨╡╨╝ ╨▓╤Б╨┐╨╗╤Л╨▓╨░╤О╤Й╨╡╨╡ ╤Г╨▓╨╡╨┤╨╛╨╝╨╗╨╡╨╜╨╕╨╡
        const toast = document.createElement('div');
        toast.className = 'progress-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-header">
                    <i class="material-icons">info</i>
                    <span>╨Ю╨▒╤К╤П╤Б╨╜╨╡╨╜╨╕╨╡ ╨┐╤А╨╛╨│╤А╨╡╤Б╤Б╨░</span>
                </div>
                <div class="toast-body">
                    <p><strong>${averageProgress}%</strong> - ╤Б╤А╨╡╨┤╨╜╨╕╨╣ ╨┐╤А╨╛╨│╤А╨╡╤Б╤Б ╨┐╨╛ ${favoriteGradeSubjects.length} ╨╕╨╖╨▒╤А╨░╨╜╨╜╤Л╨╝ ╨┐╤А╨╡╨┤╨╝╨╡╤В╨░╨╝</p>
                    <small>╨г╤З╨╕╤В╤Л╨▓╨░╤О╤В╤Б╤П: ╤Г╤А╨╛╨║╨╕, ╤В╨╡╤Б╤В╤Л, ╤Г╨┐╤А╨░╨╢╨╜╨╡╨╜╨╕╤П</small>
                </div>
            </div>
        `;

        document.body.appendChild(toast);

        // ╨Я╨╛╨║╨░╨╖╤Л╨▓╨░╨╡╨╝ ╤Б ╨░╨╜╨╕╨╝╨░╤Ж╨╕╨╡╨╣
        setTimeout(() => {
            toast.classList.add('visible');
        }, 10);

        // ╨Р╨▓╤В╨╛╨╝╨░╤В╨╕╤З╨╡╤Б╨║╨╕ ╤Б╨║╤А╤Л╨▓╨░╨╡╨╝ ╤З╨╡╤А╨╡╨╖ 4 ╤Б╨╡╨║╤Г╨╜╨┤╤Л
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 4000);

        // Haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    }

    showError(message) {
        // Use Telegram popup for errors
        if (window.Telegram?.WebApp?.showPopup) {
            window.Telegram.WebApp.showPopup({
                title: '╨Ю╤И╨╕╨▒╨║╨░',
                message: message,
                buttons: [{ type: 'ok' }]
            });
        } else {
            alert('╨Ю╤И╨╕╨▒╨║╨░: ' + message);
        }
    }

    // Premium subscription methods
    showPremiumPlans() {
        if (window.subscriptionManager) {
            window.subscriptionManager.showSubscriptionPlans();
        }
    }

    manageSubscription() {
        if (!window.subscriptionManager) return;

        const info = window.subscriptionManager.getSubscriptionInfo();
        
        if (window.Telegram?.WebApp?.showPopup) {
            const daysText = info.daysLeft ? `╨Ю╤Б╤В╨░╨╗╨╛╤Б╤М ${info.daysLeft} ╨┤╨╜╨╡╨╣` : '╨Э╨░╨▓╤Б╨╡╨│╨┤╨░';
            window.Telegram.WebApp.showPopup({
                title: '╨г╨┐╤А╨░╨▓╨╗╨╡╨╜╨╕╨╡ ╨┐╨╛╨┤╨┐╨╕╤Б╨║╨╛╨╣',
                message: `╨в╨╕╨┐: ${this.getSubscriptionTypeName(info.type)}\n${daysText}`,
                buttons: [
                    { id: 'cancel', type: 'destructive', text: '╨Ю╤В╨╝╨╡╨╜╨╕╤В╤М ╨┐╨╛╨┤╨┐╨╕╤Б╨║╤Г' },
                    { id: 'close', type: 'default', text: '╨Ч╨░╨║╤А╤Л╤В╤М' }
                ]
            }, (buttonId) => {
                if (buttonId === 'cancel') {
                    this.confirmCancelSubscription();
                }
            });
        }
    }

    confirmCancelSubscription() {
        if (window.Telegram?.WebApp?.showPopup) {
            window.Telegram.WebApp.showPopup({
                title: '╨Ю╤В╨╝╨╡╨╜╨╕╤В╤М ╨┐╨╛╨┤╨┐╨╕╤Б╨║╤Г?',
                message: '╨Т╤Л ╨┐╨╛╤В╨╡╤А╤П╨╡╤В╨╡ ╨┤╨╛╤Б╤В╤Г╨┐ ╨║╨╛ ╨▓╤Б╨╡╨╝ Premium ╤Д╤Г╨╜╨║╤Ж╨╕╤П╨╝',
                buttons: [
                    { id: 'confirm', type: 'destructive', text: '╨Ф╨░, ╨╛╤В╨╝╨╡╨╜╨╕╤В╤М' },
                    { id: 'cancel', type: 'default', text: '╨Ю╤Б╤В╨░╨▓╨╕╤В╤М' }
                ]
            }, (buttonId) => {
                if (buttonId === 'confirm' && window.subscriptionManager) {
                    window.subscriptionManager.cancelSubscription();
                    this.updateSubscriptionStatus();
                }
            });
        }
    }

    getSubscriptionTypeName(type) {
        const names = {
            monthly: '╨Ь╨╡╤Б╤П╤З╨╜╨░╤П',
            yearly: '╨У╨╛╨┤╨╛╨▓╨░╤П',
            lifetime: '╨Э╨░╨▓╤Б╨╡╨│╨┤╨░'
        };
        return names[type] || '╨Э╨╡╨╕╨╖╨▓╨╡╤Б╤В╨╜╨╛';
    }

    updateSubscriptionStatus() {
        if (!window.subscriptionManager) return;

        const info = window.subscriptionManager.getSubscriptionInfo();
        
        // Update premium badge in profile
        const premiumBadge = document.getElementById('premium-status-badge');
        if (premiumBadge) {
            premiumBadge.style.display = info.isPremium ? 'block' : 'none';
        }

        // Update premium section
        const lockedState = document.getElementById('premium-locked-state');
        const activeState = document.getElementById('premium-active-state');
        const subtitle = document.getElementById('premium-subtitle');

        if (info.isPremium) {
            if (lockedState) lockedState.style.display = 'none';
            if (activeState) activeState.style.display = 'block';
            if (subtitle) subtitle.textContent = '╨г ╨▓╨░╤Б ╨╡╤Б╤В╤М Premium ╨┤╨╛╤Б╤В╤Г╨┐';

            // Update subscription info
            const subscriptionInfo = document.getElementById('subscription-info');
            if (subscriptionInfo) {
                const typeText = this.getSubscriptionTypeName(info.type);
                const daysText = info.daysLeft ? `╨Ю╤Б╤В╨░╨╗╨╛╤Б╤М ${info.daysLeft} ╨┤╨╜╨╡╨╣` : '╨Ф╨╡╨╣╤Б╤В╨▓╤Г╨╡╤В ╨╜╨░╨▓╤Б╨╡╨│╨┤╨░';
                subscriptionInfo.textContent = `${typeText} ╨┐╨╛╨┤╨┐╨╕╤Б╨║╨░ тАв ${daysText}`;
            }
        } else {
            if (lockedState) lockedState.style.display = 'block';
            if (activeState) activeState.style.display = 'none';
            if (subtitle) subtitle.textContent = '╨а╨░╨╖╨▒╨╗╨╛╨║╨╕╤А╤Г╨╣ ╨▓╤Б╨╡ ╨▓╨╛╨╖╨╝╨╛╨╢╨╜╨╛╤Б╤В╨╕';
        }
    }
}

// Initialize app when DOM is loaded (или сразу, если уже загружен)
function initApp() { window.app = new ShanksEducationApp(); }
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
