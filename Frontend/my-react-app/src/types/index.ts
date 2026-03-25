export type SurveyStatus = "active" | "closed" | "draft";

export interface Survey {
  id: number;
  title: string;
  category: string;
  status: SurveyStatus;
  totalVoters: number;
  participationPercent: number;
  deadline: string;
  initiator: string;
  region: string;
}

export interface Option {
  id: number;
  text: string;
  votes: number;
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
}

export interface VoteResult {
  surveyId: number;
  questionId: number;
  optionId: number;
  comment?: string;
}

export interface AnalyticsStat {
  value: string;
  label: string;
}

export interface AnalyticsClosedSurvey {
  label: string;
  pct: number;
}

export interface AnalyticsAgeGroup {
  label: string;
  value: number;
}

export interface AnalyticsThemeGroup {
  label: string;
  value: number;
}

export interface AnalyticsDynamicsPoint {
  date: string;
  value: number;
}

export interface AnalyticsDecision {
  date: string;
  status: string;
  statusColor: string;
  statusBg: string;
  title: string;
  desc: string;
  votes: string;
  support: string;
}

export interface AnalyticsChange {
  status: string;
  statusColor: string;
  statusBg: string;
  title: string;
  desc: string;
}

export interface AdminRegionAnalytics {
  label: string;
  total: number;
  youth: number;
}

export interface AdminPattern {
  value: string;
  label: string;
}

export interface AnalyticsData {
  stats: AnalyticsStat[];
  closedSurveys: AnalyticsClosedSurvey[];
  ageGroups: AnalyticsAgeGroup[];
  byTheme: AnalyticsThemeGroup[];
  dynamics: AnalyticsDynamicsPoint[];
  decisions: AnalyticsDecision[];
  changes: AnalyticsChange[];
  adminRegions: AdminRegionAnalytics[];
  adminPatterns: AdminPattern[];
}

