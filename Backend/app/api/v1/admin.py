from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.models.models import Survey, User, UserRole, Response, SurveyStatus
from app.schemas.surveys import SurveyListItemResponse, SurveyStatusUpdateRequest, SurveyCreateRequest
from app.schemas.auth import UserResponse
from app.api.v1.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])


# ─── Schemas ──────────────────────────────────────────────
class ToggleActiveRequest(BaseModel):
    is_active: bool


# ─── Admin guard ──────────────────────────────────────────
async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


async def _count_responses(session: AsyncSession, survey_id: int) -> int:
    res = await session.execute(
        select(func.count(Response.id)).where(Response.survey_id == survey_id)
    )
    return int(res.scalar() or 0)


# ─── Surveys ──────────────────────────────────────────────

@router.get("/surveys", response_model=list[SurveyListItemResponse])
async def admin_list_surveys(
    session: AsyncSession = Depends(get_session),
    _: User = Depends(require_admin),
) -> list[SurveyListItemResponse]:
    res = await session.execute(select(Survey).order_by(Survey.created_at.desc()))
    surveys = list(res.scalars().all())
    result = []
    for survey in surveys:
        total = await _count_responses(session, survey.id)
        result.append(
            SurveyListItemResponse.model_validate(survey).model_copy(
                update={"total_responses": total}
            )
        )
    return result


@router.post("/surveys", response_model=SurveyListItemResponse, status_code=201)
async def admin_create_survey(
    body: SurveyCreateRequest,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(require_admin),
) -> SurveyListItemResponse:
    survey = Survey(
        title=body.title,
        description=body.description,
        region_id=body.region_id,
        end_date=body.end_date,
        created_by=admin.id,
        status=SurveyStatus.draft,
    )
    session.add(survey)
    await session.commit()
    await session.refresh(survey)
    return SurveyListItemResponse.model_validate(survey).model_copy(
        update={"total_responses": 0}
    )


@router.patch("/surveys/{survey_id}/status", response_model=SurveyListItemResponse)
async def admin_update_survey_status(
    survey_id: int,
    body: SurveyStatusUpdateRequest,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(require_admin),
) -> SurveyListItemResponse:
    res = await session.execute(select(Survey).where(Survey.id == survey_id))
    survey = res.scalar_one_or_none()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    survey.status = body.status
    await session.commit()
    await session.refresh(survey)
    total = await _count_responses(session, survey_id)
    return SurveyListItemResponse.model_validate(survey).model_copy(
        update={"total_responses": total}
    )


@router.delete("/surveys/{survey_id}", status_code=204)
async def admin_delete_survey(
    survey_id: int,
    session: AsyncSession = Depends(get_session),
    _: User = Depends(require_admin),
) -> None:
    res = await session.execute(select(Survey).where(Survey.id == survey_id))
    survey = res.scalar_one_or_none()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    await session.delete(survey)
    await session.commit()


# ─── Users ────────────────────────────────────────────────

@router.get("/users", response_model=list[UserResponse])
async def admin_list_users(
    session: AsyncSession = Depends(get_session),
    _: User = Depends(require_admin),
) -> list[User]:
    res = await session.execute(select(User).order_by(User.id))
    return list(res.scalars().all())


@router.patch("/users/{user_id}/active", response_model=UserResponse)
async def admin_toggle_user_active(
    user_id: int,
    body: ToggleActiveRequest,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(require_admin),
) -> User:
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    res = await session.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = body.is_active
    await session.commit()
    await session.refresh(user)
    return user
