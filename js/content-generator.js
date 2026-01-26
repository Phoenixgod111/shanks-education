// Content Generator - генератор базовой структуры контента
class ContentGenerator {
    static generateBasicTopics(subjectName, grade) {
        const templates = {
            'Русский язык': {
                5: [
                    { id: 'phonetics-5', title: 'Фонетика', description: 'Звуки и буквы', difficulty: 'easy', time: 30 },
                    { id: 'morphology-5', title: 'Морфология', description: 'Части речи', difficulty: 'medium', time: 45 },
                    { id: 'syntax-5', title: 'Синтаксис', description: 'Предложение и текст', difficulty: 'medium', time: 40 }
                ],
                6: [
                    { id: 'phonetics-advanced-6', title: 'Фонетика углубленная', description: 'Слог, ударение', difficulty: 'medium', time: 35 },
                    { id: 'word-formation-6', title: 'Словообразование', description: 'Образование слов', difficulty: 'medium', time: 40 }
                ]
            },
            'Математика': {
                5: [
                    { id: 'numbers-5', title: 'Натуральные числа', description: 'Изучение чисел', difficulty: 'easy', time: 30 },
                    { id: 'arithmetic-5', title: 'Арифметические действия', description: 'Сложение, вычитание', difficulty: 'easy', time: 35 },
                    { id: 'multiplication-5', title: 'Умножение', description: 'Таблица умножения', difficulty: 'medium', time: 40 }
                ]
            },
            'Физика': {
                7: [
                    { id: 'mechanics-intro-7', title: 'Введение в механику', description: 'Основные понятия', difficulty: 'easy', time: 30 },
                    { id: 'motion-7', title: 'Движение', description: 'Виды движения', difficulty: 'medium', time: 40 }
                ]
            }
        };

        const subjectTopics = templates[subjectName];
        if (!subjectTopics || !subjectTopics[grade]) {
            return {
                grade: grade,
                subject: subjectName,
                topics: [{
                    id: `${subjectName.toLowerCase().replace(' ', '-')}-${grade}-intro`,
                    title: `Введение в ${subjectName}`,
                    description: `Основы ${subjectName} для ${grade} класса`,
                    difficulty: 'easy',
                    estimatedTime: 30,
                    lessons: [],
                    quiz: {}
                }]
            };
        }

        return {
            grade: grade,
            subject: subjectName,
            topics: subjectTopics[grade].map(topic => ({
                id: topic.id,
                title: topic.title,
                description: topic.description,
                difficulty: topic.difficulty,
                estimatedTime: topic.time,
                lessons: [],
                quiz: {}
            }))
        };
    }

    static saveTopicsFile(subjectId, grade, topics) {
        const fileName = `web/subjects/${subjectId}/grade-${grade}/topics.json`;

        // Создаем папку если не существует
        const dir = `web/subjects/${subjectId}/grade-${grade}`;
        // В браузере мы не можем создавать файлы, но можем показать как должна выглядеть структура

        console.log(`Создать файл: ${fileName}`);
        console.log('Содержимое:', JSON.stringify(topics, null, 2));

        return topics;
    }
}

// Экспортируем для использования
window.ContentGenerator = ContentGenerator;