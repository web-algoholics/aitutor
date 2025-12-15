"""
Validation functions for theory course structures
"""
import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

plan_expected_format = \
"""
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
"""


def validate_course_plan(plan: Dict[str, Any]) -> bool:
    """Validate course plan structure"""
    try:
        # Required top-level fields
        required_fields = ["title", "description", "estimated_duration", "modules"]
        for field in required_fields:
            if field not in plan:
                logger.error(f"Missing required field: {field}")
                return False

        # Validate title and description
        if not isinstance(plan["title"], str) or len(plan["title"]) < 1:
            logger.error("Invalid title")
            return False
        if not isinstance(plan["description"], str) or len(plan["description"]) < 1:
            logger.error("Invalid description")
            return False
        if not isinstance(plan["estimated_duration"], int) or plan["estimated_duration"] <= 0:
            logger.error("Invalid estimated_duration")
            return False

        # Validate modules
        if not isinstance(plan["modules"], list) or len(plan["modules"]) < 1:
            logger.error("Invalid modules list")
            return False

        for i, module in enumerate(plan["modules"]):
            if not validate_module(module):
                logger.error(f"Invalid module at index {i}")
                return False

        return True
    except Exception as e:
        logger.error(f"Validation error: {e}")
        return False


def validate_module(module: Dict[str, Any]) -> bool:
    """Validate module structure"""
    try:
        required_fields = ["title", "description", "order", "learning_objectives", "key_concepts", "lessons"]
        for field in required_fields:
            if field not in module:
                logger.error(f"Module missing field: {field}")
                return False

        if not isinstance(module["title"], str) or len(module["title"]) < 1:
            return False
        if not isinstance(module["description"], str) or len(module["description"]) < 1:
            return False
        if not isinstance(module["order"], int) or module["order"] < 1:
            return False
        if not isinstance(module["learning_objectives"], list) or len(module["learning_objectives"]) < 1:
            return False
        if not isinstance(module["key_concepts"], list):
            return False
        if not isinstance(module["lessons"], list) or len(module["lessons"]) < 1:
            return False

        for i, lesson in enumerate(module["lessons"]):
            if not validate_lesson(lesson):
                logger.error(f"Invalid lesson at index {i}")
                return False

        return True
    except Exception as e:
        logger.error(f"Module validation error: {e}")
        return False


def validate_lesson(lesson: Dict[str, Any]) -> bool:
    """Validate lesson structure"""
    try:
        required_fields = ["title", "description", "order", "estimated_duration", "learning_objectives", "key_concepts"]
        for field in required_fields:
            if field not in lesson:
                logger.error(f"Lesson missing field: {field}")
                return False

        if not isinstance(lesson["title"], str) or len(lesson["title"]) < 1:
            return False
        if not isinstance(lesson["description"], str) or len(lesson["description"]) < 5:
            return False
        if not isinstance(lesson["order"], int) or lesson["order"] < 0:
            return False
        if not isinstance(lesson["estimated_duration"], int) or lesson["estimated_duration"] <= 0:
            return False
        if not isinstance(lesson["learning_objectives"], list) or len(lesson["learning_objectives"]) < 1:
            return False
        if not isinstance(lesson["key_concepts"], list):
            return False

        return True
    except Exception as e:
        logger.error(f"Lesson validation error: {e}")
        return False


def validate_lesson_content(content: Dict[str, Any]) -> bool:
    """Validate lesson content structure"""
    try:
        required_fields = ["content", "reading_time"]
        for field in required_fields:
            if field not in content:
                logger.error(f"Content missing field: {field}")
                return False

        if not isinstance(content["content"], str) or len(content["content"]) < 500:
            logger.error("Content too short or invalid")
            return False
        if not isinstance(content["reading_time"], int) or content["reading_time"] <= 0:
            logger.error("Invalid reading_time")
            return False

        return True
    except Exception as e:
        logger.error(f"Content validation error: {e}")
        return False
