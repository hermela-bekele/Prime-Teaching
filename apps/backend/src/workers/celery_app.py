from celery import Celery

from src.core.config import get_settings

settings = get_settings()
celery_app = Celery("prime_eduai", broker=settings.redis_url, backend=settings.redis_url)
