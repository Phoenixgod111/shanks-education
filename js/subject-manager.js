// Subject Manager Class - управление контентом предметов
// Version: v=13.0
console.log('🚀 SubjectManager.js loaded successfully!');

class SubjectManager {
    constructor() {
        this.subjects = {};
        this.subjectsConfig = null;
        this.currentSubject = null;
        this.currentGrade = null;
        this.currentTopic = null;
        this.isLoading = false;
        this.isLoaded = false;
        this.allTopics = []; // Храним все темы для поиска
    }

    // Генерация уникального градиента для темы
    generateTopicGradient(subjectId, topicIndex, totalTopics) {
        const subjectColor = this.getSubjectColor(subjectId);
        const baseHue = this.hexToHsl(subjectColor);

        // Создаем вариации на основе индекса темы
        const hueVariation = (topicIndex * 25) % 50; // Варьируем оттенок
        const saturationVariation = 80 + (topicIndex % 4) * 5; // Варьируем насыщенность
        const lightnessVariation = 50 + (topicIndex % 3) * 8; // Варьируем яркость

        const hue = (baseHue.h + hueVariation) % 360;
        const saturation = Math.min(100, saturationVariation);
        const lightness = lightnessVariation;

        const color1 = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        const color2 = `hsl(${(hue + 15) % 360}, ${saturation - 5}%, ${lightness + 8}%)`;

        return `linear-gradient(135deg, ${color1}, ${color2})`;
    }

    // Получение цвета предмета
    getSubjectColor(subjectId) {
        const subjectColors = {
            'russian': '#4CAF50',
            'math': '#2196F3',
            'literature': '#795548',
            'english': '#FF9800',
            'history': '#9C27B0',
            'physics': '#F44336',
            'chemistry': '#607D8B',
            'biology': '#8BC34A',
            'geography': '#00BCD4',
            'informatics': '#3F51B5',
            'social-science': '#FF5722'
        };

        return subjectColors[subjectId] || '#FF6B9D'; // Дефолтный цвет
    }

    // Получение названия предмета
    getSubjectName(subjectId) {
        const subjectNames = {
            'russian': 'Русский язык',
            'math': 'Математика',
            'literature': 'Литература',
            'english': 'Английский язык',
            'history': 'История',
            'physics': 'Физика',
            'chemistry': 'Химия',
            'biology': 'Биология',
            'geography': 'География',
            'informatics': 'Информатика',
            'social-science': 'Обществознание'
        };

        return subjectNames[subjectId] || subjectId;
    }

    // Получение иконки для темы
    getTopicIcon(topicTitle, subjectId) {
        const title = topicTitle.toLowerCase();

        // Математика
        if (subjectId === 'math') {
            if (title.includes('числа') || title.includes('иррациональн')) return 'numbers';
            if (title.includes('корни') || title.includes('радикал')) return 'functions';
            if (title.includes('тригонометр') || title.includes('синус') || title.includes('косинус')) return 'timeline';
            if (title.includes('производн') || title.includes('дифференциал')) return 'trending_up';
            if (title.includes('интеграл')) return 'calculate';
            if (title.includes('геометр') || title.includes('фигур')) return 'category';
            if (title.includes('алгебр')) return 'exposure';
            return 'school';
        }

        // Физика
        if (subjectId === 'physics') {
            if (title.includes('ньютон') || title.includes('закон') || title.includes('сила')) return 'flash_on';
            if (title.includes('электрич') || title.includes('ток')) return 'bolt';
            if (title.includes('магнит')) return 'explore';
            if (title.includes('оптик') || title.includes('свет')) return 'visibility';
            if (title.includes('термодинамик') || title.includes('тепло')) return 'whatshot';
            return 'science';
        }

        // Химия
        if (subjectId === 'chemistry') {
            if (title.includes('реакци')) return 'science';
            if (title.includes('атом') || title.includes('молекул')) return 'grain';
            if (title.includes('периодическ')) return 'view_module';
            return 'flask'; // или другой подходящий
        }

        // Биология
        if (subjectId === 'biology') {
            if (title.includes('клетк')) return 'blur_circular';
            if (title.includes('эволюци')) return 'rotate_right';
            if (title.includes('экосистем') || title.includes('природ')) return 'nature';
            if (title.includes('генетик')) return 'dna'; // или другой подходящий
            return 'bug_report';
        }

        // Английский
        if (subjectId === 'english') {
            if (title.includes('глагол')) return 'sync';
            if (title.includes('существительн')) return 'title';
            if (title.includes('прилагательн')) return 'format_color_text';
            if (title.includes('present') || title.includes('past')) return 'schedule';
            return 'language';
        }

        // Русский
        if (subjectId === 'russian') {
            if (title.includes('орфограф')) return 'spellcheck';
            if (title.includes('пунктуац')) return 'format_quote';
            if (title.includes('морфолог')) return 'psychology';
            return 'text_fields';
        }

        // Литература
        if (subjectId === 'literature') {
            if (title.includes('поэз') || title.includes('стих')) return 'format_align_center';
            if (title.includes('проза') || title.includes('рассказ')) return 'description';
            if (title.includes('драма') || title.includes('пьес')) return 'theater_comedy';
            return 'menu_book';
        }

        // История
        if (subjectId === 'history') {
            if (title.includes('войн')) return 'local_fire_department';
            if (title.includes('революц')) return 'revolution';
            if (title.includes('культур')) return 'museum';
            return 'history';
        }

        // Дефолтные иконки
        return 'school';
    }

