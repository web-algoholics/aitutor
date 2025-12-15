# Quizzes Module

Модуль для создания и прохождения квизов на основе теории уроков.

## Структура

- `models.py` - Модели данных (Quiz, Question, Answer)
- `schemas.py` - Pydantic схемы для запросов и ответов
- `routing.py` - API endpoints
- `ai_generator.py` - AI генератор вопросов для квизов

## API Endpoints

### POST /api/quizzes
Создать квиз из теории урока
```json
{
  "title": "Квиз по уроку: Основы Python",
  "description": "Опциональное описание",
  "theory_content": "Текст теории урока...",
  "num_questions": 5
}
```

### GET /api/quizzes
Получить список всех квизов пользователя

### GET /api/quizzes/{quiz_id}
Получить квиз по ID
- Query параметр: `include_answers=false` (по умолчанию) - скрывает правильные ответы для прохождения квиза

### POST /api/quizzes/{quiz_id}/submit
Отправить ответы на квиз
```json
{
  "quiz_id": 1,
  "answers": [
    {"question_id": 1, "answer_ids": [1, 3]},
    {"question_id": 2, "answer_ids": [5]}
  ]
}
```

## Модели данных

### Quiz
- `id` - ID квиза
- `title` - Название квиза
- `description` - Описание (опционально)
- `theory_content` - Теория, по которой создан квиз
- `creator_id` - ID создателя
- `is_completed` - Завершен ли квиз
- `created_at` - Дата создания

### Question
- `id` - ID вопроса
- `quiz_id` - ID квиза
- `question_text` - Текст вопроса
- `question_type` - Тип вопроса (single_choice/multiple_choice)
- `order` - Порядок вопроса
- `explanation` - Объяснение правильного ответа

### Answer
- `id` - ID ответа
- `question_id` - ID вопроса
- `answer_text` - Текст ответа
- `is_correct` - Правильность ответа
- `order` - Порядок ответа

## Использование

1. Пользователь вставляет теорию урока
2. Вызывается POST /api/quizzes с теорией
3. AI генерирует вопросы на основе теории
4. Пользователь проходит квиз через GET /api/quizzes/{quiz_id}
5. Пользователь отправляет ответы через POST /api/quizzes/{quiz_id}/submit
6. Получает результат с оценкой и объяснениями

