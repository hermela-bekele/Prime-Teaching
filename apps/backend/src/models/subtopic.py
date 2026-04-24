from sqlalchemy import Boolean, Column, Enum as SQLEnum, ForeignKey, Integer, String, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
from .base import Base, UUIDMixin, TimestampMixin
from .enums import DifficultyLevel

# Association table for prerequisites
subtopic_prerequisites = Table(
    "subtopics_prerequisites",
    Base.metadata,
    Column("subtopic_id", ForeignKey("subtopics.id", ondelete="CASCADE"), primary_key=True),
    Column("prerequisite_id", ForeignKey("subtopics.id", ondelete="CASCADE"), primary_key=True)
)

class Subtopic(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "subtopics"
    
    subtopic_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    unit_id: Mapped[str] = mapped_column(ForeignKey("units.id", ondelete="CASCADE"))
    subtopic_number: Mapped[str] = mapped_column(String(20), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    textbook_start_page: Mapped[Optional[int]] = mapped_column(Integer)
    textbook_end_page: Mapped[Optional[int]] = mapped_column(Integer)
    difficulty_level: Mapped[DifficultyLevel] = mapped_column(
        SQLEnum(DifficultyLevel, values_callable=lambda obj: [e.value for e in obj]),
        default=DifficultyLevel.FOUNDATIONAL,
    )
    recommended_sessions: Mapped[Optional[int]] = mapped_column(Integer)
    assessment_checkpoint: Mapped[bool] = mapped_column(Boolean, default=False)
    revision_needed_after: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[Optional[str]] = mapped_column(String)
    
    # Relationships
    unit: Mapped["Unit"] = relationship("Unit", back_populates="subtopics")
    assessments: Mapped[List["Assessment"]] = relationship("Assessment", back_populates="subtopic")
    resource_recommendations: Mapped[List["ResourceRecommendation"]] = relationship("ResourceRecommendation", back_populates="subtopic")


# Self-referential M2M must be configured after `Subtopic.__table__` exists (bare `id` in joins
# would otherwise resolve to Python's builtin `id` during class body execution).
Subtopic.prerequisite_subtopics = relationship(
    "Subtopic",
    secondary=subtopic_prerequisites,
    primaryjoin=Subtopic.id == subtopic_prerequisites.c.subtopic_id,
    secondaryjoin=Subtopic.id == subtopic_prerequisites.c.prerequisite_id,
    overlaps="unit,assessments,resource_recommendations",
)