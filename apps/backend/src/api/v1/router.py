from fastapi import APIRouter

from src.api.v1.endpoints import (
    assessments,
    auth,
    calendar,
    curriculum,
    generation,
    lesson_plans,
    progress,
    resources,
    schools,
    teaching_notes,
    users,
)

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(schools.router, prefix="/schools", tags=["Schools"])
api_v1_router.include_router(users.router, prefix="/users", tags=["Users"])
api_v1_router.include_router(curriculum.router, prefix="/curriculum", tags=["Curriculum"])
api_v1_router.include_router(calendar.router, prefix="/calendar", tags=["Calendar"])
api_v1_router.include_router(generation.router, prefix="/generate", tags=["AI Generation"])
api_v1_router.include_router(lesson_plans.router, prefix="/lesson-plans", tags=["Lesson Plans"])
api_v1_router.include_router(teaching_notes.router, prefix="/teaching-notes", tags=["Teaching Notes"])
api_v1_router.include_router(assessments.router, prefix="/assessments", tags=["Assessments"])
api_v1_router.include_router(progress.router, prefix="/progress", tags=["Progress Tracking"])
api_v1_router.include_router(resources.router, prefix="/resources", tags=["Resources"])
