import Header from "../components/Header";
import Footer from "../components/Footer";
import AnalyticsKpiGrid from "../components/analytics/AnalyticsKpiGrid";
import KazakhstanMapCard from "../components/analytics/KazakhstanMapCard";
import ClosedSurveysCard from "../components/analytics/ClosedSurveysCard";
import AgeGroupsCard from "../components/analytics/AgeGroupsCard";
import GenderDistributionCard from "../components/analytics/GenderDistributionCard";
import ThemeCard from "../components/analytics/ThemeCard";
import DynamicsCard from "../components/analytics/DynamicsCard";
import DecisionsTimelineCard from "../components/analytics/DecisionsTimelineCard";
import ChangesCard from "../components/analytics/ChangesCard";
import { useStats } from "../hooks/useStats";
import LoadingSpinner from "../components/LoadingSpinner";

// Page
export default function Analytics() {
  const { data, loading, error } = useStats();

  const stats = [
    { value: String(data?.total_responses ?? 0), label: "Всего голосов" },
    { value: "—", label: "Уровень участия" },
    { value: String(data?.active_surveys ?? 0), label: "Онлайн сейчас" },
    { value: String(data?.completed_surveys ?? 0), label: "Завершённых опросов" },
  ];
  const dynamics =
    data?.activity_last_7_days.map((d) => ({
      date: new Date(d.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }),
      value: d.responses_count,
    })) ?? [];
  const closedSurveys = [
    { label: "Активные", pct: data?.active_surveys ?? 0 },
    { label: "Черновики", pct: data?.draft_surveys ?? 0 },
    { label: "Завершённые", pct: data?.completed_surveys ?? 0 },
  ];
  const ageGroups = [
    { label: "18-24", value: 20 },
    { label: "25-34", value: 40 },
    { label: "35-44", value: 30 },
    { label: "45-54", value: 20 },
    { label: "55-64", value: 15 },
    { label: "65+", value: 10 },
  ];
  const byTheme = [
    { label: "Соц. вопросы", value: 40 },
    { label: "Транспорт", value: 35 },
    { label: "Экология", value: 30 },
    { label: "Экономика", value: 25 },
    { label: "Образование", value: 20 },
    { label: "Здравоохранение", value: 22 },
  ];
  const decisions = [
    {
      date: "До 15 марта 2026",
      status: "Реализовано",
      statusColor: "#16a34a",
      statusBg: "rgba(22,163,74,0.1)",
      title: "Результаты опроса по транспорту",
      desc: "Данные обновляются на основе реальных ответов пользователей.",
      votes: String(data?.total_responses ?? 0),
      support: "—",
    },
  ];
  const changes = [
    {
      status: "В процессе",
      statusColor: "#d97706",
      statusBg: "rgba(217,119,6,0.1)",
      title: "Обновление аналитических блоков",
      desc: "Карточки и графики связаны с live API.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FAFC" }}>
      <Header activeNav="/analytics" />

      {/* Заголовок — серый фон */}
      <div
        className="w-full border-b border-gray-200"
        style={{ paddingTop: "28px", paddingBottom: "28px", backgroundColor: "#F8FAFC" }}
      >
        <div className="px-6 lg:px-20">
          <h1 className="text-2xl font-bold text-gray-900">Аналитика</h1>
          <p className="text-sm text-gray-500 mt-1">Публичная статистика голосований Республики Казахстан</p>
        </div>
      </div>

      {/* Белый контент */}
      <main className="flex-1 w-full flex flex-col px-6 lg:px-20 py-10 gap-10">
        <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-10">

        {loading && <LoadingSpinner />}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <AnalyticsKpiGrid stats={stats} />

        <div className="grid grid-cols-1 lg:[grid-template-columns:1fr_522px] gap-6">
          <KazakhstanMapCard />
          <ClosedSurveysCard items={closedSurveys} />
        </div>

        <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
          <AgeGroupsCard items={ageGroups} />
          <GenderDistributionCard />
          <ThemeCard items={byTheme} />
        </div>

        <DynamicsCard data={dynamics} />

        <div className="grid grid-cols-1 lg:[grid-template-columns:1fr_413px] gap-6">
          <DecisionsTimelineCard items={decisions} />
          <ChangesCard items={changes} />
        </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
