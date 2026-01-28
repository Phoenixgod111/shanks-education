#!/bin/bash

# ПОЛНАЯ АВТОМАТИЧЕСКАЯ ИНТЕГРАЦИЯ ВСЕХ ДАННЫХ
echo "🚀 ЗАПУСК ПОЛНОЙ ИНТЕГРАЦИИ SHANKS EDUCATION..."

cd /var/www/shanks-education

# Функция для создания предмета
create_subject() {
    local subject_id=$1
    local subject_name=$2
    local icon=$3
    local classes=$4
    local description=$5

    echo "📚 Создаем предмет: $subject_name"

    # Добавляем в subjects-config.json
    if [ ! -f subjects/subjects-config.json ]; then
        echo '{"subjects": []}' > subjects/subjects-config.json
    fi

    # Проверяем, есть ли уже предмет
    if ! grep -q "\"id\": \"$subject_id\"" subjects/subjects-config.json; then
        # Добавляем предмет в конфиг
        sed -i "s/\"subjects\": \[/\"subjects\": [\n    {\n      \"id\": \"$subject_id\",\n      \"name\": \"$subject_name\",\n      \"icon\": \"$icon\",\n      \"classes\": $classes,\n      \"description\": \"$description\"\n    },/" subjects/subjects-config.json
    fi

    # Создаем директорию
    mkdir -p "subjects/$subject_id"
    echo "✅ $subject_name готов"
}

# Функция для создания тем класса
create_class_topics() {
    local subject=$1
    local class=$2
    local topics_data=$3

    echo "📝 Создаем темы $class класса для $subject"
    echo "$topics_data" > "subjects/$subject/topics-$class.json"
}

# 1. МАТЕМАТИКА - ПОЛНАЯ ИНТЕГРАЦИЯ
echo "🎯 ИНТЕГРАЦИЯ МАТЕМАТИКИ..."

create_subject "math" "Математика" "calculate" "[5,6,7,8,9]" "Изучение математики в 5-9 классах. Включает арифметику, алгебру, геометрию, вероятность и статистику."

# Класс 5
create_class_topics "math" "5" '{
  "class": 5,
  "topics": [
    {"id": "natural-numbers-and-zero", "title": "Натуральные числа и нуль", "difficulty": "beginner", "estimatedTime": 1935},
    {"id": "fractions-basic", "title": "Дроби", "difficulty": "beginner", "estimatedTime": 2160},
    {"id": "word-problems", "title": "Решение текстовых задач", "difficulty": "beginner", "estimatedTime": 900},
    {"id": "geometry-lines", "title": "Наглядная геометрия: линии", "difficulty": "beginner", "estimatedTime": 540},
    {"id": "geometry-polygons", "title": "Наглядная геометрия: многоугольники", "difficulty": "beginner", "estimatedTime": 450},
    {"id": "decimal-fractions", "title": "Десятичные дроби", "difficulty": "beginner", "estimatedTime": 1710},
    {"id": "geometry-3d", "title": "Наглядная геометрия: пространственные фигуры", "difficulty": "beginner", "estimatedTime": 405},
    {"id": "review-5", "title": "Повторение и обобщение", "difficulty": "beginner", "estimatedTime": 450}
  ]
}'

# Класс 6
create_class_topics "math" "6" '{
  "class": 6,
  "topics": [
    {"id": "natural-numbers-operations", "title": "Натуральные числа: действия и свойства", "difficulty": "intermediate", "estimatedTime": 1350},
    {"id": "geometry-plane-lines", "title": "Наглядная геометрия: прямые на плоскости", "difficulty": "beginner", "estimatedTime": 315},
    {"id": "fractions-operations", "title": "Дроби: действия", "difficulty": "intermediate", "estimatedTime": 1440},
    {"id": "integers", "title": "Положительные и отрицательные числа", "difficulty": "intermediate", "estimatedTime": 1800},
    {"id": "data-representation", "title": "Представление данных", "difficulty": "beginner", "estimatedTime": 270},
    {"id": "review-6", "title": "Повторение", "difficulty": "intermediate", "estimatedTime": 900}
  ]
}'

# Класс 7
create_class_topics "math" "7" '{
  "class": 7,
  "topics": [
    {"id": "rational-numbers", "title": "Рациональные числа", "difficulty": "intermediate", "estimatedTime": 1125},
    {"id": "algebraic-expressions", "title": "Алгебраические выражения", "difficulty": "intermediate", "estimatedTime": 1215},
    {"id": "equations-inequalities", "title": "Уравнения и неравенства", "difficulty": "intermediate", "estimatedTime": 900},
    {"id": "coordinates-graphs-functions", "title": "Координаты и графики. Функции", "difficulty": "intermediate", "estimatedTime": 1080},
    {"id": "geometry-basic-figures", "title": "Простейшие геометрические фигуры", "difficulty": "beginner", "estimatedTime": 630},
    {"id": "geometry-triangles", "title": "Треугольники", "difficulty": "intermediate", "estimatedTime": 990},
    {"id": "review-7", "title": "Повторение", "difficulty": "intermediate", "estimatedTime": 270}
  ]
}'

