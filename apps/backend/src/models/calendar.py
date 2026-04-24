from sqlalchemy import String, Integer, Date, Boolean, Enum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
from .base import Base, UUIDMixin, TimestampMixin
from .enums import AudienceScope, SequencingMode, GenerationStatus

class CalendarRun(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "calendar_runs"
    
    calendar_run_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    school_id: Mapped[str] = mapped_column(ForeignKey("schools.id", ondelete="CASCADE"))
    subject_id: Mapped[str] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"))
    created_by_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    audience_scope: Mapped[AudienceScope] = mapped_column(Enum(AudienceScope), default=AudienceScope.TEACHER)
    sequencing_mode: Mapped[SequencingMode] = mapped_column(Enum(SequencingMode), default=SequencingMode.TEXTBOOK_ORDER)
    academic_year_label: Mapped[str] = mapped_column(String(50), nullable=False)
    term_structure_note: Mapped[Optional[str]] = mapped_column(Text)
    total_available_sessions: Mapped[int] = mapped_column(Integer, nullable=False)
    planning_start_date: Mapped[Optional[str]] = mapped_column(Date)
    planning_end_date: Mapped[Optional[str]] = mapped_column(Date)
    generation_status: Mapped[GenerationStatus] = mapped_column(Enum(GenerationStatus), default=GenerationStatus.DRAFT)
    approved_by_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # Relationships
    school: Mapped["School"] = relationship("School", back_populates="calendar_runs")
    subject: Mapped["Subject"] = relationship("Subject", back_populates="calendar_runs")
    created_by: Mapped["User"] = relationship("User", foreign_keys=[created_by_id])
    approved_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[approved_by_id])