#!/bin/bash

# ПОЛНАЯ ИНТЕГРАЦИЯ МАТЕМАТИКИ 5-9 КЛАССОВ
echo "🚀 Начинаем полную интеграцию математики 5-9 классов..."

cd /var/www/shanks-education

# 1. subjects-config.json
echo "📝 Создаем subjects-config.json..."
cat > subjects/subjects-config.json << 'EOF'
{
  "subjects": [
    {
      "id": "math",
      "name": "Математика",
      "icon": "calculate",
      "classes": [5, 6, 7, 8, 9],
      "description": "Изучение математики в 5-9 классах. Включает арифметику, алгебру, геометрию, вероятность и статистику. Формирование математического стиля мышления, функциональной математической грамотности."
    }
  ]
}
EOF

# 2. Создаем директории
echo "📁 Создаем структуру директорий..."
mkdir -p subjects/math/lessons
for class in {5..9}; do
  mkdir -p "subjects/math/lessons/class-$class"
done

# 3. topics-5.json
echo "📚 Создаем topics-5.json..."
cat > subjects/math/topics-5.json << 'EOF'
{
  "class": 5,
  "topics": [
    {
      "id": "natural-numbers-and-zero",
      "title": "Натуральные числа и нуль",
      "description": "Изучение натуральных чисел, их свойств, арифметических действий с натуральными числами.",
      "difficulty": "beginner",
      "estimatedTime": 1935,
      "lessons": ["theory", "practice", "test"]
    },
    {
      "id": "fractions-basic",
      "title": "Дроби",
      "description": "Обыкновенные и десятичные дроби, их сравнение, арифметические действия с дробями.",
      "difficulty": "beginner",
      "estimatedTime": 2160,
      "lessons": ["theory", "practice", "test"]
    },
    {
      "id": "word-problems",
      "title": "Решение текстовых задач",
      "description": "Решение простых и составных текстовых задач на все арифметические действия.",
      "difficulty": "beginner",
      "estimatedTime": 900,
      "lessons": ["theory", "practice", "examples"]
    },
    {
      "id": "geometry-lines",
      "title": "Наглядная геометрия: линии",
      "description": "Изучение основных геометрических линий и их свойств.",
      "difficulty": "beginner",
      "estimatedTime": 540,
      "lessons": ["theory", "practice"]
    },
    {
      "id": "geometry-polygons",
      "title": "Наглядная геометрия: многоугольники",
      "description": "Изучение многоугольников, их элементов и свойств.",
      "difficulty": "beginner",
      "estimatedTime": 450,
      "lessons": ["theory", "practice"]
    },
    {
      "id": "decimal-fractions",
      "title": "Десятичные дроби",
      "description": "Десятичные дроби, их запись, сравнение, действия.",
      "difficulty": "beginner",
      "estimatedTime": 1710,
      "lessons": ["theory", "practice", "test"]
    },
    {
      "id": "geometry-3d",
      "title": "Наглядная геометрия: пространственные фигуры",
      "description": "Изучение основных пространственных геометрических фигур.",
      "difficulty": "beginner",
      "estimatedTime": 405,
      "lessons": ["theory", "practice"]
    },
    {
      "id": "review-5",
      "title": "Повторение и обобщение",
      "description": "Закрепление изученного материала за 5 класс.",
      "difficulty": "beginner",
      "estimatedTime": 450,
      "lessons": ["review", "final-test"]
    }
  ]
}
EOF

