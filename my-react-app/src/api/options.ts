import { apiRequest } from "./client";
import type { OptionDto } from "./surveys";

export interface OptionPayload {
  option_text?: string;
  order_index?: number;
}

export async function getOptions(questionId: number): Promise<OptionDto[]> {
  return apiRequest<OptionDto[]>(`/questions/${questionId}/options`);
}

export async function createOption(questionId: number, data: { option_text: string; order_index?: number }): Promise<OptionDto> {
  return apiRequest<OptionDto>(`/questions/${questionId}/options`, { method: "POST", body: data });
}

export async function updateOption(optionId: number, data: OptionPayload): Promise<OptionDto> {
  return apiRequest<OptionDto>(`/options/${optionId}`, { method: "PUT", body: data });
}

export async function deleteOption(optionId: number): Promise<void> {
  await apiRequest<void>(`/options/${optionId}`, { method: "DELETE" });
}

