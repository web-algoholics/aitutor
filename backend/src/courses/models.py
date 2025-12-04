from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from sqlalchemy import JSON


class Course(SQLModel, table=True):
    __tablename__ = "courses"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    description: str
    difficulty: str  # "beginner", "intermediate", "advanced"
    icon: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    modules: List["Module"] = Relationship(back_populates="course")
    enrollments: List["CourseEnrollment"] = Relationship(back_populates="course")


class Module(SQLModel, table=True):
    __tablename__ = "modules"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    course_id: int = Field(foreign_key="courses.id")
    order: int
    title: str = Field(index=True)
    description: str
    learning_objectives: str = Field(default="[]", sa_type=JSON)
    key_concepts: str = Field(default="[]", sa_type=JSON)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    course: Optional[Course] = Relationship(back_populates="modules")
    lessons: List["Lesson"] = Relationship(back_populates="module")
    chat_sessions: List["ChatSession"] = Relationship(back_populates="module")
    user_progress: List["UserModuleProgress"] = Relationship(back_populates="module")


class Lesson(SQLModel, table=True):
    __tablename__ = "lessons"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    module_id: int = Field(foreign_key="modules.id")
    order: int
    title: str = Field(index=True)
    content: str
    code_template: str
    expected_concepts: str = Field(default="[]", sa_type=JSON)
    hints: Optional[str] = Field(default=None, sa_type=JSON)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    module: Optional[Module] = Relationship(back_populates="lessons")
    submissions: List["CodeSubmission"] = Relationship(back_populates="lesson")


class ChatSession(SQLModel, table=True):
    __tablename__ = "chat_sessions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    module_id: int = Field(foreign_key="modules.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    module: Optional[Module] = Relationship(back_populates="chat_sessions")
    messages: List["ChatMessage"] = Relationship(back_populates="session")


class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="chat_sessions.id")
    role: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    session: Optional[ChatSession] = Relationship(back_populates="messages")


class CodeSubmission(SQLModel, table=True):
    __tablename__ = "code_submissions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    lesson_id: int = Field(foreign_key="lessons.id")
    code: str
    score: Optional[int] = None
    feedback: Optional[str] = None
    is_correct: Optional[bool] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    lesson: Optional[Lesson] = Relationship(back_populates="submissions")


class UserModuleProgress(SQLModel, table=True):
    __tablename__ = "user_module_progress"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    module_id: int = Field(foreign_key="modules.id")
    is_completed: bool = False
    completed_lessons: int = 0
    last_accessed: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    module: Optional[Module] = Relationship(back_populates="user_progress")


class CourseEnrollment(SQLModel, table=True):
    __tablename__ = "course_enrollments"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    course_id: int = Field(foreign_key="courses.id")
    enrolled_at: datetime = Field(default_factory=datetime.utcnow)
    is_completed: bool = False
    progress_percentage: int = 0
    
    # Relationships
    course: Optional[Course] = Relationship(back_populates="enrollments")
