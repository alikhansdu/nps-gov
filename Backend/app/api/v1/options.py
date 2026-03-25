from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import get_current_user
from app.core.database import get_session
from app.models.models import Option, Question, User, UserRole
from app.schemas.options import OptionCreateRequest, OptionResponse, OptionUpdateRequest


router = APIRouter(tags=["options"])


def _require_government(user: User) -> None:
    if user.role != UserRole.government:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Government role required")


@router.get("/questions/{question_id}/options", response_model=list[OptionResponse])
async def list_options(question_id: int, session: AsyncSession = Depends(get_session)) -> list[Option]:
    question = await session.get(Question, question_id)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    res = await session.execute(select(Option).where(Option.question_id == question_id).order_by(Option.order_index, Option.id))
    return list(res.scalars().all())


@router.post("/questions/{question_id}/options", response_model=OptionResponse, status_code=status.HTTP_201_CREATED)
async def create_option(
    question_id: int,
    payload: OptionCreateRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Option:
    _require_government(current_user)

    question = await session.get(Question, question_id)
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    option = Option(
        question_id=question_id,
        option_text=payload.option_text,
        order_index=payload.order_index,
    )
    session.add(option)
    await session.commit()
    await session.refresh(option)
    return option


@router.get("/options/{option_id}", response_model=OptionResponse)
async def get_option(option_id: int, session: AsyncSession = Depends(get_session)) -> Option:
    option = await session.get(Option, option_id)
    if option is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Option not found")
    return option


@router.put("/options/{option_id}", response_model=OptionResponse)
async def update_option(
    option_id: int,
    payload: OptionUpdateRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Option:
    _require_government(current_user)

    option = await session.get(Option, option_id)
    if option is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Option not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(option, key, value)

    await session.commit()
    await session.refresh(option)
    return option


@router.delete("/options/{option_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_option(
    option_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    _require_government(current_user)

    option = await session.get(Option, option_id)
    if option is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Option not found")

    await session.delete(option)
    await session.commit()

