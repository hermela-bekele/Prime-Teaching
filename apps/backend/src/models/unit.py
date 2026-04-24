from sqlalchemy import Boolean, Enum as SQLEnum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
from .base import Base, UUIDMixin, TimestampMixin
from .enums import StreamType

class Unit(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "units"
    
    unit_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    subject_id: Mapped[str] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"))
    unit_number: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    stream_type: Mapped[StreamType] = mapped_column(
        SQLEnum(StreamType, values_callable=lambda obj: [e.value for e in obj]),
        default=StreamType.CORE,
    )
    textbook_start_page: Mapped[Optional[int]] = mapped_column(Integer)
    textbook_end_page: Mapped[Optional[int]] = mapped_column(Integer)
    default_priority_order: Mapped[Optional[int]] = mapped_column(Integer)
    recommended_total_sessions: Mapped[Optional[int]] = mapped_column(Integer)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    notes: Mapped[Optional[str]] = mapped_column(String)
    
    # Relationships
    subject: Mapped["Subject"] = relationship("Subject", back_populates="units")
    subtopics: Mapped[List["Subtopic"]] = relationship("Subtopic", back_populates="unit", cascade="all, delete-orphan")
    calendar_sessions: Mapped[List["CalendarSession"]] = relationship("CalendarSession", back_populates="unit")
    assessments: Mapped[List["Assessment"]] = relationship("Assessment", back_populates="unit")