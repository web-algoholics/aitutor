from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from pydantic import BaseModel
import logging
import httpx

from database import get_session
from auth.auth import current_active_user
from auth.models import User
from .schemas import AnalysisRequest, MarketAnalysisResponse, SkillRecommendation
from .analyzer import JobAnalyzer

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("/analyze", response_model=MarketAnalysisResponse)
async def analyze_job_market(
    request: AnalysisRequest,
    session: AsyncSession = Depends(get_session)
):
    """
    Анализ рынка вакансий по запросу
    
    Собирает вакансии с hh.ru, анализирует требования и возвращает:
    - Популярные технологии
    - Статистику зарплат
    - Рекомендации по курсам
    - Пробелы в навыках
    """
    analyzer = JobAnalyzer(session)
    
    try:
        analysis = await analyzer.analyze_market(
            query=request.query,
            area=request.area,
            experience=request.experience,
            limit=request.limit
        )
        
        # Преобразовать в формат ответа
        response = MarketAnalysisResponse(
            query=analysis["query"],
            total_vacancies=analysis["total_vacancies"],
            technologies=[
                SkillRecommendation(**tech) for tech in analysis["technologies"]
            ],
            frameworks=[
                SkillRecommendation(**fw) for fw in analysis["frameworks"]
            ],
            databases=[
                SkillRecommendation(**db) for db in analysis["databases"]
            ],
            tools=[
                SkillRecommendation(**tool) for tool in analysis["tools"]
            ],
            salary_stats=analysis["salary_stats"],
            experience_distribution=analysis["experience_distribution"],
            recommended_courses=analysis["recommended_courses"],
            skill_gaps=analysis["skill_gaps"]
        )
        
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    
    finally:
        await analyzer.close()


@router.get("/trends/{language}")
async def get_market_trends(
    language: str,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(current_active_user)
):
    """
    Получить тренды рынка для конкретного языка программирования
    """
    # TODO: Реализовать получение трендов из БД
    # Можно использовать сохраненные анализы или генерировать новый
    return {
        "language": language,
        "message": "Trends analysis coming soon"
    }


@router.get("/skills/popular")
async def get_popular_skills(
    limit: int = 10,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(current_active_user)
):
    """
    Получить список самых популярных навыков
    """
    # Можно использовать кэшированные данные или сделать быстрый анализ
    analyzer = JobAnalyzer(session)
    
    try:
        # Быстрый анализ по популярным запросам
        analysis = await analyzer.analyze_market(
            query="разработчик",
            limit=50
        )
        
        all_skills = []
        all_skills.extend(analysis["technologies"])
        all_skills.extend(analysis["frameworks"])
        all_skills.extend(analysis["databases"])
        all_skills.extend(analysis["tools"])
        
        # Сортировка и ограничение
        popular = sorted(
            all_skills,
            key=lambda x: x["demand_count"],
            reverse=True
        )[:limit]
        
        return {
            "skills": [SkillRecommendation(**skill) for skill in popular]
        }
    
    finally:
        await analyzer.close()

