from fastapi import HTTPException, status
from jose import JWTError, jwt

from src.core.config import get_settings


def decode_auth_token(token: str) -> dict:
    settings = get_settings()
    if not settings.supabase_jwt_secret:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="JWT secret not set")

    try:
        payload = jwt.decode(token, settings.supabase_jwt_secret, algorithms=["HS256"])
        return payload
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