# 4. topics-6.json
echo "📚 Создаем topics-6.json..."
cat > subjects/math/topics-6.json << 'EOF'
{
  "class": 6,
  "topics": [
    {
      "id": "natural-numbers-operations",
      "title": "Натуральные числа: действия и свойства",
      "description": "Арифметические действия с многозначными натуральными числами, делимость, НОД и НОК.",
      "difficulty": "intermediate",
      "estimatedTime": 1350,
      "lessons": ["theory", "practice", "test"]
    },
    {
      "id": "geometry-plane-lines",
      "title": "Наглядная геометрия: прямые на плоскости",
      "description": "Изучение прямых линий на плоскости, их взаимное расположение.",
      "difficulty": "beginner",
      "estimatedTime": 315,
      "lessons": ["theory", "practice"]
    },
    {
      "id": "fractions-operations",
      "title": "Дроби: действия",
      "description": "Арифметические действия с обыкновенными дробями.",
      "difficulty": "intermediate",
      "estimatedTime": 1440,
      "lessons": ["theory", "practice", "test"]
    },
    {
      "id": "geometry-symmetry",
      "title": "Наглядная геометрия: симметрия",
      "description": "Осевая и центральная симметрия фигур.",
      "difficulty": "beginner",
      "estimatedTime": 270,
      "lessons": ["theory", "practice"]
    },
    {
      "id": "algebra-expressions",
      "title": "Выражения с буквами",
      "description": "Выражения с переменными, вычисление значений выражений.",
      "difficulty": "beginner",
      "estimatedTime": 270,
      "lessons": ["theory", "practice"]
    },
    {
      "id": "geometry-plane-figures",
      "title": "Наглядная геометрия: фигуры на плоскости",
      "description": "Изучение плоских геометрических фигур.",
      "difficulty": "beginner",
      "estimatedTime": 630,
      "lessons": ["theory", "practice"]
    },
    {
      "id": "integers",
      "title": "Положительные и отрицательные числа",
      "description": "Целые числа, координатная прямая, сравнение и действия.",
      "difficulty": "intermediate",
      "estimatedTime": 1800,
      "lessons": ["theory", "practice", "test"]
    },
    {
      "id": "data-representation",
      "title": "Представление данных",
      "description": "Таблицы, диаграммы, графики для представления данных.",
      "difficulty": "beginner",
      "estimatedTime": 270,
      "lessons": ["theory", "practice"]
    },
    {
      "id": "geometry-space-figures",
      "title": "Наглядная геометрия: фигуры в пространстве",
      "description": "Изучение пространственных геометрических фигур.",
      "difficulty": "beginner",
      "estimatedTime": 405,
      "lessons": ["theory", "practice"]
    },
    {
      "id": "review-6",
      "title": "Повторение",
      "description": "Закрепление изученного материала за 6 класс.",
      "difficulty": "intermediate",
      "estimatedTime": 900,
      "lessons": ["review", "final-test"]
    }
  ]
}
EOF

