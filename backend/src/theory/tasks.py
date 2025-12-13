import asyncio
import logging
from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload, joinedload

from database import get_session as get_db
from .models import TheoryCourse, TheoryModule, TheoryLesson, TheoryContent
from .ai_generator import TheoryAIGenerator

logger = logging.getLogger(__name__)
ai_generator = TheoryAIGenerator()


async def generate_first_module_only(course_id: int, background_tasks=None):
    """Generate theory content for only the first module, then start background generation of others"""
    # Create new database session for background task
    async for db in get_db():
        try:
            # Get course topic for context
            result = await db.execute(
                select(TheoryCourse).where(TheoryCourse.id == course_id)
            )
            course = result.scalar_one_or_none()
            course_topic = course.title if course else "курс по запросу пользователя"

            # Get first module with lessons
            result = await db.execute(
                select(TheoryModule)
                .where(and_(TheoryModule.course_id == course_id, TheoryModule.order == 1))
                .options(selectinload(TheoryModule.lessons))
            )
            first_module = result.scalar_one_or_none()

            if not first_module or not first_module.lessons:
                logger.warning(f"No first module found for course {course_id}")
                return

            logger.info(f"Generating content for first module '{first_module.title}'")

            # Generate theory for each lesson in first module
            for lesson in first_module.lessons:
                try:
                    content = ai_generator.generate_lesson_theory(
                        lesson_title=lesson.title,
                        lesson_description=lesson.description,
                        learning_objectives=lesson.learning_objectives,
                        key_concepts=lesson.key_concepts,
                        module_context=f"{first_module.title}: {first_module.description}",
                        course_topic=course_topic
                    )

                    # Calculate reading time based on content length
                    word_count = len(content.split())
                    reading_time = max(5, min(60, word_count // 200))  # 5-60 minutes range

                    theory_content = TheoryContent(
                        lesson_id=lesson.id,
                        content=content,
                        reading_time=reading_time,
                        is_generated=True
                    )
                    db.add(theory_content)
                    logger.info(f"Generated theory for lesson {lesson.id}: {lesson.title}")

                except Exception as e:
                    logger.error(f"Failed to generate theory for lesson {lesson.id}: {e}")

            await db.commit()
            logger.info(f"Completed theory generation for first module of course {course_id}")

            # Now start background generation of remaining modules
            if background_tasks:
                background_tasks.add_task(generate_remaining_modules, course_id)
            else:
                # If no background_tasks provided, run synchronously (for testing)
                asyncio.create_task(generate_remaining_modules(course_id))

        except Exception as e:
            logger.error(f"Error generating first module theory: {e}")
            await db.rollback()
        finally:
            await db.close()

async def create_course_structure_and_generate(course_id: int, plan_data: dict, background_tasks=None):
    """Create course structure (modules/lessons) and start content generation"""
    # Create new database session for background task
    async for db in get_db():
        try:
            logger.info(f"Creating course structure for course {course_id}")

            # Create modules and lessons structure
            for module_data in plan_data["modules"]:
                module = TheoryModule(
                    course_id=course_id,
                    title=module_data["title"],
                    description=module_data["description"],
                    order=module_data["order"],
                    learning_objectives=module_data["learning_objectives"],
                    key_concepts=module_data["key_concepts"]
                )
                db.add(module)
                await db.flush()  # Get module ID

                # Create lessons for this module
                for lesson_data in module_data["lessons"]:
                    lesson = TheoryLesson(
                        module_id=module.id,
                        title=lesson_data["title"],
                        description=lesson_data["description"],
                        order=lesson_data["order"],
                        estimated_duration=lesson_data["estimated_duration"],
                        learning_objectives=lesson_data["learning_objectives"],
                        key_concepts=lesson_data["key_concepts"]
                    )
                    db.add(lesson)

            await db.commit()
            logger.info(f"Successfully created course structure for course {course_id}")

            # Start background generation of course content
            if background_tasks:
                background_tasks.add_task(generate_first_module_only, course_id, background_tasks)
            else:
                asyncio.create_task(generate_first_module_only(course_id))

        except Exception as e:
            logger.error(f"Error creating course structure for {course_id}: {e}")
            await db.rollback()
        finally:
            await db.close()


async def generate_course_content(course_id: int, plan_data: dict):
    """Deprecated: Use create_course_structure_and_generate directly"""
    # This function is kept for backward compatibility
    await create_course_structure_and_generate(course_id, plan_data)

async def generate_remaining_modules(course_id: int):
    """Generate theory content for remaining modules (2+)"""
    # Create new database session for background task
    async for db in get_db():
        try:
            # Get course topic for context
            result = await db.execute(
                select(TheoryCourse).where(TheoryCourse.id == course_id)
            )
            course = result.scalar_one_or_none()
            course_topic = course.title if course else "курс по запросу пользователя"

            # Get remaining modules (order > 1) with lessons
            result = await db.execute(
                select(TheoryModule)
                .where(and_(TheoryModule.course_id == course_id, TheoryModule.order > 1))
                .options(selectinload(TheoryModule.lessons))
                .order_by(TheoryModule.order)
            )
            remaining_modules = result.scalars().all()

            if not remaining_modules:
                logger.info(f"No remaining modules to generate for course {course_id}")
                return

            logger.info(f"Starting theory generation for {len(remaining_modules)} remaining modules")

            # Generate content for remaining modules (sequentially to avoid overwhelming the AI)
            for module in remaining_modules:
                logger.info(f"Generating content for module '{module.title}' (order: {module.order})")

                # Generate theory for each lesson in the module
                for lesson in module.lessons:
                    try:
                        content = ai_generator.generate_lesson_theory(
                            lesson_title=lesson.title,
                            lesson_description=lesson.description,
                            learning_objectives=lesson.learning_objectives,
                            key_concepts=lesson.key_concepts,
                            module_context=f"{module.title}: {module.description}",
                            course_topic=course_topic
                        )

                        # Calculate reading time based on content length
                        word_count = len(content.split())
                        reading_time = max(5, min(60, word_count // 200))  # 5-60 minutes range

                        theory_content = TheoryContent(
                            lesson_id=lesson.id,
                            content=content,
                            reading_time=reading_time,
                            is_generated=True
                        )
                        db.add(theory_content)
                        logger.info(f"Generated theory for lesson {lesson.id}: {lesson.title}")

                    except Exception as e:
                        logger.error(f"Failed to generate theory for lesson {lesson.id}: {e}")

                # Commit after each module to save progress
                await db.commit()
                logger.info(f"Completed theory generation for module '{module.title}'")

            logger.info(f"Completed theory generation for all remaining modules of course {course_id}")

        except Exception as e:
            logger.error(f"Error generating remaining modules theory: {e}")
            await db.rollback()
        finally:
            await db.close()


async def generate_course_content_background(course_id: int):
    """Generate theory content for all lessons in the course (background task)"""
    # Create new database session for background task
    async for db in get_db():
        try:
            # Get course topic for context
            result = await db.execute(
                select(TheoryCourse).where(TheoryCourse.id == course_id)
            )
            course = result.scalar_one_or_none()
            course_topic = course.title if course else "курс по запросу пользователя"

            logger.info(f"Starting background content generation for course {course_id}")

            # Get all lessons for the course with modules loaded
            result = await db.execute(
                select(TheoryLesson)
                .join(TheoryModule)
                .where(TheoryModule.course_id == course_id)
                .options(joinedload(TheoryLesson.module))
                .order_by(TheoryModule.order, TheoryLesson.order)
            )
            lessons = result.unique().scalars().all()
            lessons = result.scalars().all()

            logger.info(f"Found {len(lessons)} lessons to generate content for")

            for lesson in lessons:
                try:
                    # Double-check if content already exists (in case of concurrent requests)
                    result = await db.execute(
                        select(TheoryContent).where(TheoryContent.lesson_id == lesson.id)
                    )
                    existing_content = result.scalar_one_or_none()

                    if existing_content:
                        logger.info(f"Content already exists for lesson {lesson.id}: {lesson.title}")
                        continue

                    logger.info(f"Generating theory for lesson {lesson.id}: {lesson.title}")

                    content = ai_generator.generate_lesson_theory(
                        lesson_title=lesson.title,
                        lesson_description=lesson.description,
                        learning_objectives=lesson.learning_objectives,
                        key_concepts=lesson.key_concepts,
                        module_context=f"{lesson.module.title}: {lesson.module.description}",
                        course_topic=course_topic
                    )

                    # Save content with explicit check
                    theory_content = TheoryContent(
                        lesson_id=lesson.id,
                        content=content,
                        reading_time=len(content.split()) // 200 + 1,  # Rough estimate: 200 words per minute
                        is_generated=True,
                        generated_at=datetime.utcnow()
                    )
                    db.add(theory_content)

                    try:
                        await db.commit()
                        logger.info(f"Generated theory for lesson {lesson.id}: {lesson.title}")
                    except Exception as commit_error:
                        # Check if it's a duplicate key error
                        await db.rollback()
                        logger.warning(f"Commit failed for lesson {lesson.id}, possibly duplicate: {commit_error}")

                        # Double-check if content was created by another process
                        result = await db.execute(
                            select(TheoryContent).where(TheoryContent.lesson_id == lesson.id)
                        )
                        if result.scalar_one_or_none():
                            logger.info(f"Content was created by another process for lesson {lesson.id}")
                        else:
                            logger.error(f"Failed to create content for lesson {lesson.id}: {commit_error}")

                except Exception as e:
                    logger.error(f"Error generating theory for lesson {lesson.id}: {e}")
                    await db.rollback()  # Explicit rollback on error
                    continue

            logger.info(f"Completed background content generation for course {course_id}")

        except Exception as e:
            logger.error(f"Error in generate_course_content_background for course {course_id}: {e}")


async def generate_all_course_theory(course_id: int):
    """Generate theory content for ALL modules in the course (fallback function)"""
    # Create new database session for background task
    async for db in get_db():
        try:
            # Get course topic for context
            result = await db.execute(
                select(TheoryCourse).where(TheoryCourse.id == course_id)
            )
            course = result.scalar_one_or_none()
            course_topic = course.title if course else "курс по запросу пользователя"

            # Get all modules with lessons
            result = await db.execute(
                select(TheoryModule)
                .where(TheoryModule.course_id == course_id)
                .options(selectinload(TheoryModule.lessons))
                .order_by(TheoryModule.order)
            )
            modules = result.scalars().all()

            if not modules:
                logger.warning(f"No modules found for course {course_id}")
                return

            logger.info(f"Starting theory generation for course {course_id} with {len(modules)} modules")

            # Generate content for all modules (sequentially to avoid overwhelming the AI)
            for module in modules:
                logger.info(f"Generating content for module '{module.title}' (order: {module.order})")

                # Generate theory for each lesson in the module
                for lesson in module.lessons:
                    try:
                        content = ai_generator.generate_lesson_theory(
                            lesson_title=lesson.title,
                            lesson_description=lesson.description,
                            learning_objectives=lesson.learning_objectives,
                            key_concepts=lesson.key_concepts,
                            module_context=f"{module.title}: {module.description}",
                            course_topic=course_topic
                        )

                        # Calculate reading time based on content length
                        word_count = len(content.split())
                        reading_time = max(5, min(60, word_count // 200))  # 5-60 minutes range

                        theory_content = TheoryContent(
                            lesson_id=lesson.id,
                            content=content,
                            reading_time=reading_time,
                            is_generated=True
                        )
                        db.add(theory_content)
                        logger.info(f"Generated theory for lesson {lesson.id}: {lesson.title}")

                    except Exception as e:
                        logger.error(f"Failed to generate theory for lesson {lesson.id}: {e}")

                # Commit after each module to save progress
                await db.commit()
                logger.info(f"Completed theory generation for module '{module.title}'")

            logger.info(f"Completed theory generation for all modules of course {course_id}")

        except Exception as e:
            logger.error(f"Error generating course theory: {e}")
            await db.rollback()
        finally:
            await db.close()


async def generate_first_module_theory(course_id: int):
    """Generate theory content for the first module (legacy function)"""
    # Create new database session for background task
    async for db in get_db():
        try:
            # Get first module with lessons
            result = await db.execute(
                select(TheoryModule)
                .where(and_(TheoryModule.course_id == course_id, TheoryModule.order == 1))
                .options(selectinload(TheoryModule.lessons))
            )
            module = result.scalar_one_or_none()

            if not module or not module.lessons:
                return

            # Generate theory for each lesson in first module
            for lesson in module.lessons:
                try:
                    content = ai_generator.generate_lesson_theory(
                        lesson_title=lesson.title,
                        lesson_description=lesson.description,
                        learning_objectives=lesson.learning_objectives,
                        key_concepts=lesson.key_concepts,
                        module_context=f"{module.title}: {module.description}",
                        course_topic="курс по запросу пользователя"  # Will be improved later
                    )

                    # Calculate reading time based on content length
                    word_count = len(content.split())
                    reading_time = max(5, min(60, word_count // 200))  # 5-60 minutes range

                    theory_content = TheoryContent(
                        lesson_id=lesson.id,
                        content=content,
                        reading_time=reading_time,
                        is_generated=True
                    )
                    db.add(theory_content)
                    logger.info(f"Generated theory for lesson {lesson.id}: {lesson.title}")

                except Exception as e:
                    logger.error(f"Failed to generate theory for lesson {lesson.id}: {e}")

            await db.commit()
            logger.info(f"Completed theory generation for first module of course {course_id}")

        except Exception as e:
            logger.error(f"Error generating first module theory: {e}")
            await db.rollback()
        finally:
            await db.close()


async def generate_single_lesson_content(lesson_id: int):
    """Generate content for a single lesson"""
    logger.info(f"🔄 Starting content generation for lesson {lesson_id}")

    # Create new database session for background task
    async for db in get_db():
        try:
            logger.info(f"📚 Fetching lesson data for lesson {lesson_id}")
            # Get lesson with full context
            result = await db.execute(
                select(TheoryLesson)
                .where(TheoryLesson.id == lesson_id)
                .options(selectinload(TheoryLesson.module).selectinload(TheoryModule.course))
            )
            lesson = result.scalar_one_or_none()

            if not lesson:
                logger.warning(f"Lesson {lesson_id} not found")
                return

            # Check if content already exists
            result = await db.execute(
                select(TheoryContent).where(TheoryContent.lesson_id == lesson_id)
            )
            existing_content = result.scalar_one_or_none()

            if existing_content:
                logger.info(f"Content already exists for lesson {lesson_id}: {lesson.title}")
                return

            logger.info(f"🤖 Starting AI generation for lesson '{lesson.title}'")

            # Generate theory content (ai_generator is synchronous)
            content = ai_generator.generate_lesson_theory(
                lesson_title=lesson.title,
                lesson_description=lesson.description,
                learning_objectives=lesson.learning_objectives,
                key_concepts=lesson.key_concepts,
                module_context=f"{lesson.module.title}: {lesson.module.description}",
                course_topic=lesson.module.course.topic
            )

            # Calculate reading time based on content length (roughly 200 words per minute)
            word_count = len(content.split())
            reading_time = max(5, min(60, word_count // 200))  # 5-60 minutes range

            logger.info(f"💾 Saving content for lesson {lesson_id} ({word_count} words, ~{reading_time} min read)")

            # Save content
            theory_content = TheoryContent(
                lesson_id=lesson.id,
                content=content,
                reading_time=reading_time,
                is_generated=True
            )
            db.add(theory_content)
            await db.commit()

            logger.info(f"✅ Successfully generated theory content for lesson {lesson_id}")

        except Exception as e:
            logger.error(f"❌ Error generating content for lesson {lesson_id}: {e}")
            logger.error(f"❌ Exception type: {type(e)}")
            import traceback
            logger.error(f"❌ Traceback: {traceback.format_exc()}")
            await db.rollback()
        finally:
            await db.close()


async def generate_module_content_background(module_id: int):
    """Generate content for all lessons in a module"""
    # Create new database session for background task
    async for db in get_db():
        try:
            # Get module with lessons
            result = await db.execute(
                select(TheoryModule)
                .where(TheoryModule.id == module_id)
                .options(selectinload(TheoryModule.lessons))
            )
            module = result.scalar_one_or_none()

            if not module:
                return

            # Generate content for each lesson without content (in parallel)
            lessons_to_generate = []
            for lesson in module.lessons:
                result = await db.execute(
                    select(TheoryContent).where(TheoryContent.lesson_id == lesson.id)
                )
                if not result.scalar_one_or_none():
                    lessons_to_generate.append(lesson.id)

            logger.info(f"Module {module_id} has {len(lessons_to_generate)} lessons without content out of {len(module.lessons)} total")

            # Generate all lessons in parallel with error handling and batching
            if lessons_to_generate:
                logger.info(f"Starting parallel generation for {len(lessons_to_generate)} lessons in module {module_id}")

                # Process lessons in batches of 3 to avoid overwhelming the system
                batch_size = 3
                successful_generations = 0

                for i in range(0, len(lessons_to_generate), batch_size):
                    batch = lessons_to_generate[i:i + batch_size]
                    logger.info(f"Processing batch {i//batch_size + 1} with {len(batch)} lessons")

                    # Create tasks for this batch
                    async def generate_lesson_safe(lesson_id: int):
                        try:
                            await generate_single_lesson_content(lesson_id)
                            return True
                        except Exception as e:
                            logger.error(f"Failed to generate content for lesson {lesson_id}: {e}")
                            return False

                    # Run batch in parallel
                    tasks = [generate_lesson_safe(lesson_id) for lesson_id in batch]
                    results = await asyncio.gather(*tasks, return_exceptions=True)

                    # Count successful generations in this batch
                    batch_successes = sum(1 for r in results if r is True and not isinstance(r, Exception))
                    successful_generations += batch_successes
                    logger.info(f"Batch completed: {batch_successes}/{len(batch)} lessons generated successfully")

                    # Small delay between batches to avoid overwhelming
                    if i + batch_size < len(lessons_to_generate):
                        await asyncio.sleep(1)

                logger.info(f"Module {module_id}: Generated content for {successful_generations}/{len(lessons_to_generate)} lessons successfully")

            logger.info(f"Completed content generation for module {module_id}")

        except Exception as e:
            logger.error(f"Error generating module content: {e}")
            await db.rollback()
        finally:
            await db.close()


async def retry_failed_lesson_generations(module_id: int):
    """Retry generating content for lessons that failed in the initial attempt"""
    logger.info(f"🔄 Retrying failed lesson generations for module {module_id}")

    # Create new database session for background task
    async for db in get_db():
        try:
            # Get module with lessons
            result = await db.execute(
                select(TheoryModule)
                .where(TheoryModule.id == module_id)
                .options(selectinload(TheoryModule.lessons))
            )
            module = result.scalar_one_or_none()

            if not module:
                return

            # Find lessons without content
            failed_lessons = []
            for lesson in module.lessons:
                result = await db.execute(
                    select(TheoryContent).where(TheoryContent.lesson_id == lesson.id)
                )
                if not result.scalar_one_or_none():
                    failed_lessons.append(lesson.id)

            if not failed_lessons:
                logger.info(f"No failed lessons to retry for module {module_id}")
                return

            logger.info(f"Retrying {len(failed_lessons)} failed lessons for module {module_id}")

            # Retry failed lessons one by one with more conservative approach
            successful_retries = 0
            for lesson_id in failed_lessons:
                try:
                    await generate_single_lesson_content(lesson_id)
                    successful_retries += 1
                    logger.info(f"✅ Successfully retried lesson {lesson_id}")
                except Exception as e:
                    logger.error(f"❌ Failed to retry lesson {lesson_id}: {e}")

            logger.info(f"Retry completed: {successful_retries}/{len(failed_lessons)} lessons successfully generated")

        except Exception as e:
            logger.error(f"Error retrying failed lesson generations: {e}")
        finally:
            await db.close()
