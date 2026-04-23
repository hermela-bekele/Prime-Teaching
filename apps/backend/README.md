# PRIME EduAI Backend

FastAPI service with:

- PostgreSQL + pgvector via SQLAlchemy
- Celery + Redis worker queue
- OpenAI + LangChain integration
- Auth wiring prepared for Supabase JWT verification

## Structure

- Source code is under `src/`
- API entry point: `src/main.py`
- Celery app: `src/workers/celery_app.py`
- Versioned API routes: `src/api/v1/endpoints/`
