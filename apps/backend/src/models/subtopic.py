from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database import Base


class Subtopic(Base):
    __tablename__ = "subtopics"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), index=True)
    unit_id: Mapped[int] = mapped_column(ForeignKey("units.id"), index=True)
