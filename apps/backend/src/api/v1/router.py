from fastapi import APIRouter

from src.api.v1.endpoints.auth import router as auth_router
from src.api.v1.endpoints.calendar import router as calendar_router
from src.api.v1.endpoints.curriculum import router as curriculum_router
from src.api.v1.endpoints.generation import router as generation_router
from src.api.v1.endpoints.progress import router as progress_router
from src.api.v1.endpoints.schools import router as schools_router
from src.api.v1.endpoints.users import router as users_router

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router)
api_v1_router.include_router(schools_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(curriculum_router)
api_v1_router.include_router(calendar_router)
api_v1_router.include_router(generation_router)
api_v1_router.include_router(progress_router)
