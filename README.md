# PRIME EduAI Monorepo

This workspace is scaffolded for the requested stack:

- Backend: FastAPI + PostgreSQL/pgvector + LangChain/OpenAI + Celery/Redis
- Frontend web: Next.js 14 (App Router) + shadcn-ready Tailwind setup
- Frontend mobile: React Native (Expo) + Tamagui
- Shared: TypeScript package for schemas/types
- Workspace: Turborepo + pnpm

## 1) Prerequisites

- Node.js 20+ (already present)
- pnpm (install with `corepack enable && corepack prepare pnpm@latest --activate`)
- Python 3.11+ (for FastAPI backend)
- Docker Desktop (for Postgres, Redis, and S3-compatible storage via MinIO)

## 2) Install dependencies

```bash
pnpm install
```

Backend Python deps:

```bash
cd apps/backend
python -m venv .venv
.venv\Scripts\activate
pip install -e ".[dev]"
copy .env.example .env
```

## 3) Start infra services

```bash
docker compose up -d
```

## 4) Run apps

From monorepo root:

```bash
pnpm dev
```

Run backend API (separate terminal):

```bash
cd apps/backend
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

Run Celery worker (separate terminal):

```bash
cd apps/backend
.venv\Scripts\activate
celery -A app.tasks.celery_app:celery_app worker --loglevel=info
```

## 5) Next setup steps

- Add Supabase/Auth0 JWT middleware in FastAPI
- Add S3 client implementation for textbook uploads
- Add Alembic migrations for Postgres schema management
- Initialize shadcn/ui components in `apps/web/src/components/ui`
- Add shared API client package for web/mobile -> backend communication
