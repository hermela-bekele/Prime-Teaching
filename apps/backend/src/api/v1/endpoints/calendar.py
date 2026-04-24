from __future__ import annotations

import logging
import uuid
from datetime import date as DateType
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.api.deps import get_current_user, role_str
from src.core.database import get_db
from src.models.calendar import CalendarRun
from src.models.enums import (
    AudienceScope,
    CompletionStatus,
    DeliveryConfidence,
    GenerationStatus as RunGenerationStatus,
    SequencingMode as ModelSequencingMode,
    SessionStatus,
    UserRole,
)
from src.models.lesson_plan import LessonPlan
from src.models.progress import TeacherProgress
from src.models.session import CalendarSession
from src.models.subject import Subject
from src.models.user import User
from src.schemas.calendar import CalendarRunCreate, CalendarRunCreatedResponse, SessionStatusUpdate
from src.services.ids import new_calendar_run_id, new_progress_id

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Calendar"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


def _enum_value(v: Any) -> str:
    return v.value if hasattr(v, "value") else str(v)


def _split_lines(text: str | None) -> list[str]:
    if not text:
        return []
    return [ln.strip() for ln in text.replace("\r\n", "\n").split("\n") if ln.strip()]


def _serialize_lesson_plan(lp: LessonPlan | None) -> dict[str, Any] | None:
    if lp is None:
        return None
    return {
        "id": str(lp.id),
        "lesson_plan_id": lp.lesson_plan_id,
        "generation_status": _enum_value(lp.generation_status),
        "objectives": _split_lines(lp.lesson_objectives),
        "prior_knowledge": _split_lines(lp.required_prior_knowledge),
        "opening": lp.lesson_opening or "",
        "delivery_steps": _split_lines(lp.concept_delivery_steps),
        "guided_practice": lp.guided_practice or "",
        "independent_practice": lp.independent_practice or "",
        "classwork": lp.classwork_activities or "",
        "homework": lp.homework_assignment or "",
        "materials": _split_lines(lp.materials_needed),
    }


def _materials_for_session(s: CalendarSession) -> list[str]:
    mats: list[str] = []
    if s.requires_lesson_plan:
        mats.append("Lesson Plan")
    if s.requires_teaching_note:
        mats.append("Teaching Note")
    if s.requires_quiz:
        mats.append("Quiz")
    return mats


def _serialize_session_full(s: CalendarSession) -> dict[str, Any]:
    pd = s.planned_date
    planned_iso = pd.isoformat() if hasattr(pd, "isoformat") else str(pd)
    tn = s.teaching_note
    return {
        "id": str(s.id),
        "session_id": s.session_id,
        "session_number_global": s.session_number_global,
        "session_number_in_unit": s.session_number_in_unit,
        "title": s.session_title,
        "learning_goal_summary": s.learning_goal_summary,
        "unit": (
            {
                "id": str(s.unit.id),
                "unit_id": s.unit.unit_id,
                "title": s.unit.title,
                "unit_number": s.unit.unit_number,
            }
            if s.unit
            else None
        ),
        "subtopic": None,
        "planned_date": planned_iso,
        "session_type": _enum_value(s.session_type),
        "status": _enum_value(s.status),
        "materials_required": _materials_for_session(s),
        "lesson_plan": _serialize_lesson_plan(s.lesson_plan),
        "teaching_note": (
            {
                "id": str(tn.id),
                "teaching_note_id": tn.teaching_note_id,
                "generation_status": _enum_value(tn.generation_status),
            }
            if tn
            else None
        ),
        "progress": (
            {
                "id": str(s.progress.id),
                "progress_id": s.progress.progress_id,
                "completion_status": _enum_value(s.progress.completion_status),
                "delivery_confidence": (
                    _enum_value(s.progress.delivery_confidence) if s.progress.delivery_confidence else None
                ),
                "deviation_reason": s.progress.deviation_reason,
                "follow_up_required": bool(s.progress.follow_up_required),
            }
            if s.progress
            else None
        ),
        "teacher_owner_id": str(s.teacher_owner_id),
        "school_owner_id": getattr(s, "school_owner_id", None),
        "notes": getattr(s, "notes", None),
        "session_number": s.session_number_global,
    }


def _parse_session_status(raw: str) -> SessionStatus:
    key = raw.strip().lower()
    for st in SessionStatus:
        if st.value == key:
            return st
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=f"Invalid status. Use one of: {', '.join(s.value for s in SessionStatus)}",
    )


