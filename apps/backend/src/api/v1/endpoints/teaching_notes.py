from __future__ import annotations

import logging
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.session import CalendarSession
from src.models.teaching_note import TeachingNote
from src.models.user import User
from src.utils.pdf_export import text_to_pdf_bytes

from .calendar import _user_can_access_session, _resolve_session

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Teaching Notes"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


def _enum_value(v: Any) -> str:
    return v.value if hasattr(v, "value") else str(v)


async def _resolve_teaching_note(db: AsyncSession, note_id: str) -> TeachingNote | None:
    n = await db.get(TeachingNote, note_id)
    if n:
        return n
    r = await db.execute(select(TeachingNote).where(TeachingNote.teaching_note_id == note_id))
    return r.scalar_one_or_none()


def _note_to_dict(n: TeachingNote) -> dict[str, Any]:
    return {
        "id": str(n.id),
        "teaching_note_id": n.teaching_note_id,
        "session_id": n.session_id,
        "lesson_plan_id": n.lesson_plan_id,
        "teacher_owner_id": n.teacher_owner_id,
        "generation_version": n.generation_version,
        "generation_status": _enum_value(n.generation_status),
        "teacher_intro_script": n.teacher_intro_script,
        "stepwise_explanation": n.stepwise_explanation,
        "worked_examples": n.worked_examples,
        "teacher_questions": n.teacher_questions,
        "student_activity_guidance": n.student_activity_guidance,
        "real_life_application": n.real_life_application,
        "struggling_student_support": n.struggling_student_support,
        "average_student_support": n.average_student_support,
        "advanced_student_extension": n.advanced_student_extension,
        "common_mistakes": n.common_mistakes,
        "lesson_wrap_up": n.lesson_wrap_up,
        "download_doc_url": n.download_doc_url,
        "approved_by_id": n.approved_by_id,
        "notes": n.notes,
        "generated_at": n.generated_at,
    }


@router.get("/session/{session_id}")
async def get_teaching_note_by_session(
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

        r = await db.execute(select(TeachingNote).where(TeachingNote.session_id == session.id))
        note = r.scalar_one_or_none()
        if note is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teaching note not found for this session")
        return _note_to_dict(note)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("get_teaching_note_by_session failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to load teaching note") from exc


@router.get("/{note_id}/download")
async def download_teaching_note(
    note_id: str,
    db: DbSession,
    current_user: User = Depends(get_current_user),
) -> Response:
    try:
        note = await _resolve_teaching_note(db, note_id)
        if note is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teaching note not found")

        r = await db.execute(select(CalendarSession).where(CalendarSession.id == note.session_id))
        session = r.scalar_one_or_none()
        if session is None or not await _user_can_access_session(db, current_user, session):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

        title = f"Teaching Note — {session.session_title}"
        sections: list[tuple[str, str]] = [
            ("Introduction", note.teacher_intro_script or ""),
            ("Explanation", note.stepwise_explanation or ""),
            ("Worked examples", note.worked_examples or ""),
            ("Questions", note.teacher_questions or ""),
            ("Activities", note.student_activity_guidance or ""),
            ("Real life", note.real_life_application or ""),
            ("Support (struggling)", note.struggling_student_support or ""),
            ("Support (average)", note.average_student_support or ""),
            ("Extension", note.advanced_student_extension or ""),
            ("Common mistakes", note.common_mistakes or ""),
            ("Wrap-up", note.lesson_wrap_up or ""),
        ]
        pdf_bytes = text_to_pdf_bytes(title, sections)
        fname = f"teaching-note-{note.teaching_note_id}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{fname}"'},
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("download_teaching_note failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to build PDF") from exc
