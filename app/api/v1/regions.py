from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.models.models import Region
from app.schemas.regions import RegionResponse


router = APIRouter(prefix="/regions", tags=["regions"])


@router.get("", response_model=list[RegionResponse])
async def list_regions(session: AsyncSession = Depends(get_session)) -> list[Region]:
    res = await session.execute(select(Region).order_by(Region.name))
    return list(res.scalars().all())

