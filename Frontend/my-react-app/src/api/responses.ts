import { apiRequest } from "./client";

export interface SubmitAnswerItem {
  question_id: number;
  option_id?: number | null;
  text_answer?: string | null;
}

export interface SubmitResponsePayload {
  survey_id: number;
  answers: SubmitAnswerItem[];
}

export interface ResponseDto {
  id: number;
  user_id: number;
  survey_id: number;
  question_id: number;
  option_id: number | null;
  text_answer: string | null;
  created_at: string;
}

export interface SurveyResultsResponse {
  survey_id: number;
  total_responses: number;
  questions: Array<{
    question_id: number;
    question_text: string;
    question_type: string;
    total_responses: number;
    text_responses_count: number;
    options: Array<{
      option_id: number;
      option_text: string;
      responses_count: number;
    }>;
  }>;
}

export async function submitResponse(surveyId: number, answers: SubmitAnswerItem[]): Promise<ResponseDto[]> {
  const requests = answers.map((a) =>
    apiRequest<ResponseDto>("/responses", {
      method: "POST",
      body: {
        survey_id: surveyId,
        question_id: a.question_id,
        option_id: a.option_id ?? null,
        text_answer: a.text_answer ?? null,
      },
    }),
  );
  return Promise.all(requests);
}

export async function getSurveyResults(surveyId: number): Promise<SurveyResultsResponse> {
  return apiRequest<SurveyResultsResponse>(`/surveys/${surveyId}/results`);
}

