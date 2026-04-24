from __future__ import annotations

import logging
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.assessment import Assessment
from src.models.enums import AssessmentType, JobStatus, JobType
from src.models.user import User
from src.schemas.assessments import QuizGenerationRequest
from src.schemas.generation import GenerationJobQueuedResponse
from src.services.ids import new_job_id

from .calendar import _resolve_session, _user_can_access_session
from .generation import _dispatch_assessment

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Assessments"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


def _enum_value(v: Any) -> str:
    return v.value if hasattr(v, "value") else str(v)


def _parse_assessment_type(raw: str | None) -> AssessmentType | None:
    if not raw:
        return None
    key = raw.strip().lower()
    for at in AssessmentType:
        if at.value == key:
            return at
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=f"Invalid assessment_type. Use one of: {', '.join(a.value for a in AssessmentType)}",
    )


def _assessment_to_dict(a: Assessment) -> dict[str, Any]:
    return {
        "id": str(a.id),
        "assessment_id": a.assessment_id,
        "session_id": a.session_id,
        "assessment_type": _enum_value(a.assessment_type),
        "subject_id": a.subject_id,
        "unit_id": a.unit_id,
        "subtopic_id": a.subtopic_id,
        "question_set": a.question_set,
        "answer_key": a.answer_key,
        "marking_guide": a.marking_guide,
        "estimated_duration_minutes": a.estimated_duration_minutes,
        "difficulty_level": _enum_value(a.difficulty_level),
        "download_doc_url": a.download_doc_url,
        "generated_at": a.generated_at,
    }


@router.get("/session/{session_id}")
async def get_assessment_by_session(
    session_id: str,
    db: DbSession,
    current_user: User = Depends(get_current_user),
    assessment_type: str | None = None,
) -> list[dict[str, Any]]:
    try:
        session = await _resolve_session(db, session_id)
        if session is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        if not await _user_can_access_session(db, current_user, session):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

        at = _parse_assessment_type(assessment_type)
        q = select(Assessment).where(Assessment.session_id == session.id)
        if at is not None:
            q = q.where(Assessment.assessment_type == at)
        result = await db.execute(q)
        rows = result.scalars().all()
        return [_assessment_to_dict(a) for a in rows]
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("get_assessment_by_session failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to list assessments") from exc


@router.post("/generate", response_model=GenerationJobQueuedResponse)
async def generate_quiz(
    request: QuizGenerationRequest,
    db: DbSession,
    current_user: User = Depends(get_current_user),
) -> GenerationJobQueuedResponse:
    try:
        from datetime import datetime, timezone

        from src.models.ai_job import AiJob

        session = await _resolve_session(db, request.session_id)
        if session is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        if not await _user_can_access_session(db, current_user, session):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

        job = AiJob(
            job_id=new_job_id(),
            job_type=JobType.ASSESSMENT_GENERATION,
            triggered_by_user_id=current_user.id,
            related_session_id=session.id,
            status=JobStatus.QUEUED,
            input_payload_summary=f"quiz_generate type={request.assessment_type}",
            requested_at=datetime.now(timezone.utc).isoformat(),
        )
        db.add(job)
        await db.flush()
        _dispatch_assessment(job.id)
        return GenerationJobQueuedResponse(job_id=job.job_id, status="queued")
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("generate_quiz failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to queue generation") from exc
