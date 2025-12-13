from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


# Request schemas
class CreateTheoryCourseRequest(BaseModel):
    """Request to create a new theory course"""
    topic: str  # e.g., "основы python", "machine learning", "web development"
    difficulty: Optional[str] = "intermediate"  # beginner, intermediate, advanced


class GenerateTheoryContentRequest(BaseModel):
    """Request to generate theory content for a lesson"""
    lesson_id: int


# Response schemas
class TheoryCourseResponse(BaseModel):
    """Response containing course information"""
    id: int
    title: str
    description: str
    topic: str
    difficulty: str
    estimated_duration: int
    creator_id: int
    modules_count: int
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TheoryModuleResponse(BaseModel):
    """Response containing module information"""
    id: int
    course_id: int
    title: str
    description: str
    order: int
    learning_objectives: List[str]
    key_concepts: List[str]
    lessons_count: int
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TheoryLessonResponse(BaseModel):
    """Response containing lesson information"""
    id: int
    module_id: int
    title: str
    description: str
    order: int
    estimated_duration: int
    learning_objectives: List[str]
    key_concepts: List[str]
    has_content: bool
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TheoryContentResponse(BaseModel):
    """Response containing generated theory content"""
    id: int
    lesson_id: int
    course_id: int
    content: str
    reading_time: int
    is_generated: bool
    lesson_is_completed: bool
    generated_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class TheoryCourseTreeResponse(BaseModel):
    """Complete course tree response for frontend display"""
    course: TheoryCourseResponse
    modules: List[TheoryModuleResponse]
    lessons: List[List[TheoryLessonResponse]]  # Nested by module

    class Config:
        from_attributes = True


class CourseGenerationStatus(BaseModel):
    """Status response for course generation progress"""
    course_id: int
    status: str  # "planning", "generating_modules", "generating_content", "completed"
    progress: int  # 0-100
    message: str
    estimated_time_remaining: Optional[int]  # in seconds
