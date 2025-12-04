from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from typing import List
from database import get_session
from courses.models import (
    Course, Module, Lesson, ChatSession, ChatMessage, 
    CodeSubmission, UserModuleProgress, CourseEnrollment
)
from courses.schemas import (
    CourseResponse, CourseDetailResponse, ModuleResponse, 
    ModuleDetailResponse, ChatSessionResponse, CodeEvaluationResponse, 
    CodeSubmissionResponse, UserModuleProgressResponse,
    CourseEnrollmentResponse, ChatMessageSchema
)
from courses.ai_tutor import AIPythonTutor
from config import settings
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/courses", tags=["courses"])


# ==================== COURSES ====================

@router.get("/", response_model=List[CourseResponse])
async def get_courses(db: AsyncSession = Depends(get_session)):
    """Get all available courses"""
    result = await db.execute(select(Course))
    courses = result.scalars().all()
    return courses


# ==================== SPECIFIC ROUTES (MUST BE BEFORE DYNAMIC PARAMETER ROUTES) ====================

# MODULES - specific routes first
@router.get("/modules/{module_id}")
async def get_module_detail(module_id: int, db: AsyncSession = Depends(get_session)):
    """Get module with all lessons"""
    result = await db.execute(select(Module).where(Module.id == module_id))
    module = result.scalar_one_or_none()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module


@router.post("/modules/{module_id}/chat/start")
async def start_chat_session(
    module_id: int, 
    user_id: int = Query(...),
    db: AsyncSession = Depends(get_session)
):
    """Initialize a chat session for module learning"""
    result = await db.execute(select(Module).where(Module.id == module_id))
    module = result.scalar_one_or_none()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Create new chat session
    chat_session = ChatSession(user_id=user_id, module_id=module_id)
    db.add(chat_session)
    await db.commit()
    await db.refresh(chat_session)
    
    return {
        "session_id": chat_session.id,
        "module_id": module.id,
        "messages": []
    }


# LESSONS - specific routes
@router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: int, db: AsyncSession = Depends(get_session)):
    """Get lesson details"""
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    return {
        "id": lesson.id,
        "module_id": lesson.module_id,
        "order": lesson.order,
        "title": lesson.title,
        "content": lesson.content,
        "code_template": lesson.code_template,
        "expected_concepts": json.loads(lesson.expected_concepts) if isinstance(lesson.expected_concepts, str) else lesson.expected_concepts
    }


# ==================== CHAT ====================

@router.post("/chat/{session_id}/message")
async def send_chat_message(
    session_id: int, 
    question: str = Query(...),
    db: AsyncSession = Depends(get_session)
):
    """Send message in chat with AI tutor"""
    result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    result = await db.execute(select(Module).where(Module.id == session.module_id))
    module = result.scalar_one_or_none()
    
    # Save user message
    user_msg = ChatMessage(session_id=session_id, role="user", content=question)
    db.add(user_msg)
    await db.commit()
    
    try:
        if not settings.GIGACHAT_API_KEY:
            raise HTTPException(status_code=500, detail="GigaChat API key not configured")
        
        tutor = AIPythonTutor(gigachat_api_key=settings.GIGACHAT_API_KEY)
        chain = tutor.create_module_chat_chain(
            module_title=module.title,
            objectives=json.loads(module.learning_objectives) if isinstance(module.learning_objectives, str) else module.learning_objectives,
            key_concepts=json.loads(module.key_concepts) if isinstance(module.key_concepts, str) else module.key_concepts
        )
        
        # Get AI response
        ai_response = chain.invoke({"question": question})
        response_text = ai_response.content if hasattr(ai_response, 'content') else str(ai_response)
        
        # Save AI message
        ai_msg = ChatMessage(session_id=session_id, role="assistant", content=response_text)
        db.add(ai_msg)
        await db.commit()
        
        return {
            "user_message": question,
            "ai_response": response_text
        }
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        return {
            "user_message": question,
            "ai_response": f"Ошибка при обработке вопроса: {str(e)}"
        }


@router.get("/chat/{session_id}/history")
async def get_chat_history(session_id: int, db: AsyncSession = Depends(get_session)):
    """Get chat history for a session"""
    result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    result = await db.execute(
        select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at)
    )
    messages = result.scalars().all()
    
    return {
        "session_id": session_id,
        "messages": [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at.isoformat() if msg.created_at else None
            }
            for msg in messages
        ]
    }


# ==================== CODE SUBMISSION ====================

