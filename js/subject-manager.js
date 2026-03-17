// Subject Manager Class - ╤Г╨┐╤А╨░╨▓╨╗╨╡╨╜╨╕╨╡ ╨║╨╛╨╜╤В╨╡╨╜╤В╨╛╨╝ ╨┐╤А╨╡╨┤╨╝╨╡╤В╨╛╨▓
// Version: v=13.0
console.log('ЁЯЪА SubjectManager.js loaded successfully!');

class SubjectManager {
    constructor() {
        this.subjects = {};
        this.subjectsConfig = null;
        this.currentSubject = null;
        this.currentGrade = null;
        this.currentTopic = null;
        this.isLoading = false;
        this.isLoaded = false;
        this.allTopics = []; // ╨е╤А╨░╨╜╨╕╨╝ ╨▓╤Б╨╡ ╤В╨╡╨╝╤Л ╨┤╨╗╤П ╨┐╨╛╨╕╤Б╨║╨░
    }

    // ╨У╨╡╨╜╨╡╤А╨░╤Ж╨╕╤П ╤Г╨╜╨╕╨║╨░╨╗╤М╨╜╨╛╨│╨╛ ╨│╤А╨░╨┤╨╕╨╡╨╜╤В╨░ ╨┤╨╗╤П ╤В╨╡╨╝╤Л
    generateTopicGradient(subjectId, topicIndex, totalTopics) {
        const subjectColor = this.getSubjectColor(subjectId);
        const baseHue = this.hexToHsl(subjectColor);

        // ╨б╨╛╨╖╨┤╨░╨╡╨╝ ╨▓╨░╤А╨╕╨░╤Ж╨╕╨╕ ╨╜╨░ ╨╛╤Б╨╜╨╛╨▓╨╡ ╨╕╨╜╨┤╨╡╨║╤Б╨░ ╤В╨╡╨╝╤Л
        const hueVariation = (topicIndex * 25) % 50; // ╨Т╨░╤А╤М╨╕╤А╤Г╨╡╨╝ ╨╛╤В╤В╨╡╨╜╨╛╨║
        const saturationVariation = 80 + (topicIndex % 4) * 5; // ╨Т╨░╤А╤М╨╕╤А╤Г╨╡╨╝ ╨╜╨░╤Б╤Л╤Й╨╡╨╜╨╜╨╛╤Б╤В╤М
        const lightnessVariation = 50 + (topicIndex % 3) * 8; // ╨Т╨░╤А╤М╨╕╤А╤Г╨╡╨╝ ╤П╤А╨║╨╛╤Б╤В╤М

        const hue = (baseHue.h + hueVariation) % 360;
        const saturation = Math.min(100, saturationVariation);
        const lightness = lightnessVariation;

        const color1 = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        const color2 = `hsl(${(hue + 15) % 360}, ${saturation - 5}%, ${lightness + 8}%)`;

        return `linear-gradient(135deg, ${color1}, ${color2})`;
    }

    // ╨Я╨╛╨╗╤Г╤З╨╡╨╜╨╕╨╡ ╤Ж╨▓╨╡╤В╨░ ╨┐╤А╨╡╨┤╨╝╨╡╤В╨░
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

