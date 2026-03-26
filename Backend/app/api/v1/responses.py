from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import get_current_user
from app.core.database import get_session
from app.models.models import Option, Question, Response, Survey, User
from app.schemas.responses import (
    ResponseCreateRequest,
    ResponseResponse,
    SurveyQuestionOptionResult,
    SurveyQuestionResults,
    SurveyResultsResponse,
)

router = APIRouter(tags=["responses"])


@router.post("/responses", response_model=ResponseResponse, status_code=status.HTTP_201_CREATED)
async def create_response(
    payload: ResponseCreateRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Response:
    survey = await session.get(Survey, payload.survey_id)
    if survey is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found")
    if survey.status != "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Survey is not active")

    question = await session.get(Question, payload.question_id)
    if question is None or question.survey_id != payload.survey_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Question does not belong to survey")

    if payload.option_id is not None:
        option = await session.get(Option, payload.option_id)
        if option is None or option.question_id != payload.question_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Option does not belong to question")

    response = Response(
        user_id=current_user.id,
        survey_id=payload.survey_id,
        question_id=payload.question_id,
        option_id=payload.option_id,
        text_answer=payload.text_answer,
    )
    session.add(response)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Вы уже ответили на этот вопрос",
        )
    await session.refresh(response)
    return response


@router.get("/surveys/{survey_id}/results", response_model=SurveyResultsResponse)
async def survey_results(survey_id: int, session: AsyncSession = Depends(get_session)) -> SurveyResultsResponse:
    survey = await session.get(Survey, survey_id)
    if survey is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found")

    questions_res = await session.execute(
        select(Question).where(Question.survey_id == survey_id).order_by(Question.order_index, Question.id)
    )
    questions = list(questions_res.scalars().all())

    total_responses_res = await session.execute(
        select(func.count(Response.id)).where(Response.survey_id == survey_id)
    )
    total_responses = int(total_responses_res.scalar_one() or 0)

    question_results: list[SurveyQuestionResults] = []
    for q in questions:
        q_total_res = await session.execute(select(func.count(Response.id)).where(Response.question_id == q.id))
        q_total = int(q_total_res.scalar_one() or 0)

        q_text_res = await session.execute(
            select(func.count(Response.id)).where(Response.question_id == q.id, Response.text_answer.is_not(None))
        )
        q_text_count = int(q_text_res.scalar_one() or 0)

        opt_res = await session.execute(
            select(
                Option.id,
                Option.option_text,
                func.count(Response.id).label("responses_count"),
            )
            .outerjoin(Response, (Response.option_id == Option.id) & (Response.question_id == q.id))
            .where(Option.question_id == q.id)
            .group_by(Option.id, Option.option_text)
            .order_by(Option.order_index, Option.id)
        )

        opts = [
            SurveyQuestionOptionResult(
                option_id=int(row.id),
                option_text=row.option_text,
                responses_count=int(row.responses_count or 0),
            )
            for row in opt_res
        ]

        question_results.append(
            SurveyQuestionResults(
                question_id=q.id,
                question_text=q.question_text,
                question_type=q.question_type.value,
                total_responses=q_total,
                text_responses_count=q_text_count,
                options=opts,
            )
        )

    return SurveyResultsResponse(
        survey_id=survey_id,
        total_responses=total_responses,
        questions=question_results,
    )