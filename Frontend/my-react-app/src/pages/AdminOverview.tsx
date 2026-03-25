import AdminLayout from "../layouts/AdminLayout";
import AdminOverviewKpiGrid from "../components/admin/AdminOverviewKpiGrid";
import AdminSurveysList from "../components/admin/AdminSurveysList";
import AdminMiniAreaChart from "../components/admin/AdminMiniAreaChart";
import { useStats } from "../hooks/useStats";
import { useSurveys } from "../hooks/useSurveys";
import LoadingSpinner from "../components/LoadingSpinner";

const BarIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const EditIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const CheckIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const UsersIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

export default function AdminOverview() {
  const { data: statsData, loading, error } = useStats();
  const { data: surveysData } = useSurveys();

  const stats = [
    { value: String(statsData?.active_surveys ?? 0), label: "Активных опросов", icon: <BarIcon /> },
    { value: String(statsData?.draft_surveys ?? 0), label: "Черновики", icon: <EditIcon /> },
    { value: String(statsData?.completed_surveys ?? 0), label: "Завершённые", icon: <CheckIcon /> },
    { value: String(statsData?.total_responses ?? 0), label: "Всего голосов", icon: <UsersIcon /> },
  ];
  const surveys = surveysData.slice(0, 3).map((s) => ({
    id: s.id,
    title: s.title,
    status: s.status === "active" ? "Активный" : s.status === "completed" ? "Завершён" : "Черновик",
    statusColor: s.status === "active" ? "#16a34a" : s.status === "completed" ? "#6b7280" : "#d97706",
    statusBg: s.status === "active" ? "rgba(22,163,74,0.1)" : s.status === "completed" ? "rgba(107,114,128,0.1)" : "rgba(217,119,6,0.1)",
    votes: "— голосов",
    date: s.end_date ? new Date(s.end_date).toLocaleDateString("ru-RU") : null,
  }));
  const dynamicsData =
    statsData?.activity_last_7_days.map((d) => ({
      date: new Date(d.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }),
      value: d.responses_count,
    })) ?? [];

  return (
    <AdminLayout>
      {/* px/py меньше на мобиле, больше на md+ */}
      <div className="px-4 pt-5 pb-0 md:px-12 md:pt-10 md:pb-0 flex flex-col gap-6 md:gap-10">

        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Обзор</h1>

        {loading && <LoadingSpinner />}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {/* Stats — 1 колонка на мобиле, авто на md+ (компонент сам решает) */}
        <AdminOverviewKpiGrid items={stats} />

        {/* My surveys */}
        <AdminSurveysList items={surveys} getRowHref={(id) => `/admin/surveys/${id}/edit`} />

        {/* Activity chart */}
        <div className="bg-white border border-[#E4E4E7] rounded-xl p-4 md:p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Активность за 7 дней</h2>
          <AdminMiniAreaChart data={dynamicsData} />
        </div>

      </div>
    </AdminLayout>
  );
}
