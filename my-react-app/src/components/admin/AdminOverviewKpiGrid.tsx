import type { ReactNode } from "react";

interface KpiItem {
  value: string;
  label: string;
  icon: ReactNode;
}

export default function AdminOverviewKpiGrid({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((s, i) => (
        <div key={i} className="bg-white border border-[#E4E4E7] rounded-xl p-5 shadow-sm flex flex-col gap-4">
          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
            {s.icon}
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 tracking-tight">{s.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

