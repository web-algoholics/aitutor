from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship, JSON
from sqlalchemy import Column


class TheoryCourse(SQLModel, table=True):
    """Main theory course model with lazy content generation"""
    __tablename__ = "theory_courses"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    topic: str  # User's input topic (e.g., "основы python")
    difficulty: str = "intermediate"
    estimated_duration: int  # in hours
    creator_id: int = Field(foreign_key="users.id")
    is_completed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    modules: List["TheoryModule"] = Relationship(back_populates="course", cascade_delete=True)


class TheoryModule(SQLModel, table=True):
    """Course module containing lessons"""
    __tablename__ = "theory_modules"

    id: Optional[int] = Field(default=None, primary_key=True)
    course_id: int = Field(foreign_key="theory_courses.id")
    title: str
    description: str
    order: int
    learning_objectives: List[str] = Field(default_factory=list, sa_type=JSON)
    key_concepts: List[str] = Field(default_factory=list, sa_type=JSON)
    is_completed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    course: Optional[TheoryCourse] = Relationship(back_populates="modules")
    lessons: List["TheoryLesson"] = Relationship(back_populates="module", cascade_delete=True)


class TheoryLesson(SQLModel, table=True):
    """Individual lesson within a module"""
    __tablename__ = "theory_lessons"

    id: Optional[int] = Field(default=None, primary_key=True)
    module_id: int = Field(foreign_key="theory_modules.id")
    title: str
    description: str
    order: int
    estimated_duration: int  # in minutes
    learning_objectives: List[str] = Field(default_factory=list, sa_type=JSON)
    key_concepts: List[str] = Field(default_factory=list, sa_type=JSON)
    is_completed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    module: Optional[TheoryModule] = Relationship(back_populates="lessons")
    content: Optional["TheoryContent"] = Relationship(back_populates="lesson", cascade_delete=True)


class TheoryContent(SQLModel, table=True):
    """Generated theory content for a lesson"""
    __tablename__ = "theory_contents"

    id: Optional[int] = Field(default=None, primary_key=True)
    lesson_id: int = Field(foreign_key="theory_lessons.id")
    content: str  # Full HTML/markdown content
    reading_time: int  # estimated reading time in minutes
    is_generated: bool = False
    generated_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    lesson: Optional[TheoryLesson] = Relationship(back_populates="content")
