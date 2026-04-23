from fastapi import APIRouter

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("")
async def list_calendars() -> list[dict]:
    return []
