"""Celery tasks that advance AI job rows (stubs until full LLM pipelines are wired)."""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

from sqlalchemy import select

from src.core.database import AsyncSessionLocal
from src.models.ai_job import AiJob
from src.models.enums import JobStatus
from src.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


async def _update_job(
    job_pk: str,
    *,
    status: JobStatus,
    output_record_id: str | None = None,
    error_log: str | None = None,
) -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(AiJob).where(AiJob.id == job_pk))
        job = result.scalar_one_or_none()
        if job is None:
            logger.warning("AiJob not found for pk=%s", job_pk)
            return
        job.status = status
        if output_record_id is not None:
            job.output_record_id = output_record_id
        if error_log is not None:
            job.error_log = error_log
        if status in (JobStatus.COMPLETED, JobStatus.FAILED):
            job.completed_at = datetime.now(timezone.utc).isoformat()
        await db.commit()


def _run(coro):
    return asyncio.run(coro)


@celery_app.task(name="src.workers.tasks.generation_tasks.run_calendar_generation", bind=True, max_retries=2)
def run_calendar_generation(self, job_db_id: str) -> None:
    try:
        _run(_update_job(job_db_id, status=JobStatus.PROCESSING))
        # Stub: real implementation would populate calendar_sessions from curriculum.
        _run(_update_job(job_db_id, status=JobStatus.COMPLETED, output_record_id=None))
    except Exception as exc:  # noqa: BLE001
        logger.exception("run_calendar_generation failed")
        try:
            _run(_update_job(job_db_id, status=JobStatus.FAILED, error_log=str(exc)))
        except Exception:  # noqa: BLE001
            logger.exception("failed to persist job failure")
        raise


@celery_app.task(name="src.workers.tasks.generation_tasks.run_lesson_plan_generation", bind=True, max_retries=2)
def run_lesson_plan_generation(self, job_db_id: str) -> None:
    try:
        _run(_update_job(job_db_id, status=JobStatus.PROCESSING))
        _run(_update_job(job_db_id, status=JobStatus.COMPLETED))
    except Exception as exc:  # noqa: BLE001
        logger.exception("run_lesson_plan_generation failed")
        try:
            _run(_update_job(job_db_id, status=JobStatus.FAILED, error_log=str(exc)))
        except Exception:  # noqa: BLE001
            logger.exception("failed to persist job failure")
        raise


@celery_app.task(name="src.workers.tasks.generation_tasks.run_teaching_note_generation", bind=True, max_retries=2)
def run_teaching_note_generation(self, job_db_id: str) -> None:
    try:
        _run(_update_job(job_db_id, status=JobStatus.PROCESSING))
        _run(_update_job(job_db_id, status=JobStatus.COMPLETED))
    except Exception as exc:  # noqa: BLE001
        logger.exception("run_teaching_note_generation failed")
        try:
            _run(_update_job(job_db_id, status=JobStatus.FAILED, error_log=str(exc)))
        except Exception:  # noqa: BLE001
            logger.exception("failed to persist job failure")
        raise


@celery_app.task(name="src.workers.tasks.generation_tasks.run_assessment_generation", bind=True, max_retries=2)
def run_assessment_generation(self, job_db_id: str) -> None:
    try:
        _run(_update_job(job_db_id, status=JobStatus.PROCESSING))
        _run(_update_job(job_db_id, status=JobStatus.COMPLETED))
    except Exception as exc:  # noqa: BLE001
        logger.exception("run_assessment_generation failed")
        try:
            _run(_update_job(job_db_id, status=JobStatus.FAILED, error_log=str(exc)))
        except Exception:  # noqa: BLE001
            logger.exception("failed to persist job failure")
        raise
