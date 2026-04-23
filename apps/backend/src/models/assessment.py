from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    subtopic_id: Mapped[int] = mapped_column(ForeignKey("subtopics.id"), index=True)
    assessment_type: Mapped[str] = mapped_column(String(50))
    content: Mapped[str] = mapped_column(Text)
