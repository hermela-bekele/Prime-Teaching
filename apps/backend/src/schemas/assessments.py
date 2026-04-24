from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class QuizGenerationRequest(BaseModel):
    session_id: str
    assessment_type: str = Field(default="quiz", description="quiz | unit_test")


class AssessmentOut(BaseModel):
    id: str
    assessment_id: str
    session_id: str | None
    assessment_type: str
    subject_id: str
    unit_id: str
    subtopic_id: str | None
    question_set: str | None
    answer_key: str | None
    marking_guide: str | None
    estimated_duration_minutes: int | None
    difficulty_level: str
    download_doc_url: str | None
    generated_at: str | None

    model_config = {"from_attributes": False}
