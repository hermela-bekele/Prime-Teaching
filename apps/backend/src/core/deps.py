from fastapi import Depends, Header, HTTPException, status

from src.core.security import decode_auth_token


def get_current_user(authorization: str = Header(default="")) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    token = authorization.removeprefix("Bearer ").strip()
    return decode_auth_token(token)


CurrentUser = Depends(get_current_user)
