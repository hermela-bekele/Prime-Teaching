from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database import Base


class TeachingNote(Base):
    __tablename__ = "teaching_notes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    lesson_plan_id: Mapped[int] = mapped_column(ForeignKey("lesson_plans.id"), index=True)
    note: Mapped[str] = mapped_column(Text)
