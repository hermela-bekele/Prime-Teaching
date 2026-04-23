from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])


@router.get("")
async def list_users() -> list[dict]:
    return []
