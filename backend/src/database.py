from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator
from config import settings

# Import all models for table creation
from auth.models import User
from theory.models import TheoryCourse, TheoryModule, TheoryLesson, TheoryContent
from quizzes.models import Quiz, Question, Answer
from anki.models import AnkiDeck, AnkiCard

# Async engine
engine: AsyncEngine = create_async_engine(settings.DATABASE_URL, echo=True)

# Async session maker
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def init_db():
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(SQLModel.metadata.create_all)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
