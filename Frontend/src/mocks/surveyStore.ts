export type MockSurveyStatus = "draft" | "active" | "completed";

export interface MockSurvey {
  id: number;
  title: string;
  description: string | null;
  status: MockSurveyStatus;
  region_id: number | null;
  region_name: string | null;   // добавлено
  creator_name: string;         // добавлено
  created_by: number;
  created_at: string;
  end_date: string | null;
  total_responses: number;
}

const KEY = "nps_mock_surveys";

const seed: MockSurvey[] = [
  {
    id: 1,
    title: "Public Service Satisfaction (Demo)",
    description: "Демо опрос",
    status: "active",
    region_id: 2,
    region_name: "Astana",        // добавить
    creator_name: "Demo Government", // добавить
    created_by: 1,
    created_at: "2026-03-20T10:00:00Z",
    end_date: null,
    total_responses: 1267,
  },
  {
    id: 2,
    title: "Качество госуслуг в регионах",
    description: "Демо опрос",
    status: "draft",
    region_id: null,
    region_name: "Almaty",        // добавить
    creator_name: "Demo Admin Gov",  // добавить
    created_by: 1,
    created_at: "2026-03-21T10:00:00Z",
    end_date: null,
    total_responses: 0,
  },
  {
    id: 3,
    title: "Общественный транспорт",
    description: "Демо опрос",
    status: "completed",
    region_id: 1,
    region_name: null,            // добавить
    creator_name: "Demo Government", // добавить
    created_by: 1,
    created_at: "2026-03-22T10:00:00Z",
    end_date: null,
    total_responses: 776,
  },
];

export function getMockSurveys(): MockSurvey[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as MockSurvey[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seed;
  } catch {
    return seed;
  }
}

export function saveMockSurveys(items: MockSurvey[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addMockSurvey(
  payload: Pick<MockSurvey, "title" | "description" | "status" | "region_id" | "end_date">,
): MockSurvey {
  const items = getMockSurveys();
  const nextId = items.length ? Math.max(...items.map((s) => s.id)) + 1 : 1;
  const created: MockSurvey = {
    id: nextId,
    region_name: null,
    creator_name: "Demo Government",
    created_by: 1,
    created_at: new Date().toISOString(),
    total_responses: 0,
    ...payload,
  };
  const next = [created, ...items];
  saveMockSurveys(next);
  return created;
}

