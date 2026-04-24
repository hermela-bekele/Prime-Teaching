from sqlalchemy import Enum as SQLEnum, ForeignKey, Integer, String, Text, cast
from sqlalchemy.dialects.postgresql import UUID as PGUUIDType
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from .base import Base, UUIDMixin, TimestampMixin
from .enums import GenerationStatus


def _lesson_plan_session_primaryjoin():
    from .session import CalendarSession

    return CalendarSession.id == cast(LessonPlan.session_id, PGUUIDType(as_uuid=False))


class LessonPlan(Base, UUIDMixin):
    __tablename__ = "lesson_plans"
    
    lesson_plan_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    # Stored as VARCHAR in some DBs while ``calendar_sessions.id`` is UUID — no ORM FK.
    session_id: Mapped[str] = mapped_column(String(36), nullable=False, unique=True, index=True)
    teacher_owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    generation_version: Mapped[int] = mapped_column(Integer, default=1)
    generation_status: Mapped[GenerationStatus] = mapped_column(
        SQLEnum(GenerationStatus, values_callable=lambda obj: [e.value for e in obj]),
        default=GenerationStatus.DRAFT,
    )
    lesson_objectives: Mapped[Optional[str]] = mapped_column(Text)
    required_prior_knowledge: Mapped[Optional[str]] = mapped_column(Text)
    lesson_opening: Mapped[Optional[str]] = mapped_column(Text)
    concept_delivery_steps: Mapped[Optional[str]] = mapped_column(Text)
    guided_practice: Mapped[Optional[str]] = mapped_column(Text)
    independent_practice: Mapped[Optional[str]] = mapped_column(Text)
    classwork_activities: Mapped[Optional[str]] = mapped_column(Text)
    homework_assignment: Mapped[Optional[str]] = mapped_column(Text)
    materials_needed: Mapped[Optional[str]] = mapped_column(Text)
    estimated_duration_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    download_doc_url: Mapped[Optional[str]] = mapped_column(String(500))
    approved_by_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    generated_at: Mapped[Optional[str]] = mapped_column(String)
    
    # Relationships
    session: Mapped["CalendarSession"] = relationship(
        "CalendarSession",
        back_populates="lesson_plan",
        primaryjoin=_lesson_plan_session_primaryjoin,
        foreign_keys="LessonPlan.session_id",
    )
    teacher_owner: Mapped["User"] = relationship("User", foreign_keys=[teacher_owner_id])
    approved_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[approved_by_id])
    teaching_note: Mapped[Optional["TeachingNote"]] = relationship("TeachingNote", back_populates="lesson_plan", uselist=False)