from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class LessonResponse(BaseModel):
    id: int
    module_id: int
    order: int
    title: str
    content: str
    code_template: str
    expected_concepts: List[str]

    class Config:
        from_attributes = True


class ModuleResponse(BaseModel):
    id: int
    course_id: int
    order: int
    title: str
    description: str
    learning_objectives: List[str]
    key_concepts: List[str]

    class Config:
        from_attributes = True


class ModuleDetailResponse(ModuleResponse):
    lessons: List[LessonResponse]


class CourseResponse(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    icon: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class CourseDetailResponse(CourseResponse):
    modules: List[ModuleResponse]


class ChatMessageSchema(BaseModel):
    user_message: str
    ai_response: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSessionResponse(BaseModel):
    id: int
    user_id: int
    module_id: int
    is_completed: bool
    created_at: datetime
    messages: List[ChatMessageSchema]

    class Config:
        from_attributes = True


class CodeEvaluationRequest(BaseModel):
    code: str


class CodeEvaluationResponse(BaseModel):
    passed: bool
    score: int  # 0-100
    strengths: List[str]
    improvements: List[str]
    feedback: str
    next_step: str


class CodeSubmissionResponse(BaseModel):
    id: int
    lesson_id: int
    code: str
    feedback: str
    score: int
    passed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserModuleProgressResponse(BaseModel):
    module_id: int
    is_completed: bool
    progress_percentage: int
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class CourseEnrollmentResponse(BaseModel):
    course_id: int
    enrolled_at: datetime
    progress_percentage: int

    class Config:
        from_attributes = True
