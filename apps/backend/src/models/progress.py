from sqlalchemy import Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database import Base


class Progress(Base):
    __tablename__ = "progress"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    subtopic_id: Mapped[int] = mapped_column(ForeignKey("subtopics.id"), index=True)
    score: Mapped[float] = mapped_column(Float)
