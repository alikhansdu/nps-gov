from __future__ import annotations

from pydantic import BaseModel


class DailyActivityItem(BaseModel):
    date: str
    responses_count: int


class StatsOverviewResponse(BaseModel):
    draft_surveys: int
    active_surveys: int
    completed_surveys: int
    total_responses: int
    activity_last_7_days: list[DailyActivityItem]

