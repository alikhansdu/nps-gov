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


type TimelineItem = {
  id: number;
  title: string;
  description: string | null;
  end_date: string | null;
  total_responses: number;
  support_pct: number;
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

// ─── Icons ───────────────────────────────────────────────
const VoteIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>;
const TrendIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ClockIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

// Status cycle for timeline items
const TIMELINE_STATUSES = [
  { label: "Реализовано", color: "#16a34a" },
  { label: "В процессе",  color: "#d97706" },
  { label: "Отклонено",   color: "#dc2626" },
  { label: "Реализовано", color: "#16a34a" },
];

// Static "Принятые изменения" — requires separate DB model, using demo data
const CHANGES = [
  { iconColor: "#16a34a", status: "Реализовано",  statusColor: "#16a34a", title: "Улучшение качества образования",        desc: "Повышение зарплат педагогов на 25%, программа переподготовки, новые учебники" },
  { iconColor: "#d97706", status: "В процессе",   statusColor: "#d97706", title: "Развитие дорожной инфраструктуры",       desc: "Капитальный ремонт дорог в 7 регионах, выделено 120 млрд тенге" },
  { iconColor: "#d97706", status: "В процессе",   statusColor: "#d97706", title: "Улучшение экологической обстановки",     desc: "Введены новые стандарты выбросов, реализация к 2027 году" },
];

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
          {new Date(d.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}
        </text>
      ))}
      {[0, Math.round(max / 2), max].map((v, i) => (
        <text key={i} x={10} y={H - pad - (v / max) * (H - pad * 2) + 4} fontSize="10" fill="#9ca3af">
          {v > 1000 ? `${Math.round(v / 1000)}k` : v}
        </text>
      ))}
    </svg>
  );
}

// ─── Main ─────────────────────────────────────────────────
export default function AnalyticsFixed() {
  const [overview,  setOverview]  = useState<StatsOverview | null>(null);
  const [advanced,  setAdvanced]  = useState<AdvancedStats | null>(null);
  const [timeline,  setTimeline]  = useState<TimelineItem[]>([]);

  useEffect(() => {
    fetch("/api/v1/stats/overview")
      .then(r => r.ok ? r.json() : null).then(setOverview).catch(() => {});
    fetch("/api/v1/stats/advanced")
      .then(r => r.ok ? r.json() : null).then(setAdvanced).catch(() => {});
    fetch("/api/v1/stats/timeline")
      .then(r => r.ok ? r.json() : []).then(setTimeline).catch(() => {});
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

  // ── Topic stat (fallback static — no category model yet) ──
  const topicStats = [
    { label: "Инфраструктура", pct: 80 },
    { label: "Здравоохранение", pct: 65 },
    { label: "Образование",     pct: 60 },
    { label: "Экология",        pct: 45 },
    { label: "Цифровизация",    pct: 55 },
    { label: "Экономика",       pct: 72 },
  ];

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

          {/* Horizontal bar — topics (yellow) */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">По тематике</h3>
            <div className="flex flex-col gap-3">
              {topicStats.map((g) => (
                <div key={g.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-24 flex-shrink-0 leading-tight">{g.label}</span>
                  <div className="flex-1 rounded-full" style={{ height: "10px", backgroundColor: "#e5e7eb" }}>
                    <div className="rounded-full h-full" style={{ width: `${g.pct}%`, backgroundColor: "#EAB308" }} />
                  </div>
                </div>
              ))}
            </div>
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
          {/* Хронология решений */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-gray-900">Хронология решений</h3>
            {timeline.length === 0 ? (
              <p className="text-sm text-gray-400">Нет завершённых опросов</p>
            ) : (
              timeline.map((item, i) => {
                const st = TIMELINE_STATUSES[i % TIMELINE_STATUSES.length];
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

          {/* Принятые изменения */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-gray-900">Принятые изменения</h3>
            {CHANGES.map((c, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-2">
                <div
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ width: "32px", height: "32px", backgroundColor: `${c.iconColor}18` }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.iconColor} strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="text-xs text-gray-400">Какие действия предприняты:</div>
                <div className="text-sm font-semibold text-gray-900">{c.title}</div>
                <div className="text-xs text-gray-500">{c.desc}</div>
                <div className="flex items-center justify-between mt-1">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${c.statusColor}18`, color: c.statusColor }}
                  >
                    {c.status}
                  </span>
                  <a href="#" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                    Подробнее
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                </div>
              </div>
            ))}
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
