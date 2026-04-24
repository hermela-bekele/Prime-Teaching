from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class LessonPlanOut(BaseModel):
    id: str
    lesson_plan_id: str
    session_id: str
    teacher_owner_id: str
    generation_version: int
    generation_status: str
    lesson_objectives: str | None
    required_prior_knowledge: str | None
    lesson_opening: str | None
    concept_delivery_steps: str | None
    guided_practice: str | None
    independent_practice: str | None
    classwork_activities: str | None
    homework_assignment: str | None
    materials_needed: str | None
    estimated_duration_minutes: int | None
    download_doc_url: str | None
    approved_by_id: str | None
    notes: str | None
    generated_at: str | None
