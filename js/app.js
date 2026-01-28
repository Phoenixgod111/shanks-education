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
        // Initialize Telegram Web App
        this.initTelegramWebApp();

        // Load data
        await this.loadSubjects();
        
        // Инициализируем subjectManager (должен быть загружен до app.js)
        if (window.subjectManager) {
            await window.subjectManager.init();
            console.log('✅ SubjectManager initialized successfully');
        } else {
            console.error('❌ CRITICAL: window.subjectManager not found!');
        }

        // Initialize displays
        this.updateProgressDisplay();

        // Setup event listeners
        this.setupEventListeners();

        // Update subscription status
        this.updateSubscriptionStatus();

        // Hide loading screen after initialization
        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('main-app').classList.remove('hidden');
        }, 1000);
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
                userNameElement.textContent = this.user.first_name || 'Пользователь';
            }
        }
    }


    setupEventListeners() {
        // Bottom navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const screen = item.dataset.screen;
                this.switchScreen(screen);
            });
        });

        // Setup subjects screen
        this.setupSubjectsScreen();

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
        // Синхронизируем NavigationManager с текущим экраном app.js
        if (window.navigation) {
            // Если стек пустой или текущий экран не совпадает, синхронизируем
            const navCurrentScreen = window.navigation.getCurrentScreen();
            if (!navCurrentScreen || navCurrentScreen.name !== screenName) {
                // Очищаем стек и устанавливаем текущий экран
                window.navigation.clearStack();
                window.navigation.pushScreen(screenName);
            }
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-screen="${screenName}"]`).classList.add('active');

        // Switch screen content
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(`${screenName}-screen`).classList.add('active');

        this.currentScreen = screenName;

        // Special handling for subjects screen
        if (screenName === 'subjects') {
            this.updateSubjectsDisplay();
        }
    }

    selectGrade(grade) {
        console.log('🎯 selectGrade called with grade:', grade);
        const oldGrade = this.selectedGrade;
        this.selectedGrade = grade;

        // Синхронизируем currentGrade в subjectManager
        if (window.subjectManager) {
            window.subjectManager.currentGrade = grade;
            // Сбрасываем текущий предмет и тему при смене класса
            window.subjectManager.currentSubject = null;
            window.subjectManager.currentTopic = null;
        }

        // Update displays
        this.updateProgressDisplay();
        this.updateSubjectsDisplay();

        // Если пользователь находится в разделе предметов, полностью перерисовываем экран
        const currentScreen = window.navigation?.getCurrentScreen();
        if (currentScreen && currentScreen.name === 'subjects') {
            console.log('🔄 User is on subjects screen, forcing complete refresh');
            // Принудительно перерисовываем все секции
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
        console.log('🔄 updateSubjectsDisplay called, selectedGrade:', this.selectedGrade);

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
                currentGradeDisplay.textContent = `${this.selectedGrade} класс`;
            }

            if (gradeNumber) {
                gradeNumber.textContent = this.selectedGrade;
            }

            // Полностью перерисовываем все секции
            console.log('🔄 Force refreshing all sections');
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
            console.log('🎯 Subject card clicked!', subject);
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
                5: '5 класс (Начальная школа)',
                6: '6 класс (Средняя школа)',
                7: '7 класс (Средняя школа)',
                8: '8 класс (Средняя школа)',
                9: '9 класс (Основная школа)',
                10: '10 класс (Старшая школа)',
                11: '11 класс (Старшая школа)'
            };
            gradeDisplay.textContent = gradeNames[this.selectedGrade] || 'Выберите класс';

            // Count available subjects for selected grade
            const gradeSubjects = this.subjects.filter(subject => subject.grade === this.selectedGrade);
            if (countDisplay) {
                countDisplay.textContent = `Предметов: ${gradeSubjects.length}`;
            }
        } else {
            if (gradeDisplay) gradeDisplay.textContent = 'Выберите класс в профиле';
            if (countDisplay) countDisplay.textContent = 'Предметов: 0';
        }
    }

    async loadSubjects() {
        try {
            // Load subjects from data file
            this.subjects = await DataManager.loadSubjects();
            // Don't render subjects automatically - wait for grade selection
        } catch (error) {
            console.error('Error loading subjects:', error);
            this.showError('Не удалось загрузить предметы');
        }
    }

    updateMyClassButton() {
        const myClassBtn = document.getElementById('my-class-btn');
        if (myClassBtn && this.selectedGrade) {
            // Обновляем текст кнопки на выбранный класс
            myClassBtn.innerHTML = `
                <i class="material-icons">edit</i>
                ${this.selectedGrade} класс
            `;

            // Добавляем подсказку
            myClassBtn.title = 'Нажмите, чтобы изменить класс';
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
                    <h3>Выбери класс</h3>
                    <p>Чтобы увидеть доступные предметы</p>
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
            console.log('🎯 Regular subject card clicked!', subject);
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
            'Математика': 'functions',     // Специфичная математическая иконка
            'Русский язык': 'text_fields',
            'Английский язык': 'language',
            'Физика': 'flash_on',          // Молния для физики
            'Химия': 'flask',              // Химическая колба
            'Биология': 'bug_report',      // Насекомое для биологии
            'История': 'account_balance',  // Историческое здание
            'География': 'terrain',        // Рельеф для географии
            'Литература': 'auto_stories',  // Книга с историями
            'Информатика': 'memory',
            'Обществознание': 'people'
        };

        return icons[subjectName] || 'school';
    }

    getSubjectGroup(subjectName) {
        const groups = {
            // Точные науки (синий)
            'math': ['Математика', 'Информатика'],
            // Естественные науки (зеленый)
            'science': ['Физика', 'Химия', 'Биология'],
            // Гуманитарные (фиолетовый)
            'humanities': ['История', 'Литература', 'Обществознание'],
            // Языки (розовый)
            'languages': ['Русский язык', 'Английский язык', 'Немецкий язык', 'Французский язык'],
            // География (оранжевый)
            'geography': ['География']
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
                    <h3>Выбери класс</h3>
                    <p>Предметы для ${this.selectedGrade} класса пока не добавлены</p>
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

        console.log('🎯 openSubject called with:', subject);

        // Убеждаемся, что grade - число
        const grade = parseInt(this.selectedGrade);
        if (isNaN(grade)) {
            console.log('❌ Invalid grade format');
            this.showMessage('Ошибка: неправильный формат класса');
            return;
        }

        // Проверяем, выбран ли класс
        if (!this.selectedGrade) {
            console.log('❌ No grade selected');
            this.showMessage('Сначала выберите класс');
            return;
        }

        // Проверяем, что subjectManager инициализирован
        if (!window.subjectManager) {
            console.error('❌ subjectManager not found!');
            this.showMessage('Ошибка: система управления контентом не загружена');
            return;
        }

        // Проверяем subjectsConfig
        if (!window.subjectManager.subjectsConfig) {
            console.error('❌ subjectsConfig not loaded!');
            this.showMessage('Конфигурация предметов не загружена');
            return;
        }

        // Получаем информацию о предмете
        console.log('🔍 About to call getSubjectInfo with:', subject.id);
        const subjectInfo = window.subjectManager.getSubjectInfo(subject.id);
        console.log('🔍 getSubjectInfo returned:', subjectInfo);

        if (!subjectInfo) {
            console.error('❌ Subject not found in subjectsConfig:', subject.id);
            console.error('❌ Available subjects:', window.subjectManager.subjectsConfig?.map(s => s.id));
            this.showMessage(`Предмет "${subject.name}" не найден`);
            return;
        }

        // Проверяем, доступен ли предмет в выбранном классе
        const availableGrades = subjectInfo.grades || subjectInfo.classes || [];
        if (!availableGrades.includes(grade)) {
            console.log(`Subject ${subject.id} not available for grade ${grade}`);
            this.showMessage(`Предмет "${subject.name}" недоступен в ${grade} классе`);
            return;
        }

        // Контент будет загружен по требованию в showTopicsList

        // Сохраняем текущий предмет и класс для навигации
        window.subjectManager.currentSubject = subject.id;
        window.subjectManager.currentGrade = grade;

        // Показываем список всех тем предмета
        console.log(`📚 ========== APP.JS: CALLING SHOW TOPICS LIST ==========`);
        console.log(`📚 Showing topics list for subject: ${subject.id}, grade: ${grade}`);
        console.log(`🔍 SubjectManager available:`, !!window.subjectManager);
        console.log(`🔍 SubjectManager.showTopicsList method:`, typeof window.subjectManager?.showTopicsList);

        if (!window.subjectManager) {
            console.error('❌ CRITICAL: window.subjectManager is undefined!');
            return;
        }

        if (typeof window.subjectManager.showTopicsList !== 'function') {
            console.error('❌ CRITICAL: showTopicsList is not a function!');
            return;
        }

        try {
            window.subjectManager.showTopicsList(subject.id, grade);
            console.log('✅ showTopicsList called successfully from app.js');
        } catch (error) {
            console.error('❌ ERROR calling showTopicsList:', error);
        }
    }

    startDailyChallenge() {
        // Show haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }

        this.showMessage('Ежедневный челлендж скоро будет доступен!');

        // TODO: Navigate to daily challenge
    }

    startQuiz() {
        // Show haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }

        this.showMessage('QUIZ скоро будет доступен!');
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
                    <h3>Выберите класс</h3>
                    <p>Зайди в предметы и выбери предмет, чтоб отслеживать свой прогресс</p>
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
                    <h3>Нет избранных предметов</h3>
                    <p>В разделе "Предметы" отметьте сердечком предметы ${this.selectedGrade} класса</p>
                </div>
            `;
            // Set progress to 0% when no favorites in selected grade
            this.updateOverallProgress([]);
            return;
        }

        // Show progress for favorite subjects of selected grade (max 6 for 3x2 grid)
        const subjectsToShow = favoriteGradeSubjects.slice(0, 6);
        progressContainer.innerHTML = '';

        // Собираем данные о прогрессе для расчета общего процента
        const subjectProgresses = [];

        subjectsToShow.forEach(subject => {
            // Get consistent progress for this subject
            const progressPercent = this.getSubjectProgress(subject.id);
            const progressLevel = this.getProgressLevel(progressPercent);

            // Добавляем в массив для расчета общего прогресса
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

        // Обновляем общий прогресс после отображения всех предметов
        this.updateOverallProgress(subjectProgresses);
    }

    updateOverallProgress(subjectProgresses) {
        // Рассчитываем средний прогресс по всем выбранным предметам
        let averageProgress = 0;

        if (subjectProgresses.length > 0) {
            const totalProgress = subjectProgresses.reduce((sum, subject) => sum + subject.progress, 0);
            averageProgress = Math.round(totalProgress / subjectProgresses.length);
        }

        // Обновляем процент в заголовке (всегда показываем, даже 0%)
        const percentageElement = document.querySelector('.progress-percentage');
        if (percentageElement) {
            percentageElement.textContent = `${averageProgress}%`;
        }

        // Обновляем tooltip с деталями по предметам
        const tooltipElement = document.querySelector('.progress-tooltip');
        if (tooltipElement) {
            const detailsHtml = subjectProgresses
                .map(subject => `• ${subject.name}: ${subject.progress}%`)
                .join('<br>');
            tooltipElement.innerHTML = `
                Прогресс по выбранным предметам:<br>
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
        console.log('🎯 selectGradeInModal called with grade:', grade);

        // Select grade immediately and close modal
        this.selectGrade(grade);
        this.hideGradeSelectionModal();

        // Принудительно обновляем отображение предметов после выбора класса
        console.log('🔄 Force updating subjects display after modal grade selection');
        setTimeout(() => {
            this.updateSubjectsDisplay();
            this.updateFavoritesDisplay();
        }, 200);

        // Show haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }

        console.log('✅ Grade selection completed, display force updated');
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
                title: 'Информация',
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
        // Получаем текущий прогресс по предметам
        const favoriteSubjects = this.getFavoriteSubjects();
        const gradeSubjects = this.subjects.filter(subject => subject.grade === this.selectedGrade);
        const favoriteGradeSubjects = gradeSubjects.filter(subject => this.isFavoriteSubject(subject.id));

        if (favoriteGradeSubjects.length === 0) {
            this.showMessage('Сначала выберите предметы в разделе "Предметы"');
            return;
        }

        // Собираем данные о прогрессе
        let totalProgress = 0;
        favoriteGradeSubjects.forEach(subject => {
            // Get consistent progress for this subject
            const progress = this.getSubjectProgress(subject.id);
            totalProgress += progress;
        });
        const averageProgress = Math.round(totalProgress / favoriteGradeSubjects.length);

        // Создаем всплывающее уведомление
        const toast = document.createElement('div');
        toast.className = 'progress-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-header">
                    <i class="material-icons">info</i>
                    <span>Объяснение прогресса</span>
                </div>
                <div class="toast-body">
                    <p><strong>${averageProgress}%</strong> - средний прогресс по ${favoriteGradeSubjects.length} избранным предметам</p>
                    <small>Учитываются: уроки, тесты, упражнения</small>
                </div>
            </div>
        `;

        document.body.appendChild(toast);

        // Показываем с анимацией
        setTimeout(() => {
            toast.classList.add('visible');
        }, 10);

        // Автоматически скрываем через 4 секунды
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
                title: 'Ошибка',
                message: message,
                buttons: [{ type: 'ok' }]
            });
        } else {
            alert('Ошибка: ' + message);
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
            const daysText = info.daysLeft ? `Осталось ${info.daysLeft} дней` : 'Навсегда';
            window.Telegram.WebApp.showPopup({
                title: 'Управление подпиской',
                message: `Тип: ${this.getSubscriptionTypeName(info.type)}\n${daysText}`,
                buttons: [
                    { id: 'cancel', type: 'destructive', text: 'Отменить подписку' },
                    { id: 'close', type: 'default', text: 'Закрыть' }
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
                title: 'Отменить подписку?',
                message: 'Вы потеряете доступ ко всем Premium функциям',
                buttons: [
                    { id: 'confirm', type: 'destructive', text: 'Да, отменить' },
                    { id: 'cancel', type: 'default', text: 'Оставить' }
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
            monthly: 'Месячная',
            yearly: 'Годовая',
            lifetime: 'Навсегда'
        };
        return names[type] || 'Неизвестно';
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
            if (subtitle) subtitle.textContent = 'У вас есть Premium доступ';

            // Update subscription info
            const subscriptionInfo = document.getElementById('subscription-info');
            if (subscriptionInfo) {
                const typeText = this.getSubscriptionTypeName(info.type);
                const daysText = info.daysLeft ? `Осталось ${info.daysLeft} дней` : 'Действует навсегда';
                subscriptionInfo.textContent = `${typeText} подписка • ${daysText}`;
            }
        } else {
            if (lockedState) lockedState.style.display = 'block';
            if (activeState) activeState.style.display = 'none';
            if (subtitle) subtitle.textContent = 'Разблокируй все возможности';
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ShanksEducationApp();
});