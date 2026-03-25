import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import { TOKEN_KEY } from "../api/client";

const BarIcon      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const EditIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const CheckIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const UsersIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
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

  useEffect(() => {
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

  const stats = [
    { value: String(overview?.active_surveys    ?? "—"), label: "Активных опросов", icon: <BarIcon /> },
    { value: String(overview?.draft_surveys     ?? "—"), label: "Черновики",         icon: <EditIcon /> },
    { value: String(overview?.completed_surveys ?? "—"), label: "Завершённые",        icon: <CheckIcon /> },
    { value: String(overview?.total_responses   ?? "—"), label: "Всего голосов",      icon: <UsersIcon /> },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: "40px 32px 40px 48px", display: "flex", flexDirection: "column", gap: "20px" }}>

        <h1 className="text-2xl font-bold text-gray-900">Обзор</h1>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white border border-[#E4E4E7] rounded-xl p-5 flex flex-col gap-3">
              <span className="text-gray-400">{s.icon}</span>
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
          <div className="flex flex-col divide-y divide-gray-100">
            {mySurveys.length === 0 && (
              <p className="px-5 py-4 text-sm text-gray-400">Нет опросов</p>
            )}
            {mySurveys.map((s) => {
              const st = STATUS_MAP[s.status];
              const deadline = s.end_date
                ? new Date(s.end_date).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })
                : null;
              return (
                <div key={s.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: st.color }} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                        <span className="text-xs text-gray-400">{s.total_responses.toLocaleString("ru-RU")} голосов</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
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
        <div className="bg-white border border-[#E4E4E7] rounded-xl" style={{ padding: "20px 24px", display: "flex", flexDirection: "column" }}>
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Активность за 7 дней</h2>
          <p className="text-xs text-gray-400 mb-3">Ежедневная активность голосований</p>
          <AreaChart data={overview?.activity_last_7_days ?? []} />
        </div>

      </div>
    </AdminLayout>
  );
}