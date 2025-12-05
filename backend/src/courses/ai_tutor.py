import json
from typing import List
from langchain_community.chat_models.gigachat import GigaChat
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
import logging

logger = logging.getLogger(__name__)


class AIPythonTutor:
    """AI Tutor for Python education using GigaChat"""

    def __init__(self, gigachat_api_key: str, gigachat_scope: str = "GIGACHAT_API_PERS"):
        try:
            self.llm = GigaChat(
                credentials=gigachat_api_key,
                scope=gigachat_scope,
                verify_ssl_certs=False,
                model="GigaChat"
            )
        except Exception as e:
            logger.error(f"Failed to initialize GigaChat: {e}")
            raise

    def create_module_chat_chain(self, module_title: str, objectives: List[str], key_concepts: List[str]):
        """Creates a chain for teaching a specific module"""
        
        objectives_text = "\n".join([f"- {obj}" for obj in objectives])
        concepts_text = "\n".join([f"- {concept}" for concept in key_concepts])

        system_prompt = f"""Ты опытный преподаватель Python. Твоя задача - научить студента теме: {module_title}

Цели обучения:
{objectives_text}

Ключевые концепции:
{concepts_text}

ВАЖНЫЕ ПРАВИЛА:
1. Объясни концепцию простыми словами с примерами
2. Дай визуальную аналогию или метафору
3. Покажи 2-3 практических примера кода
4. Предложи задачу для практики
5. Будь готов ответить на уточняющие вопросы

Если студент показывает код:
- Похвали что работает
- Укажи ошибки если есть (конкретно и ясно)
- Дай совет по улучшению
- Предложи оптимизацию

ЗАПРЕЩЕНО:
- Давать готовые решения
- Просто объяснять без примеров
- Игнорировать ошибки в коде

РАЗРЕШЕНО:
- Задавать наводящие вопросы
- Давать подсказки без решения
- Показывать похожие примеры
- Объяснять почему код не работает"""

        chat_prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{question}")
        ])

        return chat_prompt | self.llm

    def evaluate_code(self, code: str, lesson_title: str, expected_concepts: List[str]) -> dict:
        """Evaluates student code"""
        
        concepts_text = ", ".join(expected_concepts)

        evaluation_prompt = f"""Проверь этот код для урока: {lesson_title}

Студент должен был использовать эти концепции:
{concepts_text}

КОД:
```python
{code}
```

Проверь и оцени по критериям:
1. Корректность - работает ли код без ошибок
2. Концепции - использованы ли требуемые концепции
3. Читаемость - понятен ли код
4. Эффективность - оптимален ли алгоритм

Ответь ТОЛЬКО в формате JSON (без markdown блоков):
{{
    "passed": true or false,
    "score": число от 0 до 100,
    "strengths": ["список", "плюсов"],
    "improvements": ["список", "что улучшить"],
    "feedback": "общий отзыв на русском (2-3 предложения)",
    "next_step": "что попробовать дальше"
}}"""

        try:
            response = self.llm.invoke(evaluation_prompt)
            
            # Extract text from response
            if isinstance(response, str):
                response_text = response
            elif hasattr(response, 'content'):
                response_text = response.content
            else:
                response_text = str(response)
            
            # Parse JSON response
            response_text = response_text.strip() if isinstance(response_text, str) else str(response_text)
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
            
            return json.loads(response_text)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}. Response: {response_text}")
            return {
                "passed": False,
                "score": 0,
                "strengths": [],
                "improvements": ["Ошибка при проверке кода"],
                "feedback": "Произошла техническая ошибка при проверке. Попробуй еще раз.",
                "next_step": "Убедись что код синтаксически правильный"
            }
        except Exception as e:
            logger.error(f"Error evaluating code: {e}")
            return {
                "passed": False,
                "score": 0,
                "strengths": [],
                "improvements": ["Ошибка при проверке кода"],
                "feedback": "Произошла техническая ошибка при проверке. Попробуй еще раз.",
                "next_step": "Убедись что код синтаксически правильный"
            }

    def generate_code_hint(self, lesson_title: str, current_code: str, expected_concepts: List[str]) -> str:
        """Generates a hint without giving the solution"""
        
        concepts_text = ", ".join(expected_concepts)

        hint_prompt = f"""Студент решает задачу: {lesson_title}

Ключевые концепции которые нужно использовать:
{concepts_text}

Его текущий код:
```python
{current_code if current_code else "# Пусто"}
```

Дай направляющую подсказку (БЕЗ готового решения):
1. Укажи где он близко к решению
2. Спроси наводящий вопрос
3. Предложи следующий маленький шаг
4. Если есть ошибка, объясни почему так происходит

Будь кратким (3-4 предложения)."""

        try:
            response = self.llm.invoke(hint_prompt)
            if isinstance(response, str):
                return response
            elif hasattr(response, 'content'):
                return response.content  # type: ignore
            else:
                return str(response)
        except Exception as e:
            logger.error(f"Error generating hint: {e}")
            return "Попробуй подумать о том, какая концепция здесь используется. Какие переменные или функции тебе могут помочь?"

    def explain_error(self, error_message: str, code_snippet: str) -> str:
        """Explains programming error in detail"""
        
        explain_prompt = f"""Студент получил ошибку:

ОШИБКА:
{error_message}

КОД:
```python
{code_snippet}
```

Объясни:
1. Что означает эта ошибка
2. Почему она возникла в этом коде
3. Как ее исправить (подсказка, не решение)
4. Как избежать похожих ошибок в будущем

Объясняй как для новичка - просто и понятно."""

        try:
            response = self.llm.invoke(explain_prompt)
            if isinstance(response, str):
                return response
            elif hasattr(response, 'content'):
                return response.content  # type: ignore
            else:
                return str(response)
        except Exception as e:
            logger.error(f"Error explaining error: {e}")
            return f"Ошибка: {error_message}. Проверь синтаксис и типы данных в коде."

    def generate_theory(self, module_title: str, objectives: List[str], key_concepts: List[str]) -> str:
        """Generate comprehensive theory explanation with Markdown formatting and practical examples"""
        
        objectives_text = "\n".join([f"- {obj}" for obj in objectives])
        concepts_text = "\n".join([f"- {concept}" for concept in key_concepts])

        theory_prompt = f"""Напиши ДЕТАЛЬНОЕ объяснение темы для начинающего программиста (новичка). Используй Markdown форматирование.

# {module_title}

СТРУКТУРА ОТВЕТА (ОБЯЗАТЕЛЬНО):

## Что это такое?
Объясни в 2-3 простых предложениях для полного новичка. Без сложных терминов.

## Аналогия из реальной жизни
Дай простую и понятную аналогию или метафору из повседневной жизни.

## Практические примеры кода
Покажи 3-4 примера кода с ПОДРОБНЫМИ комментариями на русском языке. Каждый пример должен показывать разный аспект.

## Где используется в реальности?
2-3 примера реального применения этой концепции в реальных проектах.

## Важные правила и особенности
Список из 3-4 важных правил и особенностей, которые нужно помнить.

ТРЕБОВАНИЯ К ОТВЕТУ:
- Используй Markdown форматирование: ## для заголовков, ### для подзаголовков
- Примеры кода в блоках ```python с кодом и закрывающим ```
- Используй * для маркированных списков
- БЕЗ сложных терминов - объясняй как для 10-летнего ребенка!
- Объем: 1500-2000 символов
- Каждый пример должен быть рабочим кодом
- Добавь комментарии на русском к каждой строке примеров

ЦЕЛИ ОБУЧЕНИЯ:
{objectives_text}

КЛЮЧЕВЫЕ КОНЦЕПЦИИ:
{concepts_text}

Начни с # {module_title} и строго следуй структуре выше. Это критично для качества обучения."""

        try:
            response = self.llm.invoke(theory_prompt)
            if isinstance(response, str):
                return response
            elif hasattr(response, 'content'):
                content = response.content
                return str(content) if content else f"## {module_title}\n\nЭто важная концепция в программировании."
            else:
                return str(response)
        except Exception as e:
            logger.error(f"Error generating theory: {e}")
            return f"## {module_title}\n\nЭто важная концепция в программировании.\n\n### Пример:\n```python\n# Пример кода\nprint('Привет')\n```"

    def generate_quiz(self, module_title: str, key_concepts: List[str]) -> dict:
        """Generate a quiz with questions directly from the theory"""
        
        concepts_text = ", ".join(key_concepts)

        quiz_prompt = f"""Создай ТЕСТ из 3 вопросов для проверки понимания темы: {module_title}

КОНЦЕПЦИИ, которые изучал студент:
{concepts_text}

ТРЕБОВАНИЯ К ТЕСТУ:
1. Ровно 3 вопроса
2. 3 варианта ответа на каждый (обозначены как a, b, c)
3. Каждый вопрос проверяет РАЗНЫЕ аспекты темы
4. ОДИН правильный ответ на вопрос
5. ВОПРОСЫ ДОЛЖНЫ БЫТЬ ПРЯМО ИЗ ТЕОРИИ (не выходить за её рамки)
6. Сложность: базовая (для новичков)
7. На русском языке

Ответь ТОЛЬКО в формате JSON (БЕЗ markdown блоков):
{{
    "questions": [
        {{
            "id": 1,
            "question": "Вопрос здесь?",
            "options": ["вариант a", "вариант b", "вариант c"],
            "correct_answer": "a"
        }},
        {{
            "id": 2,
            "question": "Следующий вопрос?",
            "options": ["вариант a", "вариант b", "вариант c"],
            "correct_answer": "b"
        }},
        {{
            "id": 3,
            "question": "Третий вопрос?",
            "options": ["вариант a", "вариант b", "вариант c"],
            "correct_answer": "c"
        }}
    ]
}}"""

        try:
            response = self.llm.invoke(quiz_prompt)
            response_text = response.content if hasattr(response, 'content') else str(response)
            response_text = str(response_text).strip() if response_text else ""
            
            # Clean JSON if wrapped in markdown
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
            
            quiz_data = json.loads(response_text)
            return quiz_data
        except Exception as e:
            logger.error(f"Error generating quiz: {e}")
            return {
                "questions": [
                    {
                        "id": 1,
                        "question": f"Что такое {module_title}?",
                        "options": ["Это концепция программирования", "Это название переменной", "Это тип данных"],
                        "correct_answer": "a"
                    },
                    {
                        "id": 2,
                        "question": f"Когда используется {module_title}?",
                        "options": ["Часто в реальных проектах", "Никогда", "Только в учебных целях"],
                        "correct_answer": "a"
                    },
                    {
                        "id": 3,
                        "question": f"Какой главный смысл {module_title}?",
                        "options": ["Улучшить код", "Усложнить программу", "Сделать ошибку"],
                        "correct_answer": "a"
                    }
                ]
            }

    def generate_coding_task(self, module_title: str, key_concepts: List[str]) -> dict:
        """Generate a coding task with input/output examples"""
        
        concepts_text = ", ".join(key_concepts)

        task_prompt = f"""Создай ПРАКТИЧЕСКУЮ ЗАДАЧУ ДЛЯ ПРОГРАММИРОВАНИЯ по теме: {module_title}

КОНЦЕПЦИИ, которые должны быть использованы:
{concepts_text}

ТРЕБОВАНИЯ К ЗАДАЧЕ:
1. Задача должна быть интересной и реалистичной
2. Задача должна использовать ВСЕ перечисленные концепции
3. Сложность: базовая (для новичков, но не тривиальная)
4. Включи 2-3 примера вход/выход с подробной демонстрацией

Ответь в JSON (БЕЗ markdown):
{{
    "title": "Название задачи",
    "description": "Полное описание задачи на русском (что нужно сделать)",
    "code_template": "# Шаблон кода на Python для студента\\n# Наполни эту функцию\\ndef solve():\\n    pass",
    "expected_concepts": ["концепция1", "концепция2"],
    "success_criteria": [
        "Критерий 1: Функция должна...",
        "Критерий 2: Код должен использовать...",
        "Критерий 3: Результат должен..."
    ],
    "examples": [
        {{"input": "Пример входных данных 1", "output": "Пример выходных данных 1", "explanation": "Объяснение почему так"}},
        {{"input": "Пример входных данных 2", "output": "Пример выходных данных 2", "explanation": "Объяснение почему так"}}
    ]
}}"""

        try:
            response = self.llm.invoke(task_prompt)
            response_text = response.content if hasattr(response, 'content') else str(response)
            response_text = str(response_text).strip() if response_text else ""
            
            # Clean JSON if wrapped in markdown
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
            
            task_data = json.loads(response_text)
            return task_data
        except Exception as e:
            logger.error(f"Error generating coding task: {e}")
            return {
                "title": f"Практическая задача: {module_title}",
                "description": f"Напиши код, который демонстрирует использование {concepts_text}",
                "code_template": "# Напиши код здесь\ndef solve():\n    pass",
                "expected_concepts": key_concepts,
                "success_criteria": [
                    f"Код должен использовать {concepts_text}",
                    "Код должен быть понятным и иметь комментарии",
                    "Функция должна работать корректно"
                ],
                "examples": [
                    {
                        "input": "Пример входных данных",
                        "output": "Ожидаемый результат",
                        "explanation": "Объяснение"
                    }
                ]
            }

