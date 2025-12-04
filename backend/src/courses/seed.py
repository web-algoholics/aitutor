"""
Seed data for courses

To run from backend/src:
python -c "import asyncio; from courses.seed import seed_courses; asyncio.run(seed_courses())"
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from database import init_db, async_session
from courses.models import Course, Module, Lesson
from auth.models import User  # Import to register with SQLModel.metadata
from sqlalchemy import select


async def seed_courses():
    """Initialize database with sample courses"""
    # Initialize database tables first
    await init_db()
    
    async with async_session() as db_session:
        try:
            # Check if courses already exist
            result = await db_session.execute(select(Course).limit(1))
            existing = result.first()
            if existing:
                print("Courses already exist, skipping seed")
                return

            # Create Python Beginner Course
            python_course = Course(
                title="Python для начинающих",
                description="Полный курс Python с основами программирования и практическими заданиями",
                difficulty="beginner",
                icon="https://via.placeholder.com/300?text=Python"
            )
            db_session.add(python_course)
            await db_session.flush()

            # Module 1: Introduction
            module1 = Module(
                course_id=python_course.id,
                order=1,
                title="Введение в Python",
                description="Основные концепции и настройка окружения",
                learning_objectives=[
                    "Понять что такое Python и зачем он нужен",
                    "Установить Python на свой компьютер",
                    "Написать первую программу"
                ],
                key_concepts=["print", "переменные", "типы данных"]
            )
            db_session.add(module1)
            await db_session.flush()

            lesson1_1 = Lesson(
                module_id=module1.id,
                order=1,
                title="Первая программа",
                content="Научимся выводить текст на экран с помощью функции print()",
                code_template='print("Привет, мир!")',
                expected_concepts=["print", "строки"]
            )
            db_session.add(lesson1_1)

            # Module 2: Variables and Types
            module2 = Module(
                course_id=python_course.id,
                order=2,
                title="Переменные и типы данных",
                description="Работа с переменными, числами, строками и логическими значениями",
                learning_objectives=[
                    "Создавать и использовать переменные",
                    "Работать с числами и строками",
                    "Понять типы данных"
                ],
                key_concepts=["переменные", "int", "float", "str", "bool"]
            )
            db_session.add(module2)
            await db_session.flush()

            lesson2_1 = Lesson(
                module_id=module2.id,
                order=1,
                title="Создание переменных",
                content="Переменная - это имя для хранения значения. Создадим переменные разных типов.",
                code_template='''# Создай переменные с разными типами данных
name = "Иван"
age = 25
height = 1.75
is_student = True

print(name)
print(age)''',
                expected_concepts=["переменные", "int", "str", "float"]
            )
            db_session.add(lesson2_1)

            # Module 3: Lists
            module3 = Module(
                course_id=python_course.id,
                order=3,
                title="Списки (Lists)",
                description="Работа со списками для хранения нескольких значений",
                learning_objectives=[
                    "Создавать списки",
                    "Обращаться к элементам списка",
                    "Добавлять и удалять элементы"
                ],
                key_concepts=["list", "индекс", "append", "pop"]
            )
            db_session.add(module3)
            await db_session.flush()

            lesson3_1 = Lesson(
                module_id=module3.id,
                order=1,
                title="Основы списков",
                content="Список - это коллекция элементов. Научимся создавать и использовать списки.",
                code_template='''# Создай список со словами
words = ["привет", "мир", "python"]

# Выведи каждое слово
print(words[0])
print(words[1])
print(words[2])

# Добавь новое слово
words.append("язык")
print(words)''',
                expected_concepts=["list", "индекс", "append"]
            )
            db_session.add(lesson3_1)

            # Module 4: Loops
            module4 = Module(
                course_id=python_course.id,
                order=4,
                title="Циклы (Loops)",
                description="Повторение одного и того же кода несколько раз",
                learning_objectives=[
                    "Использовать цикл for",
                    "Использовать цикл while",
                    "Управлять циклом с break и continue"
                ],
                key_concepts=["for", "while", "break", "continue", "range"]
            )
            db_session.add(module4)
            await db_session.flush()

            lesson4_1 = Lesson(
                module_id=module4.id,
                order=1,
                title="Цикл for",
                content="Цикл for позволяет повторить код несколько раз для каждого элемента.",
                code_template='''# Выведи числа от 1 до 5
for i in range(1, 6):
    print(i)

# Выведи каждое слово из списка
words = ["python", "java", "c++"]
for word in words:
    print(word)''',
                expected_concepts=["for", "range", "итерация"]
            )
            db_session.add(lesson4_1)

            # Module 5: Functions
            module5 = Module(
                course_id=python_course.id,
                order=5,
                title="Функции (Functions)",
                description="Организация кода в переиспользуемые блоки",
                learning_objectives=[
                    "Создавать функции",
                    "Передавать параметры в функции",
                    "Возвращать значения из функций"
                ],
                key_concepts=["def", "параметры", "return", "вызов функции"]
            )
            db_session.add(module5)
            await db_session.flush()

            lesson5_1 = Lesson(
                module_id=module5.id,
                order=1,
                title="Создание функций",
                content="Функция - это блок кода, который решает одну задачу. Мы можем вызывать функцию много раз.",
                code_template='''# Создай функцию для приветствия
def greet(name):
    return f"Привет, {name}!"

# Вызови функцию
print(greet("Иван"))
print(greet("Мария"))

# Создай функцию для сложения
def add(a, b):
    return a + b

result = add(5, 3)
print(result)''',
                expected_concepts=["def", "параметры", "return", "f-string"]
            )
            db_session.add(lesson5_1)

            # Module 6: Final Project
            module6 = Module(
                course_id=python_course.id,
                order=6,
                title="Проект: Игра в слова",
                description="Собери все знания в финальном проекте - интерактивной игре!",
                learning_objectives=[
                    "Применить все изученные концепции",
                    "Создать интерактивную программу",
                    "Работать с пользовательским вводом"
                ],
                key_concepts=["все пройденные концепции", "input", "if/else"]
            )
            db_session.add(module6)
            await db_session.flush()

            lesson6_1 = Lesson(
                module_id=module6.id,
                order=1,
                title="Игра в слова",
                content="""Создадим игру, где компьютер загадывает слово, а игрок пытается его угадать.
            Требования:
            - Компьютер выбирает случайное слово из списка
            - Игрок вводит буквы
            - Показывать угаданные буквы
            - Считать попытки""",
                code_template='''import random

# Список слов
words = ["python", "программирование", "компьютер", "интернет", "алгоритм"]

# Выбери случайное слово
word = random.choice(words)

# Инициализируй переменные игры
guessed_letters = []
attempts = 6

# Основной игровой цикл
while attempts > 0:
    # Покажи текущее состояние слова
    display = ""
    for letter in word:
        if letter in guessed_letters:
            display += letter
        else:
            display += "_"
    
    print(f"Слово: {display}")
    print(f"Попыток осталось: {attempts}")
    
    # Попроси ввод игрока
    guess = input("Угадай букву: ").lower()
    
    # Проверь букву
    if guess in guessed_letters:
        print("Эту букву ты уже пробовал!")
    elif guess in word:
        guessed_letters.append(guess)
        print("Правильно! 🎉")
    else:
        guessed_letters.append(guess)
        attempts -= 1
        print("Неправильно! ❌")
    
    # Проверь выигрыш
    if all(letter in guessed_letters for letter in word):
        print(f"Ты выиграл! Слово: {word}")
        break

if attempts == 0:
    print(f"Ты проиграл! Слово было: {word}")''',
                expected_concepts=["random", "while", "for", "if/else", "input", "list", "string"]
            )
            db_session.add(lesson6_1)

            await db_session.commit()
            print("✅ Courses seeded successfully!")

        except Exception as e:
            await db_session.rollback()
            print(f"❌ Error seeding courses: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(seed_courses())
