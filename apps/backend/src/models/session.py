from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database import Base


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    calendar_id: Mapped[int] = mapped_column(ForeignKey("calendars.id"), index=True)
    label: Mapped[str] = mapped_column(String(100))
    date: Mapped[Date] = mapped_column(Date)
