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
