import AdminLayout from "../layouts/AdminLayout";

const PdfIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const XlsIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>;
const PptIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>;
const DownIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

const exports = [
  { icon: <PdfIcon />, label: "Полный отчёт PDF", sub: "Скачать" },
  { icon: <XlsIcon />, label: "Данные Excel",     sub: "Скачать" },
  { icon: <PptIcon />, label: "Презентация",       sub: "Скачать" },
];

export default function AdminReports() {
  return (
    <AdminLayout>
      <div style={{ padding: "40px 48px", gap: "40px", display: "flex", flexDirection: "column" }}>

        <h1 className="text-2xl font-bold text-gray-900">Отчёты и AI-инсайты</h1>

        {/* AI Analysis */}
        <div className="bg-white border border-gray-200 rounded-xl p-6" style={{ minHeight: "280px" }}>
          <h2 className="text-sm font-semibold text-gray-900 mb-4">AI-анализ данных</h2>
          {/* Empty area — будет заполнено при подключении AI */}
        </div>

        {/* Export */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Экспорт отчётов</h2>
          <div className="grid grid-cols-3 gap-4">
            {exports.map((e, i) => (
              <button key={i}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left">
                <span className="text-gray-600">{e.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{e.label}</p>
                  <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <DownIcon /> {e.sub}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
