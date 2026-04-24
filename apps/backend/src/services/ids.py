from __future__ import annotations

import uuid


def new_job_id() -> str:
    return f"JOB-{uuid.uuid4().hex[:12]}"


def new_calendar_run_id() -> str:
    return f"CR-{uuid.uuid4().hex[:12]}"


def new_progress_id() -> str:
    return f"PRG-{uuid.uuid4().hex[:12]}"


def new_resource_id() -> str:
    return f"RSC-{uuid.uuid4().hex[:12]}"
