import { useEffect, useMemo, useState } from "react";
import kzMapImg from "../assets/kz-blank.svg";
import Header from "../components/Header";
import Footer from "../components/Footer";

type StatsOverview = {
  draft_surveys?: number;
  active_surveys: number;
  completed_surveys: number;
  total_responses: number;
  activity_last_7_days: Array<{ date: string; responses_count: number }>;
};

type RegionSurveyItem = {
  label: string;
  total_surveys: number;
  completed_surveys: number;
  completion_rate: number;
};

type AgeGroupItem = {
  label: string;
  count: number;
  pct: number;
};

type GenderItem = {
  label: string;
  count: number;
  pct: number;
};

type AdvancedStats = {
  region_survey_stats: RegionSurveyItem[];
  age_group_stats: AgeGroupItem[];
  gender_stats: GenderItem[];
  comment_rate: number;
  repeat_participants_rate: number;
};

function formatRuNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("ru-RU");
}

// ─── Icons ───────────────────────────────────────────────
const VoteIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>;
const TrendIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const UsersIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ClockIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

// ─── Donut Chart ──────────────────────────────────────────
function DonutChart({ women, men: _men }: { women: number; men: number }) {
  const r = 60, cx = 80, cy = 80, stroke = 28;
  const circ = 2 * Math.PI * r;
  const womenDash = (women / 100) * circ;
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EAB308" strokeWidth={stroke} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1E3A66" strokeWidth={stroke}
        strokeDasharray={`${womenDash} ${circ - womenDash}`}
        strokeDashoffset={circ / 4}
        style={{ transform: "rotate(-90deg)", transformOrigin: "80px 80px" }}
      />
    </svg>
  );
}

// ─── Area Chart ───────────────────────────────────────────
function AreaChart({ data }: { data: Array<{ date: string; responses_count: number }> }) {
  if (!data.length) return <div className="text-sm text-gray-400">Нет данных</div>;
  const W = 600, H = 160, pad = 40;
  const max = Math.max(...data.map(d => d.responses_count), 1);
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - (d.responses_count / max) * (H - pad * 2);
    return [x, y];
  });
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const areaD = pathD + ` L${pts[pts.length-1][0]},${H-pad} L${pts[0][0]},${H-pad} Z`;
  const peak = pts.reduce((a, b) => (b[1] < a[1] ? b : a));
  const peakData = data[pts.indexOf(peak)];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b7280" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6b7280" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#areaGrad)" />
      <path d={pathD} fill="none" stroke="#6b7280" strokeWidth="2" />
      <circle cx={peak[0]} cy={peak[1]} r="5" fill="#1E3A66" />
      <text x={peak[0]} y={peak[1] - 10} textAnchor="middle" fontSize="11" fill="#1E3A66" fontWeight="600">
        {formatRuNumber(peakData?.responses_count)}
      </text>
      {data.map((d, i) => (
        <text key={d.date} x={pts[i][0]} y={H - 8} textAnchor="middle" fontSize="10" fill="#9ca3af">
          {d.date.slice(5)}
        </text>
      ))}
      {[0, Math.round(max/2), max].map((v, i) => (
        <text key={i} x={10} y={H - pad - (v / max) * (H - pad * 2) + 4} fontSize="10" fill="#9ca3af">
          {v > 1000 ? `${Math.round(v/1000)}k` : v}
        </text>
      ))}
    </svg>
  );
}

