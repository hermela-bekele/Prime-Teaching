from pydantic import BaseModel


class ProgressCreate(BaseModel):
    user_id: str
    subtopic_id: int
    score: float
