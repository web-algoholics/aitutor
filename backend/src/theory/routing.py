import logging
from typing import List, Optional
from datetime import date, datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, update
from sqlalchemy.orm import selectinload

from auth.auth import current_active_user as get_current_active_user
from auth.models import User
from database import get_session as get_db
from .models import TheoryCourse, TheoryModule, TheoryLesson, TheoryContent
from .schemas import (
    CreateTheoryCourseRequest, TheoryCourseResponse, TheoryModuleResponse,
    TheoryLessonResponse, TheoryContentResponse, TheoryCourseTreeResponse,
    CourseGenerationStatus, GenerateTheoryContentRequest
)
from .ai_generator import TheoryAIGenerator
from .tasks import (
    generate_course_content, generate_first_module_theory,
    generate_single_lesson_content, generate_module_content_background,
    retry_failed_lesson_generations, generate_all_course_theory,
    generate_first_module_only, create_course_structure_and_generate,
    generate_course_content_background
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/theory", tags=["theory"])
ai_generator = TheoryAIGenerator()


async def update_study_streak(user: User, db: AsyncSession):
    """Update user's study streak when they complete a lesson"""
    today = date.today()
    
    if user.last_study_date is None:
        # First time studying
        user.current_streak = 1
        user.last_study_date = today
    elif user.last_study_date == today:
        # Already studied today, don't increment
        pass
    elif user.last_study_date == today - timedelta(days=1):
        # Consecutive day, increment streak
        user.current_streak += 1
        user.last_study_date = today
    else:
        # Streak broken, reset to 0
        user.current_streak = 0
        user.last_study_date = today
    
    await db.commit()
    logger.info(f"Updated streak for user {user.id}: {user.current_streak} days")

@router.post("/courses", response_model=TheoryCourseTreeResponse)
async def create_theory_course(
    request: CreateTheoryCourseRequest,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new theory course with AI-generated plan and immediate structure"""
    try:
        # Generate course plan using AI
        plan = ai_generator.generate_course_plan(request.topic, request.difficulty)

        # Create course record
        course = TheoryCourse(
            title=plan["title"],
            description=plan["description"],
            topic=request.topic,
            difficulty=request.difficulty,
            estimated_duration=plan["estimated_duration"],
            creator_id=current_user.id
        )
        db.add(course)
        await db.commit()
        await db.refresh(course)

        # Create modules and lessons immediately (not in background)
        modules_data = []
        for module_plan in plan["modules"]:
            module = TheoryModule(
                course_id=course.id,
                title=module_plan["title"],
                description=module_plan["description"],
                order=module_plan["order"],
                learning_objectives=module_plan["learning_objectives"],
                key_concepts=module_plan["key_concepts"]
            )
            db.add(module)
            await db.flush()  # Get module ID

            # Create lessons for this module
            lessons_data = []
            for lesson_plan in module_plan["lessons"]:
                lesson = TheoryLesson(
                    module_id=module.id,
                    title=lesson_plan["title"],
                    description=lesson_plan["description"],
                    order=lesson_plan["order"],
                    estimated_duration=lesson_plan["estimated_duration"],
                    learning_objectives=lesson_plan["learning_objectives"],
                    key_concepts=lesson_plan["key_concepts"]
                )
                db.add(lesson)
                await db.flush()  # Get lesson ID

                lessons_data.append(TheoryLessonResponse(
                    id=lesson.id,
                    module_id=lesson.module_id,
                    title=lesson.title,
                    description=lesson.description,
                    order=lesson.order,
                    estimated_duration=lesson.estimated_duration,
                    learning_objectives=lesson.learning_objectives,
                    key_concepts=lesson.key_concepts,
                    has_content=False,  # No content yet
                    is_completed=False,
                    created_at=lesson.created_at
                ))

            await db.commit()  # Commit lessons for this module

            modules_data.append(TheoryModuleResponse(
                id=module.id,
                course_id=module.course_id,
                title=module.title,
                description=module.description,
                order=module.order,
                learning_objectives=module.learning_objectives,
                key_concepts=module.key_concepts,
                lessons_count=len(lessons_data),
                is_completed=False,
                created_at=module.created_at
            ))

        await db.commit()  # Final commit

        # Start background content generation (only content, structure is already created)
        background_tasks.add_task(generate_course_content_background, course.id)

        # Return complete course tree immediately
        return TheoryCourseTreeResponse(
            course=TheoryCourseResponse(
                id=course.id,
                title=course.title,
                description=course.description,
                topic=course.topic,
                difficulty=course.difficulty,
                estimated_duration=course.estimated_duration,
                creator_id=course.creator_id,
                modules_count=len(modules_data),
                is_completed=False,
                created_at=course.created_at
            ),
            modules=modules_data,
            lessons=[lessons_data for module in plan["modules"]]  # Group lessons by module
        )

    except Exception as e:
        logger.error(f"Error creating theory course: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create course: {str(e)}")


@router.get("/courses", response_model=List[TheoryCourseResponse])
async def get_user_theory_courses(
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all theory courses for the current user"""
    result = await db.execute(
        select(TheoryCourse)
        .where(TheoryCourse.creator_id == current_user.id)
        .options(selectinload(TheoryCourse.modules))
    )
    courses = result.scalars().all()

    response = []
    for course in courses:
        response.append(TheoryCourseResponse(
            id=course.id,
            title=course.title,
            description=course.description,
            topic=course.topic,
            difficulty=course.difficulty,
            estimated_duration=course.estimated_duration,
            creator_id=course.creator_id,
            modules_count=len(course.modules),
            is_completed=course.is_completed,
            created_at=course.created_at
        ))

    return response


@router.get("/courses/{course_id}", response_model=TheoryCourseTreeResponse)
async def get_theory_course_tree(
    course_id: int,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get complete course tree with modules and lessons"""
    # Get course
    result = await db.execute(
        select(TheoryCourse)
        .where(and_(TheoryCourse.id == course_id, TheoryCourse.creator_id == current_user.id))
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Get modules with lessons
    result = await db.execute(
        select(TheoryModule)
        .where(TheoryModule.course_id == course_id)
        .options(selectinload(TheoryModule.lessons))
        .order_by(TheoryModule.order)
    )
    modules = result.scalars().all()

    # Build response
    course_response = TheoryCourseResponse(
        id=course.id,
        title=course.title,
        description=course.description,
        topic=course.topic,
        difficulty=course.difficulty,
        estimated_duration=course.estimated_duration,
        creator_id=course.creator_id,
        modules_count=len(modules),
        is_completed=course.is_completed,
        created_at=course.created_at
    )

    modules_response = []
    lessons_response = []

    for module in modules:
        module_resp = TheoryModuleResponse(
            id=module.id,
            course_id=module.course_id,
            title=module.title,
            description=module.description,
            order=module.order,
            learning_objectives=module.learning_objectives,
            key_concepts=module.key_concepts,
            lessons_count=len(module.lessons),
            is_completed=module.is_completed,
            created_at=module.created_at
        )
        modules_response.append(module_resp)

        # Lessons for this module
        module_lessons = []
        for lesson in sorted(module.lessons, key=lambda x: x.order):
            # Check if lesson has content
            result = await db.execute(
                select(TheoryContent).where(TheoryContent.lesson_id == lesson.id)
            )
            has_content = result.first() is not None

            lesson_resp = TheoryLessonResponse(
                id=lesson.id,
                module_id=lesson.module_id,
                title=lesson.title,
                description=lesson.description,
                order=lesson.order,
                estimated_duration=lesson.estimated_duration,
                learning_objectives=lesson.learning_objectives,
                key_concepts=lesson.key_concepts,
                has_content=has_content,
                is_completed=lesson.is_completed,
                created_at=lesson.created_at
            )
            module_lessons.append(lesson_resp)

        lessons_response.append(module_lessons)

    return TheoryCourseTreeResponse(
        course=course_response,
        modules=modules_response,
        lessons=lessons_response
    )


@router.get("/courses/{course_id}/modules/{module_id}", response_model=TheoryModuleResponse)
async def get_theory_module(
    course_id: int,
    module_id: int,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get specific module details"""
    result = await db.execute(
        select(TheoryModule)
        .where(and_(
            TheoryModule.id == module_id,
            TheoryModule.course_id == course_id
        ))
        .options(selectinload(TheoryModule.course))
    )
    module = result.scalar_one_or_none()

    if not module or module.course.creator_id != current_user.id:
        raise HTTPException(status_code=404, detail="Module not found")

    # Count lessons
    result = await db.execute(
        select(TheoryLesson).where(TheoryLesson.module_id == module_id)
    )
    lessons = result.scalars().all()

    return TheoryModuleResponse(
        id=module.id,
        course_id=module.course_id,
        title=module.title,
        description=module.description,
        order=module.order,
        learning_objectives=module.learning_objectives,
        key_concepts=module.key_concepts,
        lessons_count=len(lessons),
        is_completed=module.is_completed,
        created_at=module.created_at
    )


@router.post("/lessons/{lesson_id}/generate-content")
async def generate_lesson_content(
    lesson_id: int,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate theory content for a specific lesson"""
    # Get lesson with module and course info
    result = await db.execute(
        select(TheoryLesson)
        .where(TheoryLesson.id == lesson_id)
        .options(selectinload(TheoryLesson.module).selectinload(TheoryModule.course))
    )
    lesson = result.scalar_one_or_none()

    if not lesson or lesson.module.course.creator_id != current_user.id:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Check if content already exists
    result = await db.execute(
        select(TheoryContent).where(TheoryContent.lesson_id == lesson_id)
    )
    existing_content = result.first()

    if existing_content:
        return {"message": "Content already exists", "content_id": existing_content.id}

    # Generate content in background
    background_tasks.add_task(generate_single_lesson_content, lesson_id)

    return {"message": "Content generation started", "lesson_id": lesson_id}


@router.get("/lessons/{lesson_id}/content", response_model=TheoryContentResponse)
async def get_lesson_content(
    lesson_id: int,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get theory content for a lesson"""
    # Get lesson to verify ownership
    result = await db.execute(
        select(TheoryLesson)
        .where(TheoryLesson.id == lesson_id)
        .options(selectinload(TheoryLesson.module).selectinload(TheoryModule.course))
    )
    lesson = result.scalar_one_or_none()

    if not lesson or lesson.module.course.creator_id != current_user.id:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Get content
    result = await db.execute(
        select(TheoryContent).where(TheoryContent.lesson_id == lesson_id)
    )
    content = result.scalar_one_or_none()

    if not content:
        raise HTTPException(status_code=404, detail="Content not yet generated")

    return TheoryContentResponse(
        id=content.id,
        lesson_id=content.lesson_id,
        course_id=lesson.module.course_id,
        content=content.content,
        reading_time=content.reading_time,
        is_generated=content.is_generated,
        lesson_is_completed=lesson.is_completed,
        generated_at=content.generated_at,
        created_at=content.created_at
    )


@router.post("/courses/{course_id}/generate-next-module")
async def generate_next_module(
    course_id: int,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate content for the next module when user completes current one"""
    # Get course
    result = await db.execute(
        select(TheoryCourse)
        .where(and_(TheoryCourse.id == course_id, TheoryCourse.creator_id == current_user.id))
    )
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Find next module without generated content
    result = await db.execute(
        select(TheoryModule)
        .where(TheoryModule.course_id == course_id)
        .options(selectinload(TheoryModule.lessons))
        .order_by(TheoryModule.order)
    )
    modules = result.scalars().all()

    next_module = None
    for module in modules:
        # Check if all lessons in this module have content
        has_all_content = True
        for lesson in module.lessons:
            result = await db.execute(
                select(TheoryContent).where(TheoryContent.lesson_id == lesson.id)
            )
            if not result.scalar_one_or_none():
                has_all_content = False
                break

        if not has_all_content:
            next_module = module
            break

    if not next_module:
        return {"message": "All modules already have content generated"}

    # Generate content for next module
    background_tasks.add_task(generate_module_content_background, next_module.id)

    return {"message": f"Started generating content for module: {next_module.title}"}


@router.post("/modules/{module_id}/retry-generation", response_model=dict)
async def retry_module_lesson_generation(
    module_id: int,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Retry generating content for failed lessons in a module"""
    # Verify ownership
    result = await db.execute(
        select(TheoryModule)
        .where(TheoryModule.id == module_id)
        .options(selectinload(TheoryModule.course))
    )
    module = result.scalar_one_or_none()

    if not module or module.course.creator_id != current_user.id:
        raise HTTPException(status_code=404, detail="Module not found")

    background_tasks.add_task(retry_failed_lesson_generations, module_id)

    return {"message": "Retry generation started for failed lessons"}


@router.get("/streak")
async def get_study_streak(
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's study streak"""
    # Refresh user to get latest streak data
    await db.refresh(current_user)
    
    return {
        "current_streak": current_user.current_streak,
        "last_study_date": current_user.last_study_date.isoformat() if current_user.last_study_date else None
    }


@router.post("/lessons/{lesson_id}/mark-completed")
async def mark_lesson_completed(
    lesson_id: int,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark a lesson as completed"""

    # Get lesson with module and course info
    result = await db.execute(
        select(TheoryLesson)
        .where(TheoryLesson.id == lesson_id)
        .options(selectinload(TheoryLesson.module).selectinload(TheoryModule.course))
    )
    lesson = result.scalar_one_or_none()

    if not lesson or lesson.module.course.creator_id != current_user.id:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Mark lesson as completed
    lesson.is_completed = True
    await db.commit()

    # Check if all lessons in module are completed
    result = await db.execute(
        select(TheoryLesson).where(TheoryLesson.module_id == lesson.module_id)
    )
    module_lessons = result.scalars().all()

    if all(lesson.is_completed for lesson in module_lessons):
        # Mark module as completed if all lessons are completed
        lesson.module.is_completed = True
        await db.commit()

        # Check if all modules in course are completed
        result = await db.execute(
            select(TheoryModule).where(TheoryModule.course_id == lesson.module.course_id)
        )
        course_modules = result.scalars().all()

        if all(module.is_completed for module in course_modules):
            # Mark course as completed if all modules are completed
            lesson.module.course.is_completed = True
            await db.commit()

    return {"message": "Lesson marked as completed", "is_completed": True}
