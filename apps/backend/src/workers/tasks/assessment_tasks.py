from src.workers.celery_app import celery_app


@celery_app.task(name="src.workers.tasks.assessment_tasks.generate_assessment")
def generate_assessment(subtopic_id: int) -> dict:
    return {"subtopic_id": subtopic_id, "status": "generated"}
