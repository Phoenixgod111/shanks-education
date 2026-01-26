// Data Manager Class
class DataManager {
    static async loadSubjects() {
        // For now, return mock data
        // In production, this would load from an API or local storage
        return [
            {
                id: 'math',
                name: 'Математика',
                grade: 5,
                description: 'Основы математики для 5 класса',
                icon: 'calculate',
                color: '#2196F3'
            },
            {
                id: 'russian',
                name: 'Русский язык',
                grade: 5,
                description: 'Изучение русского языка',
                icon: 'text_fields',
                color: '#4CAF50'
            },
            {
                id: 'english',
                name: 'Английский язык',
                grade: 5,
                description: 'Основы английского языка',
                icon: 'language',
                color: '#FF9800'
            },
            {
                id: 'history',
                name: 'История',
                grade: 5,
                description: 'История России и мира',
                icon: 'history',
                color: '#9C27B0'
            },
            {
                id: 'math',
                name: 'Математика',
                grade: 6,
                description: 'Математика для 6 класса',
                icon: 'calculate',
                color: '#2196F3'
            },
            {
                id: 'russian',
                name: 'Русский язык',
                grade: 6,
                description: 'Русский язык для 6 класса',
                icon: 'text_fields',
                color: '#4CAF50'
            },
            {
                id: 'english',
                name: 'Английский язык',
                grade: 6,
                description: 'Английский язык для 6 класса',
                icon: 'language',
                color: '#FF9800'
            },
            {
                id: 'history',
                name: 'История',
                grade: 6,
                description: 'История древнего мира',
                icon: 'history',
                color: '#9C27B0'
            },
            {
                id: 'literature',
                name: 'Литература',
                grade: 6,
                description: 'Русская литература',
                icon: 'menu_book',
                color: '#795548'
            },
            {
                id: 'geography',
                name: 'География',
                grade: 6,
                description: 'География материков',
                icon: 'public',
                color: '#00BCD4'
            },
            {
                id: 'biology',
                name: 'Биология',
                grade: 6,
                description: 'Основы биологии',
                icon: 'nature',
                color: '#8BC34A'
            },
            {
                id: 'informatics',
                name: 'Информатика',
                grade: 6,
                description: 'Основы информатики',
                icon: 'memory',
                color: '#3F51B5'
            },
            {
                id: 'physics',
                name: 'Физика',
                grade: 7,
                description: 'Основы физики',
                icon: 'science',
                color: '#F44336'
            },
            {
                id: 'chemistry',
                name: 'Химия',
                grade: 8,
                description: 'Основы химии',
                icon: 'science',
                color: '#607D8B'
            },
            {
                id: 'biology',
                name: 'Биология',
                grade: 9,
                description: 'Основы биологии',
                icon: 'nature',
                color: '#8BC34A'
            },
            {
                id: 'geography',
                name: 'География',
                grade: 10,
                description: 'География России и мира',
                icon: 'public',
                color: '#00BCD4'
            },
            {
                id: 'literature',
                name: 'Литература',
                grade: 11,
                description: 'Русская литература',
                icon: 'menu_book',
                color: '#795548'
            },
            // 7 класс
            {
                id: 'math',
                name: 'Математика',
                grade: 7,
                description: 'Основы алгебры и геометрии',
                icon: 'calculate',
                color: '#2196F3'
            },
            {
                id: 'chemistry',
                name: 'Химия',
                grade: 7,
                description: 'Основы химии',
                icon: 'science',
                color: '#607D8B'
            },
            {
                id: 'biology',
                name: 'Биология',
                grade: 7,
                description: 'Основы биологии',
                icon: 'nature',
                color: '#8BC34A'
            },
            {
                id: 'geography',
                name: 'География',
                grade: 7,
                description: 'География России',
                icon: 'public',
                color: '#00BCD4'
            },
            {
                id: 'informatics',
                name: 'Информатика',
                grade: 7,
                description: 'Основы информатики',
                icon: 'memory',
                color: '#3F51B5'
            },
            // 8 класс
            {
                id: 'russian',
                name: 'Русский язык',
                grade: 8,
                description: 'Русский язык и литература',
                icon: 'text_fields',
                color: '#4CAF50'
            },
            {
                id: 'english',
                name: 'Английский язык',
                grade: 8,
                description: 'Английский язык',
                icon: 'language',
                color: '#FF9800'
            },
            {
                id: 'math',
                name: 'Математика',
                grade: 8,
                description: 'Алгебра и геометрия',
                icon: 'calculate',
                color: '#2196F3'
            },
            {
                id: 'physics',
                name: 'Физика',
                grade: 8,
                description: 'Механика и молекулярная физика',
                icon: 'science',
                color: '#F44336'
            },
            {
                id: 'chemistry',
                name: 'Химия',
                grade: 8,
                description: 'Органическая химия',
                icon: 'science',
                color: '#607D8B'
            },
            {
                id: 'biology',
                name: 'Биология',
                grade: 8,
                description: 'Биология человека',
                icon: 'nature',
                color: '#8BC34A'
            },
            {
                id: 'history',
                name: 'История',
                grade: 8,
                description: 'История России 19-20 века',
                icon: 'history',
                color: '#9C27B0'
            },
            {
                id: 'social-science',
                name: 'Обществознание',
                grade: 8,
                description: 'Основы права',
                icon: 'people',
                color: '#3F51B5'
            },
            // 9 класс
            {
                id: 'russian',
                name: 'Русский язык',
                grade: 9,
                description: 'Русский язык и литература',
                icon: 'text_fields',
                color: '#4CAF50'
            },
            {
                id: 'english',
                name: 'Английский язык',
                grade: 9,
                description: 'Английский язык',
                icon: 'language',
                color: '#FF9800'
            },
            {
                id: 'math',
                name: 'Математика',
                grade: 9,
                description: 'Алгебра и геометрия',
                icon: 'calculate',
                color: '#2196F3'
            },
            {
                id: 'physics',
                name: 'Физика',
                grade: 9,
                description: 'Электродинамика',
                icon: 'science',
                color: '#F44336'
            },
            {
                id: 'chemistry',
                name: 'Химия',
                grade: 9,
                description: 'Строение вещества',
                icon: 'science',
                color: '#607D8B'
            },
            {
                id: 'biology',
                name: 'Биология',
                grade: 9,
                description: 'Эволюция и экология',
                icon: 'nature',
                color: '#8BC34A'
            },
            {
                id: 'history',
                name: 'История',
                grade: 9,
                description: 'Новейшая история',
                icon: 'history',
                color: '#9C27B0'
            },
            {
                id: 'social-science',
                name: 'Обществознание',
                grade: 9,
                description: 'Гражданское общество',
                icon: 'people',
                color: '#3F51B5'
            },
            {
                id: 'geography',
                name: 'География',
                grade: 9,
                description: 'Экономическая география',
                icon: 'public',
                color: '#00BCD4'
            },
            {
                id: 'informatics',
                name: 'Информатика',
                grade: 9,
                description: 'Информатика',
                icon: 'memory',
                color: '#3F51B5'
            },
            // 10 класс
            {
                id: 'russian',
                name: 'Русский язык',
                grade: 10,
                description: 'Русский язык и литература',
                icon: 'text_fields',
                color: '#4CAF50'
            },
            {
                id: 'english',
                name: 'Английский язык',
                grade: 10,
                description: 'Английский язык',
                icon: 'language',
                color: '#FF9800'
            },
            {
                id: 'math',
                name: 'Математика',
                grade: 10,
                description: 'Алгебра и геометрия',
                icon: 'calculate',
                color: '#2196F3'
            },
            {
                id: 'physics',
                name: 'Физика',
                grade: 10,
                description: 'Квантовая физика',
                icon: 'science',
                color: '#F44336'
            },
            {
                id: 'chemistry',
                name: 'Химия',
                grade: 10,
                description: 'Химическая кинетика',
                icon: 'science',
                color: '#607D8B'
            },
            {
                id: 'biology',
                name: 'Биология',
                grade: 10,
                description: 'Генетика и биотехнологии',
                icon: 'nature',
                color: '#8BC34A'
            },
            {
                id: 'history',
                name: 'История',
                grade: 10,
                description: 'Новейшая история',
                icon: 'history',
                color: '#9C27B0'
            },
            {
                id: 'literature',
                name: 'Литература',
                grade: 10,
                description: 'Русская литература 19 века',
                icon: 'menu_book',
                color: '#795548'
            },
            {
                id: 'social-science',
                name: 'Обществознание',
                grade: 10,
                description: 'Политология',
                icon: 'people',
                color: '#3F51B5'
            },
            {
                id: 'informatics',
                name: 'Информатика',
                grade: 10,
                description: 'Информатика',
                icon: 'memory',
                color: '#3F51B5'
            },
            // 11 класс
            {
                id: 'russian',
                name: 'Русский язык',
                grade: 11,
                description: 'Подготовка к ЕГЭ',
                icon: 'text_fields',
                color: '#4CAF50'
            },
            {
                id: 'math',
                name: 'Математика',
                grade: 11,
                description: 'Подготовка к ЕГЭ',
                icon: 'calculate',
                color: '#2196F3'
            },
            {
                id: 'physics',
                name: 'Физика',
                grade: 11,
                description: 'Подготовка к ЕГЭ',
                icon: 'science',
                color: '#F44336'
            },
            {
                id: 'chemistry',
                name: 'Химия',
                grade: 11,
                description: 'Подготовка к ЕГЭ',
                icon: 'science',
                color: '#607D8B'
            },
            {
                id: 'biology',
                name: 'Биология',
                grade: 11,
                description: 'Подготовка к ЕГЭ',
                icon: 'nature',
                color: '#8BC34A'
            },
            {
                id: 'history',
                name: 'История',
                grade: 11,
                description: 'Подготовка к ЕГЭ',
                icon: 'history',
                color: '#9C27B0'
            },
            {
                id: 'literature',
                name: 'Литература',
                grade: 11,
                description: 'Подготовка к ЕГЭ',
                icon: 'menu_book',
                color: '#795548'
            },
            {
                id: 'social-science',
                name: 'Обществознание',
                grade: 11,
                description: 'Подготовка к ЕГЭ',
                icon: 'people',
                color: '#3F51B5'
            },
            {
                id: 'english',
                name: 'Английский язык',
                grade: 11,
                description: 'Подготовка к ЕГЭ',
                icon: 'language',
                color: '#FF9800'
            },
            {
                id: 'informatics',
                name: 'Информатика',
                grade: 11,
                description: 'Подготовка к ЕГЭ',
                icon: 'memory',
                color: '#3F51B5'
            }
        ];
    }

