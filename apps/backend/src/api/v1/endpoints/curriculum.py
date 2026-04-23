from fastapi import APIRouter

router = APIRouter(prefix="/curriculum", tags=["curriculum"])


@router.get("/subjects")
async def list_subjects() -> list[dict]:
    return []
