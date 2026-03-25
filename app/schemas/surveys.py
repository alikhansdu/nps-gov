from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


SurveyStatusLiteral = Literal["draft", "active", "completed"]
QuestionTypeLiteral = Literal["single", "multiple", "text"]


class OptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question_id: int
    option_text: str
    order_index: int


class QuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    survey_id: int
    question_text: str
    question_type: QuestionTypeLiteral
    order_index: int
    options: list[OptionResponse] = []


class SurveyListItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    created_by: int
    status: SurveyStatusLiteral
    region_id: int | None
    created_at: datetime
    end_date: date | None
    total_responses: int = 0


class SurveyDetailResponse(SurveyListItemResponse):
    questions: list[QuestionResponse] = []


class SurveyCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    status: SurveyStatusLiteral = "draft"
    region_id: int | None = None
    end_date: date | None = None


class SurveyUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    region_id: int | None = None
    end_date: date | None = None


class SurveyStatusUpdateRequest(BaseModel):
    status: SurveyStatusLiteral

