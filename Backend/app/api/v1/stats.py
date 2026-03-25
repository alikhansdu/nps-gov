from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.models.models import Response, Survey, SurveyStatus
from app.schemas.stats import DailyActivityItem, StatsOverviewResponse

from app.models.models import Region, User
from app.schemas.stats import AdvancedStatsResponse, RegionStatsItem

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

    


@router.get("/advanced", response_model=AdvancedStatsResponse)
async def stats_advanced(session: AsyncSession = Depends(get_session)) -> AdvancedStatsResponse:
    # Ответы по регионам
    region_res = await session.execute(
        select(Region.name, func.count(Response.id).label("cnt"))
        .outerjoin(User, User.region_id == Region.id)
        .outerjoin(Response, Response.user_id == User.id)
        .group_by(Region.id, Region.name)
        .order_by(Region.name)
    )
    region_stats = [
        RegionStatsItem(label=row.name, responses_count=int(row.cnt or 0))
        for row in region_res
    ]

    # Всего ответов
    total_res = await session.execute(select(func.count(Response.id)))
    total = int(total_res.scalar_one() or 0)

    # % с комментарием
    comment_res = await session.execute(
        select(func.count(Response.id)).where(Response.text_answer.is_not(None))
    )
    comment_count = int(comment_res.scalar_one() or 0)
    comment_rate = round(comment_count / total * 100, 1) if total > 0 else 0.0

    # % повторных участников
    repeat_res = await session.execute(
        select(func.count()).select_from(
            select(Response.user_id)
            .group_by(Response.user_id)
            .having(func.count(func.distinct(Response.survey_id)) > 1)
            .subquery()
        )
    )
    repeat_count = int(repeat_res.scalar_one() or 0)
    total_users_res = await session.execute(
        select(func.count(func.distinct(Response.user_id)))
    )
    total_users = int(total_users_res.scalar_one() or 0)
    repeat_rate = round(repeat_count / total_users * 100, 1) if total_users > 0 else 0.0

    return AdvancedStatsResponse(
        region_stats=region_stats,
        comment_rate=comment_rate,
        repeat_participants_rate=repeat_rate,
    )
