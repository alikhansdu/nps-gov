import { apiRequest } from "./client";
import type { QuestionDto, QuestionType } from "./surveys";

export interface CreateQuestionPayload {
  question_text: string;
  question_type: QuestionType;
  order_index?: number;
}

export interface UpdateQuestionPayload {
  question_text?: string;
  question_type?: QuestionType;
  order_index?: number;
}

export async function createQuestion(surveyId: number, data: CreateQuestionPayload): Promise<QuestionDto> {
  return apiRequest<QuestionDto>(`/surveys/${surveyId}/questions`, { method: "POST", body: data });
}

export async function updateQuestion(questionId: number, data: UpdateQuestionPayload): Promise<QuestionDto> {
  return apiRequest<QuestionDto>(`/questions/${questionId}`, { method: "PUT", body: data });
}

export async function deleteQuestion(questionId: number): Promise<void> {
  await apiRequest<void>(`/questions/${questionId}`, { method: "DELETE" });
}

