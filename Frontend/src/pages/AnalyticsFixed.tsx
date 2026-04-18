import { useEffect, useMemo, useState } from "react";
import kzMapImg from "../assets/kz-blank.svg";
import Header from "../components/Header";
import Footer from "../components/Footer";

// ─── Types ───────────────────────────────────────────────
type StatsOverview = {
  active_surveys: number;
  completed_surveys: number;
  total_responses: number;
  activity_last_7_days: Array<{ date: string; responses_count: number }>;
};

type AdvancedStats = {
  region_survey_stats: Array<{ label: string; total_surveys: number; completed_surveys: number; completion_rate: number }>;
  age_group_stats: Array<{ label: string; count: number; pct: number }>;
  gender_stats: Array<{ label: string; count: number; pct: number }>;
};

type CategoryItem = {
  label: string;
  responses_count: number;
  pct: number;
};

type TimelineItem = {
  id: number;
  title: string;
  description: string | null;
  end_date: string | null;
  total_responses: number;
  support_pct: number;
  implementation_status: string;
};

type DecisionItem = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  survey_id: number | null;
};

// ─── Helpers ─────────────────────────────────────────────
function formatRuNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("ru-RU");
}
function formatEndDate(iso: string | null): string {
  if (!iso) return "—";
  return "До " + new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Status maps ──────────────────────────────────────────
const IMPL_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:     { label: "Ожидает",     color: "#6b7280" },
  in_progress: { label: "В процессе",  color: "#d97706" },
  implemented: { label: "Реализовано", color: "#16a34a" },
  rejected:    { label: "Отклонено",   color: "#dc2626" },
};

const DECISION_STATUS_MAP: Record<string, { label: string; color: string }> = {
  implemented: { label: "Реализовано", color: "#16a34a" },
  in_progress: { label: "В процессе",  color: "#d97706" },
};

// ─── Icons ───────────────────────────────────────────────
const VoteIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>;
const TrendIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ClockIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

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

  const W = 640, H = 200, padL = 44, padR = 16, padT = 30, padB = 32;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxVal = Math.max(...data.map(d => d.responses_count), 1);
  // Подбираем шаг так, чтобы 4 деления покрыли максимум
  const STEPS = [1, 2, 5, 10, 15, 20, 25, 50, 100, 150, 200, 250, 500,
                 1000, 1500, 2000, 5000, 10000, 15000, 20000, 50000, 100000];
  const step  = STEPS.find(s => s * 4 >= maxVal) ?? 100000;
  const niceMax = step * 4;
  const yTicks  = [0, step, step * 2, step * 3, niceMax];

  const xOf = (i: number) =>
    padL + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2);
  const yOf = (v: number) => padT + chartH - (v / niceMax) * chartH;

  const pts = data.map((d, i) => ({ x: xOf(i), y: yOf(d.responses_count), v: d.responses_count, date: d.date }));

  // Catmull-Rom → cubic bezier: плавная кривая через все точки
  const linePath = (() => {
    const n = pts.length;
    if (n === 1) return `M${pts[0].x},${pts[0].y}`;
    let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < n - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(n - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return d;
  })();

  const areaPath =
    `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${(padT + chartH).toFixed(1)}` +
    ` L${pts[0].x.toFixed(1)},${(padT + chartH).toFixed(1)} Z`;

  const peak = pts.reduce((a, b) => (b.v > a.v ? b : a), pts[0]);

  const fmtY = (v: number) =>
    v === 0 ? "0" : v >= 1000 ? `${Math.round(v / 1000)}k` : String(v);

  const fmtDate = (iso: string) => {
    const d = new Date(iso + "T12:00:00");
    const day = d.getDate();
    const raw = d.toLocaleDateString("ru-RU", { month: "short" }).replace(".", "");
    const month = raw.charAt(0).toUpperCase() + raw.slice(1, 3);
    return `${day} ${month}`;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#9ca3af" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#9ca3af" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {/* Горизонтальные линии сетки + подписи Y */}
      {yTicks.map((v, i) => {
        const y = yOf(v);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
              {fmtY(v)}
            </text>
          </g>
        );
      })}

      {/* Заливка под кривой */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* Плавная кривая */}
      <path d={linePath} fill="none" stroke="#9ca3af" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" />

      {/* Точка пика + подпись */}
      <circle cx={peak.x} cy={peak.y} r="5" fill="#1E3A66" />
      <text x={peak.x} y={peak.y - 10} textAnchor="middle" fontSize="11"
            fill="#1E3A66" fontWeight="600">
        {peak.v.toLocaleString("ru-RU")}
      </text>

      {/* Подписи по оси X */}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={H - 4} textAnchor="middle" fontSize="10" fill="#9ca3af">
          {fmtDate(p.date)}
        </text>
      ))}
    </svg>
  );
}

