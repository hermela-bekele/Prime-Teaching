from sqlalchemy import String, Integer, Text, Enum, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
from .base import Base, UUIDMixin, TimestampMixin
from .enums import AssessmentType, DifficultyLevel

class Assessment(Base, UUIDMixin):
    __tablename__ = "assessments"
    
    assessment_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    subject_id: Mapped[str] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"))
    unit_id: Mapped[str] = mapped_column(ForeignKey("units.id", ondelete="CASCADE"))
    subtopic_id: Mapped[Optional[str]] = mapped_column(ForeignKey("subtopics.id", ondelete="SET NULL"))
    session_id: Mapped[Optional[str]] = mapped_column(ForeignKey("calendar_sessions.id", ondelete="SET NULL"))
    assessment_type: Mapped[AssessmentType] = mapped_column(Enum(AssessmentType), default=AssessmentType.QUIZ)
    teacher_owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    generation_version: Mapped[int] = mapped_column(Integer, default=1)
    question_format_mix: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list)
    question_set: Mapped[Optional[str]] = mapped_column(Text)
    answer_key: Mapped[Optional[str]] = mapped_column(Text)
    marking_guide: Mapped[Optional[str]] = mapped_column(Text)
    estimated_duration_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    difficulty_level: Mapped[DifficultyLevel] = mapped_column(Enum(DifficultyLevel), default=DifficultyLevel.BASIC)
    download_doc_url: Mapped[Optional[str]] = mapped_column(String(500))
    approved_by_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    generated_at: Mapped[Optional[str]] = mapped_column(String)
    
    # Relationships
    subject: Mapped["Subject"] = relationship("Subject", back_populates="assessments")
    unit: Mapped["Unit"] = relationship("Unit", back_populates="assessments")
    subtopic: Mapped[Optional["Subtopic"]] = relationship("Subtopic", back_populates="assessments")
    session: Mapped[Optional["CalendarSession"]] = relationship("CalendarSession")
    teacher_owner: Mapped["User"] = relationship("User", foreign_keys=[teacher_owner_id])
    approved_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[approved_by_id])