def _parse_status_filter(raw: str | None) -> SessionStatus | None:
    if not raw:
        return None
    return _parse_session_status(raw)


async def _resolve_session(db: AsyncSession, session_id: str) -> CalendarSession | None:
    s = await db.get(CalendarSession, session_id)
    if s:
        return s
    r = await db.execute(select(CalendarSession).where(CalendarSession.session_id == session_id))
    return r.scalar_one_or_none()


async def _resolve_subject(db: AsyncSession, subject_id: str) -> Subject | None:
    s = await db.get(Subject, subject_id)
    if s:
        return s
    r = await db.execute(select(Subject).where(Subject.subject_id == subject_id))
    return r.scalar_one_or_none()


async def _teacher_school_id(db: AsyncSession, teacher_user_id: str) -> str | None:
    owner = await db.get(User, teacher_user_id)
    return str(owner.school_id) if owner else None


async def _user_can_access_session(db: AsyncSession, user: User, session: CalendarSession) -> bool:
    role = role_str(user)
    if role == UserRole.TEACHER.value:
        return str(session.teacher_owner_id) == str(user.id)
    if role in (UserRole.SCHOOL_LEADER.value, UserRole.ADMIN.value):
        if role == UserRole.ADMIN.value:
            return True
        tschool = await _teacher_school_id(db, session.teacher_owner_id)
        return tschool is not None and tschool == str(user.school_id)
    if role == UserRole.DEPARTMENT_HEAD.value:
        owner = await db.get(User, session.teacher_owner_id)
        if owner is None or str(owner.school_id) != str(user.school_id):
            return False
        ud = (user.department_name or "").strip().lower()
        od = (owner.department_name or "").strip().lower()
        return bool(ud) and ud == od
    return False


def _my_sessions_query(user: User):
    role = role_str(user)
    if role == UserRole.TEACHER.value:
        return select(CalendarSession).where(CalendarSession.teacher_owner_id == user.id)
    if role == UserRole.DEPARTMENT_HEAD.value:
        dept = user.department_name
        conds = [User.school_id == user.school_id]
        if dept:
            conds.append(User.department_name == dept)
        return select(CalendarSession).join(User, CalendarSession.teacher_owner_id == User.id).where(*conds)
    # school_leader / admin: all sessions whose teacher belongs to the same school
    return (
        select(CalendarSession)
        .join(User, CalendarSession.teacher_owner_id == User.id)
        .where(User.school_id == user.school_id)
    )


def _completion_for_session_status(st: SessionStatus) -> CompletionStatus:
    if st == SessionStatus.DELIVERED:
        return CompletionStatus.COMPLETED
    if st == SessionStatus.MISSED:
        return CompletionStatus.MISSED
    if st == SessionStatus.RESCHEDULED:
        return CompletionStatus.RESCHEDULED
    return CompletionStatus.NOT_STARTED


async def _upsert_progress_for_session(
    db: AsyncSession,
    session: CalendarSession,
    *,
    session_status: SessionStatus,
    actual_delivery_date: DateType | None,
    notes: str | None,
) -> None:
    teacher_id = session.teacher_owner_id
    r = await db.execute(select(TeacherProgress).where(TeacherProgress.session_id == session.id))
    prog = r.scalar_one_or_none()
    completion = _completion_for_session_status(session_status)
    conf: DeliveryConfidence | None = None
    if session_status == SessionStatus.DELIVERED:
        conf = DeliveryConfidence.HIGH

    if prog is None:
        prog = TeacherProgress(
            progress_id=new_progress_id(),
            session_id=session.id,
            teacher_id=teacher_id,
            completion_status=completion,
            delivery_confidence=conf,
            deviation_reason=notes,
            actual_delivery_date=actual_delivery_date,
        )
        db.add(prog)
    else:
        prog.completion_status = completion
        if conf is not None:
            prog.delivery_confidence = conf
        if notes is not None:
            prog.deviation_reason = notes
        if actual_delivery_date is not None:
            prog.actual_delivery_date = actual_delivery_date


@router.get("")
async def list_calendars() -> list[dict]:
    return []


