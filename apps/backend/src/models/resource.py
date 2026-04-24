from sqlalchemy import String, Boolean, Enum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from .base import Base, UUIDMixin, TimestampMixin
from .enums import ResourceType, ResourceScope, ApprovalStatus, SequencingMode

class Resource(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "resources"
    
    resource_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    subject_id: Mapped[str] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"))
    school_id: Mapped[Optional[str]] = mapped_column(ForeignKey("schools.id", ondelete="SET NULL"))
    resource_type: Mapped[ResourceType] = mapped_column(Enum(ResourceType), default=ResourceType.TEXTBOOK)
    file_attachment: Mapped[Optional[str]] = mapped_column(String(500))
    external_url: Mapped[Optional[str]] = mapped_column(String(500))
    resource_scope: Mapped[ResourceScope] = mapped_column(Enum(ResourceScope), default=ResourceScope.GLOBAL)
    uploaded_by_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    approved_by_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    approval_status: Mapped[ApprovalStatus] = mapped_column(Enum(ApprovalStatus), default=ApprovalStatus.PENDING)
    approved_for_ai_use: Mapped[bool] = mapped_column(Boolean, default=False)
    sequencing_mode_default: Mapped[SequencingMode] = mapped_column(Enum(SequencingMode), default=SequencingMode.TEXTBOOK_ORDER)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # Relationships
    subject: Mapped["Subject"] = relationship("Subject", back_populates="resources")
    school: Mapped[Optional["School"]] = relationship("School", back_populates="resources")
    uploaded_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[uploaded_by_id])
    approved_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[approved_by_id])