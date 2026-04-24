from sqlalchemy import Enum as SQLEnum
from sqlalchemy import JSON, ForeignKey, String, cast
from sqlalchemy.dialects.postgresql import UUID as PGUUIDType
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
from .base import Base, UUIDMixin, TimestampMixin
from .enums import UserRole, ActiveStatus, VisibilityScope


def _user_teacher_progress_primaryjoin():
    """VARCHAR ``teacher_progress.teacher_id`` vs UUID ``users.id`` (no FK in DB)."""
    from .progress import TeacherProgress

    return User.id == cast(TeacherProgress.teacher_id, PGUUIDType(as_uuid=False))


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"
    
    user_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(
            UserRole,
            name="user_role",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        default=UserRole.TEACHER,
    )
    school_id: Mapped[str] = mapped_column(ForeignKey("schools.id", ondelete="CASCADE"))
    department_name: Mapped[Optional[str]] = mapped_column(String(255))
    grade_access: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list)
    subject_access: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list)
    stream_access: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list)
    active_status: Mapped[ActiveStatus] = mapped_column(
        SQLEnum(
            ActiveStatus,
            name="active_status",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        default=ActiveStatus.ACTIVE,
    )
    visibility_scope: Mapped[VisibilityScope] = mapped_column(
        SQLEnum(
            VisibilityScope,
            name="visibility_scope",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        default=VisibilityScope.OWN_RECORDS,
    )
    last_login_date: Mapped[Optional[str]] = mapped_column(String)
    
    # Relationships (foreign_keys disambiguate multiple FKs from child tables to users.id)
    school: Mapped["School"] = relationship("School", back_populates="users")
    lesson_plans: Mapped[List["LessonPlan"]] = relationship(
        "LessonPlan",
        back_populates="teacher_owner",
        foreign_keys="LessonPlan.teacher_owner_id",
    )
    teaching_notes: Mapped[List["TeachingNote"]] = relationship(
        "TeachingNote",
        back_populates="teacher_owner",
        foreign_keys="TeachingNote.teacher_owner_id",
    )
    assessments: Mapped[List["Assessment"]] = relationship(
        "Assessment",
        back_populates="teacher_owner",
        foreign_keys="Assessment.teacher_owner_id",
    )
    progress_records: Mapped[List["TeacherProgress"]] = relationship(
        "TeacherProgress",
        back_populates="teacher",
        primaryjoin=_user_teacher_progress_primaryjoin,
        foreign_keys="TeacherProgress.teacher_id",
    )
    ai_jobs: Mapped[List["AiJob"]] = relationship("AiJob", back_populates="triggered_by_user")