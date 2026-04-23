from pydantic import BaseModel


class SubjectCreate(BaseModel):
    name: str
    school_id: int


class UnitCreate(BaseModel):
    title: str
    subject_id: int
