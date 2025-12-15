"""
Модели для курсов
"""
from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import datetime

class Course(SQLModel, table=True):
    """Модель курса"""
    __tablename__ = "courses"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    slug: str = Field(index=True, unique=True, max_length=100)  # python, javascript, vue
    name: str = Field(max_length=200)  # Python, JavaScript, Vue.js
    description: Optional[str] = None
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

