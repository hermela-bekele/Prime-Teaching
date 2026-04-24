from sqlalchemy import String, Enum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from .base import Base, UUIDMixin, TimestampMixin
from .enums import ApprovalStatus

class ResourceRecommendation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "resource_recommendations"
    
    resource_recommendation_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    subject_id: Mapped[str] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"))
    unit_id: Mapped[str] = mapped_column(ForeignKey("units.id", ondelete="CASCADE"))
    subtopic_id: Mapped[str] = mapped_column(ForeignKey("subtopics.id", ondelete="CASCADE"))
    resource_title: Mapped[str] = mapped_column(String(255), nullable=False)
    resource_provider: Mapped[Optional[str]] = mapped_column(String(255))
    resource_type: Mapped[str] = mapped_column(String(50), default="video")
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    recommended_use_case: Mapped[Optional[str]] = mapped_column(Text)
    audience_level: Mapped[str] = mapped_column(String(20), default="both")
    approval_status: Mapped[ApprovalStatus] = mapped_column(Enum(ApprovalStatus), default=ApprovalStatus.DRAFT)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # Relationships
    subject: Mapped["Subject"] = relationship("Subject", back_populates="resource_recommendations")
    unit: Mapped["Unit"] = relationship("Unit")
    subtopic: Mapped["Subtopic"] = relationship("Subtopic", back_populates="resource_recommendations")