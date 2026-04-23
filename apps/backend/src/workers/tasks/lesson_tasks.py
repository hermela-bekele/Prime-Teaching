import asyncio

from src.services.ai_service import generate_text
from src.workers.celery_app import celery_app


@celery_app.task(name="src.workers.tasks.lesson_tasks.generate_lesson_content")
def generate_lesson_content(prompt: str) -> str:
    return asyncio.run(generate_text(prompt))
