from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


RoleLiteral = Literal["citizen", "government"]


class RegisterRequest(BaseModel):
    iin: str = Field(min_length=12, max_length=12)
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr | None = None
    password: str = Field(min_length=6, max_length=128)
    role: RoleLiteral = "citizen"


class LoginRequest(BaseModel):
    iin: str = Field(min_length=12, max_length=12)
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    iin: str
    name: str
    email: str | None
    role: RoleLiteral
    region_id: int | None
    created_at: datetime

