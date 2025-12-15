import json
import logging
from typing import Dict, List, Any
from langchain_gigachat import GigaChat
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
import json_repair
from config import settings

logger = logging.getLogger(__name__)


class QuizAIGenerator:
    """AI generator for quiz questions from theory content"""

    def __init__(self):
        self.llm = GigaChat(
            credentials=settings.GIGACHAT_API_KEY,
            model="GigaChat",
            temperature=0.5,
            max_tokens=64000,
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

    def _validate_quiz_structure(self, parsed: Dict[str, Any], num_questions: int) -> None:
        """
        Validate the structure of parsed quiz JSON.
        
        Args:
            parsed: The parsed JSON dictionary from AI response
            num_questions: Expected number of questions
            
        Raises:
            ValueError: If validation fails with descriptive error message
        """
        # Validate top-level structure
        if "title" not in parsed:
            raise ValueError("AI response missing 'title' field")
        
        if not isinstance(parsed["title"], str) or len(parsed["title"].strip()) == 0:
            raise ValueError("AI response 'title' must be a non-empty string")
        
        if "questions" not in parsed:
            raise ValueError("AI response missing 'questions' field")

        questions = parsed["questions"]
        if not isinstance(questions, list):
            raise ValueError("AI response 'questions' must be a list")

        if len(questions) != num_questions:
            logger.warning(f"Expected {num_questions} questions, got {len(questions)}")

        # Validate each question
        for i, question in enumerate(questions):
            if not isinstance(question, dict):
                raise ValueError(f"Question {i} must be a dictionary")

            # Validate required fields
            if "question_text" not in question:
                raise ValueError(f"Question {i} missing 'question_text' field")
            
            if "question_type" not in question:
                raise ValueError(f"Question {i} missing 'question_type' field")
            
            if question["question_type"] not in ["single_choice", "multiple_choice"]:
                raise ValueError(
                    f"Question {i} has invalid question_type: {question['question_type']}. "
                    f"Must be 'single_choice' or 'multiple_choice'"
                )

            # Validate answers
            if "answers" not in question:
                raise ValueError(f"Question {i} missing 'answers' field")
            
            if not isinstance(question["answers"], list):
                raise ValueError(f"Question {i} 'answers' must be a list")
            
            if len(question["answers"]) < 1:
                raise ValueError(f"Question {i} must have at least 1 answer")

            # Validate answer structure
            for j, answer in enumerate(question["answers"]):
                if not isinstance(answer, dict):
                    raise ValueError(f"Question {i}, answer {j} must be a dictionary")
                if "answer_text" not in answer:
                    raise ValueError(f"Question {i}, answer {j} missing 'answer_text' field")
                if "is_correct" not in answer:
                    raise ValueError(f"Question {i}, answer {j} missing 'is_correct' field")
                if not isinstance(answer["is_correct"], bool):
                    raise ValueError(f"Question {i}, answer {j} 'is_correct' must be a boolean")

            # Validate correct answer count based on question type
            correct_count = sum(1 for ans in question["answers"] if ans.get("is_correct", False))
            
            if question["question_type"] == "single_choice" and correct_count != 1:
                raise ValueError(
                    f"Question {i} (single_choice) must have exactly 1 correct answer, got {correct_count}"
                )
            
            if question["question_type"] == "multiple_choice" and correct_count < 1:
                raise ValueError(
                    f"Question {i} (multiple_choice) must have at least 1 correct answer, got {correct_count}"
                )

    def _calculate_optimal_questions_count(self, theory_content: str) -> int:
        """
        Calculate optimal number of questions based on theory content length.
        
        Args:
            theory_content: The theory content
            
        Returns:
            Optimal number of questions (between 3 and 15)
        """
        # Calculate based on content length: approximately 1 question per 600-800 characters
        content_length = len(theory_content)
        num_questions = max(3, min(15, content_length // 700))
        return num_questions

    def generate_quiz_questions(self, theory_content: str) -> Dict[str, Any]:
        """
        Generate quiz questions and title from theory content.
        Automatically determines optimal number of questions based on content length.
        
        Args:
            theory_content: The theory content to generate questions from
            
        Returns:
            Dictionary with title, questions list, each containing question_text, question_type,
            answers list with answer_text and is_correct, and optional explanation
        """
        # Automatically determine optimal number of questions
        num_questions = self._calculate_optimal_questions_count(theory_content)
        logger.info(f"Determined optimal number of questions: {num_questions} (theory length: {len(theory_content)} chars)")
        
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", """Ты эксперт по созданию образовательных тестов и квизов. 
Твоя задача - создать качественные вопросы для проверки знаний на основе предоставленной теории.

Требования:
1. Создай краткое, информативное название квиза (3-7 слов), которое отражает тему теории
2. Вопросы должны проверять понимание ключевых концепций из теории
3. Используй разные типы вопросов: одиночный выбор (single_choice) и множественный выбор (multiple_choice)
4. Для каждого вопроса должно быть от 3 до 5 вариантов ответов
5. Только один вариант должен быть правильным для single_choice, один или более для multiple_choice
6. Неправильные ответы должны быть правдоподобными, но явно неправильными
7. Добавь краткое объяснение для каждого вопроса (почему правильный ответ правильный)

Формат ответа - строго JSON:
{{
  "title": "Краткое название квиза",
  "questions": [
    {{
      "question_text": "Текст вопроса",
      "question_type": "single_choice" или "multiple_choice",
      "answers": [
        {{"answer_text": "Вариант ответа 1", "is_correct": true}},
        {{"answer_text": "Вариант ответа 2", "is_correct": false}},
        ...
      ],
      "explanation": "Краткое объяснение правильного ответа"
    }},
    ...
  ]
}}

Важно: отвечай ТОЛЬКО валидным JSON, без дополнительного текста до или после."""),
            ("human", """Создай {num_questions} вопросов на основе следующей теории:

{theory_content}

Ответь строго в формате JSON как указано выше.""")
        ])

        expected_format_str = """{
  "title": "Краткое название квиза",
  "questions": [
    {
      "question_text": "Текст вопроса",
      "question_type": "single_choice" или "multiple_choice",
      "answers": [
        {"answer_text": "Вариант ответа 1", "is_correct": true},
        {"answer_text": "Вариант ответа 2", "is_correct": false}
      ],
      "explanation": "Краткое объяснение правильного ответа"
    }
  ]
}"""

        # Generate initial response
        chain = prompt_template | self.llm
        response = chain.invoke({
            "theory_content": theory_content,
            "num_questions": num_questions
        })

        response_text = str(response.content).strip()
        logger.info(f"Generated quiz questions response, length: {len(response_text)} chars")

        # Try to parse JSON, if it fails, ask AI to fix it in a loop
        max_fix_attempts = 3
        current_response = response_text
        error_msg = "Unknown error"

        for fix_attempt in range(max_fix_attempts):
            try:
                logger.info(f"Attempting to parse quiz JSON (attempt {fix_attempt + 1}/{max_fix_attempts})")

                # Try to parse the response as JSON
                parsed = self._parse_json_response(current_response)
                logger.info(f"Successfully parsed JSON on attempt {fix_attempt + 1} / {max_fix_attempts}")

                # Validate structure
                self._validate_quiz_structure(parsed, num_questions)

                # If we get here, validation passed
                questions = parsed["questions"]
                logger.info(f"Successfully generated and validated quiz '{parsed.get('title', 'Unknown')}' with {len(questions)} questions on fix attempt {fix_attempt + 1}")
                return parsed

            except (json.JSONDecodeError, ValueError, KeyError) as e:
                error_msg = f"JSON parsing or validation error: {str(e)}"
                logger.warning(f"{error_msg} on fix attempt {fix_attempt + 1}")

            # If we haven't succeeded and this isn't the last attempt, ask AI to fix it
            if fix_attempt < max_fix_attempts - 1:
                logger.info(f"Asking AI to fix the quiz response (attempt {fix_attempt + 2}/{max_fix_attempts})")
                current_response = self._fix_ai_response(
                    current_response,
                    error_msg,
                    expected_format_str
                )
            else:
                logger.error(f"Failed to generate valid quiz questions after {max_fix_attempts} fix attempts")
                raise ValueError(f"Failed to generate valid quiz questions after {max_fix_attempts} attempts. Last error: {error_msg}")
        
        # This should never be reached, but added for type checker
        raise RuntimeError("Unexpected code path reached in generate_quiz_questions")