    // Конвертация hex в HSL
    hexToHsl(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return { h: 0, s: 0, l: 0 };

        let r = parseInt(result[1], 16) / 255;
        let g = parseInt(result[2], 16) / 255;
        let b = parseInt(result[3], 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    async init() {
        console.log('🔧 SubjectManager: Starting initialization...');

        // Загружаем конфигурацию предметов
        await this.loadSubjectsConfig();

        // ЗАПРЕЩЕНО загружать контент сразу - только по требованию (ленивая загрузка)
        // await this.loadAllSubjectContent(); // СТРОГО ЗАКОММЕНТИРОВАНО!!!

        console.log('✅ SubjectManager: Initialization completed - NO CONTENT LOADED');
    }

    async loadSubjectsConfig() {
        try {
            const response = await fetch('subjects/subjects-config.json');
            const config = await response.json();
            // Преобразуем массив предметов в объект для удобства доступа
            this.subjectsConfig = config.subjects;
            this.subjects = {}; // Здесь будут храниться загруженные темы
            console.log('✅ Subjects config loaded:', this.subjectsConfig);
        } catch (error) {
            console.error('❌ Error loading subjects config:', error);
        }
    }

    async loadSubjectContent(grade) {
        console.log(`🔄 Loading subject content for grade: ${grade}`);
        this.currentGrade = grade;

        // Загружаем контент для каждого предмета доступного в этом классе
        if (this.subjectsConfig) {
            const loadPromises = [];
            for (const subject of this.subjectsConfig) {
                if (subject.classes && subject.classes.includes(grade)) {
                    console.log(`📚 Loading topics for subject: ${subject.id}, grade: ${grade}`);
                    // Добавляем timeout для каждой загрузки
                    const loadPromise = Promise.race([
                        this.loadSubjectTopics(subject.id, grade),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error(`Timeout loading ${subject.id} for grade ${grade}`)), 10000)
                        )
                    ]);
                    loadPromises.push(loadPromise);
                }
            }

            try {
                await Promise.all(loadPromises);
                console.log(`✅ Subject content loaded for grade: ${grade}`);
            } catch (error) {
                console.error(`❌ Error loading subject content for grade ${grade}:`, error);
            }
        } else {
            console.error('❌ subjectsConfig not loaded');
        }
    }

    async loadAllSubjectContent() {
        if (this.isLoading) {
            console.log('Already loading...');
            return;
        }

        this.isLoading = true;
        console.log('🚀 Starting to load all subject content...');

        if (!this.subjectsConfig) {
            console.error('❌ Subjects config not loaded');
            this.isLoading = false;
            return;
        }

        // Загружаем контент для всех предметов и всех их классов
        const loadPromises = [];
        let totalFiles = 0;

        for (const subject of this.subjectsConfig) {
            const grades = subject.classes || subject.grades || [];
            for (const grade of grades) {
                loadPromises.push(this.loadSubjectTopics(subject.id, grade));
                totalFiles++;
            }
        }

        console.log(`📂 Loading ${totalFiles} topic files...`);

        try {
            await Promise.all(loadPromises);
            this.isLoaded = true;
            console.log('✅ All subject content loaded successfully');

            // Проверим, что загрузилось
            let loadedCount = 0;
            for (const subject of this.subjectsConfig) {
                const grades = subject.classes || subject.grades || [];
                for (const grade of grades) {
                    if (this.subjects[subject.id] && this.subjects[subject.id][grade]) {
                        loadedCount++;
                    }
                }
            }
            console.log(`✅ Successfully loaded ${loadedCount}/${totalFiles} topic files`);

        } catch (error) {
            console.error('❌ Error loading all subject content:', error);
        } finally {
            this.isLoading = false;
        }
    }

    async loadSubjectTopics(subjectId, grade) {
        try {
            const filePath = `subjects/${subjectId}/topics-${grade}.json`;
            console.log(`📂 Attempting to load: ${filePath}`);

            const response = await fetch(filePath);
            console.log(`📡 Response status: ${response.status}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const topicsData = await response.json();
            console.log(`📄 Parsed JSON:`, topicsData);

            // Сохраняем темы для предмета
            if (!this.subjects[subjectId]) {
                this.subjects[subjectId] = {};
            }
            this.subjects[subjectId][grade] = topicsData;

            console.log(`✅ Successfully loaded ${topicsData.topics ? topicsData.topics.length : 0} topics for ${subjectId} grade ${grade}`);
            console.log(`💾 Saved to: this.subjects[${subjectId}][${grade}]`);
        } catch (error) {
            console.error(`❌ Failed to load topics for ${subjectId} grade ${grade}:`, error.message);
            // Создаем пустую структуру, если файл не найден
            if (!this.subjects[subjectId]) {
                this.subjects[subjectId] = {};
            }
            this.subjects[subjectId][grade] = { topics: [] };
            console.log(`📝 Created empty structure for ${subjectId} grade ${grade}`);
        }
    }

    getSubjectInfo(subjectId) {
        console.log('🔍 getSubjectInfo called for:', subjectId);
        console.log('🔍 subjectsConfig:', this.subjectsConfig);
        const subject = this.subjectsConfig.find(subject => subject.id === subjectId);
        console.log('🔍 Found subject:', subject);
        return subject;
    }

    isContentLoaded() {
        return this.isLoaded;
    }

    getTopicsForSubject(subjectId, grade) {
        console.log(`🔍 getTopicsForSubject: subjectId=${subjectId}, grade=${grade}`);
        console.log(`📊 Content loaded: ${this.isLoaded}, Loading: ${this.isLoading}`);
        console.log(`📊 this.subjects structure:`, Object.keys(this.subjects));

        if (this.subjects[subjectId]) {
            console.log(`📊 this.subjects[${subjectId}] grades:`, Object.keys(this.subjects[subjectId]));
            if (this.subjects[subjectId][grade]) {
                const topics = this.subjects[subjectId][grade].topics || [];
                console.log(`📋 Found ${topics.length} topics`);
                return topics;
            } else {
                console.log(`❌ Grade ${grade} not found for subject ${subjectId}`);
            }
        } else {
            console.log(`❌ Subject ${subjectId} not found in subjects`);
        }
        return [];
    }

    getTopic(subjectId, grade, topicId) {
        const topics = this.getTopicsForSubject(subjectId, grade);
        return topics.find(topic => topic.id === topicId);
    }

    async showTopicsList(subjectId, grade) {
        console.log('📚 ========== SHOW TOPICS LIST START ==========');
        console.log('📚 showTopicsList called:', subjectId, grade);
        console.log('✅ SubjectManager loaded and working!');
        console.log('🎯 Using COMPACT LIST DESIGN for all subjects!');
        console.log('🔍 Current state - currentSubject:', this.currentSubject, 'currentGrade:', this.currentGrade);
        console.log('🔍 Navigation available:', !!window.navigation);
        console.log('🔍 Navigation.showScreen:', typeof window.navigation?.showScreen);
        console.log('🔍 Navigation.pushScreen:', typeof window.navigation?.pushScreen);

        // Удаляем существующий экран тем перед созданием нового
        const existingTopicsScreen = document.getElementById('subject-topics-screen');
        if (existingTopicsScreen) {
            existingTopicsScreen.remove();
            console.log('🗑️ Removed existing topics screen');
        }

        // Загружаем контент для предмета, если не загружен
        console.log('🔄 Ensuring content is loaded for:', subjectId, grade);
        await this.loadSubjectContent(grade);

        // Устанавливаем текущий предмет и класс
        this.currentSubject = subjectId;
        this.currentGrade = grade;
        // Сбрасываем текущую тему при открытии нового списка тем
        this.currentTopic = null;

        console.log('📝 Updated state - currentSubject:', this.currentSubject, 'currentGrade:', this.currentGrade, 'currentTopic: null');

        const subjectInfo = this.getSubjectInfo(subjectId);
        const topics = this.getTopicsForSubject(subjectId, grade);

        console.log('Subject info:', subjectInfo);
        console.log('Topics:', topics);
        console.log('🔍 Topics count:', topics ? topics.length : 0);
        console.log('🎨 Rendering compact topic list with search...');

        // Получаем прогресс предмета
        const subjectProgress = window.app ? window.app.getSubjectProgress(subjectId) : 0;

        // Создаем HTML для экрана со списком тем
        const topicsScreenHTML = `
            <div id="subject-topics-screen" class="screen">
                <div class="subject-topics-screen">
                    <div class="subject-header" id="subject-header">
                        <div class="subject-header-content">
                            <button class="back-btn" onclick="window.subjectManager.goBackToSubjects()">
                                <i class="material-icons">arrow_back</i>
                            </button>
                        <div class="subject-info">
                            <div class="subject-title-row">
                                <h1 class="subject-title">${subjectInfo?.name || subjectId} ${grade} класс</h1>
                                <div class="subject-progress-badge">
                                    <i class="material-icons">analytics</i>
                                    <span>${subjectProgress}%</span>
                                </div>
                            </div>
                            <div class="subject-progress-bar">
                                <div class="progress-fill" style="width: ${subjectProgress}%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="topics-container">
                    <div class="topics-list-compact">
                        ${topics && topics.length > 0 ? topics.map((topic, index) => {
                            // Получаем прогресс темы из localStorage или генерируем его
                            const topicProgressKey = `topic_progress_${subjectId}_${topic.id}`;
                            let topicProgress = localStorage.getItem(topicProgressKey);

                            if (topicProgress === null) {
                                // Генерируем прогресс только один раз
                                topicProgress = Math.floor(Math.random() * 101);
                                localStorage.setItem(topicProgressKey, topicProgress.toString());
                            } else {
                                topicProgress = parseInt(topicProgress);
                            }

                            // Определяем, завершена ли тема (100% прогресс)
                            const isCompleted = topicProgress === 100;
                            const completedClass = isCompleted ? 'completed' : '';

                            // Форматируем номер темы с ведущим нулем (01, 02, ...)
                            const topicNumber = String(index + 1).padStart(2, '0');

                            // Генерируем уникальный градиент для темы
                            const topicGradient = this.generateTopicGradient(subjectId, index, topics.length);

                            // Получаем иконку для темы
                            const topicIcon = this.getTopicIcon(topic.title, subjectId);

                            return `
                            <div class="topic-card-minimal ${completedClass}" onclick="window.subjectManager.openTopic('${subjectId}', '${topic.id}')" data-topic-id="${topic.id}" style="--topic-gradient: ${topicGradient};">
                                <div class="topic-header-row">
                                    <div class="topic-number-minimal">${topicNumber}</div>
                                    <div class="topic-title-minimal">${topic.title}</div>
                                </div>
                                <div class="topic-progress-row">
                                    <div class="progress-bar-full">
                                        <div class="progress-fill-full" style="width: ${topicProgress}%; background: ${topicGradient};"></div>
                                    </div>
                                    <div class="progress-text-minimal">${topicProgress}%</div>
                                </div>
                            </div>
                            `;
                        }).join('') : `
                            <div class="empty-state">
                                <div class="empty-icon">
                                    <i class="material-icons">library_books</i>
                                </div>
                                <h3>Темы не найдены</h3>
                                <p>Темы для предмета "${subjectInfo?.name || subjectId}" в ${grade} классе еще не добавлены</p>
                            </div>
                        `}

                        <!-- Поисковая строка -->
                        <div class="bottom-search-container">
                            <div class="search-input-container">
                                <input type="text" class="search-input" placeholder="Поиск 🔍" autocomplete="off" onclick="window.subjectManager.openSearchModal()">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Добавляем экран тем в body (экраны должны быть на уровне body)
        console.log('🔧 Adding topics screen to DOM...');
        document.body.insertAdjacentHTML('beforeend', topicsScreenHTML);
        console.log('✅ Topics screen HTML added to DOM');

        // Используем NavigationManager для перехода на экран тем
        if (window.navigation) {
            window.navigation.pushScreen('subject-topics', { subjectId: subjectId, grade: grade });
            console.log('✅ Topics screen pushed to navigation stack');
        } else {
            console.error('❌ Navigation manager not available');
        }

        // Добавляем экран в стек навигации и переключаемся
        console.log('🔄 Adding topics screen to navigation stack...');
        if (window.navigation && window.navigation.pushScreen) {
            window.navigation.pushScreen('subject-topics', { subjectId: subjectId, grade: grade });
            console.log('✅ Successfully added topics screen to navigation stack');
        } else {
            console.warn('⚠️ Navigation manager not available for pushScreen');
        }

        // Переключаем на экран тем
        console.log('🔄 Switching to topics screen...');
        if (window.navigation && window.navigation.showScreen) {
            window.navigation.showScreen('subject-topics');
            console.log('✅ Successfully switched to topics screen via navigation');
        } else {
            console.error('❌ Navigation manager not available for screen switch');
            // Emergency fallback - прячем все экраны и показываем topics
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
                console.log('🔄 Removed active from screen:', screen.id);
            });
            const topicsScreen = document.getElementById('subject-topics-screen');
            if (topicsScreen) {
                topicsScreen.classList.add('active');
                console.log('✅ Emergency screen switch successful - topics screen is now active');
            } else {
                console.error('❌ subject-topics-screen element not found in DOM!');
            }
        }

        // Инициализируем поисковую функциональность
        setTimeout(() => {
            this.initTopicSearch();
        }, 100);

        console.log('✅ ========== SHOW TOPICS LIST COMPLETED ==========');
        console.log('📚 Topics screen should be visible now');

        // Финальная проверка
        const finalTopicsScreen = document.getElementById('subject-topics-screen');
        console.log('🔍 Final check - topics screen exists:', !!finalTopicsScreen);
        console.log('🔍 Final check - topics screen has active class:', finalTopicsScreen?.classList.contains('active'));
        console.log('🔍 Final check - active screens:', Array.from(document.querySelectorAll('.screen.active')).map(s => s.id));
    }

    goBackToSubjects() {
        console.log('⬅️ goBackToSubjects() called - Going back to subjects screen');

        // Удаляем существующие экраны перед возвратом
        const existingTopicsScreen = document.getElementById('subject-topics-screen');
        const existingLessonScreen = document.getElementById('lesson-screen');
        if (existingTopicsScreen) {
            existingTopicsScreen.remove();
            console.log('🗑️ Removed topics screen');
        }
        if (existingLessonScreen) {
            existingLessonScreen.remove();
            console.log('🗑️ Removed lesson screen');
        }

        // Сбрасываем текущий предмет и тему при возврате к списку предметов
        this.currentSubject = null;
        this.currentTopic = null;
        console.log('🔄 State reset - currentSubject: null, currentTopic: null');

        // Haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }

        // Используем NavigationManager для возврата назад
        if (window.navigation && window.navigation.popScreen) {
            const popped = window.navigation.popScreen();
            if (popped) {
                console.log('✅ Successfully popped screen from navigation stack');
                return;
            }
        }

        // Emergency fallback - если NavigationManager недоступен
        console.log('🚨 Navigation manager not available, using emergency fallback');

        // Удаляем экран тем из DOM
        const topicsScreen = document.getElementById('subject-topics-screen');
        if (topicsScreen) {
            topicsScreen.remove();
            console.log('🗑️ Topics screen removed from DOM');
        }

        // Показываем нижнее меню навигации
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'flex';
        }

        // Также попробуем через navigation manager
        if (window.navigation && window.navigation.showBottomNav) {
            window.navigation.showBottomNav();
        }

        // Возвращаемся к экрану предметов
        if (window.navigation && window.navigation.showScreen) {
            window.navigation.showScreen('subjects');
        } else {
            // Emergency fallback - direct DOM manipulation
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            const subjectsScreen = document.getElementById('subjects-screen');
            if (subjectsScreen) {
                subjectsScreen.classList.add('active');
            }
        }

        // Обновляем отображение предметов
        if (window.app && window.app.updateSubjectsDisplay) {
            window.app.updateSubjectsDisplay();
        }
    }


    openTopic(subjectId, topicId) {
        console.log('🚀 openTopic called:', subjectId, topicId, 'currentGrade:', this.currentGrade);

        // Удаляем существующий экран урока перед созданием нового
        const existingLessonScreen = document.getElementById('lesson-screen');
        if (existingLessonScreen) {
            existingLessonScreen.remove();
            console.log('🗑️ Removed existing lesson screen');
        }

        // Убеждаемся, что текущий предмет установлен правильно
        this.currentSubject = subjectId;
        this.currentTopic = topicId; // Устанавливаем текущую тему
        console.log('📝 Updated currentSubject to:', this.currentSubject, 'currentTopic to:', this.currentTopic);

        const topics = this.getTopicsForSubject(subjectId, this.currentGrade);
        console.log('📋 All topics for subject:', topics);

        const topic = this.getTopic(subjectId, this.currentGrade, topicId);
        console.log('📖 Topic found:', topic);

        if (!topic) {
            console.error('❌ Topic not found:', subjectId, topicId);
            console.error('❌ Available topic IDs:', topics ? topics.map(t => t.id) : 'No topics array');
            console.error('❌ Current grade:', this.currentGrade);
            console.error('❌ Subject ID:', subjectId);

            // Показываем сообщение об ошибке в интерфейсе
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.innerHTML = `
                    <div class="lesson-screen">
                        <div class="lesson-header">
                            <button class="back-btn" onclick="window.subjectManager.goBack()">
                                <i class="material-icons">arrow_back</i>
                            </button>
                            <div class="lesson-info">
                                <h1 class="lesson-title">Ошибка</h1>
                            </div>
                        </div>
                        <div class="lesson-content">
                            <div class="empty-state" style="margin-top: 40px;">
                                <div class="empty-icon">
                                    <i class="material-icons">error</i>
                                </div>
                                <h3>Тема не найдена</h3>
                                <p>Запрашиваемая тема не существует или еще не загружена.</p>
                                <p style="font-size: 14px; color: #94a3b8; margin-top: 8px;">
                                    ID: ${topicId}<br>
                                    Класс: ${this.currentGrade}<br>
                                    Предмет: ${subjectId}
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            }
            return;
        }

        this.currentTopic = topic;
        console.log('💾 Current topic set');

        // Показываем экран урока
        console.log('🎨 Calling showLessonScreen');
        this.showLessonScreen(topic);
    }

    showLessonScreen(topic) {
        console.log('🎯 showLessonScreen called with topic:', topic);

        // Скрываем нижнее меню навигации НЕМЕДЛЕННО
        console.log('🔽 Hiding bottom navigation for lesson screen');
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            console.log('🔽 Found bottom nav element, hiding it');
            bottomNav.style.display = 'none';
        } else {
            console.error('❌ Bottom nav element not found! Searching with different selectors...');
            // Попробуем другие селекторы
            const navById = document.getElementById('bottom-nav');
            const navByTag = document.querySelector('nav');
            console.log('navById:', navById);
            console.log('navByTag:', navByTag);
        }

        // Также попробуем через navigation manager если он доступен
        if (window.navigation && window.navigation.hideBottomNav) {
            console.log('🔽 Also calling navigation.hideBottomNav()');
            window.navigation.hideBottomNav();
        }

        // Создаем красивый HTML для экрана урока
        const lessonHTML = `
            <div id="lesson-screen" class="screen active">
                <div class="lesson-screen">
                <!-- Фиксированный header темы -->
                <div class="topic-fixed-header">
                    <div class="topic-fixed-content">
                        <button class="back-btn" onclick="window.subjectManager.goBack()" style="color: white; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; backdrop-filter: blur(10px);">
                            <i class="material-icons">arrow_back</i>
                        </button>
                        <div class="topic-fixed-title">${topic.title}</div>
                        <div class="topic-fixed-meta">
                            <div class="topic-fixed-meta-item">
                                <i class="material-icons">schedule</i>
                                <span>${topic.estimatedTime} мин</span>
                            </div>
                            <div class="topic-fixed-meta-item">
                                <i class="material-icons">school</i>
                                <span>Теория</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Navigation Tabs -->
                <div class="lesson-nav">
                    <button class="nav-tab active" data-tab="theory">
                        <i class="material-icons">school</i>
                        <span>Теория</span>
                    </button>
                    <button class="nav-tab" data-tab="practice">
                        <i class="material-icons">edit</i>
                        <span>Практика</span>
                    </button>
                    <button class="nav-tab" data-tab="quiz">
                        <i class="material-icons">quiz</i>
                        <span>Тест</span>
                    </button>
                </div>

                <!-- Content Areas -->
                <div class="lesson-content">
                    <!-- Theory Tab -->
                    <div class="content-tab active" id="theory-tab">
                        <div class="tab-header">
                            <h2>Теоретический материал</h2>
                            <p class="tab-description">${topic.description}</p>
                        </div>

                        <div class="theory-content">
                            ${topic.lessons && topic.lessons.length > 0 ?
                                topic.lessons.map((lesson, index) => `
                                    <div class="theory-item" data-lesson-id="${lesson.id || index}" onclick="window.subjectManager.openLesson('${lesson.id || index}')">
                                        <div class="theory-icon">
                                            <i class="material-icons">${lesson.type === 'theory' ? 'school' : 'lightbulb'}</i>
                                        </div>
                                        <div class="theory-content">
                                            <h3>${lesson.title}</h3>
                                            <p>${lesson.content || lesson.description || 'Теоретический материал по данной теме'}</p>
                                            <div class="lesson-meta">
                                                <span class="lesson-duration"><i class="material-icons">schedule</i> ${lesson.duration || 5} мин</span>
                                                <span class="lesson-type">${lesson.type === 'theory' ? 'Теория' : 'Практика'}</span>
                                            </div>
                                        </div>
                                        <div class="theory-action">
                                            <div class="play-indicator">
                                                <i class="material-icons">play_arrow</i>
                                            </div>
                                        </div>
                                    </div>
                                `).join('') :
                                `
                                <div class="empty-state interactive">
                                    <div class="empty-icon animated">
                                        <i class="material-icons">school</i>
                                    </div>
                                    <h3>Теоретический материал</h3>
                                    <p>Теория по теме "${topic.title}" скоро будет добавлена</p>
                                    <div class="coming-soon-container">
                                        <div class="coming-soon-badge pulse">Скоро</div>
                                        <div class="progress-placeholder">
                                            <div class="progress-bar-placeholder">
                                                <div class="progress-fill-placeholder"></div>
                                            </div>
                                            <span class="placeholder-text">Подготовка контента...</span>
                                        </div>
                                    </div>
                                    <div class="empty-actions">
                                        <button class="notify-btn" onclick="this.innerHTML='<i class="material-icons">notifications_active</i> Уведомим'">
                                            <i class="material-icons">notifications</i>
                                            Уведомить о готовности
                                        </button>
                                    </div>
                                </div>
                                `
                            }
                        </div>
                    </div>

                    <!-- Practice Tab -->
                    <div class="content-tab" id="practice-tab">
                        <div class="tab-header">
                            <h2>Практические задания</h2>
                            <p class="tab-description">Закрепите материал с помощью упражнений</p>
                        </div>

                        ${this.renderPracticeSection(topic)}
                    </div>

                    <!-- Quiz Tab -->
                    <div class="content-tab" id="quiz-tab">
                        <div class="tab-header">
                            <h2>Тестирование знаний</h2>
                            <p class="tab-description">Проверьте свои знания по теме</p>
                        </div>

                        <div class="quiz-content">
                            ${topic.quiz && topic.quiz.questions && topic.quiz.questions.length > 0 ?
                                `
                                <div class="quiz-card" onclick="window.subjectManager.startQuiz('${topic.quiz.id || 'default'}')">
                                    <div class="quiz-header">
                                        <div class="quiz-icon">
                                            <i class="material-icons">quiz</i>
                                        </div>
                                        <div class="quiz-info">
                                            <h3>Тест по теме</h3>
                                            <p>${topic.quiz.description || `Проверьте свои знания по теме "${topic.title}"`}</p>
                                        </div>
                                    </div>
                                    <div class="quiz-meta">
                                        <span class="quiz-count">${topic.quiz.questions.length} вопросов</span>
                                        <span class="quiz-time">${topic.quiz.timeLimit || 15} мин</span>
                                    </div>
                                    <div class="quiz-preview">
                                        <div class="preview-item">
                                            <i class="material-icons">help</i>
                                            <span>Разные типы вопросов</span>
                                        </div>
                                        <div class="preview-item">
                                            <i class="material-icons">timer</i>
                                            <span>Ограничение по времени</span>
                                        </div>
                                        <div class="preview-item">
                                            <i class="material-icons">analytics</i>
                                            <span>Подробный разбор</span>
                                        </div>
                                    </div>
                                    <button class="quiz-btn">
                                        <span>Начать тест</span>
                                        <i class="material-icons">play_arrow</i>
                                    </button>
                                </div>
                                ` :
                                `
                                <div class="empty-state interactive">
                                    <div class="empty-icon animated">
                                        <i class="material-icons">quiz</i>
                                    </div>
                                    <h3>Тест по теме</h3>
                                    <p>Тест по теме "${topic.title}" скоро будет добавлен</p>
                                    <div class="coming-soon-container">
                                        <div class="coming-soon-badge pulse">Скоро</div>
                                        <div class="progress-placeholder">
                                            <div class="progress-bar-placeholder">
                                                <div class="progress-fill-placeholder"></div>
                                            </div>
                                            <span class="placeholder-text">Подготовка вопросов...</span>
                                        </div>
                                    </div>
                                    <div class="empty-actions">
                                        <button class="notify-btn" onclick="this.innerHTML='<i class="material-icons">notifications_active</i> Уведомим'">
                                            <i class="material-icons">notifications</i>
                                            Уведомить о готовности
                                        </button>
                                    </div>
                                </div>
                                `
                            }
                        </div>
                    </div>
                </div>
            </div>
            </div>
        `;

        // Добавляем экран урока в main-content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertAdjacentHTML('beforeend', lessonHTML);

            // Инициализируем табы
            this.initLessonTabs();
        }

        // Используем NavigationManager для перехода на экран урока
        if (window.navigation) {
            window.navigation.pushScreen('lesson', { subjectId: this.currentSubject, topicId: topic.id });
            console.log('✅ Lesson screen pushed to navigation stack');
        } else {
            console.error('❌ Navigation manager not available');
        }
    }

    getDifficultyText(difficulty) {
        const texts = {
            'easy': 'Легко',
            'medium': 'Средне',
            'hard': 'Сложно'
        };
        return texts[difficulty] || difficulty;
    }

    getPracticeIcon(type) {
        const icons = {
            'exercises': 'calculate',
            'word-problems': 'description',
            'drill': 'repeat',
            'mixed': 'shuffle'
        };
        return icons[type] || 'assignment';
    }

    // Render practice section with difficulty levels
    renderPracticeSection(topic) {
        // Check if practice has new structure (easy, medium, hard)
        const hasNewStructure = topic.practice && 
            (topic.practice.easy || topic.practice.medium || topic.practice.hard);
        
        if (!hasNewStructure) {
            // Old structure - show empty state
            return `
                <div class="practice-content">
                    <div class="empty-state interactive">
                        <div class="empty-icon animated">
                            <i class="material-icons">edit</i>
                        </div>
                        <h3>Практические задания</h3>
                        <p>Упражнения по теме "${topic.title}" скоро будут добавлены</p>
                        <div class="coming-soon-container">
                            <div class="coming-soon-badge pulse">Скоро</div>
                            <div class="progress-placeholder">
                                <div class="progress-bar-placeholder">
                                    <div class="progress-fill-placeholder"></div>
                                </div>
                                <span class="placeholder-text">Создание заданий...</span>
                            </div>
                        </div>
                        <div class="empty-actions">
                            <button class="notify-btn" onclick="this.innerHTML='<i class=\\"material-icons\\">notifications_active</i> Уведомим'">
                                <i class="material-icons">notifications</i>
                                Уведомить о готовности
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        // New structure - show tabs with difficulty levels
        const hasEasy = topic.practice.easy && topic.practice.easy.length > 0;
        const hasMedium = topic.practice.medium && topic.practice.medium.length > 0;
        const hasHard = topic.practice.hard && topic.practice.hard.length > 0;

        return `
            <div class="practice-content">
                <!-- Difficulty Level Tabs -->
                <div class="practice-difficulty-tabs">
                    ${hasEasy ? `
                        <button class="difficulty-tab easy active" data-difficulty="easy" onclick="window.subjectManager.switchPracticeDifficulty('easy')">
                            <i class="material-icons">fitness_center</i>
                            Легкие
                        </button>
                    ` : ''}
                    ${hasMedium ? `
                        <button class="difficulty-tab medium${!hasEasy ? ' active' : ''}" data-difficulty="medium" onclick="window.subjectManager.switchPracticeDifficulty('medium')">
                            <i class="material-icons">trending_up</i>
                            Средние
                        </button>
                    ` : ''}
                    ${hasHard ? `
                        <button class="difficulty-tab hard${!hasEasy && !hasMedium ? ' active' : ''}" data-difficulty="hard" onclick="window.subjectManager.switchPracticeDifficulty('hard')">
                            <span class="lock-indicator">
                                <i class="material-icons">${window.subscriptionManager?.isPremium ? 'whatshot' : 'lock'}</i>
                                Сложные
                            </span>
                        </button>
                    ` : ''}
                </div>

                <!-- Easy Problems -->
                ${hasEasy ? `
                    <div class="difficulty-problems active" data-difficulty="easy">
                        ${topic.practice.easy.map((practice, index) => this.renderPracticeCard(practice, 'easy')).join('')}
                    </div>
                ` : ''}

                <!-- Medium Problems -->
                ${hasMedium ? `
                    <div class="difficulty-problems${!hasEasy ? ' active' : ''}" data-difficulty="medium">
                        ${topic.practice.medium.map((practice, index) => this.renderPracticeCard(practice, 'medium')).join('')}
                    </div>
                ` : ''}

                <!-- Hard Problems (Premium) -->
                ${hasHard ? `
                    <div class="difficulty-problems${!hasEasy && !hasMedium ? ' active' : ''}" data-difficulty="hard">
                        ${topic.practice.hard.map((practice, index) => this.renderPracticeCard(practice, 'hard')).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Render individual practice card
    renderPracticeCard(practice, difficulty) {
        const isPremium = practice.isPremium || false;
        const hasAccess = !isPremium || (window.subscriptionManager && window.subscriptionManager.isPremium);
        const isLocked = isPremium && !hasAccess;

        const difficultyColors = {
            easy: '#10b981',
            medium: '#f59e0b',
            hard: '#ef4444'
        };

        const difficultyLabels = {
            easy: 'Легкая',
            medium: 'Средняя',
            hard: 'Сложная'
        };

        return `
            <div class="practice-problem-card${isLocked ? ' locked' : ''}" 
                 onclick="${isLocked ? 'window.subscriptionManager.showPremiumLock(\'Сложные задачи\')' : `window.subjectManager.startPractice('${practice.id}')`}">
                ${isLocked ? `
                    <div class="problem-lock-badge">
                        <i class="material-icons">lock</i>
                        Premium
                    </div>
                ` : ''}
                <div class="practice-header">
                    <div class="practice-icon" style="background: linear-gradient(135deg, ${difficultyColors[difficulty]}, ${difficultyColors[difficulty]}dd);">
                        <i class="material-icons">${this.getPracticeIcon(practice.type)}</i>
                    </div>
                    <div class="practice-info">
                        <h3>${practice.title}</h3>
                        <p>${practice.description}</p>
                    </div>
                </div>
                <div class="practice-meta" style="display: flex; align-items: center; gap: 12px;">
                    <span class="practice-count" style="color: ${difficultyColors[difficulty]}; font-weight: 600;">
                        <i class="material-icons" style="font-size: 16px;">assignment</i>
                        ${practice.count || 0} заданий
                    </span>
                    <span class="difficulty ${difficulty}" style="background: ${difficultyColors[difficulty]}15; color: ${difficultyColors[difficulty]}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                        ${difficultyLabels[difficulty]}
                    </span>
                </div>
                <button class="practice-btn" style="${isLocked ? 'opacity: 0.5;' : ''}">
                    <span>${isLocked ? 'Требуется Premium' : 'Начать практику'}</span>
                    <i class="material-icons">${isLocked ? 'lock' : 'arrow_forward'}</i>
                </button>
            </div>
        `;
    }

    // Switch practice difficulty tab
    switchPracticeDifficulty(difficulty) {
        // Check if hard difficulty requires premium
        if (difficulty === 'hard' && window.subscriptionManager && !window.subscriptionManager.isPremium) {
            window.subscriptionManager.showPremiumLock('Сложные задачи');
            return;
        }

        // Update active tab
        document.querySelectorAll('.difficulty-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.difficulty-tab[data-difficulty="${difficulty}"]`)?.classList.add('active');

        // Update active problems
        document.querySelectorAll('.difficulty-problems').forEach(problems => {
            problems.classList.remove('active');
        });
        document.querySelector(`.difficulty-problems[data-difficulty="${difficulty}"]`)?.classList.add('active');

        // Haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    }

    getDifficultyIcon(difficulty) {
        const icons = {
            'easy': 'sentiment_satisfied',
            'medium': 'sentiment_neutral',
            'hard': 'sentiment_dissatisfied'
        };
        return icons[difficulty] || 'sentiment_neutral';
    }

    getDifficultyText(difficulty) {
        const texts = {
            'easy': 'Легко',
            'medium': 'Средне',
            'hard': 'Сложно'
        };
        return texts[difficulty] || 'Средне';
    }

    initLessonTabs() {
        const navTabs = document.querySelectorAll('.nav-tab');
        const contentTabs = document.querySelectorAll('.content-tab');

        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;

                // Убираем активный класс со всех табов
                navTabs.forEach(t => t.classList.remove('active'));
                contentTabs.forEach(c => c.classList.remove('active'));

                // Добавляем активный класс выбранному табу
                tab.classList.add('active');
                document.getElementById(`${tabName}-tab`).classList.add('active');

                // Haptic feedback
                if (window.Telegram?.WebApp?.HapticFeedback) {
                    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                }
            });
        });
    }

    openLesson(lessonId) {
        console.log('🎯 Opening lesson:', lessonId);
        // Имитация открытия урока
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }

        // В реальном приложении здесь будет открытие конкретного урока
        // Пока просто показываем уведомление
        if (window.app && window.app.showMessage) {
            window.app.showMessage('Урок скоро будет открыт! 📖');
        }
    }

    startPractice(practiceId) {
        console.log('🎯 Starting practice:', practiceId);
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }

        if (window.app && window.app.showMessage) {
            window.app.showMessage('Практика скоро будет доступна! ✏️');
        }
    }

    startQuiz(quizId) {
        console.log('🎯 Starting quiz:', quizId);
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }

        if (window.app && window.app.showMessage) {
            window.app.showMessage('Тест скоро будет доступен! 🧠');
        }
    }


    goBack() {
        console.log('⬅️ Going back from lesson screen');

        // Удаляем существующий экран урока
        const existingLessonScreen = document.getElementById('lesson-screen');
        if (existingLessonScreen) {
            existingLessonScreen.remove();
            console.log('🗑️ Removed lesson screen');
        }

        // Сбрасываем текущую тему при возврате к списку тем
        this.currentTopic = null;
        console.log('🔄 currentTopic reset to null, currentSubject remains:', this.currentSubject);

        // Haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }

        // Используем NavigationManager для возврата назад
        if (window.navigation && window.navigation.popScreen) {
            const popped = window.navigation.popScreen();
            if (popped) {
                console.log('✅ Successfully popped screen from navigation stack');
                return;
            }
        }

        // Emergency fallback - если NavigationManager недоступен
        console.log('🚨 Navigation manager not available, using emergency fallback');

        // Удаляем экран урока из DOM
        const lessonScreen = document.getElementById('lesson-screen');
        if (lessonScreen) {
            lessonScreen.remove();
            console.log('🗑️ Lesson screen removed from DOM');
        }

        // Показываем экран тем (он должен быть уже в DOM)
        const topicsScreen = document.getElementById('subject-topics-screen');
        if (topicsScreen) {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            topicsScreen.classList.add('active');
            console.log('✅ Returned to topics screen');
        } else {
            // Fallback - возвращаемся к списку тем
            console.log('⚠️ Topics screen not found, recreating...');
            if (this.currentSubject && this.currentGrade) {
                this.showTopicsList(this.currentSubject, this.currentGrade);
            } else {
                // Emergency fallback to subjects screen
                this.goBackToSubjects();
            }
        }
    }

    openLesson(lessonId) {
        const lesson = this.currentTopic.lessons.find(l => l.id === lessonId);
        if (lesson) {
            this.showLessonContent(lesson);
        }
    }

    showLessonContent(lesson) {
        const lessonHTML = `
            <div class="lesson-detail-screen">
                <div class="lesson-header">
                    <button class="back-btn" onclick="subjectManager.showLessonScreen(subjectManager.currentTopic)">
                        <i class="material-icons">arrow_back</i>
                    </button>
                    <h1>${lesson.title}</h1>
                </div>

                <div class="lesson-content">
                    <div class="lesson-text">
                        ${lesson.content}
                    </div>

                    <div class="lesson-actions">
                        <button class="btn btn-secondary" onclick="subjectManager.markLessonComplete('${lesson.id}')">
                            <i class="material-icons">check</i>
                            Завершить урок
                        </button>
                    </div>
                </div>
            </div>
        `;

        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = lessonHTML;
    }

    startQuiz(quizId) {
        // Логика для запуска теста
        app.showMessage('Тест скоро будет доступен!');
    }

    markLessonComplete(lessonId) {
        // Сохраняем прогресс урока
        const progressKey = `lesson_${this.currentTopic.id}_${lessonId}`;
        localStorage.setItem(progressKey, 'completed');

        // Обновляем общий прогресс предмета
        this.updateSubjectProgress(this.currentTopic.subjectId);

        app.showMessage('Урок завершен! 🎉');
    }

    updateSubjectProgress(subjectId) {
        // Пересчитываем прогресс предмета
        app.updateProgressDisplay();
    }

    initTopicSearch() {
        console.log('🔍 Initializing topic search...');
        const searchInput = document.getElementById('topic-search');
        const searchHint = document.getElementById('search-hint');
        
        if (!searchInput || !searchHint) {
            console.log('❌ Search elements not found!');
            return;
        }
        console.log('✅ Search input found, initializing search...');

        // Сохраняем оригинальный список тем с их данными
        this.allTopics = Array.from(document.querySelectorAll('.topic-item-compact'));
        console.log('📋 Found topics:', this.allTopics.length);

        // Извлекаем полные данные тем для глубокого поиска
        this.topicsSearchData = this.allTopics.map((item, index) => {
            const topicId = item.dataset.topicId;
            const topic = this.getTopicsForSubject(this.currentSubject, this.currentGrade).find(t => t.id === topicId);
            
            return {
                element: item,
                index: index,
                title: item.querySelector('.topic-title-compact').textContent.toLowerCase(),
                description: topic?.description?.toLowerCase() || '',
                lessons: topic?.lessons?.map(l => `${l.title} ${l.content || l.description || ''}`).join(' ').toLowerCase() || '',
                practice: topic?.practice?.map(p => `${p.title} ${p.description || ''}`).join(' ').toLowerCase() || '',
                quiz: topic?.quiz ? `${topic.quiz.description || ''} ${topic.quiz.questions?.map(q => q.question).join(' ') || ''}`.toLowerCase() : ''
            };
        });

        console.log('📊 Search data prepared for', this.topicsSearchData.length, 'topics');

        // Функция подсветки текста
        const highlightText = (text, searchTerm) => {
            if (!searchTerm) return text;
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            return text.replace(regex, '<span class="highlight-search">$1</span>');
        };

        // Функция удаления подсветки
        const removeHighlight = () => {
            document.querySelectorAll('.highlight-search').forEach(el => {
                const parent = el.parentNode;
                parent.replaceChild(document.createTextNode(el.textContent), el);
                parent.normalize();
            });
        };

        // Обработчик поиска
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            console.log('🔎 Search for:', searchTerm);

            // Удаляем предыдущую подсветку
            removeHighlight();

            // Показываем/скрываем подсказку
            if (searchTerm === '' || searchTerm.length < 3) {
                searchHint.classList.remove('hidden');
                
                // Показываем все темы
                this.topicsSearchData.forEach((data) => {
                    data.element.style.display = 'flex';
                });
                return;
            }

            // Скрываем подсказку при активном поиске
            searchHint.classList.add('hidden');

            console.log('🔍 Performing search...');
            let matchCount = 0;

            // Поиск по всем данным темы
            this.topicsSearchData.forEach((data) => {
                // Проверяем соответствие по всем полям
                const titleMatch = data.title.includes(searchTerm);
                const descMatch = data.description.includes(searchTerm);
                const lessonsMatch = data.lessons.includes(searchTerm);
                const practiceMatch = data.practice.includes(searchTerm);
                const quizMatch = data.quiz.includes(searchTerm);

                const isMatch = titleMatch || descMatch || lessonsMatch || practiceMatch || quizMatch;

                if (isMatch) {
                    matchCount++;
                    data.element.style.display = 'flex';
                    
                    // Подсвечиваем найденный текст в заголовке
                    if (titleMatch) {
                        const titleElement = data.element.querySelector('.topic-title-compact');
                        titleElement.innerHTML = highlightText(titleElement.textContent, searchTerm);
                    }
                } else {
                    data.element.style.display = 'none';
                }
            });

            console.log(`✅ Search complete: ${matchCount} matches found`);

            // Haptic feedback
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
        });

        // Очистка при потере фокуса
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                if (searchInput.value.trim() === '') {
                    removeHighlight();
                    searchHint.classList.remove('hidden');
                }
            }, 200);
        });

        console.log('✅ Search initialized successfully!');
    }

    openSearchModal() {
        console.log('🔍 Opening fullscreen search modal...');

        // Создаем полноэкранное модальное окно поиска
        const searchModalHTML = `
            <div id="search-modal" class="search-modal-fullscreen" role="dialog" aria-modal="true" aria-labelledby="search-modal-title">
                <div class="search-modal-header">
                    <div class="search-input-container-full">
                        <button class="search-back-btn" onclick="window.subjectManager.closeSearchModal()" aria-label="Закрыть поиск">
                            <i class="material-icons">arrow_back</i>
                        </button>
                        <input type="text" id="search-modal-input" class="search-input-full" placeholder="Поиск тем, теории, практики..." autocomplete="off" autofocus aria-label="Поиск">
                        <button class="search-clear-btn" onclick="document.getElementById('search-modal-input').value=''; window.subjectManager.performSearch()" aria-label="Очистить поиск">
                            <i class="material-icons">clear</i>
                        </button>
                    </div>
                </div>

                <div class="search-modal-content">
                    <div class="search-filters" role="tablist" aria-label="Фильтры поиска">
                        <button class="search-filter active" data-filter="all" onclick="window.subjectManager.setSearchFilter('all')" role="tab" aria-selected="true">
                            <i class="material-icons">search</i>
                            Все
                        </button>
                        <button class="search-filter" data-filter="title" onclick="window.subjectManager.setSearchFilter('title')" role="tab" aria-selected="false">
                            <i class="material-icons">book</i>
                            Темы
                        </button>
                        <button class="search-filter" data-filter="theory" onclick="window.subjectManager.setSearchFilter('theory')" role="tab" aria-selected="false">
                            <i class="material-icons">school</i>
                            Теория
                        </button>
                        <button class="search-filter" data-filter="practice" onclick="window.subjectManager.setSearchFilter('practice')" role="tab" aria-selected="false">
                            <i class="material-icons">edit</i>
                            Практика
                        </button>
                    </div>

                    <div id="search-results" class="search-results-full" role="region" aria-label="Результаты поиска">
                        <div class="search-placeholder" id="search-placeholder">
                            <div class="search-placeholder-icon">
                                <i class="material-icons">search</i>
                            </div>
                            <h3 id="search-modal-title">Начните поиск</h3>
                            <p>Введите название темы, теории или практики</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Добавляем полноэкранное модальное окно
        document.body.insertAdjacentHTML('beforeend', searchModalHTML);

        // Сохраняем предыдущий активный элемент для фокуса
        this.previousActiveElement = document.activeElement;

        // Фокус на поле ввода и установка обработчиков
        setTimeout(() => {
            const modal = document.getElementById('search-modal');
            const input = document.getElementById('search-modal-input');

            if (modal && input) {
                // Обработчик клика вне модального окна
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.closeSearchModal();
                    }
                });

                // Фокус на поле ввода
                input.focus();

                // Обработчик ввода
                input.addEventListener('input', (e) => {
                    this.performSearch();
                });

                // Обработчик клавиш
                // Обработчик клавиш для поля ввода
                const handleKeyDown = (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.performSearch();
                    }
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        this.closeSearchModal();
                    }
                };

                input.addEventListener('keydown', handleKeyDown);

                // Обработчик для мобильных устройств (виртуальная клавиатура)
                if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.onEvent('viewportChanged', () => {
                        setTimeout(() => input.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                    });
                }
            }
        }, 100);

        // Предотвращаем прокрутку основного контента
        document.body.style.overflow = 'hidden';

        console.log('✅ Search modal opened');
    }

    closeSearchModal() {
        console.log('🔍 Closing search modal...');
        const modal = document.getElementById('search-modal');

        if (modal) {
            modal.classList.add('closing');

            // Восстанавливаем прокрутку основного контента
            document.body.style.overflow = '';

            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }

                // Восстанавливаем фокус на предыдущий элемент
                if (this.previousActiveElement && this.previousActiveElement.focus) {
                    this.previousActiveElement.focus();
                }

                this.previousActiveElement = null;
            }, 300);
        }
        console.log('✅ Search modal closed');
    }

    setSearchFilter(filter) {
        console.log('🔍 Setting search filter:', filter);

        // Обновляем активный фильтр
        document.querySelectorAll('.search-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        this.currentSearchFilter = filter;
        this.performSearch();
    }

    performSearch() {
        const query = document.getElementById('search-modal-input')?.value?.toLowerCase().trim() || '';
        console.log('🔍 Performing search:', query, 'filter:', this.currentSearchFilter || 'all');

        const resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) return;

        if (query.length < 2) {
            resultsContainer.innerHTML = `
                <div class="search-placeholder">
                    <div class="search-placeholder-icon">
                        <i class="material-icons">search</i>
                    </div>
                    <h3>Введите запрос</h3>
                    <p>Начните вводить название темы, теории или практики</p>
                </div>
            `;
            return;
        }

        // Имитируем поиск (в реальном приложении здесь будет поиск по контенту)
        const mockResults = [
            { type: 'title', title: 'Иррациональные числа', subject: 'math', grade: 8, description: 'Понятие иррационального числа, десятичные приближения' },
            { type: 'title', title: 'Квадратные корни', subject: 'math', grade: 8, description: 'Арифметический квадратный корень, свойства корней' },
            { type: 'title', title: 'Тригонометрия', subject: 'math', grade: 8, description: 'Основы тригонометрии, синус, косинус, тангенс' },
            { type: 'title', title: 'Производные', subject: 'math', grade: 9, description: 'Понятие производной, правила дифференцирования' },
            { type: 'title', title: 'Глаголы', subject: 'english', grade: 5, description: 'Формы глаголов в английском языке' },
            { type: 'title', title: 'Химические реакции', subject: 'chemistry', grade: 8, description: 'Типы химических реакций и их признаки' },
            { type: 'theory', title: 'Свойства квадратных корней', subject: 'math', grade: 8, description: 'Теоретические основы работы с корнями' },
            { type: 'practice', title: 'Решение уравнений с корнями', subject: 'math', grade: 8, description: 'Практические задания по коренным уравнениям' },
            { type: 'practice', title: 'Тригонометрические тождества', subject: 'math', grade: 9, description: 'Упражнения на применение тригонометрических формул' }
        ];

        const filteredResults = mockResults.filter(item => {
            const matchesQuery = item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
            const matchesFilter = !this.currentSearchFilter || this.currentSearchFilter === 'all' || item.type === this.currentSearchFilter;

            return matchesQuery && matchesFilter;
        });

        if (filteredResults.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-placeholder">
                    <div class="search-placeholder-icon">
                        <i class="material-icons">search_off</i>
                    </div>
                    <h3>Ничего не найдено</h3>
                    <p>Попробуйте изменить запрос или выбрать другой фильтр</p>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = filteredResults.map((result, index) => {
                const resultGradient = this.generateTopicGradient(result.subject, index, filteredResults.length);
                const subjectName = this.getSubjectName(result.subject);

                return `
                <div class="search-result-item" onclick="window.subjectManager.selectSearchResult('${result.type}', '${result.title}')" style="--result-gradient: ${resultGradient};">
                    <div class="search-result-icon" style="background: ${resultGradient};">
                        <i class="material-icons">${result.type === 'title' ? 'book' : result.type === 'theory' ? 'school' : 'edit'}</i>
                    </div>
                    <div class="search-result-content">
                        <div class="search-result-title">${result.title}</div>
                        <div class="search-result-meta">${subjectName} • ${result.grade} класс • ${result.type === 'title' ? 'Тема' : result.type === 'theory' ? 'Теория' : 'Практика'}</div>
                        <div class="search-result-description">${result.description}</div>
                    </div>
                    <div class="search-result-arrow">
                        <i class="material-icons">arrow_forward</i>
                    </div>
                </div>
            `}).join('');
        }

        console.log('✅ Search completed, found:', filteredResults.length, 'results');
    }

    selectSearchResult(type, title) {
        console.log('🎯 Selected search result:', type, title);

        // Закрываем модальное окно поиска
        this.closeSearchModal();

        // Имитируем переход к результату
        if (window.app && window.app.showMessage) {
            const typeText = type === 'title' ? 'теме' : type === 'theory' ? 'теории' : 'практике';
            window.app.showMessage(`Открываем ${typeText}: ${title}`, 'info');

            // Имитируем загрузку контента
            setTimeout(() => {
                window.app.showMessage(`Добро пожаловать в "${title}"! Контент загружается...`, 'success');
            }, 800);
        }

        // Добавляем haptic feedback для Telegram
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }
    }

}

// Initialize subject manager
window.subjectManager = new SubjectManager();
window.subjectManager = new SubjectManager();