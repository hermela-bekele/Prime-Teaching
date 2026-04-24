from src.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from src.schemas.calendar import CalendarCreate, CalendarRunCreate, SessionStatusUpdate
from src.schemas.curriculum import SubjectCreate, UnitCreate
from src.schemas.generation import (
    AssessmentGenerationRequest,
    CalendarGenerationRequest,
    GenerateContentRequest,
    GenerationJobQueuedResponse,
    GenerationJobResponse,
    LessonPlanGenerationRequest,
    TeachingNoteGenerationRequest,
)
from src.schemas.progress import ProgressCreate, ProgressUpdateRequest, TeacherProgressStatsResponse

__all__ = [
    "AssessmentGenerationRequest",
    "AuthUser",
    "CalendarCreate",
    "CalendarGenerationRequest",
    "CalendarRunCreate",
    "GenerateContentRequest",
    "GenerationJobQueuedResponse",
    "GenerationJobResponse",
    "LessonPlanGenerationRequest",
    "LoginRequest",
    "ProgressCreate",
    "ProgressUpdateRequest",
    "RegisterRequest",
    "SessionStatusUpdate",
    "SubjectCreate",
    "TeacherProgressStatsResponse",
    "TeachingNoteGenerationRequest",
    "TokenResponse",
    "UnitCreate",
    "UserResponse",
]

# Backwards compat alias used by older imports
AuthUser = UserResponse
