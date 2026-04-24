from sqlalchemy import Boolean, Enum as SQLEnum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
from .base import Base, UUIDMixin, TimestampMixin
from .enums import GradeLevel, StreamType

class Subject(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "subjects"
    
    subject_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    grade_level: Mapped[GradeLevel] = mapped_column(
        SQLEnum(GradeLevel, values_callable=lambda obj: [e.value for e in obj]),
        default=GradeLevel.GRADE_11,
    )
    stream_type: Mapped[StreamType] = mapped_column(
        SQLEnum(StreamType, values_callable=lambda obj: [e.value for e in obj]),
        default=StreamType.CORE,
    )
    curriculum_version: Mapped[Optional[str]] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    notes: Mapped[Optional[str]] = mapped_column(String)
    
    # Relationships
    units: Mapped[List["Unit"]] = relationship("Unit", back_populates="subject", cascade="all, delete-orphan")
    resources: Mapped[List["Resource"]] = relationship("Resource", back_populates="subject")
    calendar_runs: Mapped[List["CalendarRun"]] = relationship("CalendarRun", back_populates="subject")
    assessments: Mapped[List["Assessment"]] = relationship("Assessment", back_populates="subject")
    resource_recommendations: Mapped[List["ResourceRecommendation"]] = relationship("ResourceRecommendation", back_populates="subject")