// ─── Main ─────────────────────────────────────────────────
export default function AnalyticsFixed() {
  const [overview,   setOverview]   = useState<StatsOverview | null>(null);
  const [advanced,   setAdvanced]   = useState<AdvancedStats | null>(null);
  const [timeline,   setTimeline]   = useState<TimelineItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [decisions,  setDecisions]  = useState<DecisionItem[]>([]);

  useEffect(() => {
    fetch("/api/v1/stats/overview")
      .then(r => r.ok ? r.json() : null).then(setOverview).catch(() => {});
    fetch("/api/v1/stats/advanced")
      .then(r => r.ok ? r.json() : null).then(setAdvanced).catch(() => {});
    fetch("/api/v1/stats/timeline")
      .then(r => r.ok ? r.json() : []).then(setTimeline).catch(() => {});
    fetch("/api/v1/stats/category")
      .then(r => r.ok ? r.json() : []).then(setCategories).catch(() => {});
    fetch("/api/v1/decisions")
      .then(r => r.ok ? r.json() : []).then(setDecisions).catch(() => {});
  }, []);

  // ── Derived data ─────────────────────────────────────────
  const participationRate = useMemo(() => {
    if (!overview) return null;
    const total = overview.active_surveys + overview.completed_surveys;
    if (total === 0) return null;
    return (overview.completed_surveys / total * 100).toFixed(1) + "%";
  }, [overview]);

  const regionData = useMemo(() =>
    (advanced?.region_survey_stats ?? [])
      .filter(r => r.total_surveys > 0)
      .sort((a, b) => b.completion_rate - a.completion_rate)
      .slice(0, 7),
    [advanced]
  );

  const ageData = useMemo(() =>
    advanced?.age_group_stats ?? [],
    [advanced]
  );

  const womenPct = useMemo(() => {
    const w = advanced?.gender_stats?.find(g => g.label === "Женщины");
    return w?.pct ?? 54;
  }, [advanced]);
  const menPct = useMemo(() => {
    const m = advanced?.gender_stats?.find(g => g.label === "Мужчины");
    return m?.pct ?? 46;
  }, [advanced]);

  const statCards = [
    { label: "Всего голосов",       value: formatRuNumber(overview?.total_responses),   icon: <VoteIcon /> },
    { label: "Уровень участия",     value: participationRate ?? "—",                     icon: <TrendIcon /> },
    { label: "Активных опросов",    value: formatRuNumber(overview?.active_surveys),    icon: <UsersIcon /> },
    { label: "Завершённых опросов", value: formatRuNumber(overview?.completed_surveys), icon: <ClockIcon /> },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FAFC" }}>
      <Header activeNav="/analytics" />

      <div className="w-full border-b border-gray-200 bg-white px-4 sm:px-10 lg:px-20" style={{ paddingTop: "28px", paddingBottom: "28px" }}>
          <h1 className="text-2xl font-bold text-gray-900">Аналитика</h1>
          <p className="text-sm text-gray-500 mt-1">Публичная статистика голосований Республики Казахстан</p>
      </div>

      <main className="flex-1 w-full flex flex-col px-4 sm:px-10 lg:px-20 py-8 gap-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((c) => (
            <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-3">
              <div className="flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-lg flex-shrink-0" style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}>
                {c.icon}
              </div>
              <div className="flex flex-col gap-0.5 sm:gap-0">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{c.value}</div>
                <div className="text-xs sm:text-sm text-gray-500">{c.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Map + Region stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Карта Казахстана</h3>
            <p className="text-xs text-gray-400 mb-4">Активность по регионам</p>
            <img src={kzMapImg} alt="Карта Казахстана" style={{ width: "100%", maxHeight: "280px", objectFit: "contain" }} />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Завершённые опросы</h3>
            {regionData.length === 0 ? (
              <p className="text-sm text-gray-400">Загрузка...</p>
            ) : (
              <div className="flex flex-col gap-3">
                {regionData.map((r) => (
                  <div key={r.label} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{r.label}</span>
                      <span className="font-semibold text-gray-900">{r.completion_rate}%</span>
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
            <div className="flex flex-col gap-3">
              {(ageData.length > 0 ? ageData : [
                { label: "18–24", pct: 42 }, { label: "25–34", pct: 78 },
                { label: "35–44", pct: 55 }, { label: "45–54", pct: 33 },
                { label: "55–64", pct: 48 }, { label: "65+",   pct: 60 },
              ]).map((g) => (
                <div key={g.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-12 flex-shrink-0">{g.label}</span>
                  <div className="flex-1 rounded-full" style={{ height: "10px", backgroundColor: "#e5e7eb" }}>
                    <div className="rounded-full h-full" style={{ width: `${g.pct}%`, backgroundColor: "#1E3A66" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Donut chart — gender */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 self-start">Распределение по полу</h3>
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

          {/* БАГ 1: По тематике — реальные данные из /api/v1/stats/category */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">По тематике</h3>
            {categories.length === 0 ? (
              <p className="text-sm text-gray-400">Нет данных по категориям</p>
            ) : (
              <div className="flex flex-col gap-3">
                {categories.map((g) => (
                  <div key={g.label} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-24 flex-shrink-0 leading-tight">{g.label}</span>
                    <div className="flex-1 rounded-full" style={{ height: "10px", backgroundColor: "#e5e7eb" }}>
                      <div className="rounded-full h-full" style={{ width: `${g.pct}%`, backgroundColor: "#EAB308" }} />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right flex-shrink-0">{g.pct}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Динамика участия */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm overflow-x-auto">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Динамика участия</h3>
          <p className="text-xs text-gray-400 mb-4">Ежедневная активность голосований за последние 7 дней</p>
          <div style={{ minWidth: "400px" }}>
            <AreaChart data={overview?.activity_last_7_days ?? []} />
          </div>
        </div>

        {/* Хронология + Принятые изменения */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* БАГ 2: Хронология решений — реальный implementation_status из API */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-gray-900">Хронология решений</h3>
            {timeline.length === 0 ? (
              <p className="text-sm text-gray-400">Нет завершённых опросов</p>
            ) : (
              timeline.map((item) => {
                const st = IMPL_STATUS_MAP[item.implementation_status] ?? IMPL_STATUS_MAP.pending;
                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400">{formatEndDate(item.end_date)}</span>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${st.color}18`, color: st.color }}
                      >
                        {st.label}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 line-clamp-2">{item.description}</div>
                    )}
                    <div className="flex gap-4 text-xs text-gray-500 mt-1">
                      <span><b className="text-gray-900">{formatRuNumber(item.total_responses)}</b> голосов</span>
                      <span>Поддержка: <b className="text-gray-900">{item.support_pct}%</b></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* БАГ 3: Принятые изменения — реальные данные из /api/v1/decisions */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-gray-900">Принятые изменения</h3>
            {decisions.length === 0 ? (
              <p className="text-sm text-gray-400">Нет данных о принятых изменениях</p>
            ) : (
              decisions.map((c) => {
                const st = DECISION_STATUS_MAP[c.status] ?? DECISION_STATUS_MAP.in_progress;
                return (
                  <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-2">
                    <div
                      className="flex items-center justify-center rounded-lg flex-shrink-0"
                      style={{ width: "32px", height: "32px", backgroundColor: `${st.color}18` }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={st.color} strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-400">Какие действия предприняты:</div>
                    <div className="text-sm font-semibold text-gray-900">{c.title}</div>
                    {c.description && (
                      <div className="text-xs text-gray-500">{c.description}</div>
                    )}
                    <div className="mt-1">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${st.color}18`, color: st.color }}
                      >
                        {st.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div
              className="rounded-xl p-4 text-xs text-gray-600 leading-relaxed"
              style={{ backgroundColor: "#EFF6FF" }}
            >
              Все решения принимаются в соответствии с Законом РК «О доступе к информации» и публикуются в открытом доступе на данном портале.
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
