import { Link } from "react-router-dom";

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

interface ClosedSurveyCardProps {
  id?: number;
  title?: string;
  deadline?: string;
  participants?: string;
}

export default function ClosedSurveyCard({
  id = 1,
  title = "Развитие общественного транспорта в городах РК",
  deadline = "До 15 марта 2026",
  participants = "142 850",
}: ClosedSurveyCardProps) {
  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 flex flex-col gap-4 shadow-sm w-full">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full w-fit"
        style={{ backgroundColor: "rgba(10,22,40,0.07)", color: "#0A1628" }}>
        <CheckCircleIcon /> Завершён
      </span>

      <h3 className="text-lg font-bold text-gray-900 leading-snug">{title}</h3>

      <div className="flex flex-col gap-2 text-xs" style={{ color: "#71717A" }}>
        <span className="flex items-center gap-1"><ClockIcon /> {deadline}</span>
        <span className="flex items-center gap-1"><UsersIcon /> {participants}</span>
      </div>

      <Link
        to={`/surveys/${id}`}
        className="w-full py-2.5 text-sm font-medium rounded-lg border transition-colors text-center"
        style={{ borderColor: "#0A1628", color: "#0A1628", backgroundColor: "#ffffff" }}
      >
        Посмотреть результаты
      </Link>
    </div>
  );
}
