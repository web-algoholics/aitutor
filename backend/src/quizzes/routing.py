import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from auth.auth import current_active_user as get_current_active_user
from database import get_session as get_db
from .models import Quiz, Question, Answer
from .schemas import (
    CreateQuizRequest, QuizResponse, QuizSummaryResponse,
    SubmitQuizRequest, QuizResultResponse, QuestionResponse, AnswerResponse
)
from .ai_generator import QuizAIGenerator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/quizzes", tags=["quizzes"])
ai_generator = QuizAIGenerator()


@router.post("", response_model=QuizResponse)
async def create_quiz(
    request: CreateQuizRequest,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a quiz from theory content using AI"""
    try:
        logger.info(f"Creating quiz for user {current_user.id}")

        # Generate quiz questions and title using AI
        quiz_data = ai_generator.generate_quiz_questions(
            theory_content=request.theory_content
        )

        # Create quiz with AI-generated title
        quiz = Quiz(
            title=quiz_data["title"],
            description=None,
            theory_content=request.theory_content,
            creator_id=current_user.id
        )
        db.add(quiz)
        await db.flush()  # Get quiz ID

        # Create questions and answers
        for order, question_data in enumerate(quiz_data["questions"], start=1):
            question = Question(
                quiz_id=quiz.id,
                question_text=question_data["question_text"],
                question_type=question_data["question_type"],
                order=order,
                explanation=question_data.get("explanation")
            )
            db.add(question)
            await db.flush()  # Get question ID

            # Create answers
            for ans_order, answer_data in enumerate(question_data["answers"], start=1):
                answer = Answer(
                    question_id=question.id,
                    answer_text=answer_data["answer_text"],
                    is_correct=answer_data["is_correct"],
                    order=ans_order
                )
                db.add(answer)

        await db.commit()
        await db.refresh(quiz)

        # Load full quiz with questions and answers
        result = await db.execute(
            select(Quiz)
            .where(Quiz.id == quiz.id)
            .options(
                selectinload(Quiz.questions).selectinload(Question.answers)
            )
        )
        quiz = result.scalar_one()

        # Build response
        questions_response = []
        for question in sorted(quiz.questions, key=lambda x: x.order):
            answers_response = [
                AnswerResponse(
                    id=answer.id,
                    question_id=answer.question_id,
                    answer_text=answer.answer_text,
                    is_correct=answer.is_correct,
                    order=answer.order,
                    created_at=answer.created_at
                )
                for answer in sorted(question.answers, key=lambda x: x.order)
            ]
            questions_response.append(
                QuestionResponse(
                    id=question.id,
                    quiz_id=question.quiz_id,
                    question_text=question.question_text,
                    question_type=question.question_type,
                    order=question.order,
                    explanation=question.explanation,
                    created_at=question.created_at,
                    answers=answers_response
                )
            )

        return QuizResponse(
            id=quiz.id,
            title=quiz.title,
            description=quiz.description,
            theory_content=quiz.theory_content,
            creator_id=quiz.creator_id,
            is_completed=quiz.is_completed,
            created_at=quiz.created_at,
            questions=questions_response
        )

    except Exception as e:
        logger.error(f"Error creating quiz: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create quiz: {str(e)}")


@router.get("", response_model=List[QuizSummaryResponse])
async def get_quizzes(
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all quizzes for the current user"""
    result = await db.execute(
        select(Quiz)
        .where(Quiz.creator_id == current_user.id)
        .options(selectinload(Quiz.questions))
        .order_by(Quiz.created_at.desc())
    )
    quizzes = result.scalars().all()

    return [
        QuizSummaryResponse(
            id=quiz.id,
            title=quiz.title,
            description=quiz.description,
            creator_id=quiz.creator_id,
            is_completed=quiz.is_completed,
            created_at=quiz.created_at,
            questions_count=len(quiz.questions)
        )
        for quiz in quizzes
    ]


@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_quiz(
    quiz_id: int,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    include_answers: bool = Query(False, description="Include correct answers and explanations")  # Hide by default for quiz taking
):
    """Get a specific quiz"""
    result = await db.execute(
        select(Quiz)
        .where(Quiz.id == quiz_id, Quiz.creator_id == current_user.id)
        .options(
            selectinload(Quiz.questions).selectinload(Question.answers)
        )
    )
    quiz = result.scalar_one_or_none()

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Build response
    questions_response = []
    for question in sorted(quiz.questions, key=lambda x: x.order):
        answers_response = []
        for answer in sorted(question.answers, key=lambda x: x.order):
            # Hide is_correct if include_answers is False (for taking the quiz)
            answer_data = AnswerResponse(
                id=answer.id,
                question_id=answer.question_id,
                answer_text=answer.answer_text,
                is_correct=answer.is_correct if include_answers else False,  # Always hide for quiz taking
                order=answer.order,
                created_at=answer.created_at
            )
            answers_response.append(answer_data)

        question_data = QuestionResponse(
            id=question.id,
            quiz_id=question.quiz_id,
            question_text=question.question_text,
            question_type=question.question_type,
            order=question.order,
            explanation=question.explanation if include_answers else None,  # Hide explanation when taking quiz
            created_at=question.created_at,
            answers=answers_response
        )
        questions_response.append(question_data)

    return QuizResponse(
        id=quiz.id,
        title=quiz.title,
        description=quiz.description,
        theory_content=quiz.theory_content,
        creator_id=quiz.creator_id,
        is_completed=quiz.is_completed,
        created_at=quiz.created_at,
        questions=questions_response
    )


@router.post("/{quiz_id}/submit", response_model=QuizResultResponse)
async def submit_quiz(
    quiz_id: int,
    request: SubmitQuizRequest,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit quiz answers and get results"""
    if request.quiz_id != quiz_id:
        raise HTTPException(status_code=400, detail="Quiz ID mismatch")

    # Get quiz
    result = await db.execute(
        select(Quiz)
        .where(Quiz.id == quiz_id, Quiz.creator_id == current_user.id)
        .options(
            selectinload(Quiz.questions).selectinload(Question.answers)
        )
    )
    quiz = result.scalar_one_or_none()

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Create a map of question_id -> correct answer IDs
    correct_answers_map = {}
    for question in quiz.questions:
        correct_ids = [ans.id for ans in question.answers if ans.is_correct]
        correct_answers_map[question.id] = correct_ids

    # Create a map of submitted answers
    submitted_answers_map = {}
    for answer_submission in request.answers:
        submitted_answers_map[answer_submission.question_id] = answer_submission.answer_ids

    # Evaluate answers
    total_questions = len(quiz.questions)
    correct_count = 0
    answers_results = []

    for question in sorted(quiz.questions, key=lambda x: x.order):
        question_id = question.id
        correct_answer_ids = correct_answers_map.get(question_id, [])
        submitted_answer_ids = submitted_answers_map.get(question_id, [])

        # Check if answers match (order doesn't matter, but all correct answers must be selected)
        is_correct = (
            len(submitted_answer_ids) == len(correct_answer_ids) and
            set(submitted_answer_ids) == set(correct_answer_ids)
        )

        if is_correct:
            correct_count += 1

        answers_results.append({
            "question_id": question_id,
            "is_correct": is_correct,
            "selected_answer_ids": submitted_answer_ids,
            "correct_answer_ids": correct_answer_ids
        })

    # Calculate score
    score_percentage = (correct_count / total_questions * 100) if total_questions > 0 else 0
    is_passed = score_percentage >= 50  # Pass if score >= 50%

    # Mark quiz as completed
    quiz.is_completed = True
    await db.commit()

    return QuizResultResponse(
        quiz_id=quiz_id,
        total_questions=total_questions,
        correct_answers=correct_count,
        score_percentage=round(score_percentage, 2),
        is_passed=is_passed,
        answers=answers_results
    )

