from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.models.models import Region, Response, Survey, SurveyStatus, User
from app.schemas.stats import (
    AdvancedStatsResponse,
    AgeGroupItem,
    DailyActivityItem,
    GenderItem,
    RegionStatsItem,
    RegionSurveyItem,
    StatsOverviewResponse,
)

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
    # ── Ответы по регионам (обратная совместимость) ──
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

    # ── Завершённые опросы по регионам ──
    survey_region_res = await session.execute(
        select(
            Region.name,
            func.count(Survey.id).label("total"),
            func.sum(
                case((Survey.status == SurveyStatus.completed, 1), else_=0)
            ).label("completed"),
        )
        .outerjoin(Survey, Survey.region_id == Region.id)
        .group_by(Region.id, Region.name)
        .order_by(Region.name)
    )
    region_survey_stats: list[RegionSurveyItem] = []
    for row in survey_region_res:
        total_s = int(row.total or 0)
        completed_s = int(row.completed or 0)
        rate = round(completed_s / total_s * 100, 1) if total_s > 0 else 0.0
        region_survey_stats.append(
            RegionSurveyItem(
                label=row.name,
                total_surveys=total_s,
                completed_surveys=completed_s,
                completion_rate=rate,
            )
        )

    # ── Возрастные группы ──
    age_buckets = [
        ("18-24", 18, 24),
        ("25-34", 25, 34),
        ("35-44", 35, 44),
        ("45-54", 45, 54),
        ("55-64", 55, 64),
        ("65+",   65, 999),
    ]
    total_with_age_res = await session.execute(
        select(func.count(User.id)).where(User.age.is_not(None))
    )
    total_with_age = int(total_with_age_res.scalar_one() or 0)

    age_group_stats: list[AgeGroupItem] = []
    for label, low, high in age_buckets:
        cnt_res = await session.execute(
            select(func.count(User.id)).where(User.age >= low, User.age <= high)
        )
        cnt = int(cnt_res.scalar_one() or 0)
        pct = round(cnt / total_with_age * 100, 1) if total_with_age > 0 else 0.0
        age_group_stats.append(AgeGroupItem(label=label, count=cnt, pct=pct))

    # ── Пол ──
    gender_res = await session.execute(
        select(User.gender, func.count(User.id).label("cnt"))
        .where(User.gender.is_not(None))
        .group_by(User.gender)
    )
    gender_rows = {row.gender.lower(): int(row.cnt) for row in gender_res}
    total_gender = sum(gender_rows.values()) or 1

    def _gender_count(keys: list[str]) -> int:
        return next((gender_rows[k] for k in keys if k in gender_rows), 0)

    women_count = _gender_count(["female", "f", "ж", "женский"])
    men_count = _gender_count(["male", "m", "м", "мужской"])
    gender_stats: list[GenderItem] = [
        GenderItem(label="Женщины", count=women_count, pct=round(women_count / total_gender * 100, 1)),
        GenderItem(label="Мужчины", count=men_count,   pct=round(men_count   / total_gender * 100, 1)),
    ]

    # ── Всего ответов ──
    total_res = await session.execute(select(func.count(Response.id)))
    total = int(total_res.scalar_one() or 0)

    # ── % с комментарием ──
    comment_res = await session.execute(
        select(func.count(Response.id)).where(Response.text_answer.is_not(None))
    )
    comment_count = int(comment_res.scalar_one() or 0)
    comment_rate = round(comment_count / total * 100, 1) if total > 0 else 0.0

    # ── % повторных участников ──
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
        region_survey_stats=region_survey_stats,
        age_group_stats=age_group_stats,
        gender_stats=gender_stats,
        comment_rate=comment_rate,
        repeat_participants_rate=repeat_rate,
    )
