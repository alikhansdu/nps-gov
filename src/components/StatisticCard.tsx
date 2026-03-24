import type { ReactNode } from "react";

interface StatisticCardProps {
  value?: string | number;
  label?: string;
  icon?: ReactNode;
}

const ClipboardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);

export default function StatisticCard({
  value = "4,218,650",
  label = "Всего голосов",
  icon = <ClipboardIcon />,
}: StatisticCardProps) {
  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 shadow-sm w-full max-w-xs flex flex-col gap-4">
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
        {icon}
      </div>

      {/* Value + Label */}
      <div>
        <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