    static async loadTests(subjectId) {
        // Mock test data
        return [
            {
                id: 1,
                subjectId: subjectId,
                title: 'Тест по основам',
                description: 'Проверьте свои знания основ',
                questions: 10,
                timeLimit: 15, // minutes
                difficulty: 'easy'
            },
            {
                id: 2,
                subjectId: subjectId,
                title: 'Промежуточный тест',
                description: 'Тест среднего уровня сложности',
                questions: 15,
                timeLimit: 20,
                difficulty: 'medium'
            },
            {
                id: 3,
                subjectId: subjectId,
                title: 'Финальный тест',
                description: 'Комплексный тест по всем темам',
                questions: 20,
                timeLimit: 30,
                difficulty: 'hard'
            }
        ];
    }

    static async loadAchievements() {
        return [
            {
                id: 1,
                title: 'Первый шаг',
                description: 'Завершите первый тест',
                icon: 'stars',
                unlocked: true,
                progress: 100
            },
            {
                id: 2,
                title: 'Отличник',
                description: 'Получите 5 баллов за тест',
                icon: 'grade',
                unlocked: true,
                progress: 100
            },
            {
                id: 3,
                title: 'Усердный ученик',
                description: 'Завершите 10 тестов',
                icon: 'school',
                unlocked: false,
                progress: 70
            },
            {
                id: 4,
                title: 'Гений математики',
                description: 'Получите максимальный балл по математике',
                icon: 'calculate',
                unlocked: false,
                progress: 0
            }
        ];
    }

