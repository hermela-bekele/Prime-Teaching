from sqlalchemy import Boolean, Date, Enum as SQLEnum, String, Text, cast
from sqlalchemy.dialects.postgresql import UUID as PGUUIDType
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from .base import Base, UUIDMixin, TimestampMixin
from .enums import CompletionStatus, DeliveryConfidence, DeptReviewStatus


def _teacher_progress_session_primaryjoin():
    from .session import CalendarSession

    return CalendarSession.id == cast(TeacherProgress.session_id, PGUUIDType(as_uuid=False))


def _teacher_progress_teacher_primaryjoin():
    from .user import User

    return User.id == cast(TeacherProgress.teacher_id, PGUUIDType(as_uuid=False))


class TeacherProgress(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "teacher_progress"
    
    progress_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    # Stored as VARCHAR in some DBs while ``calendar_sessions.id`` / ``users.id`` are UUID — no ORM FK to avoid bad implicit joins.
    session_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    teacher_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    actual_delivery_date: Mapped[Optional[str]] = mapped_column(Date)
    completion_status: Mapped[CompletionStatus] = mapped_column(
        SQLEnum(
            CompletionStatus,
            name="completionstatus",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        default=CompletionStatus.NOT_STARTED,
    )
    delivery_confidence: Mapped[Optional[DeliveryConfidence]] = mapped_column(
        SQLEnum(
            DeliveryConfidence,
            name="deliveryconfidence",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=True,
    )
    deviation_reason: Mapped[Optional[str]] = mapped_column(Text)
    follow_up_required: Mapped[bool] = mapped_column(Boolean, default=False)
    department_review_status: Mapped[DeptReviewStatus] = mapped_column(
        SQLEnum(
            DeptReviewStatus,
            name="deptreviewstatus",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        default=DeptReviewStatus.NOT_REVIEWED,
    )
    department_comment: Mapped[Optional[str]] = mapped_column(Text)
    
    # Relationships (explicit joins: varchar keys ↔ UUID PKs)
    session: Mapped["CalendarSession"] = relationship(
        "CalendarSession",
        back_populates="progress",
        primaryjoin=_teacher_progress_session_primaryjoin,
        foreign_keys="TeacherProgress.session_id",
    )
    teacher: Mapped["User"] = relationship(
        "User",
        back_populates="progress_records",
        primaryjoin=_teacher_progress_teacher_primaryjoin,
        foreign_keys="TeacherProgress.teacher_id",
    )