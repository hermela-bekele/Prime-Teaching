from fastapi import APIRouter

router = APIRouter(tags=["schools"])


@router.get("")
async def list_schools() -> list[dict]:
    return []
