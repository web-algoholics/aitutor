from sqlmodel import Field, SQLModel, Relationship, Column, Text, JSON
from sqlalchemy import Integer, DateTime, String
from typing import Optional, List, Dict, Any
from datetime import datetime

class JobVacancy(SQLModel, table=True):
    """Модель для хранения вакансий с hh.ru"""
    __tablename__ = "job_vacancies"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    hh_id: str = Field(index=True, unique=True)  # ID вакансии на hh.ru
    name: str = Field(max_length=500)
    description: str = Field(sa_column=Column(Text))
    employer_name: Optional[str] = Field(default=None, max_length=200)
    salary_from: Optional[int] = None
    salary_to: Optional[int] = None
    currency: Optional[str] = Field(default="RUR", max_length=10)
    experience: Optional[str] = None  # "noExperience", "between1And3", etc.
    employment: Optional[str] = None  # "full", "part", "project", etc.
    schedule: Optional[str] = None  # "fullDay", "shift", "flexible", etc.
    area: Optional[str] = None  # Город
    skills: List[str] = Field(default=[], sa_column=Column(JSON))  # Список навыков
    requirements: str = Field(sa_column=Column(Text))  # Полные требования
    url: str = Field(max_length=500)
    published_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Связь с анализом
    analyses: List["JobAnalysis"] = Relationship(back_populates="vacancy")


class JobAnalysis(SQLModel, table=True):
    """Модель для хранения результатов анализа вакансий"""
    __tablename__ = "job_analyses"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    vacancy_id: int = Field(foreign_key="job_vacancies.id")
    
    # Анализ технологий
    technologies: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))  # {"python": 150, "javascript": 120}
    frameworks: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    databases: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    tools: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    
    # Статистика
    total_vacancies: int = Field(default=0)
    average_salary_from: Optional[float] = None
    average_salary_to: Optional[float] = None
    experience_distribution: Dict[str, int] = Field(default={}, sa_column=Column(JSON))
    
    # Рекомендации
    recommended_skills: List[str] = Field(default=[], sa_column=Column(JSON))
    skill_gaps: List[str] = Field(default=[], sa_column=Column(JSON))  # Навыки, которых не хватает студентам
    
    # Метаданные анализа
    search_query: Optional[str] = None  # Запрос, по которому собирались вакансии
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)
    
    vacancy: JobVacancy = Relationship(back_populates="analyses")


class MarketTrend(SQLModel, table=True):
    """Модель для хранения трендов рынка"""
    __tablename__ = "market_trends"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Период анализа
    period_start: datetime
    period_end: datetime
    language: Optional[str] = Field(default=None, max_length=50)  # python, javascript, etc.
    
    # Тренды
    demand_score: float = Field(default=0.0)  # Оценка спроса (0-100)
    salary_trend: float = Field(default=0.0)  # Изменение зарплат (%)
    skill_trends: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))  # Тренды по навыкам
    
    # Статистика
    total_vacancies: int = Field(default=0)
    new_skills: List[str] = Field(default=[], sa_column=Column(JSON))  # Новые появляющиеся навыки
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

