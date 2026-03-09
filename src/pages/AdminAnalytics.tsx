import AdminLayout from "../layouts/AdminLayout";

const regions = [
  { label: "Алматы",        total: 25, youth: 38 },
  { label: "Астана",        total: 65, youth: 60 },
  { label: "Шымкент",       total: 30, youth: 15 },
  { label: "Арг",           total: 48, youth: 42 },
  { label: "Карагандинская",total: 35, youth: 60 },
  { label: "ВКО",           total: 18, youth: 22 },
];

const patterns = [
  { value: "2 мин 18 сек", label: "Ср. время голосования" },
  { value: "23.4%",        label: "Оставляют комментарий" },
  { value: "71.2%",        label: "Голосуют с мобильного" },
  { value: "48.7%",        label: "Повторные участники" },
];

const maxVal = 80;

export default function AdminAnalytics() {
  return (
    <AdminLayout>
      <div style={{ padding: "40px 48px", gap: "40px", display: "flex", flexDirection: "column" }}>

        <h1 className="text-2xl font-bold text-gray-900">Расширенная аналитика</h1>

        {/* Bar chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-6">Сегментация по регионам</h2>

          {/* Y axis labels */}
          <div className="relative" style={{ height: "220px" }}>
            {[80, 60, 40, 20, 0].map((val) => (
              <div key={val} className="absolute w-full flex items-center gap-2"
                style={{ bottom: `${(val / maxVal) * 180}px` }}>
                <span className="text-xs text-gray-400 w-8 text-right flex-shrink-0">{val}%</span>
                <div className="flex-1 border-t border-gray-100" />
              </div>
            ))}

            {/* Bars */}
            <div className="absolute inset-0 flex items-end pl-10 gap-6">
              {regions.map((r, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div className="flex items-end gap-1 w-full justify-center" style={{ height: "180px" }}>
                    <div className="w-8 rounded-t-sm flex-shrink-0"
                      style={{ height: `${(r.total / maxVal) * 180}px`, backgroundColor: "#0A1628" }} />
                    <div className="w-8 rounded-t-sm flex-shrink-0"
                      style={{ height: `${(r.youth / maxVal) * 180}px`, backgroundColor: "#F5C518" }} />
                  </div>
                  <span className="text-xs text-gray-500 text-center">{r.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-4 pl-10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#0A1628" }} />
              <span className="text-xs text-gray-500">Общая поддержка</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#F5C518" }} />
              <span className="text-xs text-gray-500">Молодёжь 18–25</span>
            </div>
          </div>
        </div>

        {/* Behavioral patterns */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">Поведенческие паттерны</h2>
          <div className="grid grid-cols-4 gap-4">
            {patterns.map((p, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4">
                <div className="text-xl font-bold text-gray-900">{p.value}</div>
                <div className="text-xs text-gray-500 mt-1">{p.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
