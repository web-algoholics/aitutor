from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from typing import List, Dict, Any
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


# ==================== REQUEST MODELS ====================

class SubmitQuizRequest(BaseModel):
    answers: Dict[int, str]


class SubmitCodeRequest(BaseModel):
    code: str


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


# ==================== CHAT - STRUCTURED LEARNING ====================

@router.post("/modules/{module_id}/chat/start")
async def start_chat_session(
    module_id: int, 
    user_id: int = Query(...),
    db: AsyncSession = Depends(get_session)
):
    """Initialize a chat session and start with theory"""
    try:
        result = await db.execute(select(Module).where(Module.id == module_id))
        module = result.scalar_one_or_none()
        if not module:
            raise HTTPException(status_code=404, detail="Module not found")
        
        # Create new chat session with 'theory' stage
        chat_session = ChatSession(
            user_id=user_id, 
            module_id=module_id,
            stage="theory",
            theory_confirmed=False
        )
        db.add(chat_session)
        await db.commit()
        await db.refresh(chat_session)
        
        # Generate theory explanation
        try:
            objectives = json.loads(module.learning_objectives) if isinstance(module.learning_objectives, str) else module.learning_objectives
            concepts = json.loads(module.key_concepts) if isinstance(module.key_concepts, str) else module.key_concepts
            
            tutor = AIPythonTutor(settings.GIGACHAT_API_KEY)
            theory_text = tutor.generate_theory(module.title, objectives, concepts)
        except Exception as ai_error:
            logger.error(f"Error generating theory from AI: {ai_error}")
            # Fallback for development
            theory_text = f"Тема: {module.title}\n\nЭто важная концепция в программировании. Когда будешь готов изучить эту тему подробнее, нажми на кнопку ниже.\n\nКлючевые понятия:\n" + "\n".join([f"- {concept}" for concept in (json.loads(module.key_concepts) if isinstance(module.key_concepts, str) else module.key_concepts)])
        
        # Save AI theory message
        theory_message = ChatMessage(
            session_id=chat_session.id,
            role="assistant",
            content=theory_text
        )
        db.add(theory_message)
        await db.commit()
        
        return {
            "session_id": chat_session.id,
            "module_id": module.id,
            "stage": "theory",
            "message": theory_text
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/{session_id}/confirm-theory")
async def confirm_theory(session_id: int, db: AsyncSession = Depends(get_session)):
    """User confirms they read the theory, move to quiz stage"""
    try:
        result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        if session.stage != "theory":
            raise HTTPException(status_code=400, detail="Invalid stage for this action")
        
        session.theory_confirmed = True
        session.stage = "quiz"
        
        # Generate quiz
        result = await db.execute(select(Module).where(Module.id == session.module_id))
        module = result.scalar_one_or_none()
        
        try:
            concepts = json.loads(module.key_concepts) if isinstance(module.key_concepts, str) else module.key_concepts
            tutor = AIPythonTutor(settings.GIGACHAT_API_KEY)
            quiz_data = tutor.generate_quiz(module.title, concepts)
        except Exception as ai_error:
            logger.error(f"Error generating quiz from AI: {ai_error}")
            # Fallback quiz for development
            quiz_data = {
                "questions": [
                    {
                        "id": 1,
                        "question": f"Вопрос 1 о {module.title}?",
                        "options": ["Вариант A", "Вариант B", "Вариант C"],
                        "correct_answer": "a"
                    },
                    {
                        "id": 2,
                        "question": f"Вопрос 2 о {module.title}?",
                        "options": ["Вариант A", "Вариант B", "Вариант C"],
                        "correct_answer": "b"
                    },
                    {
                        "id": 3,
                        "question": f"Вопрос 3 о {module.title}?",
                        "options": ["Вариант A", "Вариант B", "Вариант C"],
                        "correct_answer": "c"
                    }
                ]
            }
        
        db.add(session)
        await db.commit()
        
        return {
            "session_id": session_id,
            "stage": "quiz",
            "quiz": quiz_data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error confirming theory: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/{session_id}/submit-quiz")
async def submit_quiz(
    session_id: int,
    request: SubmitQuizRequest,
    db: AsyncSession = Depends(get_session)
):
    """Submit quiz answers and move to coding stage"""
    try:
        result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        if session.stage != "quiz":
            raise HTTPException(status_code=400, detail="Invalid stage for this action")
        
        # Grade quiz (simplified)
        try:
            tutor = AIPythonTutor(settings.GIGACHAT_API_KEY)
            grade = tutor.grade_quiz(session.module_id, request.answers)
        except Exception as ai_error:
            logger.error(f"Error grading quiz from AI: {ai_error}")
            # Fallback grading for development
            grade = {"score": 75, "passed": True, "feedback": "Хорошо! Ты набрал 75%. Теперь переходим к практической задаче."}
        
        session.quiz_score = grade.get("score", 0)
        session.stage = "coding"
        
        # Generate coding task
        result = await db.execute(select(Module).where(Module.id == session.module_id))
        module = result.scalar_one_or_none()
        
        try:
            concepts = json.loads(module.key_concepts) if isinstance(module.key_concepts, str) else module.key_concepts
            tutor = AIPythonTutor(settings.GIGACHAT_API_KEY)
            task = tutor.generate_coding_task(module.title, concepts)
        except Exception as ai_error:
            logger.error(f"Error generating coding task from AI: {ai_error}")
            # Fallback task for development
            task = {
                "title": f"Практическое задание: {module.title}",
                "description": "Напиши функцию или программу, которая демонстрирует понимание этой темы.",
                "code_template": "# Начни писать здесь\n# Напиши функцию solve()\ndef solve():\n    pass",
                "expected_concepts": concepts if concepts else ["основные принципы"],
                "success_criteria": ["Код должен запускаться без ошибок", "Код должен работать правильно", "Код должен быть чистым и понятным"],
                "examples": [
                    {
                        "input": "Пример входных данных",
                        "output": "Ожидаемый результат",
                        "explanation": "Объяснение того, что происходит"
                    }
                ]
            }
        
        db.add(session)
        await db.commit()
        
        return {
            "session_id": session_id,
            "quiz_result": {
                "score": grade.get("score"),
                "passed": grade.get("passed"),
                "feedback": grade.get("feedback")
            },
            "stage": "coding",
            "task": task
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))
        await db.commit()
        
        return {
            "session_id": session_id,
            "quiz_result": {
                "score": grade.get("score"),
                "passed": grade.get("passed"),
                "feedback": grade.get("feedback")
            },
            "stage": "coding",
            "task": task
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/{session_id}/submit-code")
async def submit_coding_task(
    session_id: int,
    code: str = Query(...),
    db: AsyncSession = Depends(get_session)
):
    """Submit code solution and get evaluation"""
    try:
        result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        if session.stage != "coding":
            raise HTTPException(status_code=400, detail="Invalid stage for this action")
        
        # Get module for context
        result = await db.execute(select(Module).where(Module.id == session.module_id))
        module = result.scalar_one_or_none()
        
        try:
            concepts = json.loads(module.key_concepts) if isinstance(module.key_concepts, str) else module.key_concepts
            tutor = AIPythonTutor(settings.GIGACHAT_API_KEY)
            evaluation = tutor.evaluate_code(code, module.title, concepts)
        except Exception as ai_error:
            logger.error(f"Error evaluating code from AI: {ai_error}")
            # Fallback evaluation for development - check if code is not empty
            evaluation = {
                "passed": len(code.strip()) > 10,
                "score": 80 if len(code.strip()) > 10 else 40,
                "feedback": "Код выглядит хорошо!" if len(code.strip()) > 10 else "Напиши больше кода.",
                "strengths": ["Четкая структура", "Хорошее понимание"],
                "improvements": [] if len(code.strip()) > 10 else ["Добавь больше логики"]
            }
        
        if evaluation.get("passed"):
            logger.info(f"Code evaluation passed for session {session_id}, user {session.user_id}, module {session.module_id}")
            
            # Mark module as completed
            session.stage = "completed"
            session.coding_complete = True
            db.add(session)
            
            # Update module progress
            progress_result = await db.execute(
                select(UserModuleProgress).where(
                    (UserModuleProgress.user_id == session.user_id) &
                    (UserModuleProgress.module_id == session.module_id)
                )
            )
            progress = progress_result.scalar_one_or_none()
            
            if progress:
                progress.is_completed = True
                logger.info(f"Updated existing UserModuleProgress {progress.id} to completed")
            else:
                progress = UserModuleProgress(
                    user_id=session.user_id,
                    module_id=session.module_id,
                    is_completed=True
                )
                db.add(progress)
                logger.info(f"Created new UserModuleProgress for user {session.user_id}, module {session.module_id}")
            
            # Commit the progress first
            await db.commit()
            
            # Get course to update enrollment progress
            course_result = await db.execute(
                select(Course).where(Course.id == module.course_id)
            )
            course = course_result.scalar_one_or_none()
            
            if course:
                logger.info(f"Found course {course.id} for module {session.module_id}")
                # Calculate course progress percentage
                modules_result = await db.execute(
                    select(Module).where(Module.course_id == course.id)
                )
                all_modules = modules_result.scalars().all()
                
                if all_modules:
                    logger.info(f"Course {course.id} has {len(all_modules)} total modules")
                    # Count completed modules (now the new one is in the DB)
                    completed_result = await db.execute(
                        select(UserModuleProgress).where(
                            (UserModuleProgress.user_id == session.user_id) &
                            (UserModuleProgress.module_id.in_([m.id for m in all_modules])) &
                            (UserModuleProgress.is_completed == True)
                        )
                    )
                    completed_modules = completed_result.scalars().all()
                    progress_percentage = int(len(completed_modules) / len(all_modules) * 100)
                    logger.info(f"User {session.user_id} has completed {len(completed_modules)} modules out of {len(all_modules)}, new progress: {progress_percentage}%")
                    
                    # Update or create enrollment
                    enrollment_result = await db.execute(
                        select(CourseEnrollment).where(
                            (CourseEnrollment.user_id == session.user_id) &
                            (CourseEnrollment.course_id == course.id)
                        )
                    )
                    enrollment = enrollment_result.scalar_one_or_none()
                    
                    if enrollment:
                        enrollment.progress_percentage = progress_percentage
                        if progress_percentage == 100:
                            enrollment.is_completed = True
                        logger.info(f"Updated CourseEnrollment {enrollment.id} progress to {progress_percentage}%")
                    else:
                        enrollment = CourseEnrollment(
                            user_id=session.user_id,
                            course_id=course.id,
                            progress_percentage=progress_percentage,
                            is_completed=progress_percentage == 100
                        )
                        db.add(enrollment)
                        logger.info(f"Created new CourseEnrollment for user {session.user_id}, course {course.id} with progress {progress_percentage}%")
                    
                    await db.commit()
                    logger.info(f"Successfully committed enrollment changes for session {session_id}")
        
        return {
            "session_id": session_id,
            "evaluation": evaluation,
            "stage": session.stage,
            "completed": session.stage == "completed"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting code: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/{session_id}/hint")
async def get_coding_hint(
    session_id: int,
    current_code: str = Query(default=""),
    db: AsyncSession = Depends(get_session)
):
    """Get a hint for the coding task"""
    try:
        result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        if session.stage != "coding":
            raise HTTPException(status_code=400, detail="Can only get hints during coding stage")
        
        # Get module for context
        result = await db.execute(select(Module).where(Module.id == session.module_id))
        module = result.scalar_one_or_none()
        
        concepts = json.loads(module.key_concepts) if isinstance(module.key_concepts, str) else module.key_concepts
        tutor = AIPythonTutor(settings.GIGACHAT_API_KEY)
        hint = tutor.generate_code_hint(module.title, current_code, concepts)
        
        return {"hint": hint}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting hint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chat/{session_id}/status")
async def get_session_status(session_id: int, db: AsyncSession = Depends(get_session)):
    """Get current session status and stage"""
    try:
        result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "session_id": session.id,
            "module_id": session.module_id,
            "stage": session.stage,
            "theory_confirmed": session.theory_confirmed,
            "quiz_score": session.quiz_score,
            "coding_complete": session.coding_complete,
            "completed": session.stage == "completed"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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
