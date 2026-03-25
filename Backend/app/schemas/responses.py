from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ResponseCreateRequest(BaseModel):
    survey_id: int
    question_id: int
    option_id: int | None = None
    text_answer: str | None = Field(default=None, max_length=4000)


class ResponseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    survey_id: int
    question_id: int
    option_id: int | None
    text_answer: str | None
    created_at: datetime


class SurveyQuestionOptionResult(BaseModel):
    option_id: int
    option_text: str
    responses_count: int


class SurveyQuestionResults(BaseModel):
    question_id: int
    question_text: str
    question_type: str
    total_responses: int
    text_responses_count: int
    options: list[SurveyQuestionOptionResult]


class SurveyResultsResponse(BaseModel):
    survey_id: int
    total_responses: int
    questions: list[SurveyQuestionResults]

