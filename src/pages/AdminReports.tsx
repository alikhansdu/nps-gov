import AdminLayout from "../layouts/AdminLayout";

const PdfIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const XlsIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>;
const PptIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>;
const DownIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

const exports = [
  { icon: <PdfIcon />, label: "Полный отчёт PDF", sub: "Скачать" },
  { icon: <XlsIcon />, label: "Данные Excel",     sub: "Скачать" },
  { icon: <PptIcon />, label: "Презентация",       sub: "Скачать" },
];

const cardStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "0.5px solid #E4E4E7",
  borderRadius: "16px",
  padding: "24px",
};

export default function AdminAIReports() {
  return (
    <AdminLayout>
      <div style={{
        padding: "40px 32px 40px 48px",
        gap: "12px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F8FAFC",
        minHeight: "100%",
      }}>

        <h1 className="text-2xl font-bold text-gray-900" style={{ marginBottom: "12px" }}>
          Отчёты и AI-инсайты
        </h1>

        {/* AI Analysis */}
        <div style={{ ...cardStyle, minHeight: "420px" }}>
          <h2 className="text-sm font-semibold text-gray-900">AI-анализ данных</h2>
        </div>

        {/* Export */}
        <div style={{ ...cardStyle, minHeight: "192px" }}>
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Экспорт отчётов</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            {exports.map((e, i) => (
              <button
                key={i}
                className="text-left transition-colors"
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E4E4E7",
                  borderRadius: "12px",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(el) => (el.currentTarget.style.backgroundColor = "#F1F5F9")}
                onMouseLeave={(el) => (el.currentTarget.style.backgroundColor = "#F8FAFC")}
              >
                <span style={{ color: "#374151", flexShrink: 0 }}>{e.icon}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>
                    {e.label}
                  </p>
                  <p style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    color: "#9CA3AF",
                    margin: 0,
                    fontWeight: 400,
                  }}>
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