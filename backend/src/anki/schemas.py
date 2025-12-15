from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


# Request schemas
class CreateDeckFromCourseRequest(BaseModel):
    """Request to create an Anki deck from a theory course"""
    course_id: int  # ID of the theory course


class CreateDeckFromMaterialRequest(BaseModel):
    """Request to create an Anki deck from uploaded material"""
    title: str  # Deck title
    description: Optional[str] = None  # Optional description
    material_content: str  # The material content (e.g., lecture notes, article, book excerpt)


# Response schemas
class AnkiCardResponse(BaseModel):
    """Response containing Anki card information"""
    id: int
    deck_id: int
    front: str
    back: str
    order: int
    created_at: datetime

    class Config:
        from_attributes = True


class AnkiDeckResponse(BaseModel):
    """Response containing Anki deck with all cards"""
    id: int
    title: str
    description: Optional[str]
    source_type: str
    source_id: Optional[int]
    creator_id: int
    created_at: datetime
    cards: List[AnkiCardResponse]
    cards_count: int

    class Config:
        from_attributes = True


class AnkiDeckSummaryResponse(BaseModel):
    """Response containing Anki deck summary (without cards)"""
    id: int
    title: str
    description: Optional[str]
    source_type: str
    source_id: Optional[int]
    creator_id: int
    created_at: datetime
    cards_count: int

    class Config:
        from_attributes = True

