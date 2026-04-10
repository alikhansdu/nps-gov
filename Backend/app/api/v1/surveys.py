from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_session
from app.core.security import decode_token
from app.models.models import Option, Question, Response, Survey, SurveyStatus
from app.schemas.surveys import (
    SurveyCreateRequest,
    SurveyDetailResponse,
    SurveyListItemResponse,
    SurveyResultsResponse,
    SurveyStatusUpdateRequest,
    SurveyUpdateRequest,
)
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

router = APIRouter(prefix="/surveys", tags=["surveys"])
bearer = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> int:
    try:
        payload = decode_token(credentials.credentials)
    except Exception:
        # Token can be missing/garbled in frontend-only mode; don't crash the API.
        raise HTTPException(status_code=401, detail="Invalid token")

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return int(payload["sub"])


async def _count_survey_responses(session: AsyncSession, survey_id: int) -> int:
    res = await session.execute(
        select(func.count(Response.id)).where(Response.survey_id == survey_id)
    )
    return int(res.scalar() or 0)


# ── GET /surveys ──────────────────────────────────────────────────────────────
@router.get("", response_model=list[SurveyListItemResponse])
async def list_surveys(
    status_filter: str | None = Query(None),
    region_id: int | None = Query(None),
    session: AsyncSession = Depends(get_session),
) -> list[SurveyListItemResponse]:
    stmt = (
        select(Survey)
        .options(
            selectinload(Survey.creator),
            selectinload(Survey.region),
        )
        .order_by(Survey.created_at.desc())
    )
    if status_filter is not None:
        stmt = stmt.where(Survey.status == status_filter)
    if region_id is not None:
        stmt = stmt.where(Survey.region_id == region_id)

    res = await session.execute(stmt)
    surveys = list(res.scalars().all())

    result = []
    for survey in surveys:
        total = await _count_survey_responses(session, survey.id)
        item = SurveyListItemResponse.model_validate(survey).model_copy(
            update={
                "total_responses": total,
                "creator_name": survey.creator.name if survey.creator else "Государственный орган РК",
                "region_name": survey.region.name if survey.region else None,
            }
        )
        result.append(item)
    return result


# ── POST /surveys ─────────────────────────────────────────────────────────────
@router.post("", response_model=SurveyDetailResponse, status_code=201)
async def create_survey(
    body: SurveyCreateRequest,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
) -> SurveyDetailResponse:
    survey = Survey(
        title=body.title,
        description=body.description,
        region_id=body.region_id,
        end_date=body.end_date,
        created_by=user_id,
        status=SurveyStatus(body.status),
    )
    session.add(survey)
    await session.commit()
    await session.refresh(survey)
    res = await session.execute(
        select(Survey)
        .options(selectinload(Survey.questions).selectinload(Question.options))
        .where(Survey.id == survey.id)
    )
    return res.scalar_one()


# ── GET /surveys/{survey_id} ──────────────────────────────────────────────────
@router.get("/{survey_id}", response_model=SurveyDetailResponse)
async def get_survey(
    survey_id: int,
    session: AsyncSession = Depends(get_session),
) -> SurveyDetailResponse:
    res = await session.execute(
        select(Survey)
        .options(selectinload(Survey.questions).selectinload(Question.options))
        .where(Survey.id == survey_id)
    )
    survey = res.scalar_one_or_none()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    total = await _count_survey_responses(session, survey_id)
    return SurveyDetailResponse.model_validate(survey).model_copy(
        update={"total_responses": total}
    )


# ── PUT /surveys/{survey_id} ──────────────────────────────────────────────────
@router.put("/{survey_id}", response_model=SurveyDetailResponse)
async def update_survey(
    survey_id: int,
    body: SurveyUpdateRequest,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
) -> SurveyDetailResponse:
    res = await session.execute(select(Survey).where(Survey.id == survey_id))
    survey = res.scalar_one_or_none()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    if survey.created_by != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(survey, field, value)
    await session.commit()
    res = await session.execute(
        select(Survey)
        .options(selectinload(Survey.questions).selectinload(Question.options))
        .where(Survey.id == survey_id)
    )
    return res.scalar_one()


# ── PATCH /surveys/{survey_id}/status ────────────────────────────────────────
@router.patch("/{survey_id}/status", response_model=SurveyListItemResponse)
async def update_survey_status(
    survey_id: int,
    body: SurveyStatusUpdateRequest,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
) -> SurveyListItemResponse:
    res = await session.execute(select(Survey).where(Survey.id == survey_id))
    survey = res.scalar_one_or_none()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    if survey.created_by != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    survey.status = body.status
    await session.commit()
    await session.refresh(survey)
    total = await _count_survey_responses(session, survey_id)
    return SurveyListItemResponse.model_validate(survey).model_copy(
        update={"total_responses": total}
    )


# ── GET /surveys/{survey_id}/results ─────────────────────────────────────────
@router.get("/{survey_id}/results", response_model=SurveyResultsResponse)
async def get_survey_results(
    survey_id: int,
    session: AsyncSession = Depends(get_session),
) -> SurveyResultsResponse:
    res = await session.execute(
        select(Survey)
        .options(selectinload(Survey.questions).selectinload(Question.options))
        .where(Survey.id == survey_id)
    )
    survey = res.scalar_one_or_none()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")

    total_responses = await _count_survey_responses(session, survey_id)

    questions_result = []
    for question in sorted(survey.questions, key=lambda q: q.order_index):
        # Count votes per option for this question
        votes_res = await session.execute(
            select(Response.option_id, func.count(Response.id).label("cnt"))
            .where(Response.question_id == question.id)
            .where(Response.option_id.isnot(None))
            .group_by(Response.option_id)
        )
        votes_map: dict[int, int] = {row.option_id: row.cnt for row in votes_res}

        total_votes = sum(votes_map.values())

        options_result = []
        for opt in sorted(question.options, key=lambda o: o.order_index):
            count = votes_map.get(opt.id, 0)
            percentage = round(count / total_votes * 100, 1) if total_votes > 0 else 0.0
            options_result.append({
                "id": opt.id,
                "option_text": opt.option_text,
                "order_index": opt.order_index,
                "votes_count": count,
                "percentage": percentage,
            })

        questions_result.append({
            "id": question.id,
            "question_text": question.question_text,
            "question_type": question.question_type,
            "order_index": question.order_index,
            "options": options_result,
            "total_votes": total_votes,
        })

    return SurveyResultsResponse(
        survey_id=survey.id,
        title=survey.title,
        status=survey.status,
        total_responses=total_responses,
        questions=questions_result,
    )


# ── DELETE /surveys/{survey_id} ───────────────────────────────────────────────
@router.delete("/{survey_id}", status_code=204)
async def delete_survey(
    survey_id: int,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
) -> None:
    res = await session.execute(select(Survey).where(Survey.id == survey_id))
    survey = res.scalar_one_or_none()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    if survey.created_by != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    await session.delete(survey)
    await session.commit()
