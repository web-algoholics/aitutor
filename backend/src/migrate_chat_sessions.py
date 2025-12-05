#!/usr/bin/env python3
"""
Migration script to add new columns to chat_sessions table
"""
import asyncio
from sqlalchemy import text
from database import engine

async def migrate():
    """Add missing columns to chat_sessions table"""
    async with engine.begin() as conn:
        # Add stage column
        await conn.execute(text("""
            ALTER TABLE chat_sessions 
            ADD COLUMN IF NOT EXISTS stage VARCHAR DEFAULT 'theory'
        """))
        print("✓ Added 'stage' column")
        
        # Add theory_confirmed column
        await conn.execute(text("""
            ALTER TABLE chat_sessions 
            ADD COLUMN IF NOT EXISTS theory_confirmed BOOLEAN DEFAULT FALSE
        """))
        print("✓ Added 'theory_confirmed' column")
        
        # Add quiz_score column
        await conn.execute(text("""
            ALTER TABLE chat_sessions 
            ADD COLUMN IF NOT EXISTS quiz_score INTEGER DEFAULT NULL
        """))
        print("✓ Added 'quiz_score' column")
        
        # Add coding_complete column
        await conn.execute(text("""
            ALTER TABLE chat_sessions 
            ADD COLUMN IF NOT EXISTS coding_complete BOOLEAN DEFAULT FALSE
        """))
        print("✓ Added 'coding_complete' column")
        
        print("\n✅ Migration completed successfully!")

if __name__ == "__main__":
    asyncio.run(migrate())
