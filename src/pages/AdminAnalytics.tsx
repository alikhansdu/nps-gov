import AdminLayout from "../layouts/AdminLayout";

const regions = [
  { label: "Алматы",         general: 25, youth: 38 },
  { label: "Астана",         general: 68, youth: 60 },
  { label: "Шымкент",        general: 28, youth: 14 },
  { label: "Арг",            general: 48, youth: 44 },
  { label: "Карагандинская", general: 33, youth: 60 },
  { label: "ВКО",            general: 18, youth: 25 },
];

const patterns = [
  { value: "2 мин 18 сек", label: "Ср. время голосования" },
  { value: "23.4%",        label: "Оставляют комментарий" },
  { value: "71.2%",        label: "Голосуют с мобильного" },
  { value: "48.7%",        label: "Повторные участники" },
];

const YELLOW = "#EAB308";

function BarChart() {
  const chartH = 300;
  const barW   = 63;
  const barGap = 13;
  const max    = 80;
  const ticks  = [80, 60, 40, 20, 0];

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "stretch" }}>

        {/* Y-axis labels */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "36px",
          flexShrink: 0,
          height: `${chartH}px`,
        }}>
          {ticks.map((t) => (
            <span key={t} style={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1, textAlign: "right" }}>
              {t}%
            </span>
          ))}
        </div>

        {/* Bars area */}
        <div style={{ flex: 1, position: "relative", height: `${chartH}px` }}>
          <div style={{
            position: "absolute",
            left: 0, right: 0, bottom: 0,
            height: "1px",
            backgroundColor: "#E5E7EB",
          }} />
          <div style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-around",
            height: "100%",
          }}>
            {regions.map((r) => (
              <div key={r.label} style={{ display: "flex", alignItems: "flex-end", gap: `${barGap}px` }}>
                <div style={{
                  width: `${barW}px`,
                  height: `${(r.general / max) * chartH}px`,
                  backgroundColor: "#0A1628",
                  borderRadius: "3px 3px 0 0",
                  flexShrink: 0,
                }} />
                <div style={{
                  width: `${barW}px`,
                  height: `${(r.youth / max) * chartH}px`,
                  backgroundColor: YELLOW,
                  borderRadius: "3px 3px 0 0",
                  flexShrink: 0,
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* X labels */}
      <div style={{ display: "flex", paddingLeft: "48px", marginTop: "8px" }}>
        {regions.map((r) => (
          <div key={r.label} style={{ flex: 1, textAlign: "center", fontSize: "11px", color: "#9CA3AF" }}>
            {r.label}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", marginTop: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "2px", backgroundColor: "#0A1628", flexShrink: 0 }} />
          <span style={{ fontSize: "12px", color: "#6B7280" }}>Общая поддержка</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "2px", backgroundColor: YELLOW, flexShrink: 0 }} />
          <span style={{ fontSize: "12px", color: "#6B7280" }}>Молодёжь 18–25</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminReports() {
  return (
    <AdminLayout>
      <div style={{ padding: "40px 32px 40px 48px", display: "flex", flexDirection: "column", gap: "24px" }}>

        <h1 className="text-2xl font-bold text-gray-900">Расширенная аналитика</h1>

        <div className="bg-white border border-[#E4E4E7] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Сегментация по регионам</h2>
          <BarChart />
        </div>

        <div className="bg-white border border-[#E4E4E7] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">Поведенческие паттерны</h2>
          <div className="grid grid-cols-4 gap-6">
            {patterns.map((p) => (
              <div key={p.label} className="flex flex-col gap-1.5">
                <div className="text-2xl font-bold text-gray-900">{p.value}</div>
                <div className="text-sm text-gray-500">{p.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}