from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_session
from app.models.models import Option, Question, Region, Response, Survey, SurveyStatus, User
from app.schemas.stats import (
    AdvancedStatsResponse,
    AgeGroupItem,
    CategoryStatsItem,
    DailyActivityItem,
    GenderItem,
    RegionSegmentItem,
    RegionStatsItem,
    RegionSurveyItem,
    StatsOverviewResponse,
    SurveyTimelineItem,
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

    # ── Среднее ответов на опрос ──
    total_surveys_res = await session.execute(select(func.count(Survey.id)))
    total_surveys = int(total_surveys_res.scalar_one() or 0)
    avg_responses = round(total / total_surveys, 1) if total_surveys > 0 else 0.0

    # ── % завершённых опросов ──
    completed_surveys_res = await session.execute(
        select(func.count(Survey.id)).where(Survey.status == SurveyStatus.completed)
    )
    completed_surveys = int(completed_surveys_res.scalar_one() or 0)
    survey_completion_rate = round(completed_surveys / total_surveys * 100, 1) if total_surveys > 0 else 0.0

    return AdvancedStatsResponse(
        region_stats=region_stats,
        region_survey_stats=region_survey_stats,
        age_group_stats=age_group_stats,
        gender_stats=gender_stats,
        comment_rate=comment_rate,
        repeat_participants_rate=repeat_rate,
        avg_responses_per_survey=avg_responses,
        survey_completion_rate=survey_completion_rate,
    )


@router.get("/category", response_model=list[CategoryStatsItem])
async def stats_by_category(session: AsyncSession = Depends(get_session)) -> list[CategoryStatsItem]:
    """Returns response counts grouped by survey category."""
    rows_res = await session.execute(
        select(Survey.category, func.count(Response.id).label("cnt"))
        .outerjoin(Response, Response.survey_id == Survey.id)
        .where(Survey.category.is_not(None))
        .group_by(Survey.category)
        .order_by(func.count(Response.id).desc())
    )
    rows = list(rows_res.all())

    if not rows:
        return []

    total_all = sum(int(r.cnt) for r in rows) or 1
    return [
        CategoryStatsItem(
            label=row.category,
            responses_count=int(row.cnt),
            pct=round(int(row.cnt) / total_all * 100, 1),
        )
        for row in rows
    ]


@router.get("/region-segmentation", response_model=list[RegionSegmentItem])
async def region_segmentation(session: AsyncSession = Depends(get_session)) -> list[RegionSegmentItem]:
    """Returns per-region overall response % and youth (18-25) response %."""
    region_res = await session.execute(
        select(Region.name, func.count(Response.id).label("cnt"))
        .outerjoin(User, User.region_id == Region.id)
        .outerjoin(Response, Response.user_id == User.id)
        .group_by(Region.id, Region.name)
        .having(func.count(Response.id) > 0)
        .order_by(Region.name)
    )
    region_rows = [(row.name, int(row.cnt)) for row in region_res]

    if not region_rows:
        return []

    max_cnt = max(r[1] for r in region_rows) or 1
    result: list[RegionSegmentItem] = []

    for region_name, cnt in region_rows:
        overall_pct = round(cnt / max_cnt * 100, 1)

        youth_res = await session.execute(
            select(func.count(Response.id))
            .join(User, User.id == Response.user_id)
            .join(Region, Region.id == User.region_id)
            .where(Region.name == region_name, User.age >= 18, User.age <= 25)
        )
        youth_cnt = int(youth_res.scalar_one() or 0)
        youth_pct = round(youth_cnt / cnt * 100, 1) if cnt > 0 else 0.0

        result.append(RegionSegmentItem(region=region_name, overall_pct=overall_pct, youth_pct=youth_pct))

    return result


@router.get("/timeline", response_model=list[SurveyTimelineItem])
async def stats_timeline(session: AsyncSession = Depends(get_session)) -> list[SurveyTimelineItem]:
    """Returns completed surveys with total responses, support % and implementation_status."""
    surveys_res = await session.execute(
        select(Survey)
        .options(
            selectinload(Survey.questions).selectinload(Question.options)
        )
        .where(Survey.status == SurveyStatus.completed)
        .order_by(Survey.created_at.desc())
    )
    surveys = list(surveys_res.scalars().all())

    result: list[SurveyTimelineItem] = []
    for survey in surveys:
        total_res = await session.execute(
            select(func.count(Response.id)).where(Response.survey_id == survey.id)
        )
        total = int(total_res.scalar_one() or 0)

        # Support % = votes for first 2 options of the first single-choice question
        support_pct = 0.0
        single_qs = sorted(
            [q for q in survey.questions if q.question_type.value == "single"],
            key=lambda q: q.order_index,
        )
        if single_qs:
            q = single_qs[0]
            q_total_res = await session.execute(
                select(func.count(Response.id)).where(
                    Response.question_id == q.id,
                    Response.option_id.is_not(None),
                )
            )
            q_total = int(q_total_res.scalar_one() or 0)
            if q_total > 0:
                pos_option_ids = [
                    o.id for o in sorted(q.options, key=lambda o: o.order_index)[:2]
                ]
                pos_res = await session.execute(
                    select(func.count(Response.id)).where(
                        Response.question_id == q.id,
                        Response.option_id.in_(pos_option_ids),
                    )
                )
                pos_count = int(pos_res.scalar_one() or 0)
                support_pct = round(pos_count / q_total * 100, 1)

        result.append(
            SurveyTimelineItem(
                id=survey.id,
                title=survey.title,
                description=survey.description,
                end_date=survey.end_date.isoformat() if survey.end_date else None,
                total_responses=total,
                support_pct=support_pct,
                implementation_status=survey.implementation_status.value,
            )
        )

    return result
