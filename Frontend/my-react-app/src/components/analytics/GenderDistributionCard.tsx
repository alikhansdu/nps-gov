const DonutChart = () => {
  const size = 252;
  const cx = size / 2;
  const cy = size / 2;
  const r = 86;
  const circ = 2 * Math.PI * r;
  const femaleArc = (54 / 100) * circ;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0A1628" strokeWidth="40" />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#F5C518"
        strokeWidth="40"
        strokeDasharray={`${femaleArc} ${circ}`}
        strokeDashoffset={circ * 0.25}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </svg>
  );
};

export default function GenderDistributionCard() {
  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-10 shadow-sm flex flex-col items-center w-full lg:w-[413px]">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 self-start">Гендерное распределение</h3>
      <DonutChart />
      <div className="flex items-center gap-4 mt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#0A1628" }} />
          <span className="text-xs text-gray-500">Женщины — 54%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#F5C518" }} />
          <span className="text-xs text-gray-500">Мужчины — 46%</span>
        </div>
      </div>
    </div>
  );
}

