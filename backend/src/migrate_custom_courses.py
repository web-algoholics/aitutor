import asyncio
from sqlalchemy import text
from database import engine
from custom_courses.models import CustomCourse, CustomModule, CustomLesson, CustomQuiz, CustomQuizAttempt, CustomCodingTask, CustomCodingSubmission


async def migrate_custom_courses():
    """Migrate custom_courses tables to add new columns"""

    async with engine.begin() as conn:
        try:
            # Check if difficulty column exists
            result = await conn.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'custom_courses'
                AND column_name = 'difficulty'
            """))

            if not result.fetchone():
                print("Adding difficulty column to custom_courses table...")
                await conn.execute(text("""
                    ALTER TABLE custom_courses
                    ADD COLUMN difficulty VARCHAR DEFAULT 'intermediate'
                """))
                print("✓ Added difficulty column")

            # Check if sources column exists
            result = await conn.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'custom_courses'
                AND column_name = 'sources'
            """))

            if not result.fetchone():
                print("Adding sources column to custom_courses table...")
                await conn.execute(text("""
                    ALTER TABLE custom_courses
                    ADD COLUMN sources JSON
                """))
                print("✓ Added sources column")

            # Check if custom_structure column exists
            result = await conn.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'custom_courses'
                AND column_name = 'custom_structure'
            """))

            if not result.fetchone():
                print("Adding custom_structure column to custom_courses table...")
                await conn.execute(text("""
                    ALTER TABLE custom_courses
                    ADD COLUMN custom_structure JSON
                """))
                print("✓ Added custom_structure column")

            print("Migration completed successfully!")

        except Exception as e:
            print(f"Migration failed: {e}")
            raise


async def recreate_tables():
    """Recreate all custom_courses tables (WARNING: This will delete all data!)"""

    async with engine.begin() as conn:
        try:
            print("Dropping existing custom_courses tables...")
            await conn.execute(text("DROP TABLE IF EXISTS custom_coding_submissions CASCADE"))
            await conn.execute(text("DROP TABLE IF EXISTS custom_quiz_attempts CASCADE"))
            await conn.execute(text("DROP TABLE IF EXISTS custom_quizzes CASCADE"))
            await conn.execute(text("DROP TABLE IF EXISTS custom_lessons CASCADE"))
            await conn.execute(text("DROP TABLE IF EXISTS custom_coding_tasks CASCADE"))
            await conn.execute(text("DROP TABLE IF EXISTS custom_modules CASCADE"))
            await conn.execute(text("DROP TABLE IF EXISTS custom_courses CASCADE"))
            print("✓ Dropped existing tables")

            print("Creating new tables...")
            await conn.run_sync(CustomCourse.metadata.create_all)
            print("✓ Created new tables")

        except Exception as e:
            print(f"Table recreation failed: {e}")
            raise


if __name__ == "__main__":
    print("Custom Courses Migration Tool")
    print("=" * 40)

    choice = input("Choose migration method:\n1. Safe migration (add missing columns)\n2. Recreate tables (WARNING: deletes all data!)\nChoice (1/2): ")

    if choice == "1":
        print("Running safe migration...")
        asyncio.run(migrate_custom_courses())
    elif choice == "2":
        confirm = input("Are you sure you want to delete all custom courses data? (yes/no): ")
        if confirm.lower() == "yes":
            print("Recreating tables...")
            asyncio.run(recreate_tables())
        else:
            print("Migration cancelled.")
    else:
        print("Invalid choice. Migration cancelled.")