        return subjectColors[subjectId] || '#FF6B9D'; // ╨Ф╨╡╤Д╨╛╨╗╤В╨╜╤Л╨╣ ╤Ж╨▓╨╡╤В
    }

    // ╨Я╨╛╨╗╤Г╤З╨╡╨╜╨╕╨╡ ╨╜╨░╨╖╨▓╨░╨╜╨╕╤П ╨┐╤А╨╡╨┤╨╝╨╡╤В╨░
    getSubjectName(subjectId) {
        const subjectNames = {
            'russian': '╨а╤Г╤Б╤Б╨║╨╕╨╣ ╤П╨╖╤Л╨║',
            'math': '╨Ь╨░╤В╨╡╨╝╨░╤В╨╕╨║╨░',
            'literature': '╨Ы╨╕╤В╨╡╤А╨░╤В╤Г╤А╨░',
            'english': '╨Р╨╜╨│╨╗╨╕╨╣╤Б╨║╨╕╨╣ ╤П╨╖╤Л╨║',
            'history': '╨Ш╤Б╤В╨╛╤А╨╕╤П',
            'physics': '╨д╨╕╨╖╨╕╨║╨░',
            'chemistry': '╨е╨╕╨╝╨╕╤П',
            'biology': '╨С╨╕╨╛╨╗╨╛╨│╨╕╤П',
            'geography': '╨У╨╡╨╛╨│╤А╨░╤Д╨╕╤П',
            'informatics': '╨Ш╨╜╤Д╨╛╤А╨╝╨░╤В╨╕╨║╨░',
            'social-science': '╨Ю╨▒╤Й╨╡╤Б╤В╨▓╨╛╨╖╨╜╨░╨╜╨╕╨╡'
        };

        return subjectNames[subjectId] || subjectId;
    }

    // ╨Я╨╛╨╗╤Г╤З╨╡╨╜╨╕╨╡ ╨╕╨║╨╛╨╜╨║╨╕ ╨┤╨╗╤П ╤В╨╡╨╝╤Л
    getTopicIcon(topicTitle, subjectId) {
        const title = topicTitle.toLowerCase();

        // ╨Ь╨░╤В╨╡╨╝╨░╤В╨╕╨║╨░
        if (subjectId === 'math') {
            if (title.includes('╤З╨╕╤Б╨╗╨░') || title.includes('╨╕╤А╤А╨░╤Ж╨╕╨╛╨╜╨░╨╗╤М╨╜')) return 'numbers';
            if (title.includes('╨║╨╛╤А╨╜╨╕') || title.includes('╤А╨░╨┤╨╕╨║╨░╨╗')) return 'functions';
            if (title.includes('╤В╤А╨╕╨│╨╛╨╜╨╛╨╝╨╡╤В╤А') || title.includes('╤Б╨╕╨╜╤Г╤Б') || title.includes('╨║╨╛╤Б╨╕╨╜╤Г╤Б')) return 'timeline';
            if (title.includes('╨┐╤А╨╛╨╕╨╖╨▓╨╛╨┤╨╜') || title.includes('╨┤╨╕╤Д╤Д╨╡╤А╨╡╨╜╤Ж╨╕╨░╨╗')) return 'trending_up';
            if (title.includes('╨╕╨╜╤В╨╡╨│╤А╨░╨╗')) return 'calculate';
            if (title.includes('╨│╨╡╨╛╨╝╨╡╤В╤А') || title.includes('╤Д╨╕╨│╤Г╤А')) return 'category';
            if (title.includes('╨░╨╗╨│╨╡╨▒╤А')) return 'exposure';
            return 'school';
        }

        // ╨д╨╕╨╖╨╕╨║╨░
        if (subjectId === 'physics') {
            if (title.includes('╨╜╤М╤О╤В╨╛╨╜') || title.includes('╨╖╨░╨║╨╛╨╜') || title.includes('╤Б╨╕╨╗╨░')) return 'flash_on';
            if (title.includes('╤Н╨╗╨╡╨║╤В╤А╨╕╤З') || title.includes('╤В╨╛╨║')) return 'bolt';
            if (title.includes('╨╝╨░╨│╨╜╨╕╤В')) return 'explore';
            if (title.includes('╨╛╨┐╤В╨╕╨║') || title.includes('╤Б╨▓╨╡╤В')) return 'visibility';
            if (title.includes('╤В╨╡╤А╨╝╨╛╨┤╨╕╨╜╨░╨╝╨╕╨║') || title.includes('╤В╨╡╨┐╨╗╨╛')) return 'whatshot';
            return 'science';
        }

        // ╨е╨╕╨╝╨╕╤П
        if (subjectId === 'chemistry') {
            if (title.includes('╤А╨╡╨░╨║╤Ж╨╕')) return 'science';
            if (title.includes('╨░╤В╨╛╨╝') || title.includes('╨╝╨╛╨╗╨╡╨║╤Г╨╗')) return 'grain';
            if (title.includes('╨┐╨╡╤А╨╕╨╛╨┤╨╕╤З╨╡╤Б╨║')) return 'view_module';
            return 'flask'; // ╨╕╨╗╨╕ ╨┤╤А╤Г╨│╨╛╨╣ ╨┐╨╛╨┤╤Е╨╛╨┤╤П╤Й╨╕╨╣
        }

        // ╨С╨╕╨╛╨╗╨╛╨│╨╕╤П
        if (subjectId === 'biology') {
            if (title.includes('╨║╨╗╨╡╤В╨║')) return 'blur_circular';
            if (title.includes('╤Н╨▓╨╛╨╗╤О╤Ж╨╕')) return 'rotate_right';
            if (title.includes('╤Н╨║╨╛╤Б╨╕╤Б╤В╨╡╨╝') || title.includes('╨┐╤А╨╕╤А╨╛╨┤')) return 'nature';
            if (title.includes('╨│╨╡╨╜╨╡╤В╨╕╨║')) return 'dna'; // ╨╕╨╗╨╕ ╨┤╤А╤Г╨│╨╛╨╣ ╨┐╨╛╨┤╤Е╨╛╨┤╤П╤Й╨╕╨╣
            return 'bug_report';
        }

        // ╨Р╨╜╨│╨╗╨╕╨╣╤Б╨║╨╕╨╣
        if (subjectId === 'english') {
            if (title.includes('╨│╨╗╨░╨│╨╛╨╗')) return 'sync';
            if (title.includes('╤Б╤Г╤Й╨╡╤Б╤В╨▓╨╕╤В╨╡╨╗╤М╨╜')) return 'title';
            if (title.includes('╨┐╤А╨╕╨╗╨░╨│╨░╤В╨╡╨╗╤М╨╜')) return 'format_color_text';
            if (title.includes('present') || title.includes('past')) return 'schedule';
            return 'language';
        }

        // ╨а╤Г╤Б╤Б╨║╨╕╨╣
        if (subjectId === 'russian') {
            if (title.includes('╨╛╤А╤Д╨╛╨│╤А╨░╤Д')) return 'spellcheck';
            if (title.includes('╨┐╤Г╨╜╨║╤В╤Г╨░╤Ж')) return 'format_quote';
            if (title.includes('╨╝╨╛╤А╤Д╨╛╨╗╨╛╨│')) return 'psychology';
            return 'text_fields';
        }

        // ╨Ы╨╕╤В╨╡╤А╨░╤В╤Г╤А╨░
        if (subjectId === 'literature') {
            if (title.includes('╨┐╨╛╤Н╨╖') || title.includes('╤Б╤В╨╕╤Е')) return 'format_align_center';
            if (title.includes('╨┐╤А╨╛╨╖╨░') || title.includes('╤А╨░╤Б╤Б╨║╨░╨╖')) return 'description';
            if (title.includes('╨┤╤А╨░╨╝╨░') || title.includes('╨┐╤М╨╡╤Б')) return 'theater_comedy';
            return 'menu_book';
        }

        // ╨Ш╤Б╤В╨╛╤А╨╕╤П
        if (subjectId === 'history') {
            if (title.includes('╨▓╨╛╨╣╨╜')) return 'local_fire_department';
            if (title.includes('╤А╨╡╨▓╨╛╨╗╤О╤Ж')) return 'revolution';
            if (title.includes('╨║╤Г╨╗╤М╤В╤Г╤А')) return 'museum';
            return 'history';
        }

        // ╨Ф╨╡╤Д╨╛╨╗╤В╨╜╤Л╨╡ ╨╕╨║╨╛╨╜╨║╨╕
        return 'school';
    }

    // ╨Ъ╨╛╨╜╨▓╨╡╤А╤В╨░╤Ж╨╕╤П hex ╨▓ HSL
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
        console.log('ЁЯФз SubjectManager: Starting initialization...');

        // ╨Ч╨░╨│╤А╤Г╨╢╨░╨╡╨╝ ╨║╨╛╨╜╤Д╨╕╨│╤Г╤А╨░╤Ж╨╕╤О ╨┐╤А╨╡╨┤╨╝╨╡╤В╨╛╨▓
        await this.loadSubjectsConfig();

        // ╨Ч╨Р╨Я╨а╨Х╨й╨Х╨Э╨Ю ╨╖╨░╨│╤А╤Г╨╢╨░╤В╤М ╨║╨╛╨╜╤В╨╡╨╜╤В ╤Б╤А╨░╨╖╤Г - ╤В╨╛╨╗╤М╨║╨╛ ╨┐╨╛ ╤В╤А╨╡╨▒╨╛╨▓╨░╨╜╨╕╤О (╨╗╨╡╨╜╨╕╨▓╨░╤П ╨╖╨░╨│╤А╤Г╨╖╨║╨░)
        // await this.loadAllSubjectContent(); // ╨б╨в╨а╨Ю╨У╨Ю ╨Ч╨Р╨Ъ╨Ю╨Ь╨Ь╨Х╨Э╨в╨Ш╨а╨Ю╨Т╨Р╨Э╨Ю!!!

        console.log('тЬЕ SubjectManager: Initialization completed - NO CONTENT LOADED');
    }

    async loadSubjectsConfig() {
        try {
            const response = await fetch('subjects/subjects-config.json');
            const config = await response.json();
            // ╨Я╤А╨╡╨╛╨▒╤А╨░╨╖╤Г╨╡╨╝ ╨╝╨░╤Б╤Б╨╕╨▓ ╨┐╤А╨╡╨┤╨╝╨╡╤В╨╛╨▓ ╨▓ ╨╛╨▒╤К╨╡╨║╤В ╨┤╨╗╤П ╤Г╨┤╨╛╨▒╤Б╤В╨▓╨░ ╨┤╨╛╤Б╤В╤Г╨┐╨░
            this.subjectsConfig = config.subjects;
            this.subjects = {}; // ╨Ч╨┤╨╡╤Б╤М ╨▒╤Г╨┤╤Г╤В ╤Е╤А╨░╨╜╨╕╤В╤М╤Б╤П ╨╖╨░╨│╤А╤Г╨╢╨╡╨╜╨╜╤Л╨╡ ╤В╨╡╨╝╤Л
            console.log('тЬЕ Subjects config loaded:', this.subjectsConfig);
        } catch (error) {
            console.error('тЭМ Error loading subjects config:', error);
        }
    }

    async loadSubjectContent(grade) {
        console.log(`ЁЯФД Loading subject content for grade: ${grade}`);
        this.currentGrade = grade;

        // ╨Ч╨░╨│╤А╤Г╨╢╨░╨╡╨╝ ╨║╨╛╨╜╤В╨╡╨╜╤В ╨┤╨╗╤П ╨║╨░╨╢╨┤╨╛╨│╨╛ ╨┐╤А╨╡╨┤╨╝╨╡╤В╨░ ╨┤╨╛╤Б╤В╤Г╨┐╨╜╨╛╨│╨╛ ╨▓ ╤Н╤В╨╛╨╝ ╨║╨╗╨░╤Б╤Б╨╡
        if (this.subjectsConfig) {
            const loadPromises = [];
            for (const subject of this.subjectsConfig) {
                const availableGrades = subject.grades || subject.classes || [];
                if (availableGrades.includes(grade)) {
                    console.log(`ЁЯУЪ Loading topics for subject: ${subject.id}, grade: ${grade}`);
                    // ╨Ф╨╛╨▒╨░╨▓╨╗╤П╨╡╨╝ timeout ╨┤╨╗╤П ╨║╨░╨╢╨┤╨╛╨╣ ╨╖╨░╨│╤А╤Г╨╖╨║╨╕
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
                console.log(`тЬЕ Subject content loaded for grade: ${grade}`);
            } catch (error) {
                console.error(`тЭМ Error loading subject content for grade ${grade}:`, error);
            }
        } else {
            console.error('тЭМ subjectsConfig not loaded');
        }
    }

    async loadAllSubjectContent() {
        if (this.isLoading) {
            console.log('Already loading...');
            return;
        }

        this.isLoading = true;
        console.log('ЁЯЪА Starting to load all subject content...');

        if (!this.subjectsConfig) {
            console.error('тЭМ Subjects config not loaded');
            this.isLoading = false;
            return;
        }

        // ╨Ч╨░╨│╤А╤Г╨╢╨░╨╡╨╝ ╨║╨╛╨╜╤В╨╡╨╜╤В ╨┤╨╗╤П ╨▓╤Б╨╡╤Е ╨┐╤А╨╡╨┤╨╝╨╡╤В╨╛╨▓ ╨╕ ╨▓╤Б╨╡╤Е ╨╕╤Е ╨║╨╗╨░╤Б╤Б╨╛╨▓
        const loadPromises = [];
        let totalFiles = 0;

        for (const subject of this.subjectsConfig) {
            const grades = subject.grades || subject.classes || [];
            for (const grade of grades) {
                loadPromises.push(this.loadSubjectTopics(subject.id, grade));
                totalFiles++;
            }
        }

        console.log(`ЁЯУВ Loading ${totalFiles} topic files...`);

        try {
            await Promise.all(loadPromises);
            this.isLoaded = true;
            console.log('тЬЕ All subject content loaded successfully');

            // ╨Я╤А╨╛╨▓╨╡╤А╨╕╨╝, ╤З╤В╨╛ ╨╖╨░╨│╤А╤Г╨╖╨╕╨╗╨╛╤Б╤М
            let loadedCount = 0;
            for (const subject of this.subjectsConfig) {
                const grades = subject.grades || subject.classes || [];
                for (const grade of grades) {
                    if (this.subjects[subject.id] && this.subjects[subject.id][grade]) {
                        loadedCount++;
                    }
                }
            }
            console.log(`тЬЕ Successfully loaded ${loadedCount}/${totalFiles} topic files`);

        } catch (error) {
            console.error('тЭМ Error loading all subject content:', error);
        } finally {
            this.isLoading = false;
        }
    }

    async loadSubjectTopics(subjectId, grade) {
        try {
            const filePath = `subjects/${subjectId}/grade-${grade}/topics.json`;
            console.log(`ЁЯУВ Attempting to load: ${filePath}`);

            const response = await fetch(filePath);
            console.log(`ЁЯУб Response status: ${response.status}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const topicsData = await response.json();
            console.log(`ЁЯУД Parsed JSON:`, topicsData);

            // ╨б╨╛╤Е╤А╨░╨╜╤П╨╡╨╝ ╤В╨╡╨╝╤Л ╨┤╨╗╤П ╨┐╤А╨╡╨┤╨╝╨╡╤В╨░
            if (!this.subjects[subjectId]) {
                this.subjects[subjectId] = {};
            }
            this.subjects[subjectId][grade] = topicsData;

            console.log(`тЬЕ Successfully loaded ${topicsData.topics ? topicsData.topics.length : 0} topics for ${subjectId} grade ${grade}`);
            console.log(`ЁЯТ╛ Saved to: this.subjects[${subjectId}][${grade}]`);
        } catch (error) {
            console.warn(`Placeholder: no topics file for ${subjectId} grade ${grade}, generating...`);
            const subjectInfo = this.getSubjectInfo(subjectId);
            const subjectName = subjectInfo?.name || subjectId;
            const placeholderData = this.generatePlaceholderTopics(subjectId, grade, subjectName);
            if (!this.subjects[subjectId]) {
                this.subjects[subjectId] = {};
            }
            this.subjects[subjectId][grade] = placeholderData;
            console.log(`Generated ${placeholderData.topics.length} placeholder topics for ${subjectId} grade ${grade}`);
        }
    }

    generatePlaceholderTopics(subjectId, grade, subjectName) {
        const topicTitles = [
            'Введение в предмет',
            'Основные понятия',
            'Базовые правила и законы',
            'Практическое применение',
            'Углублённое изучение',
            'Сложные случаи',
            'Подготовка к контрольной',
            'Итоговое повторение'
        ];
        const topics = topicTitles.map((title, i) => ({
            id: `topic-${subjectId}-${grade}-${i + 1}`,
            title: `Тема ${i + 1}: ${title}`,
            description: `Изучение раздела "${title}" по предмету ${subjectName} для ${grade} класса`,
            estimatedTime: 30 + i * 5,
            difficulty: i < 3 ? 'easy' : i < 6 ? 'medium' : 'hard',
            lessons: [
                { id: `lesson-${i}-1`, title: `Урок 1: ${title}`, type: 'theory', duration: 15, content: `Теоретический материал по теме "${title}". Здесь будет размещён контент, который вы загрузите позже.` },
                { id: `lesson-${i}-2`, title: `Урок 2: Примеры`, type: 'theory', duration: 20, content: `Разбор примеров и типовых задач по теме "${title}".` }
            ],
            practice: {
                easy: [
                    { id: `p-easy-${i}-1`, title: 'Базовые упражнения', type: 'exercises', count: 5, description: 'Простые задания для закрепления', difficulty: 'easy' }
                ],
                medium: [
                    { id: `p-medium-${i}-1`, title: 'Средние задачи', type: 'exercises', count: 8, description: 'Задачи средней сложности', difficulty: 'medium' }
                ],
                hard: [
                    { id: `p-hard-${i}-1`, title: 'Сложные задачи', type: 'word-problems', count: 5, description: 'Задачи повышенной сложности', difficulty: 'hard', isPremium: true }
                ]
            },
            quiz: {
                id: `quiz-${i}`,
                description: `Проверка знаний по теме "${title}"`,
                timeLimit: 10,
                questions: [
                    { question: 'Вопрос 1 (placeholder)?', options: ['Вариант А', 'Вариант Б', 'Вариант В', 'Вариант Г'], correct: 0 },
                    { question: 'Вопрос 2 (placeholder)?', options: ['Да', 'Нет', 'Частично', 'Не знаю'], correct: 1 }
                ]
            }
        }));
        return { grade, subject: subjectName, topics };
    }

    getSubjectInfo(subjectId) {
        return this.subjectsConfig.find(subject => subject.id === subjectId);
    }

    isContentLoaded() {
        return this.isLoaded;
    }

    getTopicsForSubject(subjectId, grade) {
        console.log(`ЁЯФН getTopicsForSubject: subjectId=${subjectId}, grade=${grade}`);
        console.log(`ЁЯУК Content loaded: ${this.isLoaded}, Loading: ${this.isLoading}`);
        console.log(`ЁЯУК this.subjects structure:`, Object.keys(this.subjects));

        if (this.subjects[subjectId]) {
            console.log(`ЁЯУК this.subjects[${subjectId}] grades:`, Object.keys(this.subjects[subjectId]));
            if (this.subjects[subjectId][grade]) {
                const topics = this.subjects[subjectId][grade].topics || [];
                console.log(`ЁЯУЛ Found ${topics.length} topics`);
                return topics;
            } else {
                console.log(`тЭМ Grade ${grade} not found for subject ${subjectId}`);
            }
        } else {
            console.log(`тЭМ Subject ${subjectId} not found in subjects`);
        }
        return [];
    }

    getTopic(subjectId, grade, topicId) {
        const topics = this.getTopicsForSubject(subjectId, grade);
        return topics.find(topic => topic.id === topicId);
    }

    getDifficultyText(difficulty) {
        const difficultyMap = {
            'easy': 'Легко',
            'medium': 'Средне',
            'hard': 'Сложно'
        };
        return difficultyMap[difficulty] || 'Средне';
    }

    async showTopicsList(subjectId, grade) {
        console.log('ЁЯУЪ showTopicsList called:', subjectId, grade);

        // ╨г╨┤╨░╨╗╤П╨╡╨╝ ╤Б╤Г╤Й╨╡╤Б╤В╨▓╤Г╤О╤Й╨╕╨╣ ╤Н╨║╤А╨░╨╜ ╤В╨╡╨╝ ╨┐╨╡╤А╨╡╨┤ ╤Б╨╛╨╖╨┤╨░╨╜╨╕╨╡╨╝ ╨╜╨╛╨▓╨╛╨│╨╛
        const existingTopicsScreen = document.getElementById('subject-topics-screen');
        if (existingTopicsScreen) {
            existingTopicsScreen.remove();
            console.log('ЁЯЧСя╕П Removed existing topics screen');
        }

        // ╨Ч╨░╨│╤А╤Г╨╢╨░╨╡╨╝ ╨║╨╛╨╜╤В╨╡╨╜╤В ╨┤╨╗╤П ╨┐╤А╨╡╨┤╨╝╨╡╤В╨░, ╨╡╤Б╨╗╨╕ ╨╜╨╡ ╨╖╨░╨│╤А╤Г╨╢╨╡╨╜
        console.log(`ЁЯФД Loading content for subject: ${subjectId}, grade: ${grade}`);
        await this.loadSubjectTopics(subjectId, grade);
        console.log(`ЁЯФД Content loaded, checking if topics exist...`);

        // ╨г╤Б╤В╨░╨╜╨░╨▓╨╗╨╕╨▓╨░╨╡╨╝ ╤В╨╡╨║╤Г╤Й╨╕╨╣ ╨┐╤А╨╡╨┤╨╝╨╡╤В ╨╕ ╨║╨╗╨░╤Б╤Б
        this.currentSubject = subjectId;
        this.currentGrade = grade;
        // ╨б╨▒╤А╨░╤Б╤Л╨▓╨░╨╡╨╝ ╤В╨╡╨║╤Г╤Й╤Г╤О ╤В╨╡╨╝╤Г ╨┐╤А╨╕ ╨╛╤В╨║╤А╤Л╤В╨╕╨╕ ╨╜╨╛╨▓╨╛╨│╨╛ ╤Б╨┐╨╕╤Б╨║╨░ ╤В╨╡╨╝
        this.currentTopic = null;

        console.log('ЁЯУЭ Updated state - currentSubject:', this.currentSubject, 'currentGrade:', this.currentGrade, 'currentTopic: null');

        const subjectInfo = this.getSubjectInfo(subjectId);
        const topics = this.getTopicsForSubject(subjectId, grade);

        console.log('Subject info:', subjectInfo);
        console.log('Topics:', topics);
        console.log('ЁЯФН Topics count:', topics ? topics.length : 0);
        console.log('ЁЯОи Rendering compact topic list with search...');

        // ╨Я╨╛╨╗╤Г╤З╨░╨╡╨╝ ╨┐╤А╨╛╨│╤А╨╡╤Б╤Б ╨┐╤А╨╡╨┤╨╝╨╡╤В╨░
        const subjectProgress = window.app ? window.app.getSubjectProgress(subjectId) : 0;

        // ╨б╨╛╨╖╨┤╨░╨╡╨╝ HTML ╨┤╨╗╤П ╤Н╨║╤А╨░╨╜╨░ ╤Б╨╛ ╤Б╨┐╨╕╤Б╨║╨╛╨╝ ╤В╨╡╨╝
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
                                <h1 class="subject-title">${subjectInfo?.name || subjectId} ${grade} ╨║╨╗╨░╤Б╤Б</h1>
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
                            return `
                            <div class="topic-card-simple" onclick="window.subjectManager.openTopic('${subjectId}', '${topic.id}')">
                                <div class="topic-number">${index + 1}</div>
                                <div class="topic-content">
                                    <h3 class="topic-title">${topic.title}</h3>
                                    <p class="topic-description">${topic.description || 'Изучение темы'}</p>
                                    <div class="topic-meta">
                                        <span class="topic-time">${topic.estimatedTime || 45} мин</span>
                                        <span class="topic-difficulty ${topic.difficulty || 'medium'}">${this.getDifficultyText(topic.difficulty || 'medium')}</span>
                                    </div>
                                </div>
                                <div class="topic-arrow">
                                    <i class="material-icons">chevron_right</i>
                                </div>
                            </div>
                            `;
                        }).join('') : `
                            <div class="empty-state">
                                <div class="empty-icon">
                                    <i class="material-icons">library_books</i>
                                </div>
                                <h3>╨в╨╡╨╝╤Л ╨╜╨╡ ╨╜╨░╨╣╨┤╨╡╨╜╤Л</h3>
                                <p>╨в╨╡╨╝╤Л ╨┤╨╗╤П ╨┐╤А╨╡╨┤╨╝╨╡╤В╨░ "${subjectInfo?.name || subjectId}" ╨▓ ${grade} ╨║╨╗╨░╤Б╤Б╨╡ ╨╡╤Й╨╡ ╨╜╨╡ ╨┤╨╛╨▒╨░╨▓╨╗╨╡╨╜╤Л</p>
                            </div>
                        `}

                        <!-- ╨Я╨╛╨╕╤Б╨║╨╛╨▓╨░╤П ╤Б╤В╤А╨╛╨║╨░ -->
                        <div class="bottom-search-container">
                            <div class="search-input-container">
                                <input type="text" class="search-input" placeholder="╨Я╨╛╨╕╤Б╨║ ЁЯФН" autocomplete="off" onclick="window.subjectManager.openSearchModal()">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // ╨Ф╨╛╨▒╨░╨▓╨╗╤П╨╡╨╝ ╤Н╨║╤А╨░╨╜ ╤В╨╡╨╝ ╨▓ body (╤Н╨║╤А╨░╨╜╤Л ╨┤╨╛╨╗╨╢╨╜╤Л ╨▒╤Л╤В╤М ╨╜╨░ ╤Г╤А╨╛╨▓╨╜╨╡ body)
        document.body.insertAdjacentHTML('beforeend', topicsScreenHTML);

        // ╨Ш╤Б╨┐╨╛╨╗╤М╨╖╤Г╨╡╨╝ NavigationManager ╨┤╨╗╤П ╨┐╨╡╤А╨╡╤Е╨╛╨┤╨░ ╨╜╨░ ╤Н╨║╤А╨░╨╜ ╤В╨╡╨╝
        if (window.navigation) {
            window.navigation.pushScreen('subject-topics', { subjectId: subjectId, grade: grade });
            console.log('тЬЕ Topics screen pushed to navigation stack');
        } else {
            console.error('тЭМ Navigation manager not available');
        }

        // ╨Ф╨╛╨▒╨░╨▓╨╗╤П╨╡╨╝ ╤Н╨║╤А╨░╨╜ ╨▓ ╤Б╤В╨╡╨║ ╨╜╨░╨▓╨╕╨│╨░╤Ж╨╕╨╕ ╨╕ ╨┐╨╡╤А╨╡╨║╨╗╤О╤З╨░╨╡╨╝╤Б╤П
        if (window.navigation && window.navigation.pushScreen) {
            window.navigation.pushScreen('subject-topics', { subjectId: subjectId, grade: grade });
        }

        // ╨Я╨╡╤А╨╡╨║╨╗╤О╤З╨░╨╡╨╝ ╨╜╨░ ╤Н╨║╤А╨░╨╜ ╤В╨╡╨╝
        if (window.navigation && window.navigation.showScreen) {
            window.navigation.showScreen('subject-topics');
        } else {
            // Emergency fallback - ╨┐╤А╤П╤З╨╡╨╝ ╨▓╤Б╨╡ ╤Н╨║╤А╨░╨╜╤Л ╨╕ ╨┐╨╛╨║╨░╨╖╤Л╨▓╨░╨╡╨╝ topics
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            const topicsScreen = document.getElementById('subject-topics-screen');
            if (topicsScreen) {
                topicsScreen.classList.add('active');
            }
        }

        // ╨Ш╨╜╨╕╤Ж╨╕╨░╨╗╨╕╨╖╨╕╤А╤Г╨╡╨╝ ╨┐╨╛╨╕╤Б╨║╨╛╨▓╤Г╤О ╤Д╤Г╨╜╨║╤Ж╨╕╨╛╨╜╨░╨╗╤М╨╜╨╛╤Б╤В╤М
        setTimeout(() => {
            this.initTopicSearch();
        }, 100);
    }

    goBackToSubjects() {
        console.log('тмЕя╕П goBackToSubjects() called - Going back to subjects screen');

        // ╨г╨┤╨░╨╗╤П╨╡╨╝ ╤Б╤Г╤Й╨╡╤Б╤В╨▓╤Г╤О╤Й╨╕╨╡ ╤Н╨║╤А╨░╨╜╤Л ╨┐╨╡╤А╨╡╨┤ ╨▓╨╛╨╖╨▓╤А╨░╤В╨╛╨╝
        const existingTopicsScreen = document.getElementById('subject-topics-screen');
        const existingLessonScreen = document.getElementById('lesson-screen');
        if (existingTopicsScreen) {
            existingTopicsScreen.remove();
            console.log('ЁЯЧСя╕П Removed topics screen');
        }
        if (existingLessonScreen) {
            existingLessonScreen.remove();
            console.log('ЁЯЧСя╕П Removed lesson screen');
        }

        // ╨б╨▒╤А╨░╤Б╤Л╨▓╨░╨╡╨╝ ╤В╨╡╨║╤Г╤Й╨╕╨╣ ╨┐╤А╨╡╨┤╨╝╨╡╤В ╨╕ ╤В╨╡╨╝╤Г ╨┐╤А╨╕ ╨▓╨╛╨╖╨▓╤А╨░╤В╨╡ ╨║ ╤Б╨┐╨╕╤Б╨║╤Г ╨┐╤А╨╡╨┤╨╝╨╡╤В╨╛╨▓
        this.currentSubject = null;
        this.currentTopic = null;
        console.log('ЁЯФД State reset - currentSubject: null, currentTopic: null');

        // Haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }

        // ╨Ш╤Б╨┐╨╛╨╗╤М╨╖╤Г╨╡╨╝ NavigationManager ╨┤╨╗╤П ╨▓╨╛╨╖╨▓╤А╨░╤В╨░ ╨╜╨░╨╖╨░╨┤
        if (window.navigation && window.navigation.popScreen) {
            const popped = window.navigation.popScreen();
            if (popped) {
                console.log('тЬЕ Successfully popped screen from navigation stack');
                return;
            }
        }

        // Emergency fallback - ╨╡╤Б╨╗╨╕ NavigationManager ╨╜╨╡╨┤╨╛╤Б╤В╤Г╨┐╨╡╨╜
        console.log('ЁЯЪи Navigation manager not available, using emergency fallback');

        // ╨г╨┤╨░╨╗╤П╨╡╨╝ ╤Н╨║╤А╨░╨╜ ╤В╨╡╨╝ ╨╕╨╖ DOM
        const topicsScreen = document.getElementById('subject-topics-screen');
        if (topicsScreen) {
            topicsScreen.remove();
            console.log('ЁЯЧСя╕П Topics screen removed from DOM');
        }

        // ╨Я╨╛╨║╨░╨╖╤Л╨▓╨░╨╡╨╝ ╨╜╨╕╨╢╨╜╨╡╨╡ ╨╝╨╡╨╜╤О ╨╜╨░╨▓╨╕╨│╨░╤Ж╨╕╨╕
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'flex';
        }

        // ╨в╨░╨║╨╢╨╡ ╨┐╨╛╨┐╤А╨╛╨▒╤Г╨╡╨╝ ╤З╨╡╤А╨╡╨╖ navigation manager
        if (window.navigation && window.navigation.showBottomNav) {
            window.navigation.showBottomNav();
        }

        // ╨Т╨╛╨╖╨▓╤А╨░╤Й╨░╨╡╨╝╤Б╤П ╨║ ╤Н╨║╤А╨░╨╜╤Г ╨┐╤А╨╡╨┤╨╝╨╡╤В╨╛╨▓
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

        // ╨Ю╨▒╨╜╨╛╨▓╨╗╤П╨╡╨╝ ╨╛╤В╨╛╨▒╤А╨░╨╢╨╡╨╜╨╕╨╡ ╨┐╤А╨╡╨┤╨╝╨╡╤В╨╛╨▓
        if (window.app && window.app.updateSubjectsDisplay) {
            window.app.updateSubjectsDisplay();
        }
    }


    openTopic(subjectId, topicId) {
        console.log('ЁЯЪА openTopic called:', subjectId, topicId, 'currentGrade:', this.currentGrade);

        // ╨г╨┤╨░╨╗╤П╨╡╨╝ ╤Б╤Г╤Й╨╡╤Б╤В╨▓╤Г╤О╤Й╨╕╨╣ ╤Н╨║╤А╨░╨╜ ╤Г╤А╨╛╨║╨░ ╨┐╨╡╤А╨╡╨┤ ╤Б╨╛╨╖╨┤╨░╨╜╨╕╨╡╨╝ ╨╜╨╛╨▓╨╛╨│╨╛
        const existingLessonScreen = document.getElementById('lesson-screen');
        if (existingLessonScreen) {
            existingLessonScreen.remove();
            console.log('ЁЯЧСя╕П Removed existing lesson screen');
        }

        // ╨г╨▒╨╡╨╢╨┤╨░╨╡╨╝╤Б╤П, ╤З╤В╨╛ ╤В╨╡╨║╤Г╤Й╨╕╨╣ ╨┐╤А╨╡╨┤╨╝╨╡╤В ╤Г╤Б╤В╨░╨╜╨╛╨▓╨╗╨╡╨╜ ╨┐╤А╨░╨▓╨╕╨╗╤М╨╜╨╛
        this.currentSubject = subjectId;
        this.currentTopic = topicId; // ╨г╤Б╤В╨░╨╜╨░╨▓╨╗╨╕╨▓╨░╨╡╨╝ ╤В╨╡╨║╤Г╤Й╤Г╤О ╤В╨╡╨╝╤Г
        console.log('ЁЯУЭ Updated currentSubject to:', this.currentSubject, 'currentTopic to:', this.currentTopic);

        const topics = this.getTopicsForSubject(subjectId, this.currentGrade);
        console.log('ЁЯУЛ All topics for subject:', topics);

        const topic = this.getTopic(subjectId, this.currentGrade, topicId);
        console.log('ЁЯУЦ Topic found:', topic);

        if (!topic) {
            console.error('тЭМ Topic not found:', subjectId, topicId);
            console.error('тЭМ Available topic IDs:', topics ? topics.map(t => t.id) : 'No topics array');
            console.error('тЭМ Current grade:', this.currentGrade);
            console.error('тЭМ Subject ID:', subjectId);

            // ╨Я╨╛╨║╨░╨╖╤Л╨▓╨░╨╡╨╝ ╤Б╨╛╨╛╨▒╤Й╨╡╨╜╨╕╨╡ ╨╛╨▒ ╨╛╤И╨╕╨▒╨║╨╡ ╨▓ ╨╕╨╜╤В╨╡╤А╤Д╨╡╨╣╤Б╨╡
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.innerHTML = `
                    <div class="lesson-screen">
                        <div class="lesson-header">
                            <button class="back-btn" onclick="window.subjectManager.goBack()">
                                <i class="material-icons">arrow_back</i>
                            </button>
                            <div class="lesson-info">
                                <h1 class="lesson-title">╨Ю╤И╨╕╨▒╨║╨░</h1>
                            </div>
                        </div>
                        <div class="lesson-content">
                            <div class="empty-state" style="margin-top: 40px;">
                                <div class="empty-icon">
                                    <i class="material-icons">error</i>
                                </div>
                                <h3>╨в╨╡╨╝╨░ ╨╜╨╡ ╨╜╨░╨╣╨┤╨╡╨╜╨░</h3>
                                <p>╨Ч╨░╨┐╤А╨░╤И╨╕╨▓╨░╨╡╨╝╨░╤П ╤В╨╡╨╝╨░ ╨╜╨╡ ╤Б╤Г╤Й╨╡╤Б╤В╨▓╤Г╨╡╤В ╨╕╨╗╨╕ ╨╡╤Й╨╡ ╨╜╨╡ ╨╖╨░╨│╤А╤Г╨╢╨╡╨╜╨░.</p>
                                <p style="font-size: 14px; color: #94a3b8; margin-top: 8px;">
                                    ID: ${topicId}<br>
                                    ╨Ъ╨╗╨░╤Б╤Б: ${this.currentGrade}<br>
                                    ╨Я╤А╨╡╨┤╨╝╨╡╤В: ${subjectId}
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            }
            return;
        }

        this.currentTopic = topic;
        console.log('ЁЯТ╛ Current topic set');

        // ╨Я╨╛╨║╨░╨╖╤Л╨▓╨░╨╡╨╝ ╤Н╨║╤А╨░╨╜ ╤Г╤А╨╛╨║╨░
        console.log('ЁЯОи Calling showLessonScreen');
        this.showLessonScreen(topic);
    }

    showLessonScreen(topic) {
        console.log('ЁЯОп showLessonScreen called with topic:', topic);

        // ╨б╨║╤А╤Л╨▓╨░╨╡╨╝ ╨╜╨╕╨╢╨╜╨╡╨╡ ╨╝╨╡╨╜╤О ╨╜╨░╨▓╨╕╨│╨░╤Ж╨╕╨╕ ╨Э╨Х╨Ь╨Х╨Ф╨Ы╨Х╨Э╨Э╨Ю
        console.log('ЁЯФ╜ Hiding bottom navigation for lesson screen');
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            console.log('ЁЯФ╜ Found bottom nav element, hiding it');
            bottomNav.style.display = 'none';
        } else {
            console.error('тЭМ Bottom nav element not found! Searching with different selectors...');
            // ╨Я╨╛╨┐╤А╨╛╨▒╤Г╨╡╨╝ ╨┤╤А╤Г╨│╨╕╨╡ ╤Б╨╡╨╗╨╡╨║╤В╨╛╤А╤Л
            const navById = document.getElementById('bottom-nav');
            const navByTag = document.querySelector('nav');
            console.log('navById:', navById);
            console.log('navByTag:', navByTag);
        }

        // ╨в╨░╨║╨╢╨╡ ╨┐╨╛╨┐╤А╨╛╨▒╤Г╨╡╨╝ ╤З╨╡╤А╨╡╨╖ navigation manager ╨╡╤Б╨╗╨╕ ╨╛╨╜ ╨┤╨╛╤Б╤В╤Г╨┐╨╡╨╜
        if (window.navigation && window.navigation.hideBottomNav) {
            console.log('ЁЯФ╜ Also calling navigation.hideBottomNav()');
            window.navigation.hideBottomNav();
        }

        // ╨б╨╛╨╖╨┤╨░╨╡╨╝ ╨║╤А╨░╤Б╨╕╨▓╤Л╨╣ HTML ╨┤╨╗╤П ╤Н╨║╤А╨░╨╜╨░ ╤Г╤А╨╛╨║╨░
        const lessonHTML = `
            <div id="lesson-screen" class="screen active">
                <div class="lesson-screen">
                <!-- ╨д╨╕╨║╤Б╨╕╤А╨╛╨▓╨░╨╜╨╜╤Л╨╣ header ╤В╨╡╨╝╤Л -->
                <div class="topic-fixed-header">
                    <div class="topic-fixed-content">
                        <button class="back-btn" onclick="window.subjectManager.goBack()" style="color: white; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; backdrop-filter: blur(10px);">
                            <i class="material-icons">arrow_back</i>
                        </button>
                        <div class="topic-fixed-title">${topic.title}</div>
                        <div class="topic-fixed-meta">
                            <div class="topic-fixed-meta-item">
                                <i class="material-icons">schedule</i>
                                <span>${topic.estimatedTime} ╨╝╨╕╨╜</span>
                            </div>
                            <div class="topic-fixed-meta-item">
                                <i class="material-icons">school</i>
                                <span>╨в╨╡╨╛╤А╨╕╤П</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Navigation Tabs -->
                <div class="lesson-nav">
                    <button class="nav-tab active" data-tab="theory">
                        <i class="material-icons">school</i>
                        <span>╨в╨╡╨╛╤А╨╕╤П</span>
                    </button>
                    <button class="nav-tab" data-tab="practice">
                        <i class="material-icons">edit</i>
                        <span>╨Я╤А╨░╨║╤В╨╕╨║╨░</span>
                    </button>
                    <button class="nav-tab" data-tab="quiz">
                        <i class="material-icons">quiz</i>
                        <span>╨в╨╡╤Б╤В</span>
                    </button>
                </div>

                <!-- Content Areas -->
                <div class="lesson-content">
                    <!-- Theory Tab -->
                    <div class="content-tab active" id="theory-tab">
                        <div class="tab-header">
                            <h2>╨в╨╡╨╛╤А╨╡╤В╨╕╤З╨╡╤Б╨║╨╕╨╣ ╨╝╨░╤В╨╡╤А╨╕╨░╨╗</h2>
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
                                            <p>${lesson.content || lesson.description || '╨в╨╡╨╛╤А╨╡╤В╨╕╤З╨╡╤Б╨║╨╕╨╣ ╨╝╨░╤В╨╡╤А╨╕╨░╨╗ ╨┐╨╛ ╨┤╨░╨╜╨╜╨╛╨╣ ╤В╨╡╨╝╨╡'}</p>
                                            <div class="lesson-meta">
                                                <span class="lesson-duration"><i class="material-icons">schedule</i> ${lesson.duration || 5} ╨╝╨╕╨╜</span>
                                                <span class="lesson-type">${lesson.type === 'theory' ? '╨в╨╡╨╛╤А╨╕╤П' : '╨Я╤А╨░╨║╤В╨╕╨║╨░'}</span>
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
                                    <h3>╨в╨╡╨╛╤А╨╡╤В╨╕╤З╨╡╤Б╨║╨╕╨╣ ╨╝╨░╤В╨╡╤А╨╕╨░╨╗</h3>
                                    <p>╨в╨╡╨╛╤А╨╕╤П ╨┐╨╛ ╤В╨╡╨╝╨╡ "${topic.title}" ╤Б╨║╨╛╤А╨╛ ╨▒╤Г╨┤╨╡╤В ╨┤╨╛╨▒╨░╨▓╨╗╨╡╨╜╨░</p>
                                    <div class="coming-soon-container">
                                        <div class="coming-soon-badge pulse">╨б╨║╨╛╤А╨╛</div>
                                        <div class="progress-placeholder">
                                            <div class="progress-bar-placeholder">
                                                <div class="progress-fill-placeholder"></div>
                                            </div>
                                            <span class="placeholder-text">╨Я╨╛╨┤╨│╨╛╤В╨╛╨▓╨║╨░ ╨║╨╛╨╜╤В╨╡╨╜╤В╨░...</span>
                                        </div>
                                    </div>
                                    <div class="empty-actions">
                                        <button class="notify-btn" onclick="this.innerHTML='<i class="material-icons">notifications_active</i> ╨г╨▓╨╡╨┤╨╛╨╝╨╕╨╝'">
                                            <i class="material-icons">notifications</i>
                                            ╨г╨▓╨╡╨┤╨╛╨╝╨╕╤В╤М ╨╛ ╨│╨╛╤В╨╛╨▓╨╜╨╛╤Б╤В╨╕
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
                            <h2>╨Я╤А╨░╨║╤В╨╕╤З╨╡╤Б╨║╨╕╨╡ ╨╖╨░╨┤╨░╨╜╨╕╤П</h2>
                            <p class="tab-description">╨Ч╨░╨║╤А╨╡╨┐╨╕╤В╨╡ ╨╝╨░╤В╨╡╤А╨╕╨░╨╗ ╤Б ╨┐╨╛╨╝╨╛╤Й╤М╤О ╤Г╨┐╤А╨░╨╢╨╜╨╡╨╜╨╕╨╣</p>
                        </div>

                        ${this.renderPracticeSection(topic)}
                    </div>

                    <!-- Quiz Tab -->
                    <div class="content-tab" id="quiz-tab">
                        <div class="tab-header">
                            <h2>╨в╨╡╤Б╤В╨╕╤А╨╛╨▓╨░╨╜╨╕╨╡ ╨╖╨╜╨░╨╜╨╕╨╣</h2>
                            <p class="tab-description">╨Я╤А╨╛╨▓╨╡╤А╤М╤В╨╡ ╤Б╨▓╨╛╨╕ ╨╖╨╜╨░╨╜╨╕╤П ╨┐╨╛ ╤В╨╡╨╝╨╡</p>
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
                                            <h3>╨в╨╡╤Б╤В ╨┐╨╛ ╤В╨╡╨╝╨╡</h3>
                                            <p>${topic.quiz.description || `╨Я╤А╨╛╨▓╨╡╤А╤М╤В╨╡ ╤Б╨▓╨╛╨╕ ╨╖╨╜╨░╨╜╨╕╤П ╨┐╨╛ ╤В╨╡╨╝╨╡ "${topic.title}"`}</p>
                                        </div>
                                    </div>
                                    <div class="quiz-meta">
                                        <span class="quiz-count">${topic.quiz.questions.length} ╨▓╨╛╨┐╤А╨╛╤Б╨╛╨▓</span>
                                        <span class="quiz-time">${topic.quiz.timeLimit || 15} ╨╝╨╕╨╜</span>
                                    </div>
                                    <div class="quiz-preview">
                                        <div class="preview-item">
                                            <i class="material-icons">help</i>
                                            <span>╨а╨░╨╖╨╜╤Л╨╡ ╤В╨╕╨┐╤Л ╨▓╨╛╨┐╤А╨╛╤Б╨╛╨▓</span>
                                        </div>
                                        <div class="preview-item">
                                            <i class="material-icons">timer</i>
                                            <span>╨Ю╨│╤А╨░╨╜╨╕╤З╨╡╨╜╨╕╨╡ ╨┐╨╛ ╨▓╤А╨╡╨╝╨╡╨╜╨╕</span>
                                        </div>
                                        <div class="preview-item">
                                            <i class="material-icons">analytics</i>
                                            <span>╨Я╨╛╨┤╤А╨╛╨▒╨╜╤Л╨╣ ╤А╨░╨╖╨▒╨╛╤А</span>
                                        </div>
                                    </div>
                                    <button class="quiz-btn">
                                        <span>╨Э╨░╤З╨░╤В╤М ╤В╨╡╤Б╤В</span>
                                        <i class="material-icons">play_arrow</i>
                                    </button>
                                </div>
                                ` :
                                `
                                <div class="empty-state interactive">
                                    <div class="empty-icon animated">
                                        <i class="material-icons">quiz</i>
                                    </div>
                                    <h3>╨в╨╡╤Б╤В ╨┐╨╛ ╤В╨╡╨╝╨╡</h3>
                                    <p>╨в╨╡╤Б╤В ╨┐╨╛ ╤В╨╡╨╝╨╡ "${topic.title}" ╤Б╨║╨╛╤А╨╛ ╨▒╤Г╨┤╨╡╤В ╨┤╨╛╨▒╨░╨▓╨╗╨╡╨╜</p>
                                    <div class="coming-soon-container">
                                        <div class="coming-soon-badge pulse">╨б╨║╨╛╤А╨╛</div>
                                        <div class="progress-placeholder">
                                            <div class="progress-bar-placeholder">
                                                <div class="progress-fill-placeholder"></div>
                                            </div>
                                            <span class="placeholder-text">╨Я╨╛╨┤╨│╨╛╤В╨╛╨▓╨║╨░ ╨▓╨╛╨┐╤А╨╛╤Б╨╛╨▓...</span>
                                        </div>
                                    </div>
                                    <div class="empty-actions">
                                        <button class="notify-btn" onclick="this.innerHTML='<i class="material-icons">notifications_active</i> ╨г╨▓╨╡╨┤╨╛╨╝╨╕╨╝'">
                                            <i class="material-icons">notifications</i>
                                            ╨г╨▓╨╡╨┤╨╛╨╝╨╕╤В╤М ╨╛ ╨│╨╛╤В╨╛╨▓╨╜╨╛╤Б╤В╨╕
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

        // ╨Ф╨╛╨▒╨░╨▓╨╗╤П╨╡╨╝ ╤Н╨║╤А╨░╨╜ ╤Г╤А╨╛╨║╨░ ╨▓ main-content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertAdjacentHTML('beforeend', lessonHTML);

            // ╨Ш╨╜╨╕╤Ж╨╕╨░╨╗╨╕╨╖╨╕╤А╤Г╨╡╨╝ ╤В╨░╨▒╤Л
            this.initLessonTabs();
        }

        // ╨Ш╤Б╨┐╨╛╨╗╤М╨╖╤Г╨╡╨╝ NavigationManager ╨┤╨╗╤П ╨┐╨╡╤А╨╡╤Е╨╛╨┤╨░ ╨╜╨░ ╤Н╨║╤А╨░╨╜ ╤Г╤А╨╛╨║╨░
        if (window.navigation) {
            window.navigation.pushScreen('lesson', { subjectId: this.currentSubject, topicId: topic.id });
            console.log('тЬЕ Lesson screen pushed to navigation stack');
        } else {
            console.error('тЭМ Navigation manager not available');
        }
    }

    getDifficultyText(difficulty) {
        const texts = {
            'easy': '╨Ы╨╡╨│╨║╨╛',
            'medium': '╨б╤А╨╡╨┤╨╜╨╡',
            'hard': '╨б╨╗╨╛╨╢╨╜╨╛'
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
                        <h3>╨Я╤А╨░╨║╤В╨╕╤З╨╡╤Б╨║╨╕╨╡ ╨╖╨░╨┤╨░╨╜╨╕╤П</h3>
                        <p>╨г╨┐╤А╨░╨╢╨╜╨╡╨╜╨╕╤П ╨┐╨╛ ╤В╨╡╨╝╨╡ "${topic.title}" ╤Б╨║╨╛╤А╨╛ ╨▒╤Г╨┤╤Г╤В ╨┤╨╛╨▒╨░╨▓╨╗╨╡╨╜╤Л</p>
                        <div class="coming-soon-container">
                            <div class="coming-soon-badge pulse">╨б╨║╨╛╤А╨╛</div>
                            <div class="progress-placeholder">
                                <div class="progress-bar-placeholder">
                                    <div class="progress-fill-placeholder"></div>
                                </div>
                                <span class="placeholder-text">╨б╨╛╨╖╨┤╨░╨╜╨╕╨╡ ╨╖╨░╨┤╨░╨╜╨╕╨╣...</span>
                            </div>
                        </div>
                        <div class="empty-actions">
                            <button class="notify-btn" onclick="this.innerHTML='<i class=\\"material-icons\\">notifications_active</i> ╨г╨▓╨╡╨┤╨╛╨╝╨╕╨╝'">
                                <i class="material-icons">notifications</i>
                                ╨г╨▓╨╡╨┤╨╛╨╝╨╕╤В╤М ╨╛ ╨│╨╛╤В╨╛╨▓╨╜╨╛╤Б╤В╨╕
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
                            ╨Ы╨╡╨│╨║╨╕╨╡
                        </button>
                    ` : ''}
                    ${hasMedium ? `
                        <button class="difficulty-tab medium${!hasEasy ? ' active' : ''}" data-difficulty="medium" onclick="window.subjectManager.switchPracticeDifficulty('medium')">
                            <i class="material-icons">trending_up</i>
                            ╨б╤А╨╡╨┤╨╜╨╕╨╡
                        </button>
                    ` : ''}
                    ${hasHard ? `
                        <button class="difficulty-tab hard${!hasEasy && !hasMedium ? ' active' : ''}" data-difficulty="hard" onclick="window.subjectManager.switchPracticeDifficulty('hard')">
                            <span class="lock-indicator">
                                <i class="material-icons">${window.subscriptionManager?.isPremium ? 'whatshot' : 'lock'}</i>
                                ╨б╨╗╨╛╨╢╨╜╤Л╨╡
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
            easy: '╨Ы╨╡╨│╨║╨░╤П',
            medium: '╨б╤А╨╡╨┤╨╜╤П╤П',
            hard: '╨б╨╗╨╛╨╢╨╜╨░╤П'
        };

        return `
            <div class="practice-problem-card${isLocked ? ' locked' : ''}" 
                 onclick="${isLocked ? 'window.subscriptionManager.showPremiumLock(\'╨б╨╗╨╛╨╢╨╜╤Л╨╡ ╨╖╨░╨┤╨░╤З╨╕\')' : `window.subjectManager.startPractice('${practice.id}')`}">
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
                        ${practice.count || 0} ╨╖╨░╨┤╨░╨╜╨╕╨╣
                    </span>
                    <span class="difficulty ${difficulty}" style="background: ${difficultyColors[difficulty]}15; color: ${difficultyColors[difficulty]}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                        ${difficultyLabels[difficulty]}
                    </span>
                </div>
                <button class="practice-btn" style="${isLocked ? 'opacity: 0.5;' : ''}">
                    <span>${isLocked ? '╨в╤А╨╡╨▒╤Г╨╡╤В╤Б╤П Premium' : '╨Э╨░╤З╨░╤В╤М ╨┐╤А╨░╨║╤В╨╕╨║╤Г'}</span>
                    <i class="material-icons">${isLocked ? 'lock' : 'arrow_forward'}</i>
                </button>
            </div>
        `;
    }

    // Switch practice difficulty tab
    switchPracticeDifficulty(difficulty) {
        // Check if hard difficulty requires premium
        if (difficulty === 'hard' && window.subscriptionManager && !window.subscriptionManager.isPremium) {
            window.subscriptionManager.showPremiumLock('╨б╨╗╨╛╨╢╨╜╤Л╨╡ ╨╖╨░╨┤╨░╤З╨╕');
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
            'easy': '╨Ы╨╡╨│╨║╨╛',
            'medium': '╨б╤А╨╡╨┤╨╜╨╡',
            'hard': '╨б╨╗╨╛╨╢╨╜╨╛'
        };
        return texts[difficulty] || '╨б╤А╨╡╨┤╨╜╨╡';
    }

    initLessonTabs() {
        const navTabs = document.querySelectorAll('.nav-tab');
        const contentTabs = document.querySelectorAll('.content-tab');

        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;

                // ╨г╨▒╨╕╤А╨░╨╡╨╝ ╨░╨║╤В╨╕╨▓╨╜╤Л╨╣ ╨║╨╗╨░╤Б╤Б ╤Б╨╛ ╨▓╤Б╨╡╤Е ╤В╨░╨▒╨╛╨▓
                navTabs.forEach(t => t.classList.remove('active'));
                contentTabs.forEach(c => c.classList.remove('active'));

                // ╨Ф╨╛╨▒╨░╨▓╨╗╤П╨╡╨╝ ╨░╨║╤В╨╕╨▓╨╜╤Л╨╣ ╨║╨╗╨░╤Б╤Б ╨▓╤Л╨▒╤А╨░╨╜╨╜╨╛╨╝╤Г ╤В╨░╨▒╤Г
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
        console.log('ЁЯОп Opening lesson:', lessonId);
        // ╨Ш╨╝╨╕╤В╨░╤Ж╨╕╤П ╨╛╤В╨║╤А╤Л╤В╨╕╤П ╤Г╤А╨╛╨║╨░
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }

        // ╨Т ╤А╨╡╨░╨╗╤М╨╜╨╛╨╝ ╨┐╤А╨╕╨╗╨╛╨╢╨╡╨╜╨╕╨╕ ╨╖╨┤╨╡╤Б╤М ╨▒╤Г╨┤╨╡╤В ╨╛╤В╨║╤А╤Л╤В╨╕╨╡ ╨║╨╛╨╜╨║╤А╨╡╤В╨╜╨╛╨│╨╛ ╤Г╤А╨╛╨║╨░
        // ╨Я╨╛╨║╨░ ╨┐╤А╨╛╤Б╤В╨╛ ╨┐╨╛╨║╨░╨╖╤Л╨▓╨░╨╡╨╝ ╤Г╨▓╨╡╨┤╨╛╨╝╨╗╨╡╨╜╨╕╨╡
        if (window.app && window.app.showMessage) {
            window.app.showMessage('╨г╤А╨╛╨║ ╤Б╨║╨╛╤А╨╛ ╨▒╤Г╨┤╨╡╤В ╨╛╤В╨║╤А╤Л╤В! ЁЯУЦ');
        }
    }

    startPractice(practiceId) {
        console.log('ЁЯОп Starting practice:', practiceId);
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }

        if (window.app && window.app.showMessage) {
            window.app.showMessage('╨Я╤А╨░╨║╤В╨╕╨║╨░ ╤Б╨║╨╛╤А╨╛ ╨▒╤Г╨┤╨╡╤В ╨┤╨╛╤Б╤В╤Г╨┐╨╜╨░! тЬПя╕П');
        }
    }

    startQuiz(quizId) {
        console.log('ЁЯОп Starting quiz:', quizId);
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }

        if (window.app && window.app.showMessage) {
            window.app.showMessage('╨в╨╡╤Б╤В ╤Б╨║╨╛╤А╨╛ ╨▒╤Г╨┤╨╡╤В ╨┤╨╛╤Б╤В╤Г╨┐╨╡╨╜! ЁЯза');
        }
    }


    goBack() {
        console.log('тмЕя╕П Going back from lesson screen');

        // ╨г╨┤╨░╨╗╤П╨╡╨╝ ╤Б╤Г╤Й╨╡╤Б╤В╨▓╤Г╤О╤Й╨╕╨╣ ╤Н╨║╤А╨░╨╜ ╤Г╤А╨╛╨║╨░
        const existingLessonScreen = document.getElementById('lesson-screen');
        if (existingLessonScreen) {
            existingLessonScreen.remove();
            console.log('ЁЯЧСя╕П Removed lesson screen');
        }

        // ╨б╨▒╤А╨░╤Б╤Л╨▓╨░╨╡╨╝ ╤В╨╡╨║╤Г╤Й╤Г╤О ╤В╨╡╨╝╤Г ╨┐╤А╨╕ ╨▓╨╛╨╖╨▓╤А╨░╤В╨╡ ╨║ ╤Б╨┐╨╕╤Б╨║╤Г ╤В╨╡╨╝
        this.currentTopic = null;
        console.log('ЁЯФД currentTopic reset to null, currentSubject remains:', this.currentSubject);

        // Haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }

        // ╨Ш╤Б╨┐╨╛╨╗╤М╨╖╤Г╨╡╨╝ NavigationManager ╨┤╨╗╤П ╨▓╨╛╨╖╨▓╤А╨░╤В╨░ ╨╜╨░╨╖╨░╨┤
        if (window.navigation && window.navigation.popScreen) {
            const popped = window.navigation.popScreen();
            if (popped) {
                console.log('тЬЕ Successfully popped screen from navigation stack');
                return;
            }
        }

        // Emergency fallback - ╨╡╤Б╨╗╨╕ NavigationManager ╨╜╨╡╨┤╨╛╤Б╤В╤Г╨┐╨╡╨╜
        console.log('ЁЯЪи Navigation manager not available, using emergency fallback');

        // ╨г╨┤╨░╨╗╤П╨╡╨╝ ╤Н╨║╤А╨░╨╜ ╤Г╤А╨╛╨║╨░ ╨╕╨╖ DOM
        const lessonScreen = document.getElementById('lesson-screen');
        if (lessonScreen) {
            lessonScreen.remove();
            console.log('ЁЯЧСя╕П Lesson screen removed from DOM');
        }

        // ╨Я╨╛╨║╨░╨╖╤Л╨▓╨░╨╡╨╝ ╤Н╨║╤А╨░╨╜ ╤В╨╡╨╝ (╨╛╨╜ ╨┤╨╛╨╗╨╢╨╡╨╜ ╨▒╤Л╤В╤М ╤Г╨╢╨╡ ╨▓ DOM)
        const topicsScreen = document.getElementById('subject-topics-screen');
        if (topicsScreen) {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            topicsScreen.classList.add('active');
            console.log('тЬЕ Returned to topics screen');
        } else {
            // Fallback - ╨▓╨╛╨╖╨▓╤А╨░╤Й╨░╨╡╨╝╤Б╤П ╨║ ╤Б╨┐╨╕╤Б╨║╤Г ╤В╨╡╨╝
            console.log('тЪая╕П Topics screen not found, recreating...');
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
                            ╨Ч╨░╨▓╨╡╤А╤И╨╕╤В╤М ╤Г╤А╨╛╨║
                        </button>
                    </div>
                </div>
            </div>
        `;

        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = lessonHTML;
    }

    startQuiz(quizId) {
        // ╨Ы╨╛╨│╨╕╨║╨░ ╨┤╨╗╤П ╨╖╨░╨┐╤Г╤Б╨║╨░ ╤В╨╡╤Б╤В╨░
        app.showMessage('╨в╨╡╤Б╤В ╤Б╨║╨╛╤А╨╛ ╨▒╤Г╨┤╨╡╤В ╨┤╨╛╤Б╤В╤Г╨┐╨╡╨╜!');
    }

    markLessonComplete(lessonId) {
        // ╨б╨╛╤Е╤А╨░╨╜╤П╨╡╨╝ ╨┐╤А╨╛╨│╤А╨╡╤Б╤Б ╤Г╤А╨╛╨║╨░
        const progressKey = `lesson_${this.currentTopic.id}_${lessonId}`;
        localStorage.setItem(progressKey, 'completed');

        // ╨Ю╨▒╨╜╨╛╨▓╨╗╤П╨╡╨╝ ╨╛╨▒╤Й╨╕╨╣ ╨┐╤А╨╛╨│╤А╨╡╤Б╤Б ╨┐╤А╨╡╨┤╨╝╨╡╤В╨░
        this.updateSubjectProgress(this.currentTopic.subjectId);

        app.showMessage('╨г╤А╨╛╨║ ╨╖╨░╨▓╨╡╤А╤И╨╡╨╜! ЁЯОЙ');
    }

    updateSubjectProgress(subjectId) {
        // ╨Я╨╡╤А╨╡╤Б╤З╨╕╤В╤Л╨▓╨░╨╡╨╝ ╨┐╤А╨╛╨│╤А╨╡╤Б╤Б ╨┐╤А╨╡╨┤╨╝╨╡╤В╨░
        app.updateProgressDisplay();
    }

    initTopicSearch() {
        console.log('ЁЯФН Initializing topic search...');
        const searchInput = document.getElementById('topic-search');
        const searchHint = document.getElementById('search-hint');
        
        if (!searchInput || !searchHint) {
            console.log('тЭМ Search elements not found!');
            return;
        }
        console.log('тЬЕ Search input found, initializing search...');

        // ╨б╨╛╤Е╤А╨░╨╜╤П╨╡╨╝ ╨╛╤А╨╕╨│╨╕╨╜╨░╨╗╤М╨╜╤Л╨╣ ╤Б╨┐╨╕╤Б╨╛╨║ ╤В╨╡╨╝ ╤Б ╨╕╤Е ╨┤╨░╨╜╨╜╤Л╨╝╨╕
        this.allTopics = Array.from(document.querySelectorAll('.topic-item-compact'));
        console.log('ЁЯУЛ Found topics:', this.allTopics.length);

        // ╨Ш╨╖╨▓╨╗╨╡╨║╨░╨╡╨╝ ╨┐╨╛╨╗╨╜╤Л╨╡ ╨┤╨░╨╜╨╜╤Л╨╡ ╤В╨╡╨╝ ╨┤╨╗╤П ╨│╨╗╤Г╨▒╨╛╨║╨╛╨│╨╛ ╨┐╨╛╨╕╤Б╨║╨░
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

        console.log('ЁЯУК Search data prepared for', this.topicsSearchData.length, 'topics');

        // ╨д╤Г╨╜╨║╤Ж╨╕╤П ╨┐╨╛╨┤╤Б╨▓╨╡╤В╨║╨╕ ╤В╨╡╨║╤Б╤В╨░
        const highlightText = (text, searchTerm) => {
            if (!searchTerm) return text;
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            return text.replace(regex, '<span class="highlight-search">$1</span>');
        };

        // ╨д╤Г╨╜╨║╤Ж╨╕╤П ╤Г╨┤╨░╨╗╨╡╨╜╨╕╤П ╨┐╨╛╨┤╤Б╨▓╨╡╤В╨║╨╕
        const removeHighlight = () => {
            document.querySelectorAll('.highlight-search').forEach(el => {
                const parent = el.parentNode;
                parent.replaceChild(document.createTextNode(el.textContent), el);
                parent.normalize();
            });
        };

        // ╨Ю╨▒╤А╨░╨▒╨╛╤В╤З╨╕╨║ ╨┐╨╛╨╕╤Б╨║╨░
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            console.log('ЁЯФО Search for:', searchTerm);

            // ╨г╨┤╨░╨╗╤П╨╡╨╝ ╨┐╤А╨╡╨┤╤Л╨┤╤Г╤Й╤Г╤О ╨┐╨╛╨┤╤Б╨▓╨╡╤В╨║╤Г
            removeHighlight();

            // ╨Я╨╛╨║╨░╨╖╤Л╨▓╨░╨╡╨╝/╤Б╨║╤А╤Л╨▓╨░╨╡╨╝ ╨┐╨╛╨┤╤Б╨║╨░╨╖╨║╤Г
            if (searchTerm === '' || searchTerm.length < 3) {
                searchHint.classList.remove('hidden');
                
                // ╨Я╨╛╨║╨░╨╖╤Л╨▓╨░╨╡╨╝ ╨▓╤Б╨╡ ╤В╨╡╨╝╤Л
                this.topicsSearchData.forEach((data) => {
                    data.element.style.display = 'flex';
                });
                return;
            }

            // ╨б╨║╤А╤Л╨▓╨░╨╡╨╝ ╨┐╨╛╨┤╤Б╨║╨░╨╖╨║╤Г ╨┐╤А╨╕ ╨░╨║╤В╨╕╨▓╨╜╨╛╨╝ ╨┐╨╛╨╕╤Б╨║╨╡
            searchHint.classList.add('hidden');

            console.log('ЁЯФН Performing search...');
            let matchCount = 0;

            // ╨Я╨╛╨╕╤Б╨║ ╨┐╨╛ ╨▓╤Б╨╡╨╝ ╨┤╨░╨╜╨╜╤Л╨╝ ╤В╨╡╨╝╤Л
            this.topicsSearchData.forEach((data) => {
                // ╨Я╤А╨╛╨▓╨╡╤А╤П╨╡╨╝ ╤Б╨╛╨╛╤В╨▓╨╡╤В╤Б╤В╨▓╨╕╨╡ ╨┐╨╛ ╨▓╤Б╨╡╨╝ ╨┐╨╛╨╗╤П╨╝
                const titleMatch = data.title.includes(searchTerm);
                const descMatch = data.description.includes(searchTerm);
                const lessonsMatch = data.lessons.includes(searchTerm);
                const practiceMatch = data.practice.includes(searchTerm);
                const quizMatch = data.quiz.includes(searchTerm);

                const isMatch = titleMatch || descMatch || lessonsMatch || practiceMatch || quizMatch;

                if (isMatch) {
                    matchCount++;
                    data.element.style.display = 'flex';
                    
                    // ╨Я╨╛╨┤╤Б╨▓╨╡╤З╨╕╨▓╨░╨╡╨╝ ╨╜╨░╨╣╨┤╨╡╨╜╨╜╤Л╨╣ ╤В╨╡╨║╤Б╤В ╨▓ ╨╖╨░╨│╨╛╨╗╨╛╨▓╨║╨╡
                    if (titleMatch) {
                        const titleElement = data.element.querySelector('.topic-title-compact');
                        titleElement.innerHTML = highlightText(titleElement.textContent, searchTerm);
                    }
                } else {
                    data.element.style.display = 'none';
                }
            });

            console.log(`тЬЕ Search complete: ${matchCount} matches found`);

            // Haptic feedback
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
        });

        // ╨Ю╤З╨╕╤Б╤В╨║╨░ ╨┐╤А╨╕ ╨┐╨╛╤В╨╡╤А╨╡ ╤Д╨╛╨║╤Г╤Б╨░
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                if (searchInput.value.trim() === '') {
                    removeHighlight();
                    searchHint.classList.remove('hidden');
                }
            }, 200);
        });

        console.log('тЬЕ Search initialized successfully!');
    }

    openSearchModal() {
        console.log('ЁЯФН Opening fullscreen search modal...');

        // ╨б╨╛╨╖╨┤╨░╨╡╨╝ ╨┐╨╛╨╗╨╜╨╛╤Н╨║╤А╨░╨╜╨╜╨╛╨╡ ╨╝╨╛╨┤╨░╨╗╤М╨╜╨╛╨╡ ╨╛╨║╨╜╨╛ ╨┐╨╛╨╕╤Б╨║╨░
        const searchModalHTML = `
            <div id="search-modal" class="search-modal-fullscreen" role="dialog" aria-modal="true" aria-labelledby="search-modal-title">
                <div class="search-modal-header">
                    <div class="search-input-container-full">
                        <button class="search-back-btn" onclick="window.subjectManager.closeSearchModal()" aria-label="╨Ч╨░╨║╤А╤Л╤В╤М ╨┐╨╛╨╕╤Б╨║">
                            <i class="material-icons">arrow_back</i>
                        </button>
                        <input type="text" id="search-modal-input" class="search-input-full" placeholder="╨Я╨╛╨╕╤Б╨║ ╤В╨╡╨╝, ╤В╨╡╨╛╤А╨╕╨╕, ╨┐╤А╨░╨║╤В╨╕╨║╨╕..." autocomplete="off" autofocus aria-label="╨Я╨╛╨╕╤Б╨║">
                        <button class="search-clear-btn" onclick="document.getElementById('search-modal-input').value=''; window.subjectManager.performSearch()" aria-label="╨Ю╤З╨╕╤Б╤В╨╕╤В╤М ╨┐╨╛╨╕╤Б╨║">
                            <i class="material-icons">clear</i>
                        </button>
                    </div>
                </div>

                <div class="search-modal-content">
                    <div class="search-filters" role="tablist" aria-label="╨д╨╕╨╗╤М╤В╤А╤Л ╨┐╨╛╨╕╤Б╨║╨░">
                        <button class="search-filter active" data-filter="all" onclick="window.subjectManager.setSearchFilter('all')" role="tab" aria-selected="true">
                            <i class="material-icons">search</i>
                            ╨Т╤Б╨╡
                        </button>
                        <button class="search-filter" data-filter="title" onclick="window.subjectManager.setSearchFilter('title')" role="tab" aria-selected="false">
                            <i class="material-icons">book</i>
                            ╨в╨╡╨╝╤Л
                        </button>
                        <button class="search-filter" data-filter="theory" onclick="window.subjectManager.setSearchFilter('theory')" role="tab" aria-selected="false">
                            <i class="material-icons">school</i>
                            ╨в╨╡╨╛╤А╨╕╤П
                        </button>
                        <button class="search-filter" data-filter="practice" onclick="window.subjectManager.setSearchFilter('practice')" role="tab" aria-selected="false">
                            <i class="material-icons">edit</i>
                            ╨Я╤А╨░╨║╤В╨╕╨║╨░
                        </button>
                    </div>

                    <div id="search-results" class="search-results-full" role="region" aria-label="╨а╨╡╨╖╤Г╨╗╤М╤В╨░╤В╤Л ╨┐╨╛╨╕╤Б╨║╨░">
                        <div class="search-placeholder" id="search-placeholder">
                            <div class="search-placeholder-icon">
                                <i class="material-icons">search</i>
                            </div>
                            <h3 id="search-modal-title">╨Э╨░╤З╨╜╨╕╤В╨╡ ╨┐╨╛╨╕╤Б╨║</h3>
                            <p>╨Т╨▓╨╡╨┤╨╕╤В╨╡ ╨╜╨░╨╖╨▓╨░╨╜╨╕╨╡ ╤В╨╡╨╝╤Л, ╤В╨╡╨╛╤А╨╕╨╕ ╨╕╨╗╨╕ ╨┐╤А╨░╨║╤В╨╕╨║╨╕</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // ╨Ф╨╛╨▒╨░╨▓╨╗╤П╨╡╨╝ ╨┐╨╛╨╗╨╜╨╛╤Н╨║╤А╨░╨╜╨╜╨╛╨╡ ╨╝╨╛╨┤╨░╨╗╤М╨╜╨╛╨╡ ╨╛╨║╨╜╨╛
        document.body.insertAdjacentHTML('beforeend', searchModalHTML);

        // ╨б╨╛╤Е╤А╨░╨╜╤П╨╡╨╝ ╨┐╤А╨╡╨┤╤Л╨┤╤Г╤Й╨╕╨╣ ╨░╨║╤В╨╕╨▓╨╜╤Л╨╣ ╤Н╨╗╨╡╨╝╨╡╨╜╤В ╨┤╨╗╤П ╤Д╨╛╨║╤Г╤Б╨░
        this.previousActiveElement = document.activeElement;

        // ╨д╨╛╨║╤Г╤Б ╨╜╨░ ╨┐╨╛╨╗╨╡ ╨▓╨▓╨╛╨┤╨░ ╨╕ ╤Г╤Б╤В╨░╨╜╨╛╨▓╨║╨░ ╨╛╨▒╤А╨░╨▒╨╛╤В╤З╨╕╨║╨╛╨▓
        setTimeout(() => {
            const modal = document.getElementById('search-modal');
            const input = document.getElementById('search-modal-input');

            if (modal && input) {
                // ╨Ю╨▒╤А╨░╨▒╨╛╤В╤З╨╕╨║ ╨║╨╗╨╕╨║╨░ ╨▓╨╜╨╡ ╨╝╨╛╨┤╨░╨╗╤М╨╜╨╛╨│╨╛ ╨╛╨║╨╜╨░
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.closeSearchModal();
                    }
                });

                // ╨д╨╛╨║╤Г╤Б ╨╜╨░ ╨┐╨╛╨╗╨╡ ╨▓╨▓╨╛╨┤╨░
                input.focus();

                // ╨Ю╨▒╤А╨░╨▒╨╛╤В╤З╨╕╨║ ╨▓╨▓╨╛╨┤╨░
                input.addEventListener('input', (e) => {
                    this.performSearch();
                });

                // ╨Ю╨▒╤А╨░╨▒╨╛╤В╤З╨╕╨║ ╨║╨╗╨░╨▓╨╕╤И
                // ╨Ю╨▒╤А╨░╨▒╨╛╤В╤З╨╕╨║ ╨║╨╗╨░╨▓╨╕╤И ╨┤╨╗╤П ╨┐╨╛╨╗╤П ╨▓╨▓╨╛╨┤╨░
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

                // ╨Ю╨▒╤А╨░╨▒╨╛╤В╤З╨╕╨║ ╨┤╨╗╤П ╨╝╨╛╨▒╨╕╨╗╤М╨╜╤Л╤Е ╤Г╤Б╤В╤А╨╛╨╣╤Б╤В╨▓ (╨▓╨╕╤А╤В╤Г╨░╨╗╤М╨╜╨░╤П ╨║╨╗╨░╨▓╨╕╨░╤В╤Г╤А╨░)
                if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.onEvent('viewportChanged', () => {
                        setTimeout(() => input.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                    });
                }
            }
        }, 100);

        // ╨Я╤А╨╡╨┤╨╛╤В╨▓╤А╨░╤Й╨░╨╡╨╝ ╨┐╤А╨╛╨║╤А╤Г╤В╨║╤Г ╨╛╤Б╨╜╨╛╨▓╨╜╨╛╨│╨╛ ╨║╨╛╨╜╤В╨╡╨╜╤В╨░
        document.body.style.overflow = 'hidden';

        console.log('тЬЕ Search modal opened');
    }

    closeSearchModal() {
        console.log('ЁЯФН Closing search modal...');
        const modal = document.getElementById('search-modal');

        if (modal) {
            modal.classList.add('closing');

            // ╨Т╨╛╤Б╤Б╤В╨░╨╜╨░╨▓╨╗╨╕╨▓╨░╨╡╨╝ ╨┐╤А╨╛╨║╤А╤Г╤В╨║╤Г ╨╛╤Б╨╜╨╛╨▓╨╜╨╛╨│╨╛ ╨║╨╛╨╜╤В╨╡╨╜╤В╨░
            document.body.style.overflow = '';

            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }

                // ╨Т╨╛╤Б╤Б╤В╨░╨╜╨░╨▓╨╗╨╕╨▓╨░╨╡╨╝ ╤Д╨╛╨║╤Г╤Б ╨╜╨░ ╨┐╤А╨╡╨┤╤Л╨┤╤Г╤Й╨╕╨╣ ╤Н╨╗╨╡╨╝╨╡╨╜╤В
                if (this.previousActiveElement && this.previousActiveElement.focus) {
                    this.previousActiveElement.focus();
                }

                this.previousActiveElement = null;
            }, 300);
        }
        console.log('тЬЕ Search modal closed');
    }

    setSearchFilter(filter) {
        console.log('ЁЯФН Setting search filter:', filter);

        // ╨Ю╨▒╨╜╨╛╨▓╨╗╤П╨╡╨╝ ╨░╨║╤В╨╕╨▓╨╜╤Л╨╣ ╤Д╨╕╨╗╤М╤В╤А
        document.querySelectorAll('.search-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        this.currentSearchFilter = filter;
        this.performSearch();
    }

    performSearch() {
        const query = document.getElementById('search-modal-input')?.value?.toLowerCase().trim() || '';
        console.log('ЁЯФН Performing search:', query, 'filter:', this.currentSearchFilter || 'all');

        const resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) return;

        if (query.length < 2) {
            resultsContainer.innerHTML = `
                <div class="search-placeholder">
                    <div class="search-placeholder-icon">
                        <i class="material-icons">search</i>
                    </div>
                    <h3>╨Т╨▓╨╡╨┤╨╕╤В╨╡ ╨╖╨░╨┐╤А╨╛╤Б</h3>
                    <p>╨Э╨░╤З╨╜╨╕╤В╨╡ ╨▓╨▓╨╛╨┤╨╕╤В╤М ╨╜╨░╨╖╨▓╨░╨╜╨╕╨╡ ╤В╨╡╨╝╤Л, ╤В╨╡╨╛╤А╨╕╨╕ ╨╕╨╗╨╕ ╨┐╤А╨░╨║╤В╨╕╨║╨╕</p>
                </div>
            `;
            return;
        }

        // ╨Ш╨╝╨╕╤В╨╕╤А╤Г╨╡╨╝ ╨┐╨╛╨╕╤Б╨║ (╨▓ ╤А╨╡╨░╨╗╤М╨╜╨╛╨╝ ╨┐╤А╨╕╨╗╨╛╨╢╨╡╨╜╨╕╨╕ ╨╖╨┤╨╡╤Б╤М ╨▒╤Г╨┤╨╡╤В ╨┐╨╛╨╕╤Б╨║ ╨┐╨╛ ╨║╨╛╨╜╤В╨╡╨╜╤В╤Г)
        const mockResults = [
            { type: 'title', title: '╨Ш╤А╤А╨░╤Ж╨╕╨╛╨╜╨░╨╗╤М╨╜╤Л╨╡ ╤З╨╕╤Б╨╗╨░', subject: 'math', grade: 8, description: '╨Я╨╛╨╜╤П╤В╨╕╨╡ ╨╕╤А╤А╨░╤Ж╨╕╨╛╨╜╨░╨╗╤М╨╜╨╛╨│╨╛ ╤З╨╕╤Б╨╗╨░, ╨┤╨╡╤Б╤П╤В╨╕╤З╨╜╤Л╨╡ ╨┐╤А╨╕╨▒╨╗╨╕╨╢╨╡╨╜╨╕╤П' },
            { type: 'title', title: '╨Ъ╨▓╨░╨┤╤А╨░╤В╨╜╤Л╨╡ ╨║╨╛╤А╨╜╨╕', subject: 'math', grade: 8, description: '╨Р╤А╨╕╤Д╨╝╨╡╤В╨╕╤З╨╡╤Б╨║╨╕╨╣ ╨║╨▓╨░╨┤╤А╨░╤В╨╜╤Л╨╣ ╨║╨╛╤А╨╡╨╜╤М, ╤Б╨▓╨╛╨╣╤Б╤В╨▓╨░ ╨║╨╛╤А╨╜╨╡╨╣' },
            { type: 'title', title: '╨в╤А╨╕╨│╨╛╨╜╨╛╨╝╨╡╤В╤А╨╕╤П', subject: 'math', grade: 8, description: '╨Ю╤Б╨╜╨╛╨▓╤Л ╤В╤А╨╕╨│╨╛╨╜╨╛╨╝╨╡╤В╤А╨╕╨╕, ╤Б╨╕╨╜╤Г╤Б, ╨║╨╛╤Б╨╕╨╜╤Г╤Б, ╤В╨░╨╜╨│╨╡╨╜╤Б' },
            { type: 'title', title: '╨Я╤А╨╛╨╕╨╖╨▓╨╛╨┤╨╜╤Л╨╡', subject: 'math', grade: 9, description: '╨Я╨╛╨╜╤П╤В╨╕╨╡ ╨┐╤А╨╛╨╕╨╖╨▓╨╛╨┤╨╜╨╛╨╣, ╨┐╤А╨░╨▓╨╕╨╗╨░ ╨┤╨╕╤Д╤Д╨╡╤А╨╡╨╜╤Ж╨╕╤А╨╛╨▓╨░╨╜╨╕╤П' },
            { type: 'title', title: '╨У╨╗╨░╨│╨╛╨╗╤Л', subject: 'english', grade: 5, description: '╨д╨╛╤А╨╝╤Л ╨│╨╗╨░╨│╨╛╨╗╨╛╨▓ ╨▓ ╨░╨╜╨│╨╗╨╕╨╣╤Б╨║╨╛╨╝ ╤П╨╖╤Л╨║╨╡' },
            { type: 'title', title: '╨е╨╕╨╝╨╕╤З╨╡╤Б╨║╨╕╨╡ ╤А╨╡╨░╨║╤Ж╨╕╨╕', subject: 'chemistry', grade: 8, description: '╨в╨╕╨┐╤Л ╤Е╨╕╨╝╨╕╤З╨╡╤Б╨║╨╕╤Е ╤А╨╡╨░╨║╤Ж╨╕╨╣ ╨╕ ╨╕╤Е ╨┐╤А╨╕╨╖╨╜╨░╨║╨╕' },
            { type: 'theory', title: '╨б╨▓╨╛╨╣╤Б╤В╨▓╨░ ╨║╨▓╨░╨┤╤А╨░╤В╨╜╤Л╤Е ╨║╨╛╤А╨╜╨╡╨╣', subject: 'math', grade: 8, description: '╨в╨╡╨╛╤А╨╡╤В╨╕╤З╨╡╤Б╨║╨╕╨╡ ╨╛╤Б╨╜╨╛╨▓╤Л ╤А╨░╨▒╨╛╤В╤Л ╤Б ╨║╨╛╤А╨╜╤П╨╝╨╕' },
            { type: 'practice', title: '╨а╨╡╤И╨╡╨╜╨╕╨╡ ╤Г╤А╨░╨▓╨╜╨╡╨╜╨╕╨╣ ╤Б ╨║╨╛╤А╨╜╤П╨╝╨╕', subject: 'math', grade: 8, description: '╨Я╤А╨░╨║╤В╨╕╤З╨╡╤Б╨║╨╕╨╡ ╨╖╨░╨┤╨░╨╜╨╕╤П ╨┐╨╛ ╨║╨╛╤А╨╡╨╜╨╜╤Л╨╝ ╤Г╤А╨░╨▓╨╜╨╡╨╜╨╕╤П╨╝' },
            { type: 'practice', title: '╨в╤А╨╕╨│╨╛╨╜╨╛╨╝╨╡╤В╤А╨╕╤З╨╡╤Б╨║╨╕╨╡ ╤В╨╛╨╢╨┤╨╡╤Б╤В╨▓╨░', subject: 'math', grade: 9, description: '╨г╨┐╤А╨░╨╢╨╜╨╡╨╜╨╕╤П ╨╜╨░ ╨┐╤А╨╕╨╝╨╡╨╜╨╡╨╜╨╕╨╡ ╤В╤А╨╕╨│╨╛╨╜╨╛╨╝╨╡╤В╤А╨╕╤З╨╡╤Б╨║╨╕╤Е ╤Д╨╛╤А╨╝╤Г╨╗' }
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
                    <h3>╨Э╨╕╤З╨╡╨│╨╛ ╨╜╨╡ ╨╜╨░╨╣╨┤╨╡╨╜╨╛</h3>
                    <p>╨Я╨╛╨┐╤А╨╛╨▒╤Г╨╣╤В╨╡ ╨╕╨╖╨╝╨╡╨╜╨╕╤В╤М ╨╖╨░╨┐╤А╨╛╤Б ╨╕╨╗╨╕ ╨▓╤Л╨▒╤А╨░╤В╤М ╨┤╤А╤Г╨│╨╛╨╣ ╤Д╨╕╨╗╤М╤В╤А</p>
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
                        <div class="search-result-meta">${subjectName} тАв ${result.grade} ╨║╨╗╨░╤Б╤Б тАв ${result.type === 'title' ? '╨в╨╡╨╝╨░' : result.type === 'theory' ? '╨в╨╡╨╛╤А╨╕╤П' : '╨Я╤А╨░╨║╤В╨╕╨║╨░'}</div>
                        <div class="search-result-description">${result.description}</div>
                    </div>
                    <div class="search-result-arrow">
                        <i class="material-icons">arrow_forward</i>
                    </div>
                </div>
            `}).join('');
        }

        console.log('тЬЕ Search completed, found:', filteredResults.length, 'results');
    }

    selectSearchResult(type, title) {
        console.log('ЁЯОп Selected search result:', type, title);

        // ╨Ч╨░╨║╤А╤Л╨▓╨░╨╡╨╝ ╨╝╨╛╨┤╨░╨╗╤М╨╜╨╛╨╡ ╨╛╨║╨╜╨╛ ╨┐╨╛╨╕╤Б╨║╨░
        this.closeSearchModal();

        // ╨Ш╨╝╨╕╤В╨╕╤А╤Г╨╡╨╝ ╨┐╨╡╤А╨╡╤Е╨╛╨┤ ╨║ ╤А╨╡╨╖╤Г╨╗╤М╤В╨░╤В╤Г
        if (window.app && window.app.showMessage) {
            const typeText = type === 'title' ? '╤В╨╡╨╝╨╡' : type === 'theory' ? '╤В╨╡╨╛╤А╨╕╨╕' : '╨┐╤А╨░╨║╤В╨╕╨║╨╡';
            window.app.showMessage(`╨Ю╤В╨║╤А╤Л╨▓╨░╨╡╨╝ ${typeText}: ${title}`, 'info');

            // ╨Ш╨╝╨╕╤В╨╕╤А╤Г╨╡╨╝ ╨╖╨░╨│╤А╤Г╨╖╨║╤Г ╨║╨╛╨╜╤В╨╡╨╜╤В╨░
            setTimeout(() => {
                window.app.showMessage(`╨Ф╨╛╨▒╤А╨╛ ╨┐╨╛╨╢╨░╨╗╨╛╨▓╨░╤В╤М ╨▓ "${title}"! ╨Ъ╨╛╨╜╤В╨╡╨╜╤В ╨╖╨░╨│╤А╤Г╨╢╨░╨╡╤В╤Б╤П...`, 'success');
            }, 800);
        }

        // ╨Ф╨╛╨▒╨░╨▓╨╗╤П╨╡╨╝ haptic feedback ╨┤╨╗╤П Telegram
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }
    }

}

// Initialize subject manager
window.subjectManager = new SubjectManager();
window.subjectManager = new SubjectManager();
