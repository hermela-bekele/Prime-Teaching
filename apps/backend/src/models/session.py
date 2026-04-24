from sqlalchemy import Boolean, Date, Enum as SQLEnum, ForeignKey, Integer, String, Text, cast
from sqlalchemy.dialects.postgresql import UUID as PGUUIDType
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, TYPE_CHECKING

from .base import Base, UUIDMixin, TimestampMixin
from .enums import SessionType, SessionStatus

if TYPE_CHECKING:
    from .lesson_plan import LessonPlan
    from .subject import Subject
    from .teaching_note import TeachingNote
    from .unit import Unit
    from .user import User
    from .progress import TeacherProgress


def _calendar_session_progress_primaryjoin():
    """VARCHAR ``teacher_progress.session_id`` vs UUID ``calendar_sessions.id``."""
    from .progress import TeacherProgress

    return CalendarSession.id == cast(TeacherProgress.session_id, PGUUIDType(as_uuid=False))


def _calendar_session_lesson_plan_primaryjoin():
    from .lesson_plan import LessonPlan

    return CalendarSession.id == cast(LessonPlan.session_id, PGUUIDType(as_uuid=False))


def _calendar_session_teaching_note_primaryjoin():
    from .teaching_note import TeachingNote

    return CalendarSession.id == cast(TeachingNote.session_id, PGUUIDType(as_uuid=False))


class CalendarSession(Base, UUIDMixin, TimestampMixin):
    """
    Calendar session.

    This table varies by migration: some databases omit ``subtopic_id``,
    ``calendar_run_id``, ``school_owner_id``, etc. This model matches the **minimal**
    schema (subject + unit + teacher only). Extend your database or ORM when you add columns.
    """

    __tablename__ = "calendar_sessions"

    session_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    subject_id: Mapped[str] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"))
    unit_id: Mapped[str] = mapped_column(ForeignKey("units.id", ondelete="CASCADE"))
    session_number_global: Mapped[int] = mapped_column(Integer, nullable=False)
    session_number_in_unit: Mapped[int] = mapped_column(Integer, nullable=False)
    planned_date: Mapped[str] = mapped_column(Date, nullable=False)
    session_type: Mapped[SessionType] = mapped_column(
        SQLEnum(
            SessionType,
            name="session_type",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        default=SessionType.TEACHING,
    )
    session_title: Mapped[str] = mapped_column(String(255), nullable=False)
    learning_goal_summary: Mapped[Optional[str]] = mapped_column(Text)
    requires_lesson_plan: Mapped[bool] = mapped_column(Boolean, default=True)
    requires_teaching_note: Mapped[bool] = mapped_column(Boolean, default=True)
    requires_quiz: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[SessionStatus] = mapped_column(
        SQLEnum(
            SessionStatus,
            name="session_status",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        default=SessionStatus.PLANNED,
    )
    teacher_owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))

    subject: Mapped["Subject"] = relationship("Subject")
    unit: Mapped["Unit"] = relationship("Unit", back_populates="calendar_sessions")
    teacher_owner: Mapped["User"] = relationship("User", foreign_keys=[teacher_owner_id])
    lesson_plan: Mapped[Optional["LessonPlan"]] = relationship(
        "LessonPlan",
        back_populates="session",
        uselist=False,
        primaryjoin=_calendar_session_lesson_plan_primaryjoin,
        foreign_keys="LessonPlan.session_id",
    )
    teaching_note: Mapped[Optional["TeachingNote"]] = relationship(
        "TeachingNote",
        back_populates="session",
        uselist=False,
        primaryjoin=_calendar_session_teaching_note_primaryjoin,
        foreign_keys="TeachingNote.session_id",
    )
    progress: Mapped[Optional["TeacherProgress"]] = relationship(
        "TeacherProgress",
        back_populates="session",
        uselist=False,
        primaryjoin=_calendar_session_progress_primaryjoin,
        foreign_keys="TeacherProgress.session_id",
    )
