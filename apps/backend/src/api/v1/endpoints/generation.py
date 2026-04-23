from fastapi import APIRouter

from src.schemas.generation import GenerateContentRequest, GenerationJobResponse
from src.workers.tasks.lesson_tasks import generate_lesson_content

router = APIRouter(prefix="/generation", tags=["generation"])


@router.post("/jobs", response_model=GenerationJobResponse)
async def queue_generation(request: GenerateContentRequest) -> GenerationJobResponse:
    task = generate_lesson_content.delay(request.prompt)
    return GenerationJobResponse(job_id=task.id)
