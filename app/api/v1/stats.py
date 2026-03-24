from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.models.models import Response, Survey, SurveyStatus
from app.schemas.stats import DailyActivityItem, StatsOverviewResponse


router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/overview", response_model=StatsOverviewResponse)
async def stats_overview(session: AsyncSession = Depends(get_session)) -> StatsOverviewResponse:
    draft_res = await session.execute(select(func.count(Survey.id)).where(Survey.status == SurveyStatus.draft))
    active_res = await session.execute(select(func.count(Survey.id)).where(Survey.status == SurveyStatus.active))
    completed_res = await session.execute(select(func.count(Survey.id)).where(Survey.status == SurveyStatus.completed))
    total_responses_res = await session.execute(select(func.count(Response.id)))

    now_utc = datetime.now(timezone.utc)
    start_date = (now_utc - timedelta(days=6)).date()

    activity_rows = await session.execute(
        select(
            func.date(Response.created_at).label("d"),
            func.count(Response.id).label("c"),
        )
        .where(Response.created_at >= datetime.combine(start_date, datetime.min.time(), tzinfo=timezone.utc))
        .group_by(func.date(Response.created_at))
        .order_by(func.date(Response.created_at))
    )

    activity_map = {str(row.d): int(row.c) for row in activity_rows}
    activity: list[DailyActivityItem] = []
    for i in range(7):
        day = start_date + timedelta(days=i)
        activity.append(
            DailyActivityItem(
                date=day.isoformat(),
                responses_count=activity_map.get(day.isoformat(), 0),
            )
        )

    return StatsOverviewResponse(
        draft_surveys=int(draft_res.scalar_one() or 0),
        active_surveys=int(active_res.scalar_one() or 0),
        completed_surveys=int(completed_res.scalar_one() or 0),
        total_responses=int(total_responses_res.scalar_one() or 0),
        activity_last_7_days=activity,
    )

