from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class JobVacancyRead(BaseModel):
    id: int
    hh_id: str
    name: str
    description: str
    employer_name: Optional[str]
    salary_from: Optional[int]
    salary_to: Optional[int]
    currency: Optional[str]
    experience: Optional[str]
    employment: Optional[str]
    schedule: Optional[str]
    area: Optional[str]
    skills: List[str]
    url: str
    published_at: Optional[datetime]

class JobAnalysisRead(BaseModel):
    id: int
    vacancy_id: int
    technologies: Dict[str, Any]
    frameworks: Dict[str, Any]
    databases: Dict[str, Any]
    tools: Dict[str, Any]
    total_vacancies: int
    average_salary_from: Optional[float]
    average_salary_to: Optional[float]
    experience_distribution: Dict[str, int]
    recommended_skills: List[str]
    skill_gaps: List[str]
    search_query: Optional[str]
    analyzed_at: datetime

class MarketTrendRead(BaseModel):
    id: int
    period_start: datetime
    period_end: datetime
    language: Optional[str]
    demand_score: float
    salary_trend: float
    skill_trends: Dict[str, Any]
    total_vacancies: int
    new_skills: List[str]
    created_at: datetime

class AnalysisRequest(BaseModel):
    """Запрос на анализ вакансий (основные + расширенные фильтры HH API)"""
    query: str  # Поисковый запрос (например, "Python разработчик")
    area: Optional[str] = None  # Код региона HH (например, "1" для Москвы)
    experience: Optional[str] = None  # Уровень опыта (noExperience, between1And3, ...)
    limit: int = 100  # Количество вакансий для анализа

    # Расширенные фильтры HH API (все опциональные)
    only_with_salary: bool = False  # Только вакансии с указанной зарплатой
    employment: Optional[str] = None  # Формат занятости (full, part, project, volunteer, probation)
    schedule: Optional[str] = None  # График работы (fullDay, remote, flexible и т.п.)
    date_from: Optional[str] = None  # Дата публикации c (YYYY-MM-DD)
    date_to: Optional[str] = None  # Дата публикации по (YYYY-MM-DD)

class SkillRecommendation(BaseModel):
    """Рекомендация по навыку"""
    skill: str
    demand_count: int  # Сколько раз встречается в вакансиях
    percentage: float  # Процент от всех вакансий
    average_salary: Optional[float] = None
    trend: str = "stable"  # "growing", "declining", "stable"
    course_url: Optional[str] = None  # Ссылка на курс, если курс существует

class MarketAnalysisResponse(BaseModel):
    """Полный ответ с анализом рынка"""
    query: str
    total_vacancies: int
    technologies: List[SkillRecommendation]
    frameworks: List[SkillRecommendation]
    databases: List[SkillRecommendation]
    tools: List[SkillRecommendation]
    salary_stats: Dict[str, Any]
    experience_distribution: Dict[str, int]
    recommended_courses: List[str]  # Рекомендуемые курсы на основе анализа
    skill_gaps: List[str]  # Навыки, которых не хватает
    top_skills: Optional[List[Dict[str, Any]]] = None  # Топ навыков из всех категорий
    skill_combinations: Optional[List[Dict[str, Any]]] = None  # Популярные комбинации навыков

