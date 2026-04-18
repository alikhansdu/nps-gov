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


class RegionStatsItem(BaseModel):
    label: str
    responses_count: int


class RegionSurveyItem(BaseModel):
    label: str
    total_surveys: int
    completed_surveys: int
    completion_rate: float


class AgeGroupItem(BaseModel):
    label: str
    count: int
    pct: float


class GenderItem(BaseModel):
    label: str
    count: int
    pct: float


class AdvancedStatsResponse(BaseModel):
    region_stats: list[RegionStatsItem]
    region_survey_stats: list[RegionSurveyItem]
    age_group_stats: list[AgeGroupItem]
    gender_stats: list[GenderItem]
    comment_rate: float
    repeat_participants_rate: float
    avg_responses_per_survey: float
    survey_completion_rate: float


class RegionSegmentItem(BaseModel):
    region: str
    overall_pct: float   # responses from this region, % of max
    youth_pct: float     # % of 18-25 respondents from this region


class CategoryStatsItem(BaseModel):
    label: str
    responses_count: int
    pct: float


class SurveyTimelineItem(BaseModel):
    id: int
    title: str
    description: str | None
    end_date: str | None
    total_responses: int
    support_pct: float
    implementation_status: str
