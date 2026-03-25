interface Point {
  date: string;
  value: number;
}

export default function AdminMiniAreaChart({ data }: { data?: Point[] }) {
  // Renders compact area chart for admin dashboard trends.
  if (!data || data.length < 2) {
    return <div className="text-sm text-gray-400">Нет данных</div>;
  }

  const W = 1188, H = 320;
  const padL = 40, padR = 8, padT = 16, padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const max = 60000;
  const ticks = [60000, 45000, 30000, 15000, 0];

  const toY = (v: number) => padT + chartH - (v / max) * chartH;
  const toX = (i: number) => padL + (i / Math.max(1, data.length - 1)) * chartW;

  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.value) }));

  const curve = pts.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = pts[i - 1];
    const dx = (p.x - prev.x) * 0.45;
    return `${acc} C${prev.x + dx},${prev.y} ${p.x - dx},${p.y} ${p.x},${p.y}`;
  }, "");

  const bottomY = padT + chartH;
  const area = `${curve} L${pts[pts.length - 1].x},${bottomY} L${pts[0].x},${bottomY} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Y labels + grid lines */}
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={padL} y1={toY(t)}
            x2={W - padR} y2={toY(t)}
            stroke="#F3F4F6" strokeWidth="1"
          />
          <text
            x={padL - 6} y={toY(t)}
            textAnchor="end" dominantBaseline="middle"
            fontSize="11" fill="#9aabb8" fontFamily="inherit"
          >
            {t === 0 ? "0" : `${t / 1000}k`}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={area} fill="#a8b4c4" fillOpacity="0.78" />

      {/* Line */}
      <path
        d={curve} fill="none"
        stroke="#8a9ab2" strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round"
      />

      {/* X labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={toX(i)} y={H - 4}
          textAnchor="middle" dominantBaseline="auto"
          fontSize="11" fill="#9aabb8" fontFamily="inherit"
        >
          {d.date}
        </text>
      ))}
    </svg>
  );
}
