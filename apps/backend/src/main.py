from fastapi import FastAPI

from src.api.v1.router import api_v1_router
from src.core.config import get_settings

settings = get_settings()

app = FastAPI(title=settings.app_name)
app.include_router(api_v1_router, prefix=settings.api_prefix)
