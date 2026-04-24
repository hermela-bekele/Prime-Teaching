from __future__ import annotations

from pydantic import BaseModel, Field


class ResourceCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    subject_id: str
    resource_type: str = Field(
        default="textbook",
        description="textbook, teacher_guide, worksheet, video_link, website_link, other",
    )
    file_attachment: str | None = None
    external_url: str | None = None
    resource_scope: str = Field(default="school_only", description="global, school_only, department_only")
    notes: str | None = None


class ResourceRecommendationOut(BaseModel):
    id: str
    resource_recommendation_id: str
    subject_id: str
    unit_id: str
    subtopic_id: str
    resource_title: str
    resource_provider: str | None
    resource_type: str
    url: str
    recommended_use_case: str | None
    audience_level: str
    approval_status: str
    notes: str | None


class ResourceOut(BaseModel):
    id: str
    resource_id: str
    title: str
    subject_id: str
    school_id: str | None
    resource_type: str
    file_attachment: str | None
    external_url: str | None
    resource_scope: str
    approval_status: str
    approved_for_ai_use: bool
    notes: str | None
