from fastapi import APIRouter

router = APIRouter(prefix="/schools", tags=["schools"])


@router.get("")
async def list_schools() -> list[dict]:
    return []
