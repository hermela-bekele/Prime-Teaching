from fastapi import APIRouter

router = APIRouter(tags=["users"])


@router.get("")
async def list_users() -> list[dict]:
    return []
