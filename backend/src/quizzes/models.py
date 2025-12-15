from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship, JSON
from sqlalchemy import Column


class Quiz(SQLModel, table=True):
    """Quiz model for testing knowledge on lesson theory"""
    __tablename__ = "quizzes"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str  # Quiz title (e.g., "Квиз по уроку: Основы Python")
    description: Optional[str] = None  # Optional description
    theory_content: str  # The theory content used to generate the quiz
    creator_id: int = Field(foreign_key="users.id")
    is_completed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    questions: List["Question"] = Relationship(back_populates="quiz", cascade_delete=True)


class Question(SQLModel, table=True):
    """Question in a quiz"""
    __tablename__ = "quiz_questions"

    id: Optional[int] = Field(default=None, primary_key=True)
    quiz_id: int = Field(foreign_key="quizzes.id")
    question_text: str  # The question text
    question_type: str = "multiple_choice"  # "multiple_choice" or "single_choice"
    order: int  # Order of question in quiz
    explanation: Optional[str] = None  # Explanation shown after answering
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    quiz: Optional[Quiz] = Relationship(back_populates="questions")
    answers: List["Answer"] = Relationship(back_populates="question", cascade_delete=True)


class Answer(SQLModel, table=True):
    """Answer option for a question"""
    __tablename__ = "quiz_answers"

    id: Optional[int] = Field(default=None, primary_key=True)
    question_id: int = Field(foreign_key="quiz_questions.id")
    answer_text: str  # The answer text
    is_correct: bool = False  # Whether this answer is correct
    order: int  # Order of answer in question
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    question: Optional[Question] = Relationship(back_populates="answers")

