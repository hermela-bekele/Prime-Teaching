from __future__ import annotations

import logging
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user, role_str
from src.core.database import get_db
from src.models.enums import ApprovalStatus, ResourceScope, ResourceType, UserRole
from src.models.resource import Resource
from src.models.resource_recommendation import ResourceRecommendation
from src.models.subtopic import Subtopic
from src.models.user import User
from src.schemas.resources import ResourceCreate, ResourceOut
from src.services.ids import new_resource_id

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Resources"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


def _enum_value(v: Any) -> str:
    return v.value if hasattr(v, "value") else str(v)


async def _resolve_subtopic(db: AsyncSession, subtopic_id: str) -> Subtopic | None:
    st = await db.get(Subtopic, subtopic_id)
    if st:
        return st
    r = await db.execute(select(Subtopic).where(Subtopic.subtopic_id == subtopic_id))
    return r.scalar_one_or_none()


def _parse_resource_type(raw: str) -> ResourceType:
    key = raw.strip().lower()
    for rt in ResourceType:
        if rt.value == key:
            return rt
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=f"Invalid resource_type. Use one of: {', '.join(r.value for r in ResourceType)}",
    )


def _parse_resource_scope(raw: str) -> ResourceScope:
    key = raw.strip().lower()
    for rs in ResourceScope:
        if rs.value == key:
            return rs
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=f"Invalid resource_scope. Use one of: {', '.join(r.value for r in ResourceScope)}",
    )


@router.get("/recommendations/{subtopic_id}")
async def get_resource_recommendations(
    subtopic_id: str,
    db: DbSession,
    current_user: User = Depends(get_current_user),
) -> list[dict[str, Any]]:
    try:
        st = await _resolve_subtopic(db, subtopic_id)
        if st is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subtopic not found")

        r = await db.execute(
            select(ResourceRecommendation)
            .where(ResourceRecommendation.subtopic_id == st.id)
            .order_by(ResourceRecommendation.resource_title)
        )
        rows = r.scalars().all()
        return [
            {
                "id": str(rec.id),
                "resource_recommendation_id": rec.resource_recommendation_id,
                "subject_id": rec.subject_id,
                "unit_id": rec.unit_id,
                "subtopic_id": rec.subtopic_id,
                "resource_title": rec.resource_title,
                "resource_provider": rec.resource_provider,
                "resource_type": rec.resource_type,
                "url": rec.url,
                "recommended_use_case": rec.recommended_use_case,
                "audience_level": rec.audience_level,
                "approval_status": _enum_value(rec.approval_status),
                "notes": rec.notes,
            }
            for rec in rows
        ]
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("get_resource_recommendations failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load recommendations",
        ) from exc


@router.post("/", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
async def upload_resource(
    request: ResourceCreate,
    db: DbSession,
    current_user: User = Depends(get_current_user),
) -> ResourceOut:
    try:
        from src.models.subject import Subject

        subj = await db.get(Subject, request.subject_id)
        if subj is None:
            r = await db.execute(select(Subject).where(Subject.subject_id == request.subject_id))
            subj = r.scalar_one_or_none()
        if subj is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")

        res = Resource(
            resource_id=new_resource_id(),
            title=request.title.strip(),
            subject_id=subj.id,
            school_id=current_user.school_id,
            resource_type=_parse_resource_type(request.resource_type),
            file_attachment=request.file_attachment,
            external_url=request.external_url,
            resource_scope=_parse_resource_scope(request.resource_scope),
            uploaded_by_id=current_user.id,
            approval_status=ApprovalStatus.PENDING,
            approved_for_ai_use=False,
            notes=request.notes,
        )
        db.add(res)
        await db.flush()

        if role_str(current_user) == UserRole.SCHOOL_LEADER.value:
            res.approval_status = ApprovalStatus.APPROVED
            res.approved_by_id = current_user.id
            res.approved_for_ai_use = True
            await db.flush()

        return ResourceOut(
            id=str(res.id),
            resource_id=res.resource_id,
            title=res.title,
            subject_id=res.subject_id,
            school_id=res.school_id,
            resource_type=_enum_value(res.resource_type),
            file_attachment=res.file_attachment,
            external_url=res.external_url,
            resource_scope=_enum_value(res.resource_scope),
            approval_status=_enum_value(res.approval_status),
            approved_for_ai_use=res.approved_for_ai_use,
            notes=res.notes,
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("upload_resource failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create resource") from exc
