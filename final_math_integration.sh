#!/bin/bash

# ФИНАЛЬНАЯ ИНТЕГРАЦИЯ МАТЕМАТИКИ 5-9 КЛАССОВ
echo "🚀 ФИНАЛЬНАЯ ИНТЕГРАЦИЯ МАТЕМАТИКИ..."

cd /var/www/shanks-education

# Создаем subjects-config.json
cat > subjects/subjects-config.json << 'EOF'
{
  "subjects": [
    {
      "id": "math",
      "name": "Математика",
      "icon": "calculate",
      "classes": [5, 6, 7, 8, 9],
      "description": "Изучение математики в 5-9 классах. Включает арифметику, алгебру, геометрию, вероятность и статистику."
    }
  ]
}
EOF

# 5 КЛАСС - 8 тем
cat > subjects/math/topics-5.json << 'EOF'
{
  "class": 5,
  "topics": [
    {"id": "natural-numbers-and-zero", "title": "Натуральные числа и нуль", "description": "Изучение натуральных чисел, их свойств, арифметических действий.", "difficulty": "beginner", "estimatedTime": 1935, "lessons": ["theory", "practice", "test"]},
    {"id": "fractions-basic", "title": "Дроби", "description": "Обыкновенные и десятичные дроби, их сравнение, действия.", "difficulty": "beginner", "estimatedTime": 2160, "lessons": ["theory", "practice", "test"]},
    {"id": "word-problems", "title": "Решение текстовых задач", "description": "Решение простых и составных задач.", "difficulty": "beginner", "estimatedTime": 900, "lessons": ["theory", "practice", "examples"]},
    {"id": "geometry-lines", "title": "Наглядная геометрия: линии", "description": "Изучение геометрических линий.", "difficulty": "beginner", "estimatedTime": 540, "lessons": ["theory", "practice"]},
    {"id": "geometry-polygons", "title": "Наглядная геометрия: многоугольники", "description": "Изучение многоугольников.", "difficulty": "beginner", "estimatedTime": 450, "lessons": ["theory", "practice"]},
    {"id": "decimal-fractions", "title": "Десятичные дроби", "description": "Десятичные дроби, их действия.", "difficulty": "beginner", "estimatedTime": 1710, "lessons": ["theory", "practice", "test"]},
    {"id": "geometry-3d", "title": "Наглядная геометрия: пространственные фигуры", "description": "Изучение 3D фигур.", "difficulty": "beginner", "estimatedTime": 405, "lessons": ["theory", "practice"]},
    {"id": "review-5", "title": "Повторение и обобщение", "description": "Закрепление материала 5 класса.", "difficulty": "beginner", "estimatedTime": 450, "lessons": ["review", "final-test"]}
  ]
}
EOF

# 6 КЛАСС - 10 тем
cat > subjects/math/topics-6.json << 'EOF'
{
  "class": 6,
  "topics": [
    {"id": "natural-numbers-operations", "title": "Натуральные числа: действия и свойства", "description": "Действия с многозначными числами, делимость.", "difficulty": "intermediate", "estimatedTime": 1350, "lessons": ["theory", "practice", "test"]},
    {"id": "geometry-plane-lines", "title": "Наглядная геометрия: прямые на плоскости", "description": "Прямые на плоскости.", "difficulty": "beginner", "estimatedTime": 315, "lessons": ["theory", "practice"]},
    {"id": "fractions-operations", "title": "Дроби: действия", "description": "Действия с обыкновенными дробями.", "difficulty": "intermediate", "estimatedTime": 1440, "lessons": ["theory", "practice", "test"]},
    {"id": "geometry-symmetry", "title": "Наглядная геометрия: симметрия", "description": "Осевая и центральная симметрия.", "difficulty": "beginner", "estimatedTime": 270, "lessons": ["theory", "practice"]},
    {"id": "algebra-expressions", "title": "Выражения с буквами", "description": "Выражения с переменными.", "difficulty": "beginner", "estimatedTime": 270, "lessons": ["theory", "practice"]},
    {"id": "geometry-plane-figures", "title": "Наглядная геометрия: фигуры на плоскости", "description": "Плоские геометрические фигуры.", "difficulty": "beginner", "estimatedTime": 630, "lessons": ["theory", "practice"]},
    {"id": "integers", "title": "Положительные и отрицательные числа", "description": "Целые числа, координатная прямая.", "difficulty": "intermediate", "estimatedTime": 1800, "lessons": ["theory", "practice", "test"]},
    {"id": "data-representation", "title": "Представление данных", "description": "Таблицы, диаграммы, графики.", "difficulty": "beginner", "estimatedTime": 270, "lessons": ["theory", "practice"]},
    {"id": "geometry-space-figures", "title": "Наглядная геометрия: фигуры в пространстве", "description": "Пространственные геометрические фигуры.", "difficulty": "beginner", "estimatedTime": 405, "lessons": ["theory", "practice"]},
    {"id": "review-6", "title": "Повторение", "description": "Закрепление материала 6 класса.", "difficulty": "intermediate", "estimatedTime": 900, "lessons": ["review", "final-test"]}
  ]
}
EOF