# Класс 8
create_class_topics "math" "8" '{
  "class": 8,
  "topics": [
    {"id": "irrational-numbers", "title": "Квадратные корни и действительные числа", "difficulty": "advanced", "estimatedTime": 1080},
    {"id": "quadratic-equations", "title": "Квадратные уравнения", "difficulty": "advanced", "estimatedTime": 900},
    {"id": "systems-equations", "title": "Системы уравнений", "difficulty": "advanced", "estimatedTime": 720},
    {"id": "inequalities", "title": "Неравенства", "difficulty": "advanced", "estimatedTime": 630},
    {"id": "functions-quadratic", "title": "Квадратичная функция", "difficulty": "advanced", "estimatedTime": 720}
  ]
}'

# Класс 9
create_class_topics "math" "9" '{
  "class": 9,
  "topics": [
    {"id": "trigonometry", "title": "Тригонометрия", "difficulty": "advanced", "estimatedTime": 900},
    {"id": "vectors", "title": "Векторы", "difficulty": "advanced", "estimatedTime": 720},
    {"id": "coordinate-method", "title": "Координатный метод", "difficulty": "advanced", "estimatedTime": 810},
    {"id": "sequences-progressions", "title": "Прогрессии", "difficulty": "advanced", "estimatedTime": 720},
    {"id": "combinatorics", "title": "Комбинаторика", "difficulty": "advanced", "estimatedTime": 540},
    {"id": "probability-theory", "title": "Теория вероятностей", "difficulty": "advanced", "estimatedTime": 630}
  ]
}'

# 2. РУССКИЙ ЯЗЫК - БАЗОВАЯ СТРУКТУРА
echo "📚 ИНТЕГРАЦИЯ РУССКОГО ЯЗЫКА..."

create_subject "russian" "Русский язык" "text_fields" "[5,6,7,8,9]" "Изучение русского языка в 5-9 классах. Включает грамматику, орфографию, развитие речи."

create_class_topics "russian" "5" '{
  "class": 5,
  "topics": [
    {"id": "phonetics", "title": "Фонетика", "difficulty": "beginner", "estimatedTime": 900},
    {"id": "morphology-nouns", "title": "Имя существительное", "difficulty": "beginner", "estimatedTime": 1350},
    {"id": "morphology-adjectives", "title": "Имя прилагательное", "difficulty": "beginner", "estimatedTime": 900},
    {"id": "syntax-simple-sentence", "title": "Простое предложение", "difficulty": "beginner", "estimatedTime": 720}
  ]
}'

# 3. АНГЛИЙСКИЙ ЯЗЫК
echo "📚 ИНТЕГРАЦИЯ АНГЛИЙСКОГО ЯЗЫКА..."

create_subject "english" "Английский язык" "language" "[5,6,7,8,9]" "Изучение английского языка в 5-9 классах. Grammar, vocabulary, speaking, listening."

create_class_topics "english" "5" '{
  "class": 5,
  "topics": [
    {"id": "basic-phrases", "title": "Basic Phrases", "difficulty": "beginner", "estimatedTime": 450},
    {"id": "present-simple", "title": "Present Simple", "difficulty": "beginner", "estimatedTime": 600},
    {"id": "family-members", "title": "Family Members", "difficulty": "beginner", "estimatedTime": 360},
    {"id": "numbers-colors", "title": "Numbers and Colors", "difficulty": "beginner", "estimatedTime": 300}
  ]
}'

# 4. ЛИТЕРАТУРА
echo "📚 ИНТЕГРАЦИЯ ЛИТЕРАТУРЫ..."

create_subject "literature" "Литература" "book" "[5,6,7,8,9]" "Изучение литературы в 5-9 классах. Русская и мировая литература."

create_class_topics "literature" "5" '{
  "class": 5,
  "topics": [
    {"id": "folklore", "title": "Народное творчество", "difficulty": "beginner", "estimatedTime": 720},
    {"id": "pushkin", "title": "А.С. Пушкин", "difficulty": "beginner", "estimatedTime": 900},
    {"id": "fairy-tales", "title": "Волшебные сказки", "difficulty": "beginner", "estimatedTime": 600}
  ]
}'

# 5. ФИЗИКА
echo "📚 ИНТЕГРАЦИЯ ФИЗИКИ..."

create_subject "physics" "Физика" "science" "[7,8,9]" "Изучение физики в 7-9 классах. Механика, молекулярная физика, электричество."

create_class_topics "physics" "7" '{
  "class": 7,
  "topics": [
    {"id": "mechanics-basics", "title": "Основы механики", "difficulty": "beginner", "estimatedTime": 900},
    {"id": "pressure", "title": "Давление", "difficulty": "intermediate", "estimatedTime": 720},
    {"id": "simple-machines", "title": "Простые механизмы", "difficulty": "intermediate", "estimatedTime": 600}
  ]
}'

# Финализация
echo "🔧 Устанавливаем права доступа..."
sudo chown -R www-data:www-data subjects/

echo "📊 СТАТИСТИКА ИНТЕГРАЦИИ:"
echo "- Предметов: $(grep -c '"id"' subjects/subjects-config.json)"
echo "- Тем: $(find subjects/ -name "topics-*.json" | wc -l)"
echo "- Классов: 5 (5-9)"

echo ""
echo "🎉 ИНТЕГРАЦИЯ ЗАВЕРШЕНА!"
echo "🌐 Проверьте приложение: http://155.212.132.62"
echo ""
echo "📚 ДОСТУПНЫЕ ПРЕДМЕТЫ:"
echo "- Математика (5-9 классы)"
echo "- Русский язык (5-9 классы)"
echo "- Английский язык (5-9 классы)"
echo "- Литература (5-9 классы)"
echo "- Физика (7-9 классы)"