# 5. topics-7.json
echo "📚 Создаем topics-7.json..."
cat > subjects/math/topics-7.json << 'EOF'
{
  "class": 7,
  "topics": [
    {
      "id": "rational-numbers",
      "title": "Рациональные числа",
      "description": "Понятие рационального числа, арифметические действия, степени, проценты.",
      "difficulty": "intermediate",
      "estimatedTime": 1125,
      "lessons": ["theory", "practice", "test"]
    },
    {
      "id": "algebraic-expressions",
      "title": "Алгебраические выражения",
      "description": "Переменные, многочлены, формулы сокращенного умножения, разложение на множители.",
      "difficulty": "intermediate",
      "estimatedTime": 1215,
      "lessons": ["theory", "practice", "test"]
    },
    {
      "id": "equations-inequalities",
      "title": "Уравнения и неравенства",
      "description": "Линейные уравнения и неравенства, системы уравнений.",
      "difficulty": "intermediate",
      "estimatedTime": 900,
      "lessons": ["theory", "practice", "test"]
    },
    {
      "id": "coordinates-graphs-functions",
      "title": "Координаты и графики. Функции",
      "description": "Координатная плоскость, графики функций, понятие функции.",
      "difficulty": "intermediate",
      "estimatedTime": 1080,
      "lessons": ["theory", "practice", "test"]
    },
    {
      "id": "geometry-basic-figures",
      "title": "Простейшие геометрические фигуры",
      "description": "Точка, прямая, отрезок, луч, угол, треугольник.",
      "difficulty": "beginner",
      "estimatedTime": 630,
      "lessons": ["theory", "practice"]
    },
    {
      "id": "geometry-triangles",
      "title": "Треугольники",
      "description": "Виды треугольников, свойства, признаки равенства.",
      "difficulty": "intermediate",
      "estimatedTime": 990,
      "lessons": ["theory", "practice", "test"]
    },
    {
      "id": "geometry-parallel-lines",
      "title": "Параллельные прямые",
      "description": "Аксиомы параллельных прямых, свойства параллельных прямых.",
      "difficulty": "intermediate",
      "estimatedTime": 630,
      "lessons": ["theory", "practice"]
    },
    {
      "id": "geometry-circle",
      "title": "Окружность и круг",
      "description": "Элементы окружности и круга, касательные, углы.",
      "difficulty": "intermediate",
      "estimatedTime": 630,
      "lessons": ["theory", "practice"]
    },
    {
      "id": "statistics-data-representation",
      "title": "Представление данных",
      "description": "Статистические характеристики, графики, диаграммы.",
      "difficulty": "beginner",
      "estimatedTime": 315,
      "lessons": ["theory", "practice"]
    },
    {
      "id": "statistics-descriptive",
      "title": "Описательная статистика",
      "description": "Среднее значение, медиана, мода, размах.",
      "difficulty": "intermediate",
      "estimatedTime": 360,
      "lessons": ["theory", "practice"]
    },
    {
      "id": "probability-random-variability",
      "title": "Случайная изменчивость",
      "description": "Вероятность случайных событий, частота.",
      "difficulty": "beginner",
      "estimatedTime": 270,
      "lessons": ["theory", "practice"]
    },
    {
      "id": "review-7",
      "title": "Повторение",
      "description": "Закрепление изученного материала за 7 класс.",
      "difficulty": "intermediate",
      "estimatedTime": 270,
      "lessons": ["review", "final-test"]
    }
  ]
}
EOF

# 6. topics-8.json и topics-9.json (упрощенные версии)
echo "📚 Создаем topics-8.json..."
cat > subjects/math/topics-8.json << 'EOF'
{
  "class": 8,
  "topics": [
    {
      "id": "irrational-numbers",
      "title": "Квадратные корни и действительные числа",
      "description": "Квадратные корни, иррациональные числа, действительные числа.",
      "difficulty": "advanced",
      "estimatedTime": 1080,
      "lessons": ["theory", "practice", "test"]
    },
    {
      "id": "quadratic-equations",
      "title": "Квадратные уравнения",
      "description": "Решение квадратных уравнений, теорема Виета.",
      "difficulty": "advanced",
      "estimatedTime": 900,
      "lessons": ["theory", "practice", "test"]
    },
    {
      "id": "systems-equations",
      "title": "Системы уравнений",
      "description": "Системы линейных уравнений с двумя переменными.",
      "difficulty": "advanced",
      "estimatedTime": 720,
      "lessons": ["theory", "practice", "test"]
    },
    {
      "id": "inequalities",
      "title": "Неравенства",
      "description": "Линейные и квадратные неравенства.",
      "difficulty": "advanced",
      "estimatedTime": 630,
      "lessons": ["theory", "practice"]
    },
    {
      "id": "functions-quadratic",
      "title": "Квадратичная функция",
      "description": "Графики квадратичных функций, свойства.",
      "difficulty": "advanced",
      "estimatedTime": 720,
      "lessons": ["theory", "practice", "test"]
    }
  ]
}
EOF

