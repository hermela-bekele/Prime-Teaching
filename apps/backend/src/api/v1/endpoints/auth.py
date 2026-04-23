from fastapi import APIRouter, Depends

from src.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me")
async def me(user: dict = Depends(get_current_user)) -> dict:
    return user