    static async loadDailyChallenge() {
        return {
            id: 1,
            title: 'Математический ребус',
            description: 'Решите эту интересную задачу и получите дополнительные баллы!',
            type: 'math',
            difficulty: 'medium',
            reward: {
                points: 50,
                experience: 25
            },
            timeLeft: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
            question: 'Найдите значение выражения: 2³ × (4 + 6) ÷ 2',
            options: ['20', '32', '40', '56'],
            correctAnswer: 2 // index of correct answer
        };
    }

    static async saveUserProgress(userId, subjectId, progress) {
        // In production, this would save to a database
        const key = `progress_${userId}_${subjectId}`;
        localStorage.setItem(key, JSON.stringify(progress));
    }

    static async loadUserProgress(userId, subjectId) {
        const key = `progress_${userId}_${subjectId}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    static async saveTestResult(userId, testId, result) {
        const key = `test_result_${userId}_${testId}`;
        localStorage.setItem(key, JSON.stringify({
            ...result,
            timestamp: Date.now()
        }));
    }

    static async loadTestResults(userId) {
        const results = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(`test_result_${userId}_`)) {
                const result = JSON.parse(localStorage.getItem(key));
                results.push(result);
            }
        }
        return results;
    }

    static async getUserStats(userId) {
        const results = await this.loadTestResults(userId);

        return {
            totalTests: results.length,
            averageScore: results.length > 0 ?
                results.reduce((sum, r) => sum + r.score, 0) / results.length : 0,
            totalPoints: results.reduce((sum, r) => sum + (r.points || 0), 0),
            streak: this.calculateStreak(results),
            achievements: await this.loadAchievements()
        };
    }

    static calculateStreak(results) {
        if (results.length === 0) return 0;

        // Sort by date (newest first)
        const sortedResults = results.sort((a, b) => b.timestamp - a.timestamp);

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedResults.length; i++) {
            const resultDate = new Date(sortedResults[i].timestamp);
            resultDate.setHours(0, 0, 0, 0);

            const daysDiff = Math.floor((today - resultDate) / (1000 * 60 * 60 * 24));

            if (daysDiff === streak) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }
}

// Make DataManager globally available
window.DataManager = DataManager;