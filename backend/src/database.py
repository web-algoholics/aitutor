from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator
from config import settings

# Import all models to ensure they are registered
from auth.models import User  # noqa: F401
from jobs.models import JobVacancy, JobAnalysis, MarketTrend  # noqa: F401

# Import Course model if available
try:
    from courses.models import Course  # noqa: F401
except ImportError:
    pass  # Course model not available, skip

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
        
        # Check and recreate courses table if it doesn't have the right structure
        try:
            from courses.models import Course
            from sqlalchemy import text
            
            # Check if table exists and has slug column
            result = await conn.execute(
                text("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.columns 
                        WHERE table_schema = 'public' 
                        AND table_name = 'courses' 
                        AND column_name = 'slug'
                    );
                """)
            )
            has_slug = result.scalar()
            
            if not has_slug:
                # Check if table exists at all
                result = await conn.execute(
                    text("""
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_schema = 'public' 
                            AND table_name = 'courses'
                        );
                    """)
                )
                table_exists = result.scalar()
                
                if table_exists:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.info("Recreating courses table with correct structure...")
                    await conn.execute(text("DROP TABLE IF EXISTS courses CASCADE"))
                    # Recreate the table
                    await conn.run_sync(Course.__table__.create)
        except Exception as e:
            # If there's an error, just log it and continue
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Could not update courses table: {e}. Run migrate_courses_table.py manually.")

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
