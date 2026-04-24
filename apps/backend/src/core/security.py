from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import HTTPException, status
from jose import JWTError, jwt

from src.core.config import get_settings, jwt_signing_secret


def verify_password(plain_password: str, password_hash: str) -> bool:
    """Check password against a bcrypt hash (compatible with `bcrypt` and seed_data.py)."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            password_hash.encode("utf-8"),
        )
    except (ValueError, AttributeError):
        return False


def hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def create_access_token(
    *,
    user_id: str,
    email: str,
    name: str,
    role: str,
    school_id: str,
    expires_delta: timedelta | None = None,
) -> str:
    settings = get_settings()
    secret = jwt_signing_secret(settings)
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=7))
    payload = {
        "id": str(user_id),
        "email": email,
        "name": name,
        "role": role,
        "school_id": str(school_id) if school_id is not None else None,
        "exp": expire,
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def decode_auth_token(token: str) -> dict:
    settings = get_settings()
    secret = jwt_signing_secret(settings)
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
