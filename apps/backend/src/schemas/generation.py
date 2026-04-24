from __future__ import annotations

from pydantic import AliasChoices, BaseModel, Field, field_validator


class CalendarGenerationRequest(BaseModel):
    subject_id: str
    sequencing_mode: str = "textbook_order"
    total_available_sessions: int = Field(
        ge=1,
        le=500,
        validation_alias=AliasChoices("total_available_sessions", "total_sessions"),
    )

    @field_validator("sequencing_mode", mode="before")
    @classmethod
    def normalize_sequencing(cls, v: object) -> object:
        if v == "optimized":
            return "optimized_sequence"
        return v


class LessonPlanGenerationRequest(BaseModel):
    session_id: str


class TeachingNoteGenerationRequest(BaseModel):
    lesson_plan_id: str


class AssessmentGenerationRequest(BaseModel):
    session_id: str
    assessment_type: str = Field(default="quiz", description="quiz | unit_test")


class GenerationJobQueuedResponse(BaseModel):
    job_id: str
    status: str = "queued"


class GenerationJobResponse(BaseModel):
    job_id: str
    status: str
    output_record_id: str | None = None
    error_log: str | None = None


# Backwards compatibility
class GenerateContentRequest(BaseModel):
    prompt: str
    requester_email: str
    role: str
