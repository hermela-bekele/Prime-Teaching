from __future__ import annotations

import logging
from datetime import date
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from src.api.deps import get_current_user, require_roles, role_str
from src.core.database import get_db
from src.models.enums import CompletionStatus, DeliveryConfidence, SessionStatus, UserRole
from src.models.progress import TeacherProgress
from src.models.session import CalendarSession
from src.models.user import User
from src.schemas.progress import (
    ConfidenceBreakdown,
    DepartmentProgressResponse,
    DepartmentStatItem,
    ProgressUpdateRequest,
    ProgressUpdateResult,
    SchoolProgressResponse,
    TeacherListProgressItem,
    TeacherProgressStatsResponse,
)
from src.services.ids import new_progress_id

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Progress Tracking"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


def _enum_value(v: Any) -> str:
    return v.value if hasattr(v, "value") else str(v)


def _parse_completion(raw: str) -> CompletionStatus:
    key = raw.strip().lower()
    for c in CompletionStatus:
        if c.value == key:
            return c
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=f"Invalid completion_status. Use one of: {', '.join(c.value for c in CompletionStatus)}",
    )


def _parse_confidence(raw: str | None) -> DeliveryConfidence | None:
    if raw is None or raw == "":
        return None
    key = raw.strip().lower()
    for c in DeliveryConfidence:
        if c.value == key:
            return c
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=f"Invalid delivery_confidence. Use one of: {', '.join(c.value for c in DeliveryConfidence)}",
    )


def _session_status_from_completion(c: CompletionStatus) -> SessionStatus | None:
    if c == CompletionStatus.COMPLETED:
        return SessionStatus.DELIVERED
    if c == CompletionStatus.MISSED:
        return SessionStatus.MISSED
    if c == CompletionStatus.RESCHEDULED:
        return SessionStatus.RESCHEDULED
    if c == CompletionStatus.PARTIALLY_COMPLETED:
        return SessionStatus.PLANNED
    if c == CompletionStatus.NOT_STARTED:
        return SessionStatus.PLANNED
    return None


def _planned_as_date(planned: Any) -> date:
    if isinstance(planned, date):
        return planned
    if hasattr(planned, "date"):
        return planned.date()  # type: ignore[no-any-return]
    return date.fromisoformat(str(planned))


async def _resolve_target_teacher(db: AsyncSession, current_user: User, teacher_id: str | None) -> User:
    if not teacher_id or teacher_id == current_user.id:
        return current_user
    role = role_str(current_user)
    if role == UserRole.TEACHER.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot view other teachers")
    target = await db.get(User, teacher_id)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found")
    if target.school_id != current_user.school_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in same school")
    if role == UserRole.DEPARTMENT_HEAD.value:
        a = (current_user.department_name or "").strip().lower()
        b = (target.department_name or "").strip().lower()
        if not a or a != b:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in same department")
    return target


def _stats_for_sessions(sessions: list[CalendarSession], progress_by_session: dict[str, TeacherProgress]) -> TeacherProgressStatsResponse:
    today = date.today()
    total = len(sessions)
    completed = 0
    overdue = 0
    cb = ConfidenceBreakdown()

    for s in sessions:
        prog = progress_by_session.get(s.id)
        st = s.status
        pd = _planned_as_date(s.planned_date)
        is_done = st in (SessionStatus.DELIVERED, SessionStatus.MISSED) or (
            prog is not None and prog.completion_status == CompletionStatus.COMPLETED
        )
        if st == SessionStatus.DELIVERED or (prog is not None and prog.completion_status == CompletionStatus.COMPLETED):
            completed += 1
        if pd < today and not is_done:
            overdue += 1
        if prog is None or prog.delivery_confidence is None:
            cb.unset += 1
            continue
        v = prog.delivery_confidence
        if v == DeliveryConfidence.HIGH:
            cb.high += 1
        elif v == DeliveryConfidence.MEDIUM:
            cb.medium += 1
        elif v == DeliveryConfidence.LOW:
            cb.low += 1

    rate = (completed / total) if total else 0.0
    return TeacherProgressStatsResponse(
        total_sessions=total,
        completed_count=completed,
        completion_rate=round(rate, 4),
        overdue_sessions=overdue,
        confidence_breakdown=cb,
    )


