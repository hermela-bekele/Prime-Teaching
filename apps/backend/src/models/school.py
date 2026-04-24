from sqlalchemy import Enum as SQLEnum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
from .base import Base, UUIDMixin, TimestampMixin
from .enums import SchoolType

class School(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "schools"
    
    school_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[Optional[str]] = mapped_column(String(50))
    # PostgreSQL enum type name is ``school_type`` (values: private, public, pilot, other)
    type: Mapped[SchoolType] = mapped_column(
        SQLEnum(SchoolType, name="school_type", values_callable=lambda obj: [e.value for e in obj]),
        default=SchoolType.PRIVATE,
    )
    country: Mapped[str] = mapped_column(String(100), default="Ethiopia")
    region_city: Mapped[Optional[str]] = mapped_column(String(255))
    # Many deployments store status as plain VARCHAR (e.g. active / pilot), not a PG enum.
    status: Mapped[str] = mapped_column(String(50), default="active")
    notes: Mapped[Optional[str]] = mapped_column(String)
    
    # Relationships
    users: Mapped[List["User"]] = relationship("User", back_populates="school", cascade="all, delete-orphan")
    resources: Mapped[List["Resource"]] = relationship("Resource", back_populates="school")
    calendar_runs: Mapped[List["CalendarRun"]] = relationship("CalendarRun", back_populates="school")