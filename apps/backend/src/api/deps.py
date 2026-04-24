"""FastAPI dependencies: JWT auth, DB user loading, role checks."""
from __future__ import annotations

import logging
from typing import Callable, Iterable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import get_settings, jwt_signing_secret
from src.core.database import get_db
from src.models.enums import ActiveStatus, UserRole
from src.models.user import User

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)


async def _user_from_token_payload(payload: dict, db: AsyncSession) -> User:
    uid = str(payload.get("id") or payload.get("sub") or "").strip()
    if not uid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if user.active_status != ActiveStatus.ACTIVE:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active")
    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = credentials.credentials.strip()
    settings = get_settings()
    secret = jwt_signing_secret(settings)
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
    except JWTError as exc:
        logger.debug("JWT decode failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc
    return await _user_from_token_payload(payload, db)


def require_roles(*allowed_roles: str) -> Callable[..., User]:
    """Dependency factory: only listed role values (e.g. teacher, department_head) may access."""

    allowed = frozenset(allowed_roles)

    async def role_checker(user: User = Depends(get_current_user)) -> User:
        role_val = user.role.value if isinstance(user.role, UserRole) else str(user.role)
        if role_val not in allowed:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return role_checker


def role_str(user: User) -> str:
    return user.role.value if isinstance(user.role, UserRole) else str(user.role)


__all__ = ["get_current_user", "require_roles", "role_str", "security"]
