import type { AnalyticsDynamicsPoint } from "../../types";

function AreaChart({ data }: { data: AnalyticsDynamicsPoint[] }) {
  const w = 560;
  const h = 120;
  const max = Math.max(...data.map((d) => d.value), 1);
  const points = data.map((d, i) => ({
    x: (i / Math.max(1, data.length - 1)) * w,
    y: h - (d.value / max) * h,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${pathD} L${w},${h} L0,${h} Z`;
  const peak = points[Math.min(2, points.length - 1)] ?? { x: 0, y: 0 };

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${h + 30}`} style={{ width: "100%", height: "185px" }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00132D" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00132D" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#areaGrad)" />
        <path d={pathD} fill="none" stroke="#00132D" strokeOpacity="0.8" strokeWidth="1.5" />
        <circle cx={peak.x} cy={peak.y} r="4" fill="#00132D" />
        <text x={peak.x} y={peak.y - 10} textAnchor="middle" fontSize="10" fill="#00132D">
          44 800
        </text>
        {data.map((d, i) => (
          <text
            key={i}
            x={(i / Math.max(1, data.length - 1)) * w}
            y={h + 20}
            textAnchor="middle"
            fontSize="9"
            fill="#9CA3AF"
          >
            {d.date}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function DynamicsCard({ data }: { data: AnalyticsDynamicsPoint[] }) {
  return (
    <div className="bg-white border border-[#E4E4E7] border-[0.5px] rounded-xl p-10 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Динамика участия</h3>
      <p className="text-xs text-gray-400 mb-4">Ежедневная активность голосований за последние 7 дней</p>
      <AreaChart data={data} />
    </div>
  );
}

