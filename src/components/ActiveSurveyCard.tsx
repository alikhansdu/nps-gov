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
const MapPinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

interface ActiveSurveyCardProps {
  title?: string;
  description?: string;
  region?: string;
  initiator?: string;
  deadline?: string;
  participants?: string;
  participation?: number;
  onVote?: () => void;
}

export default function ActiveSurveyCard({
  title = "Развитие общественного транспорта в городах РК",
  description = "Оцените текущее состояние и предложите меры по улучшению городского транспорта в вашем регио...",
  region = "Вся РК",
  initiator = "Министерство индустрии и инфраструктурного развития",
  deadline = "До 15 марта 2026",
  participants = "142 850",
  participation = 71,
  onVote,
}: ActiveSurveyCardProps) {
  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 flex flex-col gap-4 shadow-sm w-full">
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 text-xs font-medium rounded-full"
          style={{ backgroundColor: "rgba(0,188,100,0.1)", color: "#16a34a" }}>
          Активный
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <MapPinIcon /> {region}
        </span>
      </div>

      <div>
        <h3 className="text-base font-bold text-gray-900 leading-snug mb-2">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>

      <p className="text-sm text-gray-600">
        <span className="font-semibold">Инициатор:</span> {initiator}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1"><ClockIcon /> {deadline}</span>
        <span className="flex items-center gap-1"><UsersIcon /> {participants}</span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">Участие</span>
          <span className="text-xs font-semibold text-gray-800">{participation}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${participation}%`, backgroundColor: "#0A1628" }} />
        </div>
      </div>

      <button onClick={onVote}
        className="w-full py-3 text-sm font-medium rounded-lg transition-colors"
        style={{ backgroundColor: "#0A1628", color: "white" }}>
        Проголосовать
      </button>
    </div>
  );
}
