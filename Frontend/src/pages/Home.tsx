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
const VoteIcon   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>;
const TrendIcon  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const CheckSq    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const StarIcon   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const ShieldIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

const statIcons = [<VoteIcon />, <TrendIcon />, <CheckSq />, <StarIcon />];

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
      <div className="px-16 pt-20 pb-32 max-w-4xl">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-6 border"
          style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white", borderColor: "rgba(255,255,255,0.2)" }}
        >
          <ShieldIcon /> Официальный государственный портал
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
          Ваш голос формирует будущее<br />Казахстана
        </h1>
        <p className="text-base mb-10" style={{ color: "rgba(255,255,255,0.75)" }}>
          Национальная цифровая система общественных опросов.<br />
          Участвуйте в принятии государственных решений.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            className="px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
            style={{ backgroundColor: "#F5C518", color: "#0A1628" }}
          >
            Принять участие →
          </button>
          <button
            className="px-6 py-2.5 rounded-lg text-sm font-medium border hover:bg-white/10 transition-colors"
            style={{ color: "white", borderColor: "rgba(255,255,255,0.4)", backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            Посмотреть результаты
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
          style={{ display: "block", width: "100%", height: "80px" }}>
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f9fafb" />
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
  }, []);

  const statsDisplay = [
    { value: stats?.total_responses   ?? "—", label: "Всего ответов"       },
    { value: stats?.active_surveys    ?? "—", label: "Активных опросов"    },
    { value: stats?.completed_surveys ?? "—", label: "Завершённых опросов" },
    { value: stats?.draft_surveys     ?? "—", label: "Черновиков"          },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header activeNav="/" />
      <Hero />

      <main className="flex-1 w-full flex flex-col" style={{ paddingTop: "80px" }}>

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
              style={{ color: "#00BCD4" }}
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
        <section className="w-full bg-gray-100 py-16">
          <div className="max-w-7xl mx-auto w-full px-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Завершённые опросы</h2>
                <p className="text-sm text-gray-500 mt-0.5">Результаты публичных голосований</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {closedSurveys.map((s) => (
                <ClosedSurveyCard key={s.id} {...s} />
              ))}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="max-w-7xl mx-auto w-full px-8 py-16">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Общая статистика</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsDisplay.map((s, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center text-center gap-3"
              >
                <span className="text-gray-400">{statIcons[i]}</span>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <Link
              to="/analytics"
              className="px-6 py-2.5 text-sm font-medium rounded-lg transition-colors"
              style={{ backgroundColor: "#0A1628", color: "white" }}
            >
              Аналитика →
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="w-full bg-gray-100 py-16">
          <div className="max-w-7xl mx-auto w-full px-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Как это работает</h2>
              <p className="text-sm text-gray-500 mt-1">Простой и прозрачный процесс участия</p>
            </div>
            <div className="w-full rounded-xl border border-gray-200 bg-white flex flex-col sm:flex-row">
              {howItWorks.map((item, i) => (
                <div
                  key={item.step}
                  className="flex items-start gap-4 flex-1 p-6"
                  style={{ borderRight: i < howItWorks.length - 1 ? "1px solid #E4E4E7" : "none" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: "#0A1628" }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
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
