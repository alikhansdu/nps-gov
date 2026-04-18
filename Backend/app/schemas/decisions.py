from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class DecisionCreate(BaseModel):
    title: str
    description: str | None = None
    status: str = "in_progress"
    survey_id: int | None = None


class DecisionUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    survey_id: int | None = None


class DecisionOut(BaseModel):
    id: int
    title: str
    description: str | None
    status: str
    created_at: datetime
    survey_id: int | None

    model_config = {"from_attributes": True}
