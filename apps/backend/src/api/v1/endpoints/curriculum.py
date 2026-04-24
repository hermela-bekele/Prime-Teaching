from __future__ import annotations

import logging
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.enums import GradeLevel
from src.models.subject import Subject
from src.models.subtopic import Subtopic
from src.models.unit import Unit
from src.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Curriculum"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


async def _get_subject(db: AsyncSession, subject_id: str) -> Subject | None:
    s = await db.get(Subject, subject_id)
    if s:
        return s
    r = await db.execute(select(Subject).where(Subject.subject_id == subject_id))
    return r.scalar_one_or_none()


async def _get_unit(db: AsyncSession, unit_id: str) -> Unit | None:
    u = await db.get(Unit, unit_id)
    if u:
        return u
    r = await db.execute(select(Unit).where(Unit.unit_id == unit_id))
    return r.scalar_one_or_none()


def _enum_value(v: Any) -> str:
    return v.value if hasattr(v, "value") else str(v)


def _grade_filters(user: User) -> list[GradeLevel] | None:
    raw = user.grade_access
    if not raw:
        return None
    out: list[GradeLevel] = []
    for item in raw:
        key = str(item).strip().lower()
        for g in GradeLevel:
            if g.value == key:
                out.append(g)
                break
    return out or None


@router.get("/subjects")
async def get_subjects(
    db: DbSession,
    current_user: User = Depends(get_current_user),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[dict[str, Any]]:
    try:
        units_sq = (
            select(func.count())
            .select_from(Unit)
            .where(Unit.subject_id == Subject.id, Unit.is_active.is_(True))
            .correlate(Subject)
            .scalar_subquery()
        )
        q = (
            select(Subject, units_sq.label("units_count"))
            .where(Subject.is_active.is_(True))
            .order_by(Subject.name)
            .offset(offset)
            .limit(limit)
        )
        grades = _grade_filters(current_user)
        if grades is not None:
            q = q.where(Subject.grade_level.in_(grades))

        result = await db.execute(q)
        rows = result.all()
        return [
            {
                "id": str(s.id),
                "subject_id": s.subject_id,
                "name": s.name,
                "grade_level": _enum_value(s.grade_level),
                "stream_type": _enum_value(s.stream_type),
                "curriculum_version": s.curriculum_version,
                "units_count": int(uc or 0),
            }
            for s, uc in rows
        ]
    except Exception as exc:  # noqa: BLE001
        logger.exception("get_subjects failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to list subjects") from exc


@router.get("/subjects/{subject_id}/units")
async def get_units(
    subject_id: str,
    db: DbSession,
    current_user: User = Depends(get_current_user),
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[dict[str, Any]]:
    try:
        subject = await _get_subject(db, subject_id)
        if subject is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")

        subtopics_sq = (
            select(func.count())
            .select_from(Subtopic)
            .where(Subtopic.unit_id == Unit.id)
            .correlate(Unit)
            .scalar_subquery()
        )
        q = (
            select(Unit, subtopics_sq.label("subtopics_count"))
            .where(Unit.subject_id == subject.id, Unit.is_active.is_(True))
            .order_by(Unit.unit_number)
            .offset(offset)
            .limit(limit)
        )
        result = await db.execute(q)
        return [
            {
                "id": str(u.id),
                "unit_id": u.unit_id,
                "unit_number": u.unit_number,
                "title": u.title,
                "stream_type": _enum_value(u.stream_type),
                "recommended_total_sessions": u.recommended_total_sessions,
                "subtopics_count": int(sc or 0),
            }
            for u, sc in result.all()
        ]
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("get_units failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to list units") from exc


@router.get("/units/{unit_id}/subtopics")
async def get_subtopics(
    unit_id: str,
    db: DbSession,
    current_user: User = Depends(get_current_user),
    limit: int = Query(default=200, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> list[dict[str, Any]]:
    try:
        unit = await _get_unit(db, unit_id)
        if unit is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found")

        q = (
            select(Subtopic)
            .where(Subtopic.unit_id == unit.id)
            .order_by(Subtopic.subtopic_number)
            .offset(offset)
            .limit(limit)
        )
        result = await db.execute(q)
        rows = result.scalars().all()
        return [
            {
                "id": str(st.id),
                "subtopic_id": st.subtopic_id,
                "subtopic_number": st.subtopic_number,
                "title": st.title,
                "difficulty_level": _enum_value(st.difficulty_level),
                "recommended_sessions": st.recommended_sessions,
                # ``calendar_sessions.subtopic_id`` is absent in minimal schemas; keep API field at 0.
                "sessions_count": 0,
            }
            for st in rows
        ]
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("get_subtopics failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to list subtopics") from exc
