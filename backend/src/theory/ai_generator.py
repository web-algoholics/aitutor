import json
import logging
from typing import Dict, List, Any, Optional
from langchain_gigachat import GigaChat
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
import json_repair
from config import settings
from .validators import validate_course_plan, plan_expected_format

logger = logging.getLogger(__name__)

class TheoryAIGenerator:
    """AI generator for theory courses with lazy content generation"""

    def __init__(self):
        self.llm = GigaChat(
            credentials=settings.GIGACHAT_API_KEY,
            model="GigaChat",
            temperature=0.5,
            max_tokens=64000,  # Increased to handle complete course plans
            verify_ssl_certs=False,
        )

    def _parse_json_response(self, response: str) -> dict:
        """Parse JSON response from AI - uses json_repair to fix malformed JSON automatically"""
        try:
            # Check if response looks like it might be truncated
            if not response.strip().endswith('}'):
                logger.warning("Response appears to be truncated (doesn't end with })")
                raise ValueError("Response appears to be truncated")

            # First try to parse as-is
            try:
                parsed = json.loads(response)
                logger.info("JSON parsing successful (no repair needed)")
                return parsed
            except json.JSONDecodeError:
                # If parsing fails, try to repair the JSON
                logger.info("JSON parsing failed, attempting to repair with json_repair...")
                repaired_json = json_repair.repair_json(response)
                logger.debug(f"Repaired JSON: {repaired_json[:100]}...")
                parsed = json.loads(repaired_json)
                logger.info("JSON parsing successful after repair")
                return parsed

        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing failed even after repair: {e}")
            logger.error(f"Response length: {len(response)} chars")
            logger.error(f"Response start: {response[:100]}...")
            logger.error(f"Response end: ...{response[-100:]}")
            raise ValueError(f"AI returned invalid JSON: {e}")
        except Exception as e:
            logger.error(f"Unexpected error during JSON parsing: {e}")
            raise ValueError(f"Failed to parse AI response: {e}")

    def _fix_ai_response(self, response: str, error_message: str, expected_format: str) -> str:
        """Ask AI to fix its response"""
        fix_prompt = ChatPromptTemplate.from_template("""
Ты допустил ошибку в предыдущем ответе. Исправь JSON согласно требованиям.

ОШИБКА: {error_message}

ПРАВИЛА:
- ОТВЕТЬ ТОЛЬКО ВАЛИДНЫМ JSON
- НЕ ДОБАВЛЯЙ КОММЕНТАРИИ ИЛИ ДОПОЛНИТЕЛЬНЫЙ ТЕКСТ
- JSON ДОЛЖЕН БЫТЬ ПОЛНОСТЬЮ ВАЛИДНЫМ

Исправь этот ответ: {response}
""")

        chain = fix_prompt | self.llm
        fix_response = chain.invoke({
            "error_message": error_message,
            "expected_format": expected_format,
            "response": response
        })

        return str(fix_response.content).strip()


    def generate_course_plan(self, topic: str, difficulty: str = "intermediate") -> Dict[str, Any]:
        """
        Generate a comprehensive course plan based on the topic.
        Returns course structure with 6-12 modules, each with 4-8 lessons.
        """
        prompt = ChatPromptTemplate.from_template("""
Ты - эксперт в создании образовательных курсов в стиле Stepik и Яндекс.Хэндбуков.
Тебе нужно создать план курса по теме: "{topic}"

**Требования к курсу:**
- Уровень сложности: {difficulty}
- 6-10 модулей (больших тем)
- Каждый модуль содержит 4-6 уроков
- Курс должен быть логичным и последовательным
- Каждый модуль должен иметь четкие цели обучения

ОТВЕТЬ ТОЛЬКО ВАЛИДНЫМ JSON БЕЗ ЛЮБОГО ДОПОЛНИТЕЛЬНОГО ТЕКСТА.
НЕ ДОБАВЛЯЙ КОММЕНТАРИИ, НЕ ИСПОЛЬЗУЙ МАРКДАУН, НЕ ДОБАВЛЯЙ ЛИШНИЕ ЗАПЯТЫЕ.
JSON ДОЛЖЕН БЫТЬ ПОЛНОСТЬЮ ВАЛИДНЫМ И ПАРСИТЬСЯ СТАНДАРТНЫМ JSON ПАРСЕРОМ.

**Структура ответа (ТОЛЬКО JSON):**
{{
  "title": "Название курса",
  "description": "Краткое описание курса",
  "estimated_duration": 40,
  "modules": [
    {{
      "title": "Название модуля",
      "description": "Описание модуля",
      "order": 1,
      "learning_objectives": ["Цель 1", "Цель 2", "Цель 3", "Цель 4", "Цель 5"],
      "key_concepts": ["Ключевой концепт 1", "Ключевой концепт 2", "Ключевой концепт3", "Ключевой концепт 4"],
      "lessons": [
        {{
          "title": "Название урока",
          "description": "Описание урока",
          "order": 1,
          "estimated_duration": 45,
          "learning_objectives": ["Цель урока 1", "Цель урока 2"],
          "key_concepts": ["Концепт 1", "Концепт 2"]
        }}
      ]
    }}
  ]
}}

**Примеры хороших курсов:**
- Python (уровень сложности - beginner): Введение в python → Ввод-вывод данных → Типы данных → Условный оператор → Циклы → Коллекции и работа с памятью → Функции → Мини-проект
- Python (уровень сложности - intermediate): Базовые конструкции в python → Коллекции и работа с памятью → Функции и их особенности → Объектно-ороиентированное программирование → Библиотеки для анализа данных → Проект
- Machine Learning (уровень сложности - advanced): Введение в машинное обучение -> Классическое обучение с учителем → Оценка качества моделей → Вероятностные модели → Введение в глубокое обучение → Арихтектуры глубокого обучения → Генеративные модели → Рекомендательные системы

Создай логичную последовательность модулей и уроков. Будь конкретным и практичным.
""")

        # Generate initial response
        chain = prompt | self.llm
        response = chain.invoke({
            "topic": topic,
            "difficulty": difficulty
        })

        response_content = str(response.content)

        # Save AI response to file for debugging
        #debug_file_path = '/home/bakamol/Desktop/code/WebProjects/aitutor/ai_response_debug.txt'
        #№with open(debug_file_path, 'w', encoding='utf-8') as f:
        #    f.write(response_content)

        # Try to parse JSON, if it fails, ask AI to fix it in a loop
        max_fix_attempts = 3
        current_response = response_content

        for fix_attempt in range(max_fix_attempts):
            try:
                logger.info(f"Attempting to parse JSON (attempt {fix_attempt + 1}/{max_fix_attempts})")

                # Try to parse the response as JSON
                plan = self._parse_json_response(current_response)
                logger.info(f"Succesfully parsed JSON on attempt {fix_attempt + 1} / {max_fix_attempts}")

                # Validate the parsed JSON structure
                if validate_course_plan(plan):
                    logger.info(f"Successfully generated and validated course plan on fix attempt {fix_attempt + 1}")
                    return plan
                else:
                    error_msg = "Course plan structure validation failed"
                    logger.warning(f"{error_msg} on fix attempt {fix_attempt + 1}")

            except (json.JSONDecodeError, ValueError, KeyError) as e:
                error_msg = f"JSON parsing or validation error: {str(e)}"
                logger.warning(f"{error_msg} on fix attempt {fix_attempt + 1}")

            # If we haven't succeeded and this isn't the last attempt, ask AI to fix it
            if fix_attempt < max_fix_attempts - 1:
                logger.info(f"Asking AI to fix the response (attempt {fix_attempt + 2}/{max_fix_attempts})")
                current_response = self._fix_ai_response(
                    current_response,
                    error_msg,
                    plan_expected_format
                )
            else:
                logger.error(f"Failed to generate valid course plan after {max_fix_attempts} fix attempts")
                raise ValueError(f"Failed to generate valid course plan after {max_fix_attempts} attempts. Last error: {error_msg}")

    def generate_lesson_theory(self, lesson_title: str, lesson_description: str,
                              learning_objectives: List[str], key_concepts: List[str],
                              module_context: str, course_topic: str) -> str:
        """
        Generate comprehensive theory content for a lesson in the style of Яндекс.Хэндбуки.
        Returns only the markdown content.
        """
        prompt = ChatPromptTemplate.from_template("""
Ты - эксперт в создании образовательного контента в стиле stepik и Яндекс.Хэндбуков.
Тебе нужно написать подробную теорию для урока.

**Контекст:**
- Тема курса: {course_topic}
- Модуль: {module_context}
- Урок: {lesson_title}
- Описание: {lesson_description}

**Цели обучения:**
{learning_objectives}

**Ключевые концепции:**
{key_concepts}

**Требования к теории:**
- Полное, подробное объяснение всех ключевых концепций
- Практические примеры кода (если применимо)
- Визуальные объяснения сложных идей
- Структура: введение → основная теория → примеры → практика → заключение
- Язык: понятный, но профессиональный
- Форматирование: заголовки, списки, выделения
- Не добавляй эмодзи в заголовках
- Длина: 1000-5000 слов для полного охвата темы

**Формат ответа:**
Верни только полный markdown текст урока (Может содержать заголовки, списки, встроенный код и т.д.).

**Пример ответа:**
# Введение в Python

Python - это высокоуровневый язык программирования общего назначения...

## Основные концепции

### Переменные
Переменные в Python используются для хранения данных...

### Типы данных
Python поддерживает различные типы данных...

## Примеры использования

```python
# Пример простой программы
print("Hello, World!")
```

Создай качественную, полную теорию, которую можно читать как главу из учебника.
""")

        objectives_str = "\\n".join(f"- {obj}" for obj in learning_objectives)
        concepts_str = "\\n".join(f"- {concept}" for concept in key_concepts)

        chain = prompt | self.llm
        response = chain.invoke({
            "course_topic": course_topic,
            "module_context": module_context,
            "lesson_title": lesson_title,
            "lesson_description": lesson_description,
            "learning_objectives": objectives_str,
            "key_concepts": concepts_str
        })

        response_content = str(response.content)

        content = response_content.strip()

        # Basic validation
        if len(content) >= 500:
            logger.info("Successfully generated lesson theory")
            return content
        else:
            logger.warning(f"Content too short ({len(content)} chars), generating fallback content")
            return self._generate_fallback_content(lesson_title, lesson_description, learning_objectives, key_concepts)

    def generate_module_content(self, module_title: str, module_description: str,
                               lessons: List[Dict], course_topic: str) -> Dict[str, Any]:
        """
        Generate content for all lessons in a module.
        Used when user completes a module and needs next one generated.
        """
        results = {}
        module_context = f"{module_title}: {module_description}"

        for lesson in lessons:
            try:
                content = self.generate_lesson_theory(
                    lesson_title=lesson["title"],
                    lesson_description=lesson["description"],
                    learning_objectives=lesson["learning_objectives"],
                    key_concepts=lesson["key_concepts"],
                    module_context=module_context,
                    course_topic=course_topic
                )

                # Calculate reading time
                word_count = len(content.split())
                reading_time = max(5, min(60, word_count // 200))

                results[lesson["id"]] = {
                    "content": content,
                    "reading_time": reading_time
                }
                logger.info(f"Generated theory for lesson: {lesson['title']} ({word_count} words)")

            except Exception as e:
                logger.error(f"Failed to generate theory for lesson {lesson['title']}: {e}")
                # Provide fallback content
                results[lesson["id"]] = {
                    "content": f"# {lesson['title']}\n\n{lesson['description']}\n\n*Приносим извинения, контент временно недоступен.*",
                    "reading_time": 5
                }

        return results

    def _generate_fallback_content(self, lesson_title: str, lesson_description: str,
                                 learning_objectives: List[str], key_concepts: List[str]) -> str:
        """Generate simple fallback content if AI fails"""
        content = f"# {lesson_title}\n\n"
        content += f"{lesson_description}\n\n"

        if learning_objectives:
            content += "## Цели обучения\n\n"
            for obj in learning_objectives:
                content += f"- {obj}\n"
            content += "\n"

        if key_concepts:
            content += "## Ключевые концепции\n\n"
            for concept in key_concepts:
                content += f"- {concept}\n"
            content += "\n"

        content += "*Приносим извинения, контент временно недоступен. Пожалуйста, попробуйте позже.*\n"

        return content
