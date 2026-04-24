from __future__ import annotations

import logging
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user, role_str
from src.core.database import get_db
from src.core.security import create_access_token, hash_password, verify_password
from src.models.enums import ActiveStatus, SchoolType, UserRole, VisibilityScope
from src.models.school import School
from src.models.user import User
from src.schemas.auth import LoginRequest, MeResponse, RegisterRequest, RegisterResponse, TokenResponse, UserResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Authentication"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


def _user_to_response(user: User) -> UserResponse:
    r = user.role.value if isinstance(user.role, UserRole) else str(user.role)
    return UserResponse(
        id=str(user.id),
        user_id=user.user_id,
        full_name=user.full_name,
        name=user.full_name,
        email=user.email,
        role=r,
        school_id=str(user.school_id),
        department_name=user.department_name,
    )


def _parse_user_role(raw: str) -> UserRole:
    key = raw.strip().lower().replace("-", "_")
    for ur in UserRole:
        if ur.value == key:
            return ur
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=f"Invalid role. Use one of: {', '.join(r.value for r in UserRole)}",
    )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: DbSession) -> TokenResponse:
    try:
        email_norm = str(request.email).lower().strip()
        result = await db.execute(select(User).where(User.email == email_norm))
        user = result.scalar_one_or_none()
        if user is None or not verify_password(request.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
        if user.active_status != ActiveStatus.ACTIVE:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active")

        role_val = role_str(user)
        token = create_access_token(
            user_id=user.id,
            email=user.email,
            name=user.full_name,
            role=role_val,
            school_id=user.school_id,
        )
        return TokenResponse(access_token=token, user=_user_to_response(user))
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("login failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Login failed") from exc


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: DbSession) -> RegisterResponse:
    try:
        email_norm = str(request.email).lower().strip()
        existing = await db.execute(select(User).where(User.email == email_norm))
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        school: School | None = None
        if request.school_id:
            school = await db.get(School, request.school_id)
            if school is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid school_id")
        else:
            school_label = (request.school_name or "My school").strip() or "My school"
            school = School(
                school_id=f"SCH-{uuid.uuid4().hex[:10]}",
                name=school_label,
                type=SchoolType.PRIVATE,
                country="Ethiopia",
                status="active",
            )
            db.add(school)
            await db.flush()

        role = _parse_user_role(request.role)
        if role in (UserRole.DEPARTMENT_HEAD,) and not (request.department_name or "").strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="department_name is required for department_head",
            )

        user = User(
            user_id=f"USR-{uuid.uuid4().hex[:12]}",
            full_name=request.full_name.strip(),
            email=email_norm,
            password_hash=hash_password(request.password),
            role=role,
            school_id=school.id,
            department_name=(request.department_name or None),
            active_status=ActiveStatus.ACTIVE,
            visibility_scope=VisibilityScope.OWN_RECORDS,
        )
        db.add(user)
        await db.flush()
        return RegisterResponse(
            user_id=user.user_id,
            email=user.email,
            full_name=user.full_name,
            role=role_str(user),
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("register failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Registration failed") from exc


@router.get("/me", response_model=MeResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> MeResponse:
    return MeResponse.model_validate(_user_to_response(current_user).model_dump())
