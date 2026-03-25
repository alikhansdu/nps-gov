import { apiRequest } from "./client";

export type SurveyStatus = "draft" | "active" | "completed";
export type QuestionType = "single" | "multiple" | "text";

export interface OptionDto {
  id: number;
  question_id: number;
  option_text: string;
  order_index: number;
}

export interface QuestionDto {
  id: number;
  survey_id: number;
  question_text: string;
  question_type: QuestionType;
  order_index: number;
  options: OptionDto[];
}

export interface SurveyDto {
  id: number;
  title: string;
  description: string | null;
  created_by: number;
  status: SurveyStatus;
  region_id: number | null;
  created_at: string;
  end_date: string | null;
  total_responses?: number;
}

export interface SurveyDetailDto extends SurveyDto {
  questions: QuestionDto[];
}

export interface GetSurveysFilters {
  status_filter?: SurveyStatus;
  region_id?: number;
}

export interface CreateSurveyPayload {
  title: string;
  description?: string | null;
  status?: SurveyStatus;
  region_id?: number | null;
  end_date?: string | null;
}

export interface UpdateSurveyPayload {
  title?: string;
  description?: string | null;
  region_id?: number | null;
  end_date?: string | null;
}

export async function getSurveys(filters?: GetSurveysFilters): Promise<SurveyDto[]> {
  const qs = new URLSearchParams();
  if (filters?.status_filter) qs.set("status_filter", filters.status_filter);
  if (typeof filters?.region_id === "number") qs.set("region_id", String(filters.region_id));
  const query = qs.toString();
  return apiRequest<SurveyDto[]>(`/surveys${query ? `?${query}` : ""}`);
}

export async function getSurvey(id: number): Promise<SurveyDetailDto> {
  return apiRequest<SurveyDetailDto>(`/surveys/${id}`);
}

export async function createSurvey(payload: CreateSurveyPayload): Promise<SurveyDto> {
  return apiRequest<SurveyDto>("/surveys", { method: "POST", body: payload });
}

export async function updateSurvey(id: number, payload: UpdateSurveyPayload): Promise<SurveyDto> {
  return apiRequest<SurveyDto>(`/surveys/${id}`, { method: "PUT", body: payload });
}

export async function deleteSurvey(id: number): Promise<void> {
  await apiRequest<void>(`/surveys/${id}`, { method: "DELETE" });
}

export async function updateStatus(id: number, status: SurveyStatus): Promise<SurveyDto> {
  return apiRequest<SurveyDto>(`/surveys/${id}/status`, { method: "PATCH", body: { status } });
}

