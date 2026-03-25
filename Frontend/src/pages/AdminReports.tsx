import React, { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

const PdfIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const XlsIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>;
const PptIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>;
const DownIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const SparkleIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/></svg>;

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

interface StatsOverview {
  draft_surveys: number;
  active_surveys: number;
  completed_surveys: number;
  total_responses: number;
  activity_last_7_days: { date: string; responses_count: number }[];
}

interface InsightBlock {
  title: string;
  text: string;
  type: "positive" | "warning" | "info";
}

export default function AdminAIReports() {
  const [insights, setInsights] = useState<InsightBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Берём данные с бэка
      const statsRes = await fetch("/api/v1/stats/overview");
      if (!statsRes.ok) throw new Error("Не удалось загрузить статистику");
      const stats: StatsOverview = await statsRes.json();

      const totalActivity = stats.activity_last_7_days.reduce((s, d) => s + d.responses_count, 0);
      const avgPerDay = (totalActivity / 7).toFixed(1);
      const lastDay = stats.activity_last_7_days[stats.activity_last_7_days.length - 1];
      const trend = lastDay.responses_count > Number(avgPerDay) ? "растёт" : "снижается";

      const prompt = `Ты аналитик государственной платформы опросов граждан Казахстана.
Вот статистика платформы:
- Черновики опросов: ${stats.draft_surveys}
- Активные опросы: ${stats.active_surveys}
- Завершённые опросы: ${stats.completed_surveys}
- Всего ответов: ${stats.total_responses}
- Активность за 7 дней: ${stats.activity_last_7_days.map(d => `${d.date}: ${d.responses_count}`).join(", ")}
- Среднее ответов в день: ${avgPerDay}
- Тренд активности: ${trend}

Дай ровно 3 инсайта в формате JSON массива. Каждый инсайт:
{
  "title": "Короткий заголовок (макс 6 слов)",
  "text": "2-3 предложения с конкретным наблюдением и рекомендацией",
  "type": "positive" | "warning" | "info"
}

Отвечай ТОЛЬКО валидным JSON массивом, без markdown, без пояснений.`;

      // 2. Отправляем в Claude API
      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const aiData = await aiRes.json();
      const text = aiData.content?.map((c: { type: string; text?: string }) => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed: InsightBlock[] = JSON.parse(clean);
      setInsights(parsed);
      setGenerated(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка генерации");
    } finally {
      setLoading(false);
    }
  };

  const typeColors: Record<string, { bg: string; border: string; dot: string }> = {
    positive: { bg: "#F0FDF4", border: "#86EFAC", dot: "#16A34A" },
    warning:  { bg: "#FFFBEB", border: "#FCD34D", dot: "#D97706" },
    info:     { bg: "#EFF6FF", border: "#93C5FD", dot: "#2563EB" },
  };

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
        <div style={{ ...cardStyle, minHeight: "420px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 className="text-sm font-semibold text-gray-900">AI-анализ данных</h2>
            <button
              onClick={generateInsights}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                backgroundColor: loading ? "#9CA3AF" : "#0A1628",
                color: "white",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                border: "none",
              }}
            >
              <SparkleIcon />
              {loading ? "Анализирую..." : generated ? "Обновить анализ" : "Сгенерировать инсайты"}
            </button>
          </div>

          {!generated && !loading && (
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              color: "#9CA3AF",
            }}>
              <SparkleIcon />
              <p style={{ fontSize: "14px", margin: 0 }}>
                Нажмите кнопку чтобы AI проанализировал данные платформы
              </p>
            </div>
          )}

          {loading && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontSize: "14px", color: "#6B7280" }}>Загружаю данные и генерирую инсайты...</p>
            </div>
          )}

          {error && (
            <p style={{ fontSize: "13px", color: "#EF4444" }}>{error}</p>
          )}

          {!loading && insights.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {insights.map((ins, i) => {
                const colors = typeColors[ins.type] || typeColors.info;
                return (
                  <div key={i} style={{
                    padding: "16px 20px",
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "12px",
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}>
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      backgroundColor: colors.dot, flexShrink: 0, marginTop: "5px",
                    }} />
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 4px 0" }}>
                        {ins.title}
                      </p>
                      <p style={{ fontSize: "13px", color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
                        {ins.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>{e.label}</p>
                  <p style={{
                    display: "flex", alignItems: "center", gap: "4px",
                    fontSize: "12px", color: "#9CA3AF", margin: 0, fontWeight: 400,
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