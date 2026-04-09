import { useState, useEffect } from "react";
import ActiveSurveyCard from "../components/ActiveSurveyCard";
import ClosedSurveyCard from "../components/ClosedSurveyCard";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import { FRONTEND_ONLY } from "../config/frontendMode";
import { getMockSurveys } from "../mocks/surveyStore";

// ─── Types ───────────────────────────────────────────────
type SurveyFromAPI = {
  id: number;
  title: string;
  description: string | null;
  status: "draft" | "active" | "completed";
  region_id: number | null;
  region_name: string | null;   // добавь
  creator_name: string; 
  created_by: number;
  created_at: string;
  end_date: string | null;
  total_responses: number;
};

type StatsFromAPI = {
  total_responses: number;
  active_surveys: number;
  completed_surveys: number;
  draft_surveys: number;
};

// ─── Helpers ─────────────────────────────────────────────
function formatDeadline(end_date: string | null): string {
  if (!end_date) return "Без срока";
  const d = new Date(end_date);
  return "До " + d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function toActiveCard(s: SurveyFromAPI) {
  return {
    id:            s.id,
    title:         s.title,
    description:   s.description ?? "",
    region:        s.region_name ?? "Вся РК",        // было: `Регион ${s.region_id}`
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
    deadline:     formatDeadline(s.end_date),
    participants: s.total_responses.toLocaleString("ru-RU"),
  };
}

// ─── Icons ───────────────────────────────────────────────
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const VoteIcon    = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><polyline points="9 12 11 14 15 10"/></svg>;
const TrendIcon   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const BarChartIcon= () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="12" width="4" height="8" rx="1"/><rect x="10" y="7" width="4" height="13" rx="1"/><rect x="17" y="3" width="4" height="17" rx="1"/></svg>;
const MapPinIcon2 = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>;
const ShieldIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

const statIcons = [<VoteIcon />, <TrendIcon />, <BarChartIcon />, <MapPinIcon2 />];

// ─── Static content ───────────────────────────────────────
const howItWorks = [
  { step: "1", title: "Авторизация",      desc: "Войдите через ЭЦП или систему eGov для верификации личности гражданина РК." },
  { step: "2", title: "Участие в опросе", desc: "Выберите интересующий опрос, ознакомьтесь с описанием и оставьте свой голос." },
  { step: "3", title: "Влияние",          desc: "Ваш голос учитывается при принятии государственных решений. Результаты публичны." },
];

// ─── Hero ─────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative w-full overflow-hidden" style={{ backgroundColor: "#1E3A66" }}>
      <div className="px-8 md:px-16 pt-16 pb-36 max-w-4xl">
        <div
          className="inline-flex items-center gap-2 mb-8"
          style={{
            backgroundColor: "#2d3f5e",
            color: "#c8d8e8",
            border: "1.5px solid #8aa0c0",
            borderRadius: "20px",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          <ShieldIcon /> Официальный государственный портал
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
          Ваш голос формирует будущее<br />Казахстана
        </h1>
        <p className="text-base mb-10" style={{ color: "rgba(255,255,255,0.7)" }}>
          Национальная цифровая система общественных опросов.<br />
          Участвуйте в принятии государственных решений.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            className="px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
            style={{ backgroundColor: "#EAB308", color: "#FAFAFA" }}
          >
            Принять участие →
          </button>
          <button
            className="px-6 py-2.5 rounded-lg text-sm font-medium border transition-colors"
            style={{ color: "rgba(255,255,255,0.85)", borderColor: "rgba(255,255,255,0.3)", backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            Посмотреть результаты
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 92" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
          style={{ display: "block", width: "100%", height: "92px" }}>
          <path d="M0,45 C360,90 1080,0 1440,45 L1440,92 L0,92 Z" fill="#ffffff" />
        </svg>
      </div>
    </section>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function Home() {
  const [activeSurveys, setActiveSurveys] = useState<ReturnType<typeof toActiveCard>[]>([]);
  const [closedSurveys, setClosedSurveys] = useState<ReturnType<typeof toClosedCard>[]>([]);
  const [stats, setStats]                 = useState<StatsFromAPI | null>(null);
  const [regionsCount, setRegionsCount]   = useState<number | null>(null);

  useEffect(() => {
    if (FRONTEND_ONLY) {
      const mock = getMockSurveys();
      const active = mock.filter((s) => s.status === "active");
      const completed = mock.filter((s) => s.status === "completed");
      setActiveSurveys(active.slice(0, 3).map(toActiveCard));
      setClosedSurveys(completed.slice(0, 3).map(toClosedCard));
      setStats({
        total_responses: mock.reduce((sum, s) => sum + s.total_responses, 0),
        active_surveys: active.length,
        completed_surveys: completed.length,
        draft_surveys: mock.filter((s) => s.status === "draft").length,
      });
      setRegionsCount(17);
      return;
    }

    fetch("/api/v1/surveys?status_filter=active")
      .then((r) => r.ok ? r.json() : [])
      .then((data: SurveyFromAPI[]) => setActiveSurveys(data.slice(0, 3).map(toActiveCard)))
      .catch(() => setActiveSurveys([]));

    fetch("/api/v1/surveys?status_filter=completed")
      .then((r) => r.ok ? r.json() : [])
      .then((data: SurveyFromAPI[]) => setClosedSurveys(data.slice(0, 3).map(toClosedCard)))
      .catch(() => setClosedSurveys([]));

    fetch("/api/v1/stats/overview")
      .then((r) => r.ok ? r.json() : null)
      .then(setStats)
      .catch(() => setStats(null));

    fetch("/api/v1/regions")
      .then((r) => r.ok ? r.json() : [])
      .then((data: { id: number }[]) => setRegionsCount(data.length))
      .catch(() => setRegionsCount(null));
  }, []);

  const participationRate = (() => {
    if (!stats) return null;
    const total = stats.active_surveys + stats.completed_surveys;
    if (total === 0) return null;
    return Math.round((stats.completed_surveys / total) * 1000) / 10;
  })();

  const statsDisplay = [
    {
      value: stats ? stats.total_responses.toLocaleString("ru-RU") : "—",
      label: "Всего голосов",
    },
    {
      value: participationRate !== null ? `${participationRate}%` : "—",
      label: "Уровень участия",
    },
    {
      value: stats?.active_surveys ?? "—",
      label: "Активных опросов",
    },
    {
      value: regionsCount ?? "—",
      label: "Регионов участвует",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeNav="/" />
      <Hero />

      <main className="flex-1 w-full flex flex-col" style={{ paddingTop: "60px", marginTop: "-2px" }}>

        {/* Active Surveys */}
        <section className="max-w-7xl mx-auto w-full px-8 mb-24">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Активные опросы</h2>
              <p className="text-sm text-gray-500 mt-0.5">Примите участие и выразите своё мнение</p>
            </div>
            <Link
              to="/surveys"
              className="text-sm font-medium flex items-center gap-2 hover:underline"
              style={{ color: "#374151" }}
            >
              Все опросы <ChevronRight />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeSurveys.map((s) => (
              <ActiveSurveyCard key={s.id} {...s} />
            ))}
          </div>
        </section>

        {/* Closed Surveys */}
        <section className="w-full py-16" style={{ backgroundColor: "#F5F7FA" }}>
          <div className="max-w-7xl mx-auto w-full px-8">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900">Завершённые опросы</h2>
              <p className="text-sm text-gray-500 mt-0.5">Результаты публичных голосований</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {closedSurveys.map((s) => (
                <ClosedSurveyCard key={s.id} {...s} />
              ))}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="w-full py-16 bg-white">
          <div className="max-w-7xl mx-auto w-full px-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">Общая статистика</h2>
            </div>

            {/* 4 individual cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statsDisplay.map((s, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-xl flex flex-col items-center text-center py-7 px-4"
                >
                  <div
                    className="flex items-center justify-center mb-4 rounded-2xl"
                    style={{ width: "52px", height: "52px", backgroundColor: "#F0F1F3" }}
                  >
                    <span style={{ color: "#0d1117" }}>{statIcons[i]}</span>
                  </div>
                  <div className="mb-1" style={{ fontSize: "32px", fontWeight: 800, color: "#0d1117", lineHeight: 1.1 }}>{s.value}</div>
                  <div style={{ fontSize: "13px", color: "#6B7280" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Button */}
            <div className="flex justify-center mt-8">
              <Link
                to="/analytics"
                className="px-6 py-2.5 text-sm font-medium rounded-lg transition-colors"
                style={{ backgroundColor: "#0A1628", color: "white" }}
              >
                Перейти в аналитику →
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="w-full py-16" style={{ backgroundColor: "#F5F7FA" }}>
          <div className="max-w-7xl mx-auto w-full px-8">
            <div className="text-center mb-10">
              <h2 className="text-xl font-bold text-gray-900">Как это работает</h2>
              <p className="text-sm text-gray-500 mt-1">Простой и прозрачный процесс участия</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-10 sm:gap-6">
              {howItWorks.map((item) => (
                <div key={item.step} className="flex items-start gap-4 flex-1">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: "#0A1628" }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