@router.get("/my-sessions")
async def get_my_sessions(
    db: DbSession,
    current_user: User = Depends(get_current_user),
    status: str | None = Query(default=None, description="Filter by session status"),
    from_date: str | None = Query(default=None, description="Planned date lower bound YYYY-MM-DD"),
    to_date: str | None = Query(default=None, description="Planned date upper bound YYYY-MM-DD"),
    date: str | None = Query(default=None, description="Single-day filter (alias for from/to same day)"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[dict[str, Any]]:
    try:
        if date and not from_date and not to_date:
            from_date = to_date = date
        st = _parse_status_filter(status)
        q = _my_sessions_query(current_user).options(
            joinedload(CalendarSession.unit),
            joinedload(CalendarSession.lesson_plan),
            joinedload(CalendarSession.teaching_note),
            joinedload(CalendarSession.progress),
        )
        if st is not None:
            q = q.where(CalendarSession.status == st)
        if from_date:
            try:
                d0 = DateType.fromisoformat(from_date)
            except ValueError as exc:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Invalid from_date, use YYYY-MM-DD",
                ) from exc
            q = q.where(CalendarSession.planned_date >= d0)
        if to_date:
            try:
                d1 = DateType.fromisoformat(to_date)
            except ValueError as exc:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Invalid to_date, use YYYY-MM-DD",
                ) from exc
            q = q.where(CalendarSession.planned_date <= d1)

        q = q.order_by(CalendarSession.planned_date, CalendarSession.session_number_global).offset(offset).limit(limit)
        result = await db.execute(q)
        rows = result.unique().scalars().all()
        return [_serialize_session_full(s) for s in rows]
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("get_my_sessions failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to list sessions") from exc


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    db: DbSession,
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    try:
        session = await _resolve_session(db, session_id)
        if session is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        if not await _user_can_access_session(db, current_user, session):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to view this session")

        q = (
            select(CalendarSession)
            .where(CalendarSession.id == session.id)
            .options(
                joinedload(CalendarSession.unit),
                joinedload(CalendarSession.lesson_plan),
                joinedload(CalendarSession.teaching_note),
                joinedload(CalendarSession.progress),
            )
        )
        result = await db.execute(q)
        s = result.unique().scalar_one()
        return _serialize_session_full(s)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("get_session failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to load session") from exc


@router.patch("/sessions/{session_id}/status")
async def update_session_status(
    session_id: str,
    request: SessionStatusUpdate,
    db: DbSession,
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    try:
        session = await _resolve_session(db, session_id)
        if session is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        if not await _user_can_access_session(db, current_user, session):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to update this session")

        new_status = _parse_session_status(request.status)
        session.status = new_status
        if request.notes is not None:
            session.notes = request.notes
        await _upsert_progress_for_session(
            db,
            session,
            session_status=new_status,
            actual_delivery_date=request.actual_delivery_date,
            notes=request.notes,
        )
        await db.flush()

        q = (
            select(CalendarSession)
            .where(CalendarSession.id == session.id)
            .options(
                joinedload(CalendarSession.unit),
                joinedload(CalendarSession.lesson_plan),
                joinedload(CalendarSession.teaching_note),
                joinedload(CalendarSession.progress),
            )
        )
        result = await db.execute(q)
        s = result.unique().scalar_one()
        return _serialize_session_full(s)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("update_session_status failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update session status",
        ) from exc


@router.post("/calendar-runs", response_model=CalendarRunCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_calendar_run(
    request: CalendarRunCreate,
    db: DbSession,
    current_user: User = Depends(get_current_user),
) -> CalendarRunCreatedResponse:
    try:
        subject = await _resolve_subject(db, request.subject_id)
        if subject is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")

        mode_map = {
            "textbook_order": ModelSequencingMode.TEXTBOOK_ORDER,
            "optimized_sequence": ModelSequencingMode.OPTIMIZED_SEQUENCE,
        }
        seq = mode_map.get(request.sequencing_mode.value, ModelSequencingMode.TEXTBOOK_ORDER)

        run = CalendarRun(
            calendar_run_id=new_calendar_run_id(),
            school_id=current_user.school_id,
            subject_id=subject.id,
            created_by_id=current_user.id,
            audience_scope=AudienceScope.TEACHER,
            sequencing_mode=seq,
            academic_year_label=request.academic_year_label.strip(),
            total_available_sessions=request.total_available_sessions,
            generation_status=RunGenerationStatus.DRAFT,
        )
        db.add(run)
        await db.flush()
        return CalendarRunCreatedResponse(
            calendar_run_id=run.calendar_run_id,
            generation_status=_enum_value(run.generation_status),
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("create_calendar_run failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create calendar run",
        ) from exc
