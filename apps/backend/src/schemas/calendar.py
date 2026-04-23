from datetime import date

from pydantic import BaseModel


class CalendarCreate(BaseModel):
    school_id: int
    start_date: date
    end_date: date
