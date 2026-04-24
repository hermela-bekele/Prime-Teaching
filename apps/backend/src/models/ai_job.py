from sqlalchemy import String, Enum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from .base import Base, UUIDMixin, TimestampMixin
from .enums import JobType, JobStatus

class AiJob(Base, UUIDMixin):
    __tablename__ = "ai_jobs"
    
    job_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    job_type: Mapped[JobType] = mapped_column(Enum(JobType), nullable=False)
    triggered_by_user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    related_subject_id: Mapped[Optional[str]] = mapped_column(ForeignKey("subjects.id", ondelete="SET NULL"))
    related_unit_id: Mapped[Optional[str]] = mapped_column(ForeignKey("units.id", ondelete="SET NULL"))
    related_subtopic_id: Mapped[Optional[str]] = mapped_column(ForeignKey("subtopics.id", ondelete="SET NULL"))
    related_session_id: Mapped[Optional[str]] = mapped_column(ForeignKey("calendar_sessions.id", ondelete="SET NULL"))
    status: Mapped[JobStatus] = mapped_column(Enum(JobStatus), default=JobStatus.QUEUED)
    input_payload_summary: Mapped[Optional[str]] = mapped_column(Text)
    output_record_id: Mapped[Optional[str]] = mapped_column(String(100))
    error_log: Mapped[Optional[str]] = mapped_column(Text)
    requested_at: Mapped[str] = mapped_column(String)
    completed_at: Mapped[Optional[str]] = mapped_column(String)
    
    # Relationships
    triggered_by_user: Mapped["User"] = relationship("User", back_populates="ai_jobs")
    related_subject: Mapped[Optional["Subject"]] = relationship("Subject")
    related_unit: Mapped[Optional["Unit"]] = relationship("Unit")
    related_subtopic: Mapped[Optional["Subtopic"]] = relationship("Subtopic")
    related_session: Mapped[Optional["CalendarSession"]] = relationship("CalendarSession")