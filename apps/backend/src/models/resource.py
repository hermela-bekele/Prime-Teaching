from pgvector.sqlalchemy import Vector
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database import Base


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    subtopic_id: Mapped[int] = mapped_column(ForeignKey("subtopics.id"), index=True)
    file_url: Mapped[str] = mapped_column(String(512))
    embedding: Mapped[list[float] | None] = mapped_column(Vector(1536), nullable=True)
