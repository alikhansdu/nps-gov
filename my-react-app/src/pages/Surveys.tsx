import { useState } from "react";
import ActiveSurveyCard from "../components/ActiveSurveyCard";
import ClosedSurveyCard from "../components/ClosedSurveyCard";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useSurveys } from "../hooks/useSurveys";
import LoadingSpinner from "../components/LoadingSpinner";

const categories = ["Все", "Инфраструктура", "Здравоохранение", "Цифровизация", "Экономика", "Экология", "Образование"];

// ─── Search Icon ─────────────────────────────────────────
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ─── Surveys Page ─────────────────────────────────────────
export default function Surveys() {
  const [search, setSearch]     = useState("");
  const [status, setStatus]     = useState<"Все" | "Активные" | "Завершённые">("Все");
  const [category, setCategory] = useState("Все");

  const { data: activeApi, loading: activeLoading, error: activeError } = useSurveys({ status_filter: "active" });
  const { data: closedApi, loading: closedLoading, error: closedError } = useSurveys({ status_filter: "completed" });

  const filterActive = activeApi
    .filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))
    .map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description?.trim() ? s.description : "Описание не указано",
      region: "Вся РК",
      initiator: "Государственный орган",
      deadline: s.end_date ? `До ${new Date(s.end_date).toLocaleDateString("ru-RU")}` : "Без срока",
      participants: "—",
      participation: 0,
      category,
    }));

  const filterClosed = closedApi
    .filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))
    .map((s) => ({
      id: s.id,
      title: s.title,
      deadline: s.end_date ? `До ${new Date(s.end_date).toLocaleDateString("ru-RU")}` : "Без срока",
      participants: "—",
      category,
    }));

  const showActive = status === "Все" || status === "Активные";
  const showClosed = status === "Все" || status === "Завершённые";

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FAFC" }}>
      <Header activeNav="/surveys" />

      {/* Page title — СЕРЫЙ фон */}
      <div
        className="w-full border-b border-gray-200"
        style={{ paddingTop: "28px", paddingBottom: "28px", backgroundColor: "#F8FAFC" }}
      >
        <div className="px-6 md:px-20">
          <h1 className="text-2xl font-bold text-gray-900">Опросы</h1>
          <p className="text-sm text-gray-500 mt-1">Все публичные опросы Республики Казахстан</p>
        </div>
      </div>

      {/* БЕЛЫЙ body */}
      <main className="flex-1 w-full flex flex-col px-6 md:px-20 pt-10 pb-20 gap-10">
        <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-10">

        {/* Search + Status filter */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
          <div className="w-full md:flex-1 flex items-center gap-2 bg-white border border-[#E4E4E7] rounded-lg px-4 py-2.5">
            <span className="text-gray-400"><SearchIcon /></span>
            <input
              type="text"
              placeholder="Поиск опросов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400"
            />
          </div>

          <div className="w-full md:w-auto flex items-center bg-white border border-[#E4E4E7] rounded-lg p-1 gap-1">
            {(["Все", "Активные", "Завершённые"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className="flex-1 md:flex-none px-4 py-2 text-sm font-medium transition-colors rounded-md"
                style={{
                  backgroundColor: status === s ? "#0A1628" : "transparent",
                  color: status === s ? "white" : "#6b7280",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-4 py-2 text-sm font-medium rounded-full transition-colors"
              style={{
                backgroundColor: category === cat ? "#0A1628" : "white",
                color: category === cat ? "white" : "#374151",
                border: category === cat ? "1px solid #0A1628" : "1px solid #E4E4E7",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Active Surveys */}
        {showActive && filterActive.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-lg font-bold text-gray-900">Активные опросы</h2>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(22,163,74,0.12)", color: "#16a34a" }}
              >
                {filterActive.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeLoading && <LoadingSpinner />}
              {activeError && <p className="text-sm text-red-600">{activeError}</p>}
              {filterActive.map((s) => (
                <ActiveSurveyCard key={s.id} {...s} />
              ))}
            </div>
          </section>
        )}

        {/* Closed Surveys */}
        {showClosed && filterClosed.length > 0 && (
          <section style={{ marginTop: "40px" }}>
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-lg font-bold text-gray-900">Завершённые опросы</h2>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(107,114,128,0.12)", color: "#6b7280" }}
              >
                {filterClosed.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {closedLoading && <LoadingSpinner />}
              {closedError && <p className="text-sm text-red-600">{closedError}</p>}
              {filterClosed.map((s) => (
                <ClosedSurveyCard key={s.id} {...s} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {filterActive.length === 0 && filterClosed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-400 text-sm">Опросы не найдены</p>
          </div>
        )}

        </div>
      </main>

      <Footer />
    </div>
  );
}