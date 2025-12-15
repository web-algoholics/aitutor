from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship


class AnkiDeck(SQLModel, table=True):
    """Anki deck model for flashcards collections"""
    __tablename__ = "anki_decks"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str  # Deck title
    description: Optional[str] = None  # Optional description
    source_type: str  # "course" or "material" - where the deck came from
    source_id: Optional[int] = None  # ID of the course or material (if applicable)
    creator_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    cards: List["AnkiCard"] = Relationship(back_populates="deck", cascade_delete=True)


class AnkiCard(SQLModel, table=True):
    """Anki flashcard model"""
    __tablename__ = "anki_cards"

    id: Optional[int] = Field(default=None, primary_key=True)
    deck_id: int = Field(foreign_key="anki_decks.id")
    front: str  # Front side of the card (question/prompt)
    back: str  # Back side of the card (answer/explanation)
    order: int  # Order of card in deck
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    deck: Optional[AnkiDeck] = Relationship(back_populates="cards")

