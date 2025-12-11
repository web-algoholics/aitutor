"""
Скрипт для миграции таблицы courses
Используется для добавления недостающих колонок или пересоздания таблицы
"""
import asyncio
from sqlalchemy import text
from database import engine
from courses.models import Course


async def migrate_courses_table():
    """Пересоздать таблицу courses с правильной структурой"""
    async with engine.begin() as conn:
        # Проверяем, существует ли таблица
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
            # Проверяем, есть ли колонка slug
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
                print("Таблица courses существует, но не имеет колонку slug. Пересоздаю таблицу...")
                # Удаляем таблицу
                await conn.execute(text("DROP TABLE IF EXISTS courses CASCADE"))
                # Создаем заново
                await conn.run_sync(Course.__table__.create)
                print("Таблица courses успешно пересоздана!")
            else:
                print("Таблица courses уже имеет правильную структуру.")
        else:
            # Создаем таблицу
            print("Создаю таблицу courses...")
            await conn.run_sync(Course.__table__.create)
            print("Таблица courses успешно создана!")


if __name__ == "__main__":
    asyncio.run(migrate_courses_table())

