from __future__ import annotations

import logging
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.api.deps import get_current_user, require_roles, role_str
from src.core.database import get_db
from src.models.enums import GenerationStatus, UserRole
from src.models.lesson_plan import LessonPlan
from src.models.session import CalendarSession
from src.models.user import User
from src.utils.pdf_export import text_to_pdf_bytes

from .calendar import _user_can_access_session, _resolve_session

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Lesson Plans"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


def _enum_value(v: Any) -> str:
    return v.value if hasattr(v, "value") else str(v)


async def _resolve_lesson_plan(db: AsyncSession, lesson_plan_id: str) -> LessonPlan | None:
    lp = await db.get(LessonPlan, lesson_plan_id)
    if lp:
        return lp
    r = await db.execute(select(LessonPlan).where(LessonPlan.lesson_plan_id == lesson_plan_id))
    return r.scalar_one_or_none()


def _lesson_plan_to_dict(lp: LessonPlan) -> dict[str, Any]:
    return {
        "id": str(lp.id),
        "lesson_plan_id": lp.lesson_plan_id,
        "session_id": lp.session_id,
        "teacher_owner_id": lp.teacher_owner_id,
        "generation_version": lp.generation_version,
        "generation_status": _enum_value(lp.generation_status),
        "lesson_objectives": lp.lesson_objectives,
        "required_prior_knowledge": lp.required_prior_knowledge,
        "lesson_opening": lp.lesson_opening,
        "concept_delivery_steps": lp.concept_delivery_steps,
        "guided_practice": lp.guided_practice,
        "independent_practice": lp.independent_practice,
        "classwork_activities": lp.classwork_activities,
        "homework_assignment": lp.homework_assignment,
        "materials_needed": lp.materials_needed,
        "estimated_duration_minutes": lp.estimated_duration_minutes,
        "download_doc_url": lp.download_doc_url,
        "approved_by_id": lp.approved_by_id,
        "notes": lp.notes,
        "generated_at": lp.generated_at,
    }


@router.get("/session/{session_id}")
async def get_lesson_plan_by_session(
    session_id: str,
    db: DbSession,
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    try:
        session = await _resolve_session(db, session_id)
        if session is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        if not await _user_can_access_session(db, current_user, session):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

        r = await db.execute(select(LessonPlan).where(LessonPlan.session_id == session.id))
        lp = r.scalar_one_or_none()
        if lp is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson plan not found for this session")
        return _lesson_plan_to_dict(lp)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("get_lesson_plan_by_session failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to load lesson plan") from exc


@router.get("/{lesson_plan_id}/download")
async def download_lesson_plan(
    lesson_plan_id: str,
    db: DbSession,
    current_user: User = Depends(get_current_user),
) -> Response:
    try:
        lp = await _resolve_lesson_plan(db, lesson_plan_id)
        if lp is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson plan not found")

        r = await db.execute(
            select(CalendarSession)
            .where(CalendarSession.id == lp.session_id)
            .options(joinedload(CalendarSession.unit))
        )
        session = r.unique().scalar_one_or_none()
        if session is None or not await _user_can_access_session(db, current_user, session):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

        title = f"Lesson Plan — {session.session_title}"
        sections: list[tuple[str, str]] = [
            ("Objectives", lp.lesson_objectives or ""),
            ("Prior knowledge", lp.required_prior_knowledge or ""),
            ("Opening", lp.lesson_opening or ""),
            ("Concept delivery", lp.concept_delivery_steps or ""),
            ("Guided practice", lp.guided_practice or ""),
            ("Independent practice", lp.independent_practice or ""),
            ("Classwork", lp.classwork_activities or ""),
            ("Homework", lp.homework_assignment or ""),
            ("Materials", lp.materials_needed or ""),
        ]
        pdf_bytes = text_to_pdf_bytes(title, sections)
        fname = f"lesson-plan-{lp.lesson_plan_id}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{fname}"'},
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("download_lesson_plan failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to build PDF") from exc


@router.patch("/{lesson_plan_id}/approve")
async def approve_lesson_plan(
    lesson_plan_id: str,
    db: DbSession,
    current_user: User = Depends(
        require_roles(UserRole.DEPARTMENT_HEAD.value, UserRole.SCHOOL_LEADER.value, UserRole.ADMIN.value)
    ),
) -> dict[str, Any]:
    try:
        lp = await _resolve_lesson_plan(db, lesson_plan_id)
        if lp is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson plan not found")

        r = await db.execute(select(CalendarSession).where(CalendarSession.id == lp.session_id))
        session = r.scalar_one_or_none()
        if session is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        if role_str(current_user) != UserRole.ADMIN.value and session.school_owner_id != current_user.school_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to approve for this school")

        lp.generation_status = GenerationStatus.APPROVED
        lp.approved_by_id = current_user.id
        await db.flush()
        return _lesson_plan_to_dict(lp)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("approve_lesson_plan failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to approve") from exc
