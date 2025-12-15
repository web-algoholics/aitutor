import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

from auth.auth import current_active_user as get_current_active_user
from database import get_session as get_db
from .models import AnkiDeck, AnkiCard
from .schemas import (
    CreateDeckFromCourseRequest,
    CreateDeckFromMaterialRequest,
    AnkiDeckResponse,
    AnkiDeckSummaryResponse,
    AnkiCardResponse
)
from .ai_generator import AnkiAIGenerator
from theory.models import TheoryCourse, TheoryLesson, TheoryContent, TheoryModule

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/anki", tags=["anki"])
ai_generator = AnkiAIGenerator()


@router.post("/decks/from-course", response_model=AnkiDeckResponse)
async def create_deck_from_course(
    request: CreateDeckFromCourseRequest,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create an Anki deck from a theory course"""
    try:
        logger.info(f"Creating Anki deck from course {request.course_id} for user {current_user.id}")

        # Get course and verify ownership
        result = await db.execute(
            select(TheoryCourse).where(TheoryCourse.id == request.course_id)
        )
        course = result.scalar_one_or_none()

        if not course or course.creator_id != current_user.id:
            raise HTTPException(status_code=404, detail="Course not found")

        # Get all lessons with content for this course
        result = await db.execute(
            select(TheoryLesson, TheoryContent)
            .join(TheoryModule, TheoryLesson.module_id == TheoryModule.id)
            .outerjoin(TheoryContent, TheoryLesson.id == TheoryContent.lesson_id)
            .where(TheoryModule.course_id == request.course_id)
            .where(TheoryContent.id.isnot(None))  # Only lessons with content
            .order_by(TheoryModule.order, TheoryLesson.order)
        )
        lessons_with_content = result.all()

        if not lessons_with_content:
            raise HTTPException(
                status_code=400,
                detail="Course has no lessons with generated content. Please generate content for lessons first."
            )

        # Prepare lessons content for AI
        lessons_content = []
        for lesson, content in lessons_with_content:
            lessons_content.append({
                "title": lesson.title,
                "content": content.content
            })

        # Generate cards using AI
        deck_data = ai_generator.generate_cards_from_course_content(
            course_title=course.title,
            lessons_content=lessons_content
        )

        # Create deck
        deck = AnkiDeck(
            title=deck_data["title"],
            description=f"Карточки на основе курса: {course.title}",
            source_type="course",
            source_id=request.course_id,
            creator_id=current_user.id
        )
        db.add(deck)
        await db.flush()  # Get deck ID

        # Create cards
        for order, card_data in enumerate(deck_data["cards"], start=1):
            card = AnkiCard(
                deck_id=deck.id,
                front=card_data["front"],
                back=card_data["back"],
                order=order
            )
            db.add(card)

        await db.commit()
        await db.refresh(deck)

        # Load full deck with cards
        result = await db.execute(
            select(AnkiDeck)
            .where(AnkiDeck.id == deck.id)
            .options(selectinload(AnkiDeck.cards))
        )
        deck = result.scalar_one()

        # Build response
        cards_response = [
            AnkiCardResponse(
                id=card.id,
                deck_id=card.deck_id,
                front=card.front,
                back=card.back,
                order=card.order,
                created_at=card.created_at
            )
            for card in sorted(deck.cards, key=lambda x: x.order)
        ]

        return AnkiDeckResponse(
            id=deck.id,
            title=deck.title,
            description=deck.description,
            source_type=deck.source_type,
            source_id=deck.source_id,
            creator_id=deck.creator_id,
            created_at=deck.created_at,
            cards=cards_response,
            cards_count=len(cards_response)
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating Anki deck from course: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create Anki deck: {str(e)}")


@router.post("/decks/from-material", response_model=AnkiDeckResponse)
async def create_deck_from_material(
    request: CreateDeckFromMaterialRequest,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create an Anki deck from uploaded material"""
    try:
        logger.info(f"Creating Anki deck from material for user {current_user.id}")

        if not request.material_content or len(request.material_content.strip()) < 100:
            raise HTTPException(
                status_code=400,
                detail="Material content must be at least 100 characters long"
            )

        # Generate cards using AI
        deck_data = ai_generator.generate_cards_from_material(
            material_content=request.material_content,
            title=request.title
        )

        # Use AI-generated title if provided, otherwise use user's title
        deck_title = deck_data.get("title", request.title)

        # Create deck
        deck = AnkiDeck(
            title=deck_title,
            description=request.description,
            source_type="material",
            source_id=None,  # No specific source for material
            creator_id=current_user.id
        )
        db.add(deck)
        await db.flush()  # Get deck ID

        # Create cards
        for order, card_data in enumerate(deck_data["cards"], start=1):
            card = AnkiCard(
                deck_id=deck.id,
                front=card_data["front"],
                back=card_data["back"],
                order=order
            )
            db.add(card)

        await db.commit()
        await db.refresh(deck)

        # Load full deck with cards
        result = await db.execute(
            select(AnkiDeck)
            .where(AnkiDeck.id == deck.id)
            .options(selectinload(AnkiDeck.cards))
        )
        deck = result.scalar_one()

        # Build response
        cards_response = [
            AnkiCardResponse(
                id=card.id,
                deck_id=card.deck_id,
                front=card.front,
                back=card.back,
                order=card.order,
                created_at=card.created_at
            )
            for card in sorted(deck.cards, key=lambda x: x.order)
        ]

        return AnkiDeckResponse(
            id=deck.id,
            title=deck.title,
            description=deck.description,
            source_type=deck.source_type,
            source_id=deck.source_id,
            creator_id=deck.creator_id,
            created_at=deck.created_at,
            cards=cards_response,
            cards_count=len(cards_response)
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating Anki deck from material: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create Anki deck: {str(e)}")


@router.get("/decks", response_model=List[AnkiDeckSummaryResponse])
async def get_decks(
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all Anki decks for the current user"""
    try:
        result = await db.execute(
            select(AnkiDeck)
            .where(AnkiDeck.creator_id == current_user.id)
            .options(selectinload(AnkiDeck.cards))
            .order_by(AnkiDeck.created_at.desc())
        )
        decks = result.unique().scalars().all()

        return [
            AnkiDeckSummaryResponse(
                id=deck.id,
                title=deck.title,
                description=deck.description,
                source_type=deck.source_type,
                source_id=deck.source_id,
                creator_id=deck.creator_id,
                created_at=deck.created_at,
                cards_count=len(deck.cards)
            )
            for deck in decks
        ]

    except Exception as e:
        logger.error(f"Error getting Anki decks: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get Anki decks: {str(e)}")


@router.get("/decks/{deck_id}", response_model=AnkiDeckResponse)
async def get_deck(
    deck_id: int,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific Anki deck with all cards"""
    try:
        result = await db.execute(
            select(AnkiDeck)
            .where(AnkiDeck.id == deck_id)
            .options(selectinload(AnkiDeck.cards))
        )
        deck = result.scalar_one_or_none()

        if not deck or deck.creator_id != current_user.id:
            raise HTTPException(status_code=404, detail="Deck not found")

        # Build response
        cards_response = [
            AnkiCardResponse(
                id=card.id,
                deck_id=card.deck_id,
                front=card.front,
                back=card.back,
                order=card.order,
                created_at=card.created_at
            )
            for card in sorted(deck.cards, key=lambda x: x.order)
        ]

        return AnkiDeckResponse(
            id=deck.id,
            title=deck.title,
            description=deck.description,
            source_type=deck.source_type,
            source_id=deck.source_id,
            creator_id=deck.creator_id,
            created_at=deck.created_at,
            cards=cards_response,
            cards_count=len(cards_response)
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting Anki deck: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get Anki deck: {str(e)}")


@router.delete("/decks/{deck_id}")
async def delete_deck(
    deck_id: int,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an Anki deck"""
    try:
        result = await db.execute(
            select(AnkiDeck).where(AnkiDeck.id == deck_id)
        )
        deck = result.scalar_one_or_none()

        if not deck or deck.creator_id != current_user.id:
            raise HTTPException(status_code=404, detail="Deck not found")

        # Delete the deck (cards will be deleted via cascade_delete)
        await db.execute(delete(AnkiDeck).where(AnkiDeck.id == deck_id))
        await db.commit()

        return {"message": "Deck deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting Anki deck: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete Anki deck: {str(e)}")