# 7 КЛАСС - 12 тем
cat > subjects/math/topics-7.json << 'EOF'
{
  "class": 7,
  "topics": [
    {"id": "rational-numbers", "title": "Рациональные числа", "description": "Рациональные числа, действия.", "difficulty": "intermediate", "estimatedTime": 1125, "lessons": ["theory", "practice", "test"]},
    {"id": "algebraic-expressions", "title": "Алгебраические выражения", "description": "Многочлены, разложение на множители.", "difficulty": "intermediate", "estimatedTime": 1215, "lessons": ["theory", "practice", "test"]},
    {"id": "equations-inequalities", "title": "Уравнения и неравенства", "description": "Линейные уравнения и неравенства.", "difficulty": "intermediate", "estimatedTime": 900, "lessons": ["theory", "practice", "test"]},
    {"id": "coordinates-graphs-functions", "title": "Координаты и графики. Функции", "description": "Координатная плоскость, функции.", "difficulty": "intermediate", "estimatedTime": 1080, "lessons": ["theory", "practice", "test"]},
    {"id": "geometry-basic-figures", "title": "Простейшие геометрические фигуры", "description": "Точка, прямая, угол, треугольник.", "difficulty": "beginner", "estimatedTime": 630, "lessons": ["theory", "practice"]},
    {"id": "geometry-triangles", "title": "Треугольники", "description": "Виды треугольников, свойства.", "difficulty": "intermediate", "estimatedTime": 990, "lessons": ["theory", "practice", "test"]},
    {"id": "geometry-parallel-lines", "title": "Параллельные прямые", "description": "Аксиомы параллельных прямых.", "difficulty": "intermediate", "estimatedTime": 630, "lessons": ["theory", "practice"]},
    {"id": "geometry-circle", "title": "Окружность и круг", "description": "Элементы окружности и круга.", "difficulty": "intermediate", "estimatedTime": 630, "lessons": ["theory", "practice"]},
    {"id": "statistics-data-representation", "title": "Представление данных", "description": "Статистические характеристики.", "difficulty": "beginner", "estimatedTime": 315, "lessons": ["theory", "practice"]},
    {"id": "statistics-descriptive", "title": "Описательная статистика", "description": "Среднее, медиана, мода.", "difficulty": "intermediate", "estimatedTime": 360, "lessons": ["theory", "practice"]},
    {"id": "probability-random-variability", "title": "Случайная изменчивость", "description": "Вероятность случайных событий.", "difficulty": "beginner", "estimatedTime": 270, "lessons": ["theory", "practice"]},
    {"id": "review-7", "title": "Повторение", "description": "Закрепление материала 7 класса.", "difficulty": "intermediate", "estimatedTime": 270, "lessons": ["review", "final-test"]}
  ]
}
EOF

# 8 КЛАСС - 5 тем
cat > subjects/math/topics-8.json << 'EOF'
{
  "class": 8,
  "topics": [
    {"id": "irrational-numbers", "title": "Квадратные корни и действительные числа", "description": "Квадратные корни, иррациональные числа.", "difficulty": "advanced", "estimatedTime": 1080, "lessons": ["theory", "practice", "test"]},
    {"id": "quadratic-equations", "title": "Квадратные уравнения", "description": "Решение квадратных уравнений.", "difficulty": "advanced", "estimatedTime": 900, "lessons": ["theory", "practice", "test"]},
    {"id": "systems-equations", "title": "Системы уравнений", "description": "Системы линейных уравнений.", "difficulty": "advanced", "estimatedTime": 720, "lessons": ["theory", "practice", "test"]},
    {"id": "inequalities", "title": "Неравенства", "description": "Линейные и квадратные неравенства.", "difficulty": "advanced", "estimatedTime": 630, "lessons": ["theory", "practice"]},
    {"id": "functions-quadratic", "title": "Квадратичная функция", "description": "Графики квадратичных функций.", "difficulty": "advanced", "estimatedTime": 720, "lessons": ["theory", "practice", "test"]}
  ]
}
EOF

# 9 КЛАСС - 6 тем
cat > subjects/math/topics-9.json << 'EOF'
{
  "class": 9,
  "topics": [
    {"id": "trigonometry", "title": "Тригонометрия", "description": "Синус, косинус, тангенс.", "difficulty": "advanced", "estimatedTime": 900, "lessons": ["theory", "practice", "test"]},
    {"id": "vectors", "title": "Векторы", "description": "Векторы на плоскости.", "difficulty": "advanced", "estimatedTime": 720, "lessons": ["theory", "practice"]},
    {"id": "coordinate-method", "title": "Координатный метод", "description": "Уравнения прямых и кривых.", "difficulty": "advanced", "estimatedTime": 810, "lessons": ["theory", "practice", "test"]},
    {"id": "sequences-progressions", "title": "Прогрессии", "description": "Арифметическая и геометрическая прогрессии.", "difficulty": "advanced", "estimatedTime": 720, "lessons": ["theory", "practice", "test"]},
    {"id": "combinatorics", "title": "Комбинаторика", "description": "Комбинации, перестановки.", "difficulty": "advanced", "estimatedTime": 540, "lessons": ["theory", "practice"]},
    {"id": "probability-theory", "title": "Теория вероятностей", "description": "Классическая вероятность.", "difficulty": "advanced", "estimatedTime": 630, "lessons": ["theory", "practice"]}
  ]
}
EOF

# Устанавливаем права
sudo chown -R www-data:www-data subjects/

echo "✅ МАТЕМАТИКА ПОЛНОСТЬЮ ИНТЕГРИРОВАНА!"
echo ""
echo "📊 СТАТИСТИКА:"
echo "- Классов: 5 (5, 6, 7, 8, 9)"
echo "- Тем всего: 41"
echo "- 5 класс: 8 тем"
echo "- 6 класс: 10 тем"
echo "- 7 класс: 12 тем"
echo "- 8 класс: 5 тем"
echo "- 9 класс: 6 тем"
echo ""
echo "🌐 Проверьте: http://155.212.132.62"
echo "В приложении должна появиться МАТЕМАТИКА со всеми темами!"