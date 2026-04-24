from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user, role_str
from src.core.database import get_db
from src.models.ai_job import AiJob
from src.models.enums import JobStatus, JobType, UserRole
from src.models.session import CalendarSession
from src.models.subject import Subject
from src.models.user import User
from src.schemas.generation import (
    AssessmentGenerationRequest,
    CalendarGenerationRequest,
    GenerationJobQueuedResponse,
    GenerationJobResponse,
    LessonPlanGenerationRequest,
    TeachingNoteGenerationRequest,
)
from src.services.ids import new_job_id

logger = logging.getLogger(__name__)

router = APIRouter(tags=["AI Generation"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


async def _resolve_session_local(db: AsyncSession, session_id: str) -> CalendarSession | None:
    s = await db.get(CalendarSession, session_id)
    if s:
        return s
    r = await db.execute(select(CalendarSession).where(CalendarSession.session_id == session_id))
    return r.scalar_one_or_none()


async def _resolve_subject_pk(db: AsyncSession, subject_id: str) -> str | None:
    s = await db.get(Subject, subject_id)
    if s:
        return s.id
    r = await db.execute(select(Subject).where(Subject.subject_id == subject_id))
    row = r.scalar_one_or_none()
    return row.id if row else None


def _dispatch_calendar(job_pk: str) -> None:
    try:
        from src.workers.tasks.generation_tasks import run_calendar_generation

        run_calendar_generation.delay(job_pk)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Celery calendar task not dispatched (broker down or import error): %s", exc)


def _dispatch_lesson(job_pk: str) -> None:
    try:
        from src.workers.tasks.generation_tasks import run_lesson_plan_generation

        run_lesson_plan_generation.delay(job_pk)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Celery lesson task not dispatched: %s", exc)


def _dispatch_note(job_pk: str) -> None:
    try:
        from src.workers.tasks.generation_tasks import run_teaching_note_generation

        run_teaching_note_generation.delay(job_pk)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Celery teaching note task not dispatched: %s", exc)


def _dispatch_assessment(job_pk: str) -> None:
    try:
        from src.workers.tasks.generation_tasks import run_assessment_generation

        run_assessment_generation.delay(job_pk)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Celery assessment task not dispatched: %s", exc)


@router.post("/calendar", response_model=GenerationJobQueuedResponse)
async def generate_calendar(
    request: CalendarGenerationRequest,
    db: DbSession,
    current_user: User = Depends(get_current_user),
) -> GenerationJobQueuedResponse:
    try:
        subj_pk = await _resolve_subject_pk(db, request.subject_id)
        job = AiJob(
            job_id=new_job_id(),
            job_type=JobType.CALENDAR_GENERATION,
            triggered_by_user_id=current_user.id,
            related_subject_id=subj_pk,
            status=JobStatus.QUEUED,
            input_payload_summary=f"sequencing={request.sequencing_mode},sessions={request.total_available_sessions}",
            requested_at=datetime.now(timezone.utc).isoformat(),
        )
        db.add(job)
        await db.flush()
        _dispatch_calendar(job.id)
        return GenerationJobQueuedResponse(job_id=job.job_id, status="queued")
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("generate_calendar failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to queue job") from exc


@router.post("/lesson-plan", response_model=GenerationJobQueuedResponse)
async def generate_lesson_plan(
    request: LessonPlanGenerationRequest,
    db: DbSession,
    current_user: User = Depends(get_current_user),
) -> GenerationJobQueuedResponse:
    try:
        sess = await _resolve_session_local(db, request.session_id)
        sess_pk = sess.id if sess else None
        job = AiJob(
            job_id=new_job_id(),
            job_type=JobType.LESSON_PLAN_GENERATION,
            triggered_by_user_id=current_user.id,
            related_session_id=sess_pk,
            status=JobStatus.QUEUED,
            input_payload_summary=f"session_id={request.session_id}",
            requested_at=datetime.now(timezone.utc).isoformat(),
        )
        db.add(job)
        await db.flush()
        _dispatch_lesson(job.id)
        return GenerationJobQueuedResponse(job_id=job.job_id, status="queued")
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("generate_lesson_plan failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to queue job") from exc


@router.post("/teaching-note", response_model=GenerationJobQueuedResponse)
async def generate_teaching_note(
    request: TeachingNoteGenerationRequest,
    db: DbSession,
    current_user: User = Depends(get_current_user),
) -> GenerationJobQueuedResponse:
    try:
        job = AiJob(
            job_id=new_job_id(),
            job_type=JobType.TEACHING_NOTE_GENERATION,
            triggered_by_user_id=current_user.id,
            status=JobStatus.QUEUED,
            input_payload_summary=f"lesson_plan_id={request.lesson_plan_id}",
            requested_at=datetime.now(timezone.utc).isoformat(),
        )
        db.add(job)
        await db.flush()
        _dispatch_note(job.id)
        return GenerationJobQueuedResponse(job_id=job.job_id, status="queued")
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("generate_teaching_note failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to queue job") from exc


@router.post("/assessment", response_model=GenerationJobQueuedResponse)
async def generate_assessment(
    request: AssessmentGenerationRequest,
    db: DbSession,
    current_user: User = Depends(get_current_user),
) -> GenerationJobQueuedResponse:
    try:
        sess = await _resolve_session_local(db, request.session_id)
        sess_pk = sess.id if sess else None
        job = AiJob(
            job_id=new_job_id(),
            job_type=JobType.ASSESSMENT_GENERATION,
            triggered_by_user_id=current_user.id,
            related_session_id=sess_pk,
            status=JobStatus.QUEUED,
            input_payload_summary=f"type={request.assessment_type},session={request.session_id}",
            requested_at=datetime.now(timezone.utc).isoformat(),
        )
        db.add(job)
        await db.flush()
        _dispatch_assessment(job.id)
        return GenerationJobQueuedResponse(job_id=job.job_id, status="queued")
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("generate_assessment failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to queue job") from exc


@router.get("/jobs/{job_id}", response_model=GenerationJobResponse)
async def get_job_status(
    job_id: str,
    db: DbSession,
    current_user: User = Depends(get_current_user),
) -> GenerationJobResponse:
    try:
        r = await db.execute(select(AiJob).where(AiJob.job_id == job_id))
        job = r.scalar_one_or_none()
        if job is None:
            r2 = await db.execute(select(AiJob).where(AiJob.id == job_id))
            job = r2.scalar_one_or_none()
        if job is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
        if job.triggered_by_user_id != current_user.id and role_str(current_user) != UserRole.ADMIN.value:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to view this job")
        return GenerationJobResponse(
            job_id=job.job_id,
            status=job.status.value if hasattr(job.status, "value") else str(job.status),
            output_record_id=job.output_record_id,
            error_log=job.error_log,
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("get_job_status failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to load job") from exc
