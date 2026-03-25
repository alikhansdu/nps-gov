import type { AnalyticsAgeGroup } from "../../types";

export default function AgeGroupsCard({ items }: { items: AnalyticsAgeGroup[] }) {
  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-10 shadow-sm w-full lg:w-[413px]">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Возрастные группы</h3>
      <div className="flex flex-col gap-2.5" style={{ height: "320px", justifyContent: "space-between" }}>
        {items.map((g, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-10 flex-shrink-0">{g.label}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#F4F4F5" }}>
              <div className="h-full rounded-full" style={{ width: `${g.value}%`, backgroundColor: "#00132D" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

