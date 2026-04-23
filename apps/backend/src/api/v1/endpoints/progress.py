from fastapi import APIRouter

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("")
async def list_progress() -> list[dict]:
    return []
