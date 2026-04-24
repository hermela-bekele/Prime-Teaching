import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from src.api.v1.router import api_v1_router
from src.core.config import get_settings
from src.core.database import AsyncSessionLocal

settings = get_settings()
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.app_name)

_origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
if _origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_v1_router)


@app.get("/")
async def root() -> dict:
    return {"message": "PRIME Teaching API", "version": "0.1.0", "status": "running"}


@app.get("/health")
async def health_check() -> dict:
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as exc:  # noqa: BLE001
        logger.exception("health check failed")
        return {"status": "unhealthy", "database": str(exc)}
