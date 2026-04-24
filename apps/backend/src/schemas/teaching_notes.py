from __future__ import annotations

from pydantic import BaseModel


class TeachingNoteOut(BaseModel):
    id: str
    teaching_note_id: str
    session_id: str
    lesson_plan_id: str
    teacher_owner_id: str
    generation_version: int
    generation_status: str
    teacher_intro_script: str | None
    stepwise_explanation: str | None
    worked_examples: str | None
    teacher_questions: str | None
    student_activity_guidance: str | None
    real_life_application: str | None
    struggling_student_support: str | None
    average_student_support: str | None
    advanced_student_extension: str | None
    common_mistakes: str | None
    lesson_wrap_up: str | None
    download_doc_url: str | None
    approved_by_id: str | None
    notes: str | None
    generated_at: str | None
