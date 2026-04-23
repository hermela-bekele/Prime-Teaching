from src.workers.celery_app import celery_app


@celery_app.task(name="src.workers.tasks.calendar_tasks.generate_calendar")
def generate_calendar(school_id: int) -> dict:
    return {"school_id": school_id, "status": "generated"}
