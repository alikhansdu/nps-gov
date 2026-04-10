import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import { TOKEN_KEY } from "../api/client";
import { FRONTEND_ONLY } from "../config/frontendMode";
import { getMockSurveys } from "../mocks/surveyStore";

const BarIcon   = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3"  y="12" width="4" height="9" rx="1" />
    <rect x="10" y="6"  width="4" height="15" rx="1" />
    <rect x="17" y="9"  width="4" height="12" rx="1" />
  </svg>
);
const EditIcon  = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const ClockIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const PlusIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const ChevronRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;

// ─── Types ───────────────────────────────────────────────
type StatsOverview = {
  draft_surveys: number;
  active_surveys: number;
  completed_surveys: number;
  total_responses: number;
  activity_last_7_days: { date: string; responses_count: number }[];
};

type SurveyFromAPI = {
  id: number;
  title: string;
  status: "draft" | "active" | "completed";
  end_date: string | null;
  total_responses: number;
  created_by: number;
};

const STATUS_MAP = {
  active:    { label: "Активный",  color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
  draft:     { label: "Черновик",  color: "#d97706", bg: "rgba(217,119,6,0.1)" },
  completed: { label: "Завершён",  color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
};

// ─── Area Chart ───────────────────────────────────────────
function AreaChart({ data }: { data: { date: string; responses_count: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-gray-400" style={{ padding: "18px 0" }}>
        Нет данных для графика
      </div>
    );
  }

  const W = 1188, H = 320;
  const padL = 40, padR = 8, padT = 16, padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const max    = Math.max(...data.map((d) => d.responses_count), 1);
  const ticks  = [max, Math.round(max * 0.75), Math.round(max * 0.5), Math.round(max * 0.25), 0];

  const toY = (v: number) => padT + chartH - (v / max) * chartH;
  const toX = (i: number) => padL + (i / Math.max(data.length - 1, 1)) * chartW;

  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.responses_count) }));

  const curve = pts.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = pts[i - 1];
    const dx = (p.x - prev.x) * 0.45;
    return `${acc} C${prev.x + dx},${prev.y} ${p.x - dx},${p.y} ${p.x},${p.y}`;
  }, "");

  const bottomY = padT + chartH;
  const area = `${curve} L${pts[pts.length - 1].x},${bottomY} L${pts[0].x},${bottomY} Z`;

  return (
    <div style={{ width: "100%" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "320px", display: "block" }} preserveAspectRatio="none">
        {ticks.map((t) => (
          <text key={t} x={padL - 6} y={toY(t)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="#9aabb8" fontFamily="inherit">
            {t > 999 ? `${Math.round(t / 1000)}k` : t}
          </text>
        ))}
        <path d={area} fill="#a8b4c4" fillOpacity="0.78" />
        <path d={curve} fill="none" stroke="#8a9ab2" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" dominantBaseline="auto" fontSize="11" fill="#9aabb8" fontFamily="inherit">
            {d.date.slice(5)}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function AdminOverview() {
  const [overview, setOverview]   = useState<StatsOverview | null>(null);
  const [surveys, setSurveys]     = useState<SurveyFromAPI[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const token = localStorage.getItem(TOKEN_KEY);
  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const mockOverview: StatsOverview = {
    draft_surveys: 3,
    active_surveys: 12,
    completed_surveys: 8,
    total_responses: 4218650,
    activity_last_7_days: [
      { date: "2026-03-19", responses_count: 540 },
      { date: "2026-03-20", responses_count: 710 },
      { date: "2026-03-21", responses_count: 820 },
      { date: "2026-03-22", responses_count: 430 },
      { date: "2026-03-23", responses_count: 300 },
      { date: "2026-03-24", responses_count: 640 },
      { date: "2026-03-25", responses_count: 590 },
    ],
  };

  useEffect(() => {
    if (FRONTEND_ONLY) {
      const mockSurveys = getMockSurveys().map((s) => ({
        id: s.id,
        title: s.title,
        status: s.status,
        end_date: s.end_date,
        total_responses: s.total_responses,
        created_by: s.created_by,
      }));
      setCurrentUserId(1);
      setOverview(mockOverview);
      setSurveys(mockSurveys);
      return;
    }

    // Текущий пользователь
    fetch("/api/v1/auth/me", { headers: authHeader })
      .then((r) => r.ok ? r.json() : null)
      .then((u) => u && setCurrentUserId(u.id))
      .catch(() => {});

    // Статистика
    fetch("/api/v1/stats/overview")
      .then((r) => r.ok ? r.json() : null)
      .then(setOverview)
      .catch(() => {});

    // Опросы
    fetch("/api/v1/surveys", { headers: authHeader })
      .then((r) => r.ok ? r.json() : [])
      .then(setSurveys)
      .catch(() => setSurveys([]));
  }, [authHeader]);

  const mySurveys = currentUserId
    ? surveys.filter((s) => s.created_by === currentUserId)
    : surveys;

  const fmtNum = (n: number | undefined) =>
    n != null ? n.toLocaleString("ru-RU") : "—";

  const stats = [
    { value: fmtNum(overview?.active_surveys),    label: "Активных опросов", icon: <BarIcon /> },
    { value: fmtNum(overview?.draft_surveys),     label: "Черновики",         icon: <EditIcon /> },
    { value: fmtNum(overview?.completed_surveys), label: "Завершённые",        icon: <CheckIcon /> },
    { value: fmtNum(overview?.total_responses),   label: "Всего голосов",      icon: <UsersIcon /> },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col gap-5" style={{ padding: "clamp(20px,4vw,40px) clamp(16px,4vw,48px)" }}>

        <h1 className="text-2xl font-bold text-gray-900">Обзор</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white border border-[#E4E4E7] rounded-xl p-5 flex flex-col gap-3">
              <span
                className="flex items-center justify-center rounded-lg text-gray-500 flex-shrink-0"
                style={{ width: "40px", height: "40px", backgroundColor: "#F1F2F4" }}
              >
                {s.icon}
              </span>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* My surveys */}
        <div className="bg-white border border-[#E4E4E7] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Мои опросы</h2>
            <Link to="/admin/create" className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              <PlusIcon /> Создать
            </Link>
          </div>
          <div className="flex flex-col gap-2 p-3">
            {mySurveys.length === 0 && (
              <p className="px-3 py-3 text-sm text-gray-400">Нет опросов</p>
            )}
            {mySurveys.map((s) => {
              const st = STATUS_MAP[s.status];
              const deadline = s.end_date
                ? new Date(s.end_date).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })
                : null;
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg hover:bg-gray-100 transition-colors cursor-pointer gap-2"
                  style={{
                    backgroundColor: "#F8F9FA",
                    borderLeft: `3px solid ${st.color}`,
                    padding: "10px 14px",
                  }}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{s.title}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-medium" style={{ color: st.color }}>
                        • {st.label}
                      </span>
                      <span className="text-xs text-gray-400">{s.total_responses.toLocaleString("ru-RU")} голосов</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 flex-shrink-0">
                    <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                      <ClockIcon /> {deadline ?? "—"}
                    </span>
                    <ChevronRight />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity chart */}
        <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 flex flex-col">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Активность за 7 дней</h2>
          <p className="text-xs text-gray-400 mb-3">Ежедневная активность голосований</p>
          <AreaChart data={overview?.activity_last_7_days ?? []} />
        </div>

      </div>
    </AdminLayout>
  );
}