@router.post("/update", response_model=ProgressUpdateResult)
async def update_progress(
    request: ProgressUpdateRequest,
    db: DbSession,
    current_user: User = Depends(get_current_user),
) -> ProgressUpdateResult:
    try:
        from .calendar import _resolve_session

        session = await _resolve_session(db, request.session_id)
        if session is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        if session.teacher_owner_id != current_user.id and role_str(current_user) not in (
            UserRole.DEPARTMENT_HEAD.value,
            UserRole.SCHOOL_LEADER.value,
            UserRole.ADMIN.value,
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to update this session")

        completion = _parse_completion(request.completion_status)
        conf = _parse_confidence(request.delivery_confidence)

        r = await db.execute(select(TeacherProgress).where(TeacherProgress.session_id == session.id))
        prog = r.scalar_one_or_none()
        if prog is None:
            prog = TeacherProgress(
                progress_id=new_progress_id(),
                session_id=session.id,
                teacher_id=session.teacher_owner_id,
                completion_status=completion,
                delivery_confidence=conf,
                deviation_reason=request.deviation_reason,
                actual_delivery_date=request.actual_delivery_date,
                follow_up_required=bool(request.follow_up_required) if request.follow_up_required is not None else False,
            )
            db.add(prog)
        else:
            prog.completion_status = completion
            prog.delivery_confidence = conf
            if request.deviation_reason is not None:
                prog.deviation_reason = request.deviation_reason
            if request.actual_delivery_date is not None:
                prog.actual_delivery_date = request.actual_delivery_date
            if request.follow_up_required is not None:
                prog.follow_up_required = request.follow_up_required

        new_ss = _session_status_from_completion(completion)
        if new_ss is not None:
            session.status = new_ss

        await db.flush()
        return ProgressUpdateResult(progress_id=prog.progress_id, status="ok")
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("update_progress failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update progress") from exc


@router.get("/teacher", response_model=TeacherProgressStatsResponse)
async def get_teacher_progress(
    db: DbSession,
    current_user: User = Depends(get_current_user),
    teacher_id: str | None = Query(default=None),
) -> TeacherProgressStatsResponse:
    try:
        target = await _resolve_target_teacher(db, current_user, teacher_id)
        q = select(CalendarSession).where(CalendarSession.teacher_owner_id == target.id)
        result = await db.execute(q)
        sessions = list(result.scalars().all())

        r2 = await db.execute(select(TeacherProgress).where(TeacherProgress.teacher_id == target.id))
        prows = r2.scalars().all()
        pmap = {p.session_id: p for p in prows}

        stats = _stats_for_sessions(sessions, pmap)
        today = date.today()
        today_count = 0
        upcoming_count = 0
        for s in sessions:
            pd = _planned_as_date(s.planned_date)
            if pd == today:
                today_count += 1
            elif pd > today:
                upcoming_count += 1
        return stats.model_copy(
            update={
                "today_count": today_count,
                "upcoming_count": upcoming_count,
                "pending_count": stats.overdue_sessions,
            }
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("get_teacher_progress failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load teacher progress",
        ) from exc


@router.get("/department", response_model=DepartmentProgressResponse)
async def get_department_progress(
    db: DbSession,
    current_user: User = Depends(
        require_roles(UserRole.DEPARTMENT_HEAD.value, UserRole.SCHOOL_LEADER.value, UserRole.ADMIN.value)
    ),
) -> DepartmentProgressResponse:
    try:
        q = select(User).where(User.school_id == current_user.school_id, User.role == UserRole.TEACHER)
        if role_str(current_user) == UserRole.DEPARTMENT_HEAD.value and current_user.department_name:
            q = q.where(User.department_name == current_user.department_name)
        result = await db.execute(q)
        teachers = list(result.scalars().all())
        items: list[TeacherListProgressItem] = []
        for t in teachers:
            sq = select(CalendarSession).where(CalendarSession.teacher_owner_id == t.id)
            sres = await db.execute(sq)
            sessions = list(sres.scalars().all())
            pr = await db.execute(select(TeacherProgress).where(TeacherProgress.teacher_id == t.id))
            pmap = {p.session_id: p for p in pr.scalars().all()}
            stats = _stats_for_sessions(sessions, pmap)
            items.append(
                TeacherListProgressItem(
                    teacher_id=t.id,
                    user_id=t.user_id,
                    full_name=t.full_name,
                    email=t.email,
                    department_name=t.department_name,
                    stats=stats,
                )
            )
        return DepartmentProgressResponse(teachers=items)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("get_department_progress failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load department progress",
        ) from exc


@router.get("/school", response_model=SchoolProgressResponse)
async def get_school_progress(
    db: DbSession,
    current_user: User = Depends(require_roles(UserRole.SCHOOL_LEADER.value, UserRole.ADMIN.value)),
) -> SchoolProgressResponse:
    try:
        q = (
            select(User.department_name, func.count(User.id))
            .where(User.school_id == current_user.school_id, User.role == UserRole.TEACHER)
            .group_by(User.department_name)
        )
        result = await db.execute(q)
        dept_rows = result.all()
        out: list[DepartmentStatItem] = []
        for dept_name, tcount in dept_rows:
            label = dept_name or "Unassigned"
            tq = select(User).where(
                User.school_id == current_user.school_id,
                User.role == UserRole.TEACHER,
                User.department_name == dept_name,
            )
            tres = await db.execute(tq)
            teachers = list(tres.scalars().all())
            total_sessions = 0
            completed_sessions = 0
            for t in teachers:
                sq = select(CalendarSession).where(CalendarSession.teacher_owner_id == t.id)
                sres = await db.execute(sq)
                sessions = list(sres.scalars().all())
                pr = await db.execute(select(TeacherProgress).where(TeacherProgress.teacher_id == t.id))
                pmap = {p.session_id: p for p in pr.scalars().all()}
                st = _stats_for_sessions(sessions, pmap)
                total_sessions += st.total_sessions
                completed_sessions += st.completed_count
            avg_rate = (completed_sessions / total_sessions) if total_sessions else 0.0
            out.append(
                DepartmentStatItem(
                    department_name=label,
                    teacher_count=int(tcount or 0),
                    avg_completion_rate=round(avg_rate, 4),
                    total_sessions=total_sessions,
                    completed_sessions=completed_sessions,
                )
            )
        return SchoolProgressResponse(departments=out)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("get_school_progress failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load school progress",
        ) from exc


@router.get("")
async def list_progress_placeholder() -> list[dict]:
    return []
