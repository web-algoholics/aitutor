"""
Роутинг для курсов
"""
from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import List
from database import get_session
from .models import Course

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("/", response_model=List[dict])
async def get_courses(
    session: AsyncSession = Depends(get_session)
):
    """
    Получить список всех активных курсов
    Возвращает список курсов с их slug для генерации ссылок
    """
    result = await session.exec(
        select(Course).where(Course.is_active == True)
    )
    courses = result.all()
    
    return [
        {
            "slug": course.slug,
            "name": course.name,
            "description": course.description
        }
        for course in courses
    ]


@router.get("/slugs", response_model=List[str])
async def get_course_slugs(
    session: AsyncSession = Depends(get_session)
):
    """
    Получить только список slug активных курсов
    Используется для быстрой проверки наличия курса
    """
    result = await session.exec(
        select(Course.slug).where(Course.is_active == True)
    )
    slugs = result.all()
    return list(slugs)


@router.post("/create-test")
async def create_test_course(
    session: AsyncSession = Depends(get_session)
):
    """
    Создать тестовый курс Python для проверки функциональности
    """
    try:
        # Проверить, существует ли уже курс с slug 'python'
        result = await session.exec(
            select(Course).where(Course.slug == "python")
        )
        existing = result.first()
        
        if existing:
            return {
                "message": "Course 'python' already exists",
                "course": {
                    "id": existing.id,
                    "slug": existing.slug,
                    "name": existing.name
                }
            }
        
        # Создать новый курс
        new_course = Course(
            slug="python",
            name="Python",
            description="Python programming course",
            is_active=True
        )
        session.add(new_course)
        await session.commit()
        await session.refresh(new_course)
        
        return {
            "message": "Test course 'python' created successfully",
            "course": {
                "id": new_course.id,
                "slug": new_course.slug,
                "name": new_course.name
            }
        }
    except Exception as e:
        await session.rollback()
        return {
            "error": str(e),
            "message": "Failed to create test course"
        }