echo "📚 Создаем topics-9.json..."
cat > subjects/math/topics-9.json << 'EOF'
{
  "class": 9,
  "topics": [
    {
      "id": "trigonometry",
      "title": "Тригонометрия",
      "description": "Синус, косинус, тангенс, тригонометрические тождества.",
      "difficulty": "advanced",
      "estimatedTime": 900,
      "lessons": ["theory", "practice", "test"]
    },
    {
      "id": "vectors",
      "title": "Векторы",
      "description": "Векторы на плоскости, действия с векторами.",
      "difficulty": "advanced",
      "estimatedTime": 720,
      "lessons": ["theory", "practice"]
    },
    {
      "id": "coordinate-method",
      "title": "Координатный метод",
      "description": "Уравнения прямых и кривых на плоскости.",
      "difficulty": "advanced",
      "estimatedTime": 810,
      "lessons": ["theory", "practice", "test"]
    },
    {
      "id": "sequences-progressions",
      "title": "Прогрессии",
      "description": "Арифметическая и геометрическая прогрессии.",
      "difficulty": "advanced",
      "estimatedTime": 720,
      "lessons": ["theory", "practice", "test"]
    },
    {
      "id": "combinatorics",
      "title": "Комбинаторика",
      "description": "Комбинации, перестановки, размещения.",
      "difficulty": "advanced",
      "estimatedTime": 540,
      "lessons": ["theory", "practice"]
    },
    {
      "id": "probability-theory",
      "title": "Теория вероятностей",
      "description": "Классическая вероятность, статистическая вероятность.",
      "difficulty": "advanced",
      "estimatedTime": 630,
      "lessons": ["theory", "practice"]
    }
  ]
}
EOF

# 7. Создаем пример урока
echo "📖 Создаем пример урока..."
mkdir -p subjects/math/lessons/natural-numbers-and-zero
cat > subjects/math/lessons/natural-numbers-and-zero/theory.json << 'EOF'
{
  "title": "Натуральные числа: теория",
  "class": 5,
  "subject": "math",
  "topic": "natural-numbers-and-zero",
  "type": "theory",
  "content": "Натуральные числа - это числа, используемые при счете предметов: 1, 2, 3, 4, ... Ряд натуральных чисел бесконечен. Число 0 не является натуральным, но часто рассматривается вместе с натуральными числами.\n\nПозиционная система счисления - система, в которой значение цифры зависит от ее позиции в числе. В десятичной системе каждая позиция представляет степень числа 10.\n\nНатуральные числа можно изображать точками на координатной прямой. Каждой точке соответствует одно число, и каждому числу - одна точка.",
  "examples": [
    "Число 235 = 2×100 + 3×10 + 5×1",
    "Римская запись: XXIV = 24"
  ]
}
EOF

cat > subjects/math/lessons/natural-numbers-and-zero/practice.json << 'EOF'
{
  "title": "Натуральные числа: практика",
  "class": 5,
  "subject": "math",
  "topic": "natural-numbers-and-zero",
  "type": "practice",
  "tasks": [
    {
      "question": "Сравните числа: 235 и 253",
      "options": ["235 < 253", "235 > 253", "235 = 253"],
      "correct": 0,
      "explanation": "Число 235 меньше 253, так как в разряде десятков у первого числа 3, а у второго 5."
    },
    {
      "question": "Округлите число 478 до десятков",
      "options": ["470", "480", "500", "479"],
      "correct": 1,
      "explanation": "При округлении до десятков смотрим на единицы. 8 > 5, поэтому увеличиваем десятки на 1."
    }
  ]
}
EOF

# 8. Устанавливаем права
echo "🔧 Устанавливаем права..."
sudo chown -R www-data:www-data subjects/
sudo chmod -R 755 subjects/

# 9. Проверяем результат
echo "📋 Финальная проверка..."
echo "Файлы созданы:"
ls -la subjects/
echo ""
echo "Математика по классам:"
ls -la subjects/math/topics-*.json
echo ""
echo "Примеры уроков:"
find subjects/math/lessons/ -name "*.json" | head -5

echo ""
echo "🎉 ПОЛНАЯ ИНТЕГРАЦИЯ МАТЕМАТИКИ 5-9 КЛАССОВ ЗАВЕРШЕНА!"
echo ""
echo "📊 СТАТИСТИКА:"
echo "- Предметов: 1 (Математика)"
echo "- Классов: 5 (5, 6, 7, 8, 9)"
echo "- Тем: 8 (5кл) + 10 (6кл) + 12 (7кл) + 5 (8кл) + 6 (9кл) = 41 тема"
echo "- Пример уроков: 2 (теория + практика)"
echo ""
echo "🌐 Тестируйте: http://155.212.132.62"
echo "В приложении должна появиться МАТЕМАТИКА с классами 5-9!"