from __future__ import annotations

from datetime import date
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class SequencingMode(str, Enum):
    textbook_order = "textbook_order"
    optimized_sequence = "optimized_sequence"


class CalendarRunCreate(BaseModel):
    subject_id: str
    sequencing_mode: SequencingMode
    total_available_sessions: int = Field(ge=1, le=500)
    academic_year_label: str = Field(min_length=1, max_length=50)


class SessionStatusUpdate(BaseModel):
    status: str = Field(
        ...,
        description="planned, generated, delivered, missed, rescheduled",
    )
    actual_delivery_date: date | None = None
    notes: str | None = None


class CalendarRunCreatedResponse(BaseModel):
    calendar_run_id: str
    generation_status: str


# Legacy alias for patches
class SessionStatusPatch(SessionStatusUpdate):
    pass


class CalendarCreate(BaseModel):
    school_id: int
    start_date: date
    end_date: date


class PaginationParams(BaseModel):
    limit: int = Field(default=50, ge=1, le=200)
    offset: int = Field(default=0, ge=0)
