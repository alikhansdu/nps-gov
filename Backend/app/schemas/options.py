from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class OptionCreateRequest(BaseModel):
    option_text: str = Field(min_length=1)
    order_index: int = 0


class OptionUpdateRequest(BaseModel):
    option_text: str | None = Field(default=None, min_length=1)
    order_index: int | None = None


class OptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question_id: int
    option_text: str
    order_index: int

