import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

type AdvancedStats = {
  comment_rate: number;
  repeat_participants_rate: number;
  mobile_rate?: number;
  avg_vote_time_sec?: number;
  region_survey_stats?: { label: string; total_surveys: number; completion_rate: number }[];
  age_group_stats?: { label: string; count: number; pct: number }[];
};

// ─── Mock region data ─────────────────────────────────────
const MOCK_REGIONS = [
  { label: "Алматы",        general: 24, youth: 38 },
  { label: "Астана",        general: 67, youth: 60 },
  { label: "Шымкент",       general: 28, youth: 15 },
  { label: "Арг",           general: 50, youth: 44 },
  { label: "Карагандинская",general: 33, youth: 60 },
  { label: "ВКО",           general: 18, youth: 25 },
];

// ─── Grouped Bar Chart ────────────────────────────────────
function GroupedBarChart({ data }: { data: typeof MOCK_REGIONS }) {
  const W = 900, H = 300;
  const padL = 44, padR = 20, padT = 16, padB = 56;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxVal = 80;
  const ticks = [0, 20, 40, 60, 80];

  const groupW = chartW / data.length;
  const barW = Math.min(36, groupW * 0.3);
  const gap = 6;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }} preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {ticks.map((t) => {
        const y = padT + chartH - (t / maxVal) * chartH;
        return (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">{t}%</text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const groupX = padL + i * groupW + groupW / 2;
        const x1 = groupX - barW - gap / 2;
        const x2 = groupX + gap / 2;

        const h1 = (d.general / maxVal) * chartH;
        const h2 = (d.youth / maxVal) * chartH;
        const y1 = padT + chartH - h1;
        const y2 = padT + chartH - h2;

        return (
          <g key={d.label}>
            <rect x={x1} y={y1} width={barW} height={h1} fill="#0A1628" rx="2" />
            <rect x={x2} y={y2} width={barW} height={h2} fill="#EAB308" rx="2" />
            <text
              x={groupX}
              y={padT + chartH + 18}
              textAnchor="middle"
              fontSize="12"
              fill="#6b7280"
            >
              {d.label}
            </text>
          </g>
        );
      })}

      {/* Bottom axis line */}
      <line x1={padL} x2={W - padR} y1={padT + chartH} y2={padT + chartH} stroke="#e5e7eb" strokeWidth="1" />

      {/* Legend */}
      <g transform={`translate(${padL}, ${H - 16})`}>
        <rect width="12" height="12" fill="#0A1628" rx="2" />
        <text x="16" y="10" fontSize="11" fill="#374151">Общая поддержка</text>
        <rect x="130" width="12" height="12" fill="#EAB308" rx="2" />
        <text x="146" y="10" fontSize="11" fill="#374151">Молодёжь 18–25</text>
      </g>
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────
export default function AdminAnalytics() {
  const [advanced, setAdvanced] = useState<AdvancedStats | null>(null);

  useEffect(() => {
    fetch("/api/v1/stats/advanced")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setAdvanced(d))
      .catch(() => {});
  }, []);

  const formatTime = (sec: number | undefined) => {
    if (!sec) return "2 мин 18 сек";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} мин ${s} сек`;
  };

  const patterns = [
    {
      value: formatTime(advanced?.avg_vote_time_sec),
      label: "Ср. время голосования",
    },
    {
      value: `${advanced?.comment_rate ?? 23.4}%`,
      label: "Оставляют комментарий",
    },
    {
      value: `${advanced?.mobile_rate ?? 71.2}%`,
      label: "Голосуют с мобильного",
    },
    {
      value: `${advanced?.repeat_participants_rate ?? 48.7}%`,
      label: "Повторные участники",
    },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col" style={{ padding: "clamp(20px, 4vw, 40px) clamp(16px, 4vw, 48px)", gap: "24px" }}>

        <h1 className="text-2xl font-bold text-gray-900">Расширенная аналитика</h1>

        {/* Сегментация по регионам */}
        <div className="bg-white border border-[#E4E4E7] rounded-xl" style={{ padding: "24px" }}>
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Сегментация по регионам</h2>
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: "480px" }}>
              <GroupedBarChart data={MOCK_REGIONS} />
            </div>
          </div>
        </div>

        {/* Поведенческие паттерны */}
        <div className="bg-white border border-[#E4E4E7] rounded-xl" style={{ padding: "24px" }}>
          <h2 className="text-sm font-semibold text-gray-900 mb-5">Поведенческие паттерны</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {patterns.map((p) => (
              <div
                key={p.label}
                className="rounded-xl flex flex-col gap-1"
                style={{ backgroundColor: "#F8F9FA", padding: "16px 20px" }}
              >
                <span className="text-xl font-bold text-gray-900">{p.value}</span>
                <span className="text-xs text-gray-500">{p.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
