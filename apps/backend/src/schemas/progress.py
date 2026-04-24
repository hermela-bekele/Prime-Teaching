from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field, model_validator


class ProgressUpdateRequest(BaseModel):
    session_id: str
    completion_status: str = Field(
        ...,
        description="not_started, completed, partially_completed, missed, rescheduled",
    )
    delivery_confidence: str | None = Field(
        default=None,
        description="high, medium, low",
    )
    deviation_reason: str | None = None
    notes: str | None = Field(default=None, description="Alias mapped to deviation_reason when latter is unset")
    actual_delivery_date: date | None = None
    follow_up_required: bool | None = Field(
        default=None,
        description="When set, flags the session for department head review",
    )

    @model_validator(mode="after")
    def map_notes_to_deviation(self) -> ProgressUpdateRequest:
        if self.deviation_reason is None and self.notes is not None:
            object.__setattr__(self, "deviation_reason", self.notes)
        return self


class ProgressUpdateResult(BaseModel):
    progress_id: str
    status: str


class ConfidenceBreakdown(BaseModel):
    high: int = 0
    medium: int = 0
    low: int = 0
    unset: int = 0


class TeacherProgressStatsResponse(BaseModel):
    total_sessions: int
    completed_count: int
    completion_rate: float
    overdue_sessions: int
    confidence_breakdown: ConfidenceBreakdown
    today_count: int = 0
    upcoming_count: int = 0
    pending_count: int = 0


class TeacherListProgressItem(BaseModel):
    teacher_id: str
    user_id: str
    full_name: str
    email: str
    department_name: str | None
    stats: TeacherProgressStatsResponse


class DepartmentProgressResponse(BaseModel):
    teachers: list[TeacherListProgressItem]


class DepartmentStatItem(BaseModel):
    department_name: str
    teacher_count: int
    avg_completion_rate: float
    total_sessions: int
    completed_sessions: int


class SchoolProgressResponse(BaseModel):
    departments: list[DepartmentStatItem]


# Legacy response (kept for older clients)
class TeacherProgressResponse(BaseModel):
    today_count: int
    upcoming_count: int
    completed_count: int
    pending_count: int


class ProgressCreate(BaseModel):
    user_id: str
    subtopic_id: int
    score: float
