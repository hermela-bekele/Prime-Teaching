from pydantic import BaseModel, EmailStr


class GenerateContentRequest(BaseModel):
    prompt: str
    requester_email: EmailStr
    role: str


class GenerationJobResponse(BaseModel):
    job_id: str
    status: str = "queued"
