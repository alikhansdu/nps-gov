from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.surveys import OptionResponse


QuestionTypeLiteral = Literal["single", "multiple", "text"]


class QuestionCreateRequest(BaseModel):
    question_text: str = Field(min_length=1)
    question_type: QuestionTypeLiteral
    order_index: int = 0


class QuestionUpdateRequest(BaseModel):
    question_text: str | None = Field(default=None, min_length=1)
    question_type: QuestionTypeLiteral | None = None
    order_index: int | None = None


class QuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    survey_id: int
    question_text: str
    question_type: QuestionTypeLiteral
    order_index: int
    options: list[OptionResponse] = []

