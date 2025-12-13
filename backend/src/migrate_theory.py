#!/usr/bin/env python3
"""
Migration script for theory module tables
"""
import asyncio
from database import engine
from sqlalchemy import text


async def migrate_theory():
    """Create theory tables and run migrations"""
    print("Running theory module migrations...")

    # Create tables
    from database import init_db
    await init_db()

    # Run migration to drop code_examples column if it exists
    async with engine.begin() as conn:
        try:
            # Check if column exists and drop it
            result = await conn.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'theory_contents'
                AND column_name = 'code_examples'
                AND table_schema = 'public'
            """))

            if result.fetchone():
                print("Dropping code_examples column from theory_contents table...")
                await conn.execute(text("ALTER TABLE theory_contents DROP COLUMN IF EXISTS code_examples"))
                print("✅ code_examples column dropped successfully!")
            else:
                print("✅ code_examples column already dropped or doesn't exist")

        except Exception as e:
            print(f"⚠️  Migration warning: {e}")

    print("Theory tables migration completed!")


if __name__ == "__main__":
    asyncio.run(migrate_theory())
