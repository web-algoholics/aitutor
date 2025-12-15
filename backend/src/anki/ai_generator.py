import json
import logging
from typing import Dict, List, Any
from langchain_gigachat import GigaChat
from langchain_core.prompts import ChatPromptTemplate
import json_repair
from config import settings

logger = logging.getLogger(__name__)


class AnkiAIGenerator:
    """AI generator for Anki flashcards from course content or material"""

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

    def _validate_cards_structure(self, parsed: Dict[str, Any], min_cards: int = 1) -> None:
        """
        Validate the structure of parsed cards JSON.
        
        Args:
            parsed: The parsed JSON dictionary from AI response
            min_cards: Minimum expected number of cards
            
        Raises:
            ValueError: If validation fails with descriptive error message
        """
        # Validate top-level structure
        if "cards" not in parsed:
            raise ValueError("AI response missing 'cards' field")
        
        if not isinstance(parsed["cards"], list):
            raise ValueError("AI response 'cards' must be a list")
        
        cards = parsed["cards"]
        
        if len(cards) < min_cards:
            raise ValueError(f"AI response must contain at least {min_cards} cards, got {len(cards)}")
        
        # Validate each card
        for i, card in enumerate(cards):
            if not isinstance(card, dict):
                raise ValueError(f"Card {i} is not a dictionary")
            
            if "front" not in card:
                raise ValueError(f"Card {i} missing 'front' field")
            
            if not isinstance(card["front"], str) or len(card["front"].strip()) == 0:
                raise ValueError(f"Card {i} 'front' must be a non-empty string")
            
            if "back" not in card:
                raise ValueError(f"Card {i} missing 'back' field")
            
            if not isinstance(card["back"], str) or len(card["back"].strip()) == 0:
                raise ValueError(f"Card {i} 'back' must be a non-empty string")

    def _calculate_optimal_cards_count(self, content_length: int) -> int:
        """Calculate optimal number of cards based on content length"""
        # Roughly 1 card per 500-800 characters
        num_cards = max(5, min(50, content_length // 600))
        return num_cards

    def generate_cards_from_course_content(self, course_title: str, lessons_content: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Generate Anki cards from course lessons content.
        
        Args:
            course_title: Title of the course
            lessons_content: List of dicts with 'title' and 'content' keys for each lesson
            
        Returns:
            Dict with 'title' and 'cards' list, where each card has 'front' and 'back'
        """
        # Combine all lessons content
        combined_content = f"Курс: {course_title}\n\n"
        for lesson in lessons_content:
            combined_content += f"Урок: {lesson['title']}\n\n{lesson['content']}\n\n"
        
        # Calculate optimal number of cards
        num_cards = self._calculate_optimal_cards_count(len(combined_content))
        
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", """Ты помощник по созданию учебных карточек Anki на основе предоставленного материала курса.

Твоя задача - создать качественные карточки для запоминания ключевых концепций, определений, фактов и важной информации из материала.

ТРЕБОВАНИЯ К КАРТОЧКАМ:
1. Front (лицевая сторона) - это вопрос, термин, понятие или утверждение, на которое нужно ответить
2. Back (обратная сторона) - это ответ, определение, объяснение или дополнение
3. Карточки должны быть краткими и конкретными
4. Избегай длинных текстов на лицевой стороне
5. Сосредоточься на важных концепциях, определениях, фактах
6. Используй разные типы карточек:
   - Вопрос-ответ
   - Термин-определение
   - Концепция-объяснение
   - Факт-контекст
7. Каждая карточка должна быть самодостаточной и понятной

Формат ответа - строго JSON:
{{
  "title": "Название колоды карточек",
  "cards": [
    {{
      "front": "Вопрос или термин",
      "back": "Ответ или определение"
    }},
    ...
  ]
}}

Важно: отвечай ТОЛЬКО валидным JSON, без дополнительного текста до или после."""),
            ("human", """Создай {num_cards} карточек Anki на основе следующего материала курса:

{combined_content}

Ответь строго в формате JSON как указано выше.""")
        ])

        expected_format_str = """{
  "title": "Название колоды карточек",
  "cards": [
    {
      "front": "Вопрос или термин",
      "back": "Ответ или определение"
    }
  ]
}"""

        # Generate initial response
        chain = prompt_template | self.llm
        response = chain.invoke({
            "combined_content": combined_content,
            "num_cards": num_cards
        })

        response_text = str(response.content).strip()
        logger.info(f"Generated Anki cards response, length: {len(response_text)} chars")

        # Try to parse JSON, if it fails, ask AI to fix it in a loop
        max_fix_attempts = 3
        current_response = response_text
        error_msg = "Unknown error"

        for fix_attempt in range(max_fix_attempts):
            try:
                logger.info(f"Attempting to parse Anki cards JSON (attempt {fix_attempt + 1}/{max_fix_attempts})")

                # Try to parse the response as JSON
                parsed = self._parse_json_response(current_response)
                logger.info(f"Successfully parsed JSON on attempt {fix_attempt + 1} / {max_fix_attempts}")

                # Validate structure
                self._validate_cards_structure(parsed, min_cards=5)

                # If we get here, validation passed
                cards = parsed["cards"]
                logger.info(f"Successfully generated and validated Anki deck '{parsed.get('title', 'Unknown')}' with {len(cards)} cards on fix attempt {fix_attempt + 1}")
                return parsed

            except (json.JSONDecodeError, ValueError, KeyError) as e:
                error_msg = f"JSON parsing or validation error: {str(e)}"
                logger.warning(f"{error_msg} on fix attempt {fix_attempt + 1}")

            # If we haven't succeeded and this isn't the last attempt, ask AI to fix it
            if fix_attempt < max_fix_attempts - 1:
                logger.info(f"Asking AI to fix the Anki cards response (attempt {fix_attempt + 2}/{max_fix_attempts})")
                current_response = self._fix_ai_response(
                    current_response,
                    error_msg,
                    expected_format_str
                )
            else:
                logger.error(f"Failed to generate valid Anki cards after {max_fix_attempts} fix attempts")
                raise ValueError(f"Failed to generate valid Anki cards after {max_fix_attempts} attempts. Last error: {error_msg}")
        
        # This should never be reached, but added for type checker
        raise RuntimeError("Unexpected code path reached in generate_cards_from_course_content")

    def generate_cards_from_material(self, material_content: str, title: str) -> Dict[str, Any]:
        """
        Generate Anki cards from uploaded material content.
        
        Args:
            material_content: The material content (e.g., lecture notes, article, book excerpt)
            title: Suggested title for the deck
            
        Returns:
            Dict with 'title' and 'cards' list, where each card has 'front' and 'back'
        """
        # Calculate optimal number of cards
        num_cards = self._calculate_optimal_cards_count(len(material_content))
        
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", """Ты помощник по созданию учебных карточек Anki на основе предоставленного материала.

Твоя задача - создать качественные карточки для запоминания ключевых концепций, определений, фактов и важной информации из материала.

ТРЕБОВАНИЯ К КАРТОЧКАМ:
1. Front (лицевая сторона) - это вопрос, термин, понятие или утверждение, на которое нужно ответить
2. Back (обратная сторона) - это ответ, определение, объяснение или дополнение
3. Карточки должны быть краткими и конкретными
4. Избегай длинных текстов на лицевой стороне
5. Сосредоточься на важных концепциях, определениях, фактах
6. Используй разные типы карточек:
   - Вопрос-ответ
   - Термин-определение
   - Концепция-объяснение
   - Факт-контекст
7. Каждая карточка должна быть самодостаточной и понятной

Формат ответа - строго JSON:
{{
  "title": "Название колоды карточек",
  "cards": [
    {{
      "front": "Вопрос или термин",
      "back": "Ответ или определение"
    }},
    ...
  ]
}}

Важно: отвечай ТОЛЬКО валидным JSON, без дополнительного текста до или после."""),
            ("human", """Создай {num_cards} карточек Anki на основе следующего материала:

{material_content}

Ответь строго в формате JSON как указано выше.""")
        ])

        expected_format_str = """{
  "title": "Название колоды карточек",
  "cards": [
    {
      "front": "Вопрос или термин",
      "back": "Ответ или определение"
    }
  ]
}"""

        # Generate initial response
        chain = prompt_template | self.llm
        response = chain.invoke({
            "material_content": material_content,
            "num_cards": num_cards
        })

        response_text = str(response.content).strip()
        logger.info(f"Generated Anki cards from material response, length: {len(response_text)} chars")

        # Try to parse JSON, if it fails, ask AI to fix it in a loop
        max_fix_attempts = 3
        current_response = response_text
        error_msg = "Unknown error"

        for fix_attempt in range(max_fix_attempts):
            try:
                logger.info(f"Attempting to parse Anki cards JSON (attempt {fix_attempt + 1}/{max_fix_attempts})")

                # Try to parse the response as JSON
                parsed = self._parse_json_response(current_response)
                logger.info(f"Successfully parsed JSON on attempt {fix_attempt + 1} / {max_fix_attempts}")

                # Validate structure
                self._validate_cards_structure(parsed, min_cards=5)

                # If we get here, validation passed
                cards = parsed["cards"]
                logger.info(f"Successfully generated and validated Anki deck '{parsed.get('title', 'Unknown')}' with {len(cards)} cards on fix attempt {fix_attempt + 1}")
                return parsed

            except (json.JSONDecodeError, ValueError, KeyError) as e:
                error_msg = f"JSON parsing or validation error: {str(e)}"
                logger.warning(f"{error_msg} on fix attempt {fix_attempt + 1}")

            # If we haven't succeeded and this isn't the last attempt, ask AI to fix it
            if fix_attempt < max_fix_attempts - 1:
                logger.info(f"Asking AI to fix the Anki cards response (attempt {fix_attempt + 2}/{max_fix_attempts})")
                current_response = self._fix_ai_response(
                    current_response,
                    error_msg,
                    expected_format_str
                )
            else:
                logger.error(f"Failed to generate valid Anki cards after {max_fix_attempts} fix attempts")
                raise ValueError(f"Failed to generate valid Anki cards after {max_fix_attempts} attempts. Last error: {error_msg}")
        
        # This should never be reached, but added for type checker
        raise RuntimeError("Unexpected code path reached in generate_cards_from_material")

