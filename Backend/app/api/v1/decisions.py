from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.security import decode_token
from app.models.models import Decision, DecisionStatus
from app.schemas.decisions import DecisionCreate, DecisionOut, DecisionUpdate

router = APIRouter(prefix="/decisions", tags=["decisions"])
bearer = HTTPBearer(auto_error=True)


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> int:
    try:
        payload = decode_token(credentials.credentials)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return int(payload["sub"])


@router.get("", response_model=list[DecisionOut])
async def list_decisions(session: AsyncSession = Depends(get_session)) -> list[DecisionOut]:
    res = await session.execute(select(Decision).order_by(Decision.created_at.desc()))
    return list(res.scalars().all())


@router.get("/{decision_id}", response_model=DecisionOut)
async def get_decision(decision_id: int, session: AsyncSession = Depends(get_session)) -> DecisionOut:
    obj = await session.get(Decision, decision_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Decision not found")
    return obj


@router.post("", response_model=DecisionOut, status_code=201)
async def create_decision(
    body: DecisionCreate,
    session: AsyncSession = Depends(get_session),
    _user_id: int = Depends(get_current_user_id),
) -> DecisionOut:
    try:
        status_enum = DecisionStatus(body.status)
    except ValueError:
        raise HTTPException(status_code=422, detail=f"Invalid status: {body.status}")

    obj = Decision(
        title=body.title,
        description=body.description,
        status=status_enum,
        survey_id=body.survey_id,
    )
    session.add(obj)
    await session.commit()
    await session.refresh(obj)
    return obj


@router.put("/{decision_id}", response_model=DecisionOut)
async def update_decision(
    decision_id: int,
    body: DecisionUpdate,
    session: AsyncSession = Depends(get_session),
    _user_id: int = Depends(get_current_user_id),
) -> DecisionOut:
    obj = await session.get(Decision, decision_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Decision not found")

    if body.title is not None:
        obj.title = body.title
    if body.description is not None:
        obj.description = body.description
    if body.status is not None:
        try:
            obj.status = DecisionStatus(body.status)
        except ValueError:
            raise HTTPException(status_code=422, detail=f"Invalid status: {body.status}")
    if body.survey_id is not None:
        obj.survey_id = body.survey_id

    await session.commit()
    await session.refresh(obj)
    return obj


@router.delete("/{decision_id}", status_code=204)
async def delete_decision(
    decision_id: int,
    session: AsyncSession = Depends(get_session),
    _user_id: int = Depends(get_current_user_id),
) -> None:
    obj = await session.get(Decision, decision_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Decision not found")
    await session.delete(obj)
    await session.commit()