// ─── Main ─────────────────────────────────────────────────
export default function AnalyticsFixed() {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [advanced, setAdvanced] = useState<AdvancedStats | null>(null);

  useEffect(() => {
    fetch("/api/v1/stats/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setOverview(data))
      .catch(() => {});

    fetch("/api/v1/stats/advanced")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setAdvanced(data))
      .catch(() => {});
  }, []);

  const statCards = useMemo(() => [
    { label: "Всего голосов",      value: formatRuNumber(overview?.total_responses),   icon: <VoteIcon /> },
    { label: "Уровень участия",    value: advanced ? `${advanced.repeat_participants_rate}%` : "—", icon: <TrendIcon /> },
    { label: "Активных опросов",   value: formatRuNumber(overview?.active_surveys),    icon: <UsersIcon /> },
    { label: "Завершённых опросов", value: formatRuNumber(overview?.completed_surveys), icon: <ClockIcon /> },
  ], [overview, advanced]);

  const womenPct = advanced?.gender_stats.find(g => g.label === "Женщины")?.pct ?? 54;
  const menPct   = advanced?.gender_stats.find(g => g.label === "Мужчины")?.pct ?? 46;

  const regionStats = advanced?.region_survey_stats ?? [];
  const ageGroups   = advanced?.age_group_stats ?? [];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FAFC" }}>
      <Header activeNav="/analytics" />

      <div className="w-full border-b border-gray-200 bg-white" style={{ paddingTop: "28px", paddingBottom: "28px" }}>
        <div className="px-6 lg:px-20">
          <h1 className="text-2xl font-bold text-gray-900">Аналитика</h1>
          <p className="text-sm text-gray-500 mt-1">Публичная статистика голосований Республики Казахстан</p>
        </div>
      </div>

      <main className="flex-1 w-full flex flex-col px-6 lg:px-20 py-10 gap-8 max-w-[1280px] mx-auto w-full">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((c) => (
            <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}>
                {c.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900">{c.value}</div>
              <div className="text-sm text-gray-500">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Map + Region stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Карта Казахстана</h3>
            <p className="text-xs text-gray-400 mb-4">Активность по регионам</p>
            <img src={kzMapImg} alt="Карта Казахстана" style={{ width: "100%", maxHeight: "280px", objectFit: "contain" }} />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Завершённые опросы</h3>
            {regionStats.length === 0 ? (
              <div className="text-sm text-gray-400">Нет данных</div>
            ) : (
              <div className="flex flex-col gap-3">
                {regionStats.map((r) => (
                  <div key={r.label} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{r.label}</span>
                      <span>{r.completion_rate}%</span>
                    </div>
                    <div className="w-full rounded-full" style={{ height: "6px", backgroundColor: "#e5e7eb" }}>
                      <div className="rounded-full h-full" style={{ width: `${r.completion_rate}%`, backgroundColor: "#1E3A66" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Age groups + Donut + Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Horizontal bar — age */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Возрастные группы</h3>
            {ageGroups.length === 0 ? (
              <div className="text-sm text-gray-400">Нет данных</div>
            ) : (
              <div className="flex flex-col gap-3">
                {ageGroups.map((g) => (
                  <div key={g.label} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-10 flex-shrink-0">{g.label}</span>
                    <div className="flex-1 rounded-full" style={{ height: "10px", backgroundColor: "#e5e7eb" }}>
                      <div className="rounded-full h-full" style={{ width: `${g.pct}%`, backgroundColor: "#1E3A66" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Donut chart — gender */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 self-start">Пол участников</h3>
            <DonutChart women={womenPct} men={menPct} />
            <div className="flex gap-6 mt-4 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: "#1E3A66" }} />
                Женщины — {womenPct}%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: "#EAB308" }} />
                Мужчины — {menPct}%
              </span>
            </div>
          </div>

          {/* Horizontal bar — comments rate */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Поведение участников</h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Оставляют комментарий</span>
                  <span>{advanced?.comment_rate ?? "—"}%</span>
                </div>
                <div className="w-full rounded-full" style={{ height: "10px", backgroundColor: "#e5e7eb" }}>
                  <div className="rounded-full h-full" style={{ width: `${advanced?.comment_rate ?? 0}%`, backgroundColor: "#EAB308" }} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Повторные участники</span>
                  <span>{advanced?.repeat_participants_rate ?? "—"}%</span>
                </div>
                <div className="w-full rounded-full" style={{ height: "10px", backgroundColor: "#e5e7eb" }}>
                  <div className="rounded-full h-full" style={{ width: `${advanced?.repeat_participants_rate ?? 0}%`, backgroundColor: "#EAB308" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Динамика участия */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Динамика участия</h3>
          <p className="text-xs text-gray-400 mb-4">Ежедневная активность голосований за последние 7 дней</p>
          <AreaChart data={overview?.activity_last_7_days ?? []} />
        </div>

      </main>

      <Footer />
    </div>
  );
}
