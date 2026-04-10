import { useState, useEffect } from "react";
import ActiveSurveyCard from "../components/ActiveSurveyCard";
import ClosedSurveyCard from "../components/ClosedSurveyCard";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FRONTEND_ONLY } from "../config/frontendMode";
import { getMockSurveys } from "../mocks/surveyStore";

type SurveyFromAPI = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  status: "draft" | "active" | "completed";
  region_id: number | null;
  region_name: string | null;
  creator_name: string;
  created_by: number;
  end_date: string | null;
  total_responses: number;
};

function formatDeadline(end_date: string | null): string {
  if (!end_date) return "Без срока";
  return "До " + new Date(end_date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function toActiveCard(s: SurveyFromAPI) {
  return {
    id:            s.id,
    title:         s.title,
    description:   s.description ?? "",
    category:      s.category ?? null,
    region:        s.region_name ?? "Вся РК",
    initiator:     s.creator_name,
    deadline:      formatDeadline(s.end_date),
    participants:  s.total_responses.toLocaleString("ru-RU"),
    participation: 0,
  };
}

function toClosedCard(s: SurveyFromAPI) {
  return {
    id:           s.id,
    title:        s.title,
    category:     s.category ?? null,
    deadline:     formatDeadline(s.end_date),
    participants: s.total_responses.toLocaleString("ru-RU"),
  };
}

const categories = ["Все", "Инфраструктура", "Здравоохранение", "Цифровизация", "Экономика", "Экология", "Образование"];

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function Surveys() {
  const [search, setSearch]       = useState("");
  const [status, setStatus]       = useState<"Все" | "Активные" | "Завершённые">("Все");
  const [category, setCategory]   = useState("Все");
  const [activeSurveys, setActive] = useState<ReturnType<typeof toActiveCard>[]>([]);
  const [closedSurveys, setClosed] = useState<ReturnType<typeof toClosedCard>[]>([]);

  useEffect(() => {
    if (FRONTEND_ONLY) {
      const mock = getMockSurveys();
      setActive(mock.filter((s) => s.status === "active").map((s) => toActiveCard({ ...s, category: null, region_name: null, creator_name: `Автор #${s.created_by}` })));
      setClosed(mock.filter((s) => s.status === "completed").map((s) => toClosedCard({ ...s, category: null, region_name: null, creator_name: "" })));
      return;
    }

    fetch("/api/v1/surveys?status_filter=active")
      .then((r) => r.ok ? r.json() : [])
      .then((data: SurveyFromAPI[]) => setActive(data.map(toActiveCard)))
      .catch(() => setActive([]));

    fetch("/api/v1/surveys?status_filter=completed")
      .then((r) => r.ok ? r.json() : [])
      .then((data: SurveyFromAPI[]) => setClosed(data.map(toClosedCard)))
      .catch(() => setClosed([]));
  }, []);

  const filterActive = activeSurveys.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) &&
    (category === "Все" || s.category === category)
  );
  const filterClosed = closedSurveys.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) &&
    (category === "Все" || s.category === category)
  );

  const showActive = status === "Все" || status === "Активные";
  const showClosed = status === "Все" || status === "Завершённые";

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#ffffff" }}>
      <Header activeNav="/surveys" />

      <div
        className="w-full border-b border-gray-200 px-5 sm:px-10 lg:px-20"
        style={{ paddingTop: "28px", paddingBottom: "28px", backgroundColor: "#F8FAFC" }}
      >
        <h1 className="text-2xl font-bold text-gray-900">Опросы</h1>
        <p className="text-sm text-gray-500 mt-1">Все публичные опросы Республики Казахстан</p>
      </div>

      <main
        className="flex-1 w-full flex flex-col px-5 sm:px-10 lg:px-20"
        style={{ paddingTop: "28px", paddingBottom: "60px", gap: "24px", backgroundColor: "#ffffff" }}
      >
        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 w-full">
          <span className="text-gray-400"><SearchIcon /></span>
          <input
            type="text"
            placeholder="Поиск опросов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden w-full sm:w-auto self-start">
          {(["Все", "Активные", "Завершённые"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ backgroundColor: status === s ? "#0A1628" : "transparent", color: status === s ? "white" : "#6b7280" }}
            >
              {s}
            </button>
          ))}
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
                border: category === cat ? "none" : "1px solid #E5E7EB",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Active Surveys */}
        {showActive && filterActive.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <h2 className="text-lg font-bold text-gray-900">Активные опросы</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#0A1628" }}>
                {filterActive.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filterActive.map((s) => <ActiveSurveyCard key={s.id} {...s} />)}
            </div>
          </section>
        )}

        {/* Closed Surveys */}
        {showClosed && filterClosed.length > 0 && (
          <section className="mt-4 sm:mt-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <h2 className="text-lg font-bold text-gray-900">Завершённые опросы</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#0A1628" }}>
                {filterClosed.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filterClosed.map((s) => <ClosedSurveyCard key={s.id} {...s} />)}
            </div>
          </section>
        )}

        {filterActive.length === 0 && filterClosed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-400 text-sm">Опросы не найдены</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}