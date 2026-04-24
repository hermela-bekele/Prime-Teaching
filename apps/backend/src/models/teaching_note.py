from sqlalchemy import String, Integer, Text, Enum, ForeignKey, cast
from sqlalchemy.dialects.postgresql import UUID as PGUUIDType
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from .base import Base, UUIDMixin, TimestampMixin
from .enums import GenerationStatus


def _teaching_note_session_primaryjoin():
    from .session import CalendarSession

    return CalendarSession.id == cast(TeachingNote.session_id, PGUUIDType(as_uuid=False))


class TeachingNote(Base, UUIDMixin):
    __tablename__ = "teaching_notes"
    
    teaching_note_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    # Stored as VARCHAR in some DBs while ``calendar_sessions.id`` is UUID — no ORM FK.
    session_id: Mapped[str] = mapped_column(String(36), nullable=False, unique=True, index=True)
    lesson_plan_id: Mapped[str] = mapped_column(ForeignKey("lesson_plans.id", ondelete="CASCADE"))
    teacher_owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    generation_version: Mapped[int] = mapped_column(Integer, default=1)
    generation_status: Mapped[GenerationStatus] = mapped_column(Enum(GenerationStatus), default=GenerationStatus.DRAFT)
    teacher_intro_script: Mapped[Optional[str]] = mapped_column(Text)
    stepwise_explanation: Mapped[Optional[str]] = mapped_column(Text)
    worked_examples: Mapped[Optional[str]] = mapped_column(Text)
    teacher_questions: Mapped[Optional[str]] = mapped_column(Text)
    student_activity_guidance: Mapped[Optional[str]] = mapped_column(Text)
    real_life_application: Mapped[Optional[str]] = mapped_column(Text)
    struggling_student_support: Mapped[Optional[str]] = mapped_column(Text)
    average_student_support: Mapped[Optional[str]] = mapped_column(Text)
    advanced_student_extension: Mapped[Optional[str]] = mapped_column(Text)
    common_mistakes: Mapped[Optional[str]] = mapped_column(Text)
    lesson_wrap_up: Mapped[Optional[str]] = mapped_column(Text)
    download_doc_url: Mapped[Optional[str]] = mapped_column(String(500))
    approved_by_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    generated_at: Mapped[Optional[str]] = mapped_column(String)
    
    # Relationships
    session: Mapped["CalendarSession"] = relationship(
        "CalendarSession",
        back_populates="teaching_note",
        primaryjoin=_teaching_note_session_primaryjoin,
        foreign_keys="TeachingNote.session_id",
    )
    lesson_plan: Mapped["LessonPlan"] = relationship("LessonPlan", back_populates="teaching_note")
    teacher_owner: Mapped["User"] = relationship("User", foreign_keys=[teacher_owner_id])
    approved_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[approved_by_id])