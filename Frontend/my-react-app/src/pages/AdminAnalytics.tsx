import AdminLayout from "../layouts/AdminLayout";

const regions = [
  { label: "Алматы",         general: 25, youth: 38 },
  { label: "Астана",         general: 68, youth: 60 },
  { label: "Шымкент",        general: 28, youth: 14 },
  { label: "Карагандинская", general: 48, youth: 44 },
  { label: "ВКО",            general: 33, youth: 60 },
];

const patterns = [
  { value: "2 мин 18 сек", label: "Ср. время голосования" },
  { value: "23.4%",        label: "Оставляют комментарий" },
  { value: "71.2%",        label: "Голосуют с мобильного" },
  { value: "48.7%",        label: "Повторные участники" },
];

const YELLOW = "#EAB308";

function BarChart() {
  const chartH = 240;
  const max    = 80;
  const ticks  = [80, 60, 40, 20, 0];

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>

        {/* Y-axis */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "32px",
          flexShrink: 0,
          height: `${chartH}px`,
        }}>
          {ticks.map((t) => (
            <span key={t} style={{ fontSize: "10px", color: "#9CA3AF", lineHeight: 1, textAlign: "right" }}>
              {t}%
            </span>
          ))}
        </div>

        {/* Bars — flex grow, бары тянутся по ширине */}
        <div style={{ flex: 1, position: "relative", height: `${chartH}px` }}>
          <div style={{
            position: "absolute", left: 0, right: 0, bottom: 0,
            height: "1px", backgroundColor: "#E5E7EB",
          }} />
          <div style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            height: "100%",
            gap: "4px",
          }}>
            {regions.map((r) => (
              <div key={r.label} style={{
                flex: 1,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                gap: "2px",
                height: "100%",
              }}>
                <div style={{
                  flex: 1,
                  maxWidth: "28px",
                  height: `${(r.general / max) * chartH}px`,
                  backgroundColor: "#0A1628",
                  borderRadius: "3px 3px 0 0",
                }} />
                <div style={{
                  flex: 1,
                  maxWidth: "28px",
                  height: `${(r.youth / max) * chartH}px`,
                  backgroundColor: YELLOW,
                  borderRadius: "3px 3px 0 0",
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* X labels */}
      <div style={{ display: "flex", paddingLeft: "40px", marginTop: "8px", gap: "4px" }}>
        {regions.map((r) => (
          <div key={r.label} style={{
            flex: 1,
            textAlign: "center",
            fontSize: "10px",
            color: "#9CA3AF",
            lineHeight: 1.3,
            wordBreak: "break-word",
          }}>
            {r.label}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", marginTop: "14px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#0A1628", flexShrink: 0 }} />
          <span style={{ fontSize: "11px", color: "#6B7280" }}>Общая поддержка</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: YELLOW, flexShrink: 0 }} />
          <span style={{ fontSize: "11px", color: "#6B7280" }}>Молодёжь 18–25</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminReports() {
  return (
    <AdminLayout>
      <div className="px-4 pt-5 pb-0 md:px-12 md:pt-10 md:pb-0 flex flex-col gap-6">

        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Расширенная аналитика</h1>

        <div className="bg-white border border-[#E4E4E7] rounded-xl p-4 md:p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Сегментация по регионам</h2>
          <BarChart />
        </div>

        <div className="bg-white border border-[#E4E4E7] rounded-xl p-4 md:p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">Поведенческие паттерны</h2>
          {/* 1 колонка на мобиле, 2 на sm, 4 на md */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {patterns.map((p) => (
              <div key={p.label} className="bg-[#F9FAFB] rounded-lg p-4 flex flex-col gap-1">
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
