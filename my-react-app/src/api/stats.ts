import { apiRequest } from "./client";

export interface StatsOverview {
  draft_surveys: number;
  active_surveys: number;
  completed_surveys: number;
  total_responses: number;
  activity_last_7_days: Array<{
    date: string;
    responses_count: number;
  }>;
}

export async function getOverview(): Promise<StatsOverview> {
  return apiRequest<StatsOverview>("/stats/overview");
}

