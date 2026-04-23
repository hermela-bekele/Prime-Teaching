from pydantic import BaseModel, EmailStr


class AuthUser(BaseModel):
    id: str
    email: EmailStr
    role: str
