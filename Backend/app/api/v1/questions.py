from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.auth import get_current_user
from app.core.database import get_session
from app.models.models import Question, QuestionType, Survey, User, UserRole
from app.schemas.questions import QuestionCreateRequest, QuestionResponse, QuestionUpdateRequest


router = APIRouter(tags=["questions"])


def _require_government(user: User) -> None:
    if user.role != UserRole.government:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Government role required")


@router.post("/surveys/{survey_id}/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    survey_id: int,
    payload: QuestionCreateRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Question:
    _require_government(current_user)

    survey = await session.get(Survey, survey_id)
    if survey is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found")

    question = Question(
        survey_id=survey_id,
        question_text=payload.question_text,
        question_type=QuestionType(payload.question_type),
        order_index=payload.order_index,
    )
    session.add(question)
    await session.commit()

    res = await session.execute(
        select(Question).where(Question.id == question.id).options(selectinload(Question.options))
    )
    return res.scalar_one()


@router.put("/questions/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: int,
    payload: QuestionUpdateRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Question:
    _require_government(current_user)

    question = await session.get(Question, question_id)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    data = payload.model_dump(exclude_unset=True)
    if "question_type" in data and data["question_type"] is not None:
        data["question_type"] = QuestionType(data["question_type"])

    for key, value in data.items():
        setattr(question, key, value)

    await session.commit()
    res = await session.execute(
        select(Question).where(Question.id == question.id).options(selectinload(Question.options))
    )
    return res.scalar_one()


@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    _require_government(current_user)

    question = await session.get(Question, question_id)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    await session.delete(question)
    await session.commit()