@router.post("/lessons/{lesson_id}/submit-code", response_model=CodeEvaluationResponse)
async def submit_code(
    lesson_id: int, 
    user_id: int = Query(...),
    code: str = Query(...),
    db: AsyncSession = Depends(get_session)
):
    """Submit code for evaluation"""
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    result = await db.execute(select(Module).where(Module.id == lesson.module_id))
    module = result.scalar_one_or_none()
    
    # Save submission
    submission = CodeSubmission(
        user_id=user_id,
        lesson_id=lesson_id,
        code=code
    )
    db.add(submission)
    await db.commit()
    
    # Evaluate code
    try:
        if not settings.GIGACHAT_API_KEY:
            submission.score = 0
            submission.feedback = "API key not configured"
            submission.is_correct = False
        else:
            tutor = AIPythonTutor(gigachat_api_key=settings.GIGACHAT_API_KEY)
            expected_concepts = json.loads(lesson.expected_concepts) if isinstance(lesson.expected_concepts, str) else lesson.expected_concepts
            evaluation = tutor.evaluate_code(code, lesson.title, expected_concepts)
            
            submission.score = evaluation.get("score", 0)
            submission.feedback = evaluation.get("feedback", "")
            submission.is_correct = evaluation.get("passed", False)
    except Exception as e:
        logger.error(f"Error evaluating code: {e}")
        submission.score = 0
        submission.feedback = f"Ошибка при проверке: {str(e)}"
        submission.is_correct = False
    
    await db.commit()
    await db.refresh(submission)
    
    return {
        "id": submission.id,
        "score": submission.score,
        "is_correct": submission.is_correct,
        "feedback": submission.feedback
    }


@router.post("/lessons/{lesson_id}/hint")
async def get_code_hint(
    lesson_id: int, 
    current_code: str = Query(...),
    db: AsyncSession = Depends(get_session)
):
    """Get a hint for the code challenge"""
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    try:
        if not settings.GIGACHAT_API_KEY:
            raise HTTPException(status_code=500, detail="GigaChat API key not configured")
        
        tutor = AIPythonTutor(gigachat_api_key=settings.GIGACHAT_API_KEY)
        expected_concepts = json.loads(lesson.expected_concepts) if isinstance(lesson.expected_concepts, str) else lesson.expected_concepts
        hint = tutor.generate_code_hint(lesson.title, current_code, expected_concepts)
        
        return {"hint": hint}
    except Exception as e:
        logger.error(f"Error generating hint: {e}")
        return {"hint": "Попробуй подумать о том, какую концепцию ты должен использовать в этой задаче."}


# ==================== PROGRESS ====================

@router.get("/user/{user_id}/progress")
async def get_user_progress(user_id: int, db: AsyncSession = Depends(get_session)):
    """Get user's progress across all courses"""
    result = await db.execute(
        select(CourseEnrollment).where(CourseEnrollment.user_id == user_id)
    )
    enrollments = result.scalars().all()
    
    return {
        "enrollments": [
            {
                "id": e.id,
                "course_id": e.course_id,
                "is_completed": e.is_completed,
                "progress_percentage": e.progress_percentage,
                "enrolled_at": e.enrolled_at.isoformat() if e.enrolled_at else None
            }
            for e in enrollments
        ]
    }


@router.post("/user/{user_id}/module/{module_id}/complete")
async def mark_module_complete(
    user_id: int, 
    module_id: int, 
    db: AsyncSession = Depends(get_session)
):
    """Mark module as complete for user"""
    result = await db.execute(
        select(UserModuleProgress).where(
            and_(
                UserModuleProgress.user_id == user_id,
                UserModuleProgress.module_id == module_id
            )
        )
    )
    progress = result.scalar_one_or_none()
    
    if not progress:
        progress = UserModuleProgress(user_id=user_id, module_id=module_id, is_completed=True)
        db.add(progress)
    else:
        progress.is_completed = True
    
    await db.commit()
    await db.refresh(progress)
    
    return {
        "user_id": user_id,
        "module_id": module_id,
        "is_completed": progress.is_completed
    }


# ==================== DYNAMIC PARAMETER ROUTES (MUST BE AFTER SPECIFIC ROUTES) ====================

@router.get("/{course_id}/modules", response_model=List[ModuleResponse])
async def get_course_roadmap(course_id: int, db: AsyncSession = Depends(get_session)):
    """Get course roadmap (all modules in order)"""
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    result = await db.execute(
        select(Module).where(Module.course_id == course_id).order_by(Module.order)
    )
    modules = result.scalars().all()
    return modules


@router.get("/{course_id}")
async def get_course(course_id: int, db: AsyncSession = Depends(get_session)):
    """Get course with all modules"""
    try:
        result = await db.execute(
            select(Course)
            .where(Course.id == course_id)
            .options(selectinload(Course.modules))
        )
        course = result.scalar_one_or_none()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        return course
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting course {course_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
