from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


# Request schemas
class CreateQuizRequest(BaseModel):
    """Request to create a quiz from theory content"""
    description: Optional[str] = None
    theory_content: str  # The theory content to generate quiz from


class SubmitQuizAnswerRequest(BaseModel):
    """Request to submit an answer for a question"""
    question_id: int
    answer_ids: List[int]  # List of selected answer IDs (for multiple choice)


class SubmitQuizRequest(BaseModel):
    """Request to submit entire quiz with all answers"""
    quiz_id: int
    answers: List[SubmitQuizAnswerRequest]  # List of all answers


# Response schemas
class AnswerResponse(BaseModel):
    """Response containing answer information"""
    id: int
    question_id: int
    answer_text: str
    is_correct: bool
    order: int
    created_at: datetime

    class Config:
        from_attributes = True


class QuestionResponse(BaseModel):
    """Response containing question information"""
    id: int
    quiz_id: int
    question_text: str
    question_type: str
    order: int
    explanation: Optional[str]
    created_at: datetime
    answers: List[AnswerResponse]

    class Config:
        from_attributes = True


class QuizResponse(BaseModel):
    """Response containing quiz information"""
    id: int
    title: str
    description: Optional[str]
    theory_content: str
    creator_id: int
    is_completed: bool
    created_at: datetime
    questions: List[QuestionResponse]

    class Config:
        from_attributes = True


class QuizSummaryResponse(BaseModel):
    """Response containing quiz summary (without answers)"""
    id: int
    title: str
    description: Optional[str]
    creator_id: int
    is_completed: bool
    created_at: datetime
    questions_count: int

    class Config:
        from_attributes = True


class QuizResultResponse(BaseModel):
    """Response containing quiz result after submission"""
    quiz_id: int
    total_questions: int
    correct_answers: int
    score_percentage: float
    is_passed: bool  # e.g., passed if score >= 50%
    answers: List[dict]  # List of {question_id, is_correct, selected_answer_ids, correct_answer_ids}

