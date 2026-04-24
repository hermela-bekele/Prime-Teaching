from __future__ import annotations

from pydantic import AliasChoices, BaseModel, ConfigDict, EmailStr, Field, model_validator


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(
        min_length=1,
        description="Display name",
        validation_alias=AliasChoices("full_name", "name"),
    )
    role: str = Field(default="teacher", description="teacher | department_head | school_leader | admin")
    school_id: str | None = None
    department_name: str | None = None
    school_name: str | None = Field(default=None, description="Legacy: create a school when school_id is omitted")

    @model_validator(mode="after")
    def require_school_reference(self) -> RegisterRequest:
        if not self.school_id and not (self.school_name and str(self.school_name).strip()):
            raise ValueError("Provide school_id or school_name")
        return self


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    full_name: str
    name: str
    email: str
    role: str
    school_id: str
    department_name: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class RegisterResponse(BaseModel):
    user_id: str
    email: str
    full_name: str
    role: str


class MeResponse(UserResponse):
    """Same shape as ``UserResponse`` for GET /auth/me."""

    pass
