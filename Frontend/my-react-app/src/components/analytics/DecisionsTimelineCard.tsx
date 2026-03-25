import type { AnalyticsDecision } from "../../types";

export default function DecisionsTimelineCard({ items }: { items: AnalyticsDecision[] }) {
  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-5">Хронология решений</h3>
      <div className="flex flex-col gap-4">
        {items.map((d, i) => (
          <div key={i} className="border border-[#E4E4E7] rounded-xl bg-white px-5 py-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{d.date}</span>
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: d.statusBg, color: d.statusColor }}
              >
                {d.status}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-gray-900">{d.title}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{d.desc}</p>
            <div className="flex items-center gap-6 text-xs text-gray-400 mt-2 pt-2 border-t border-[#E4E4E7]">
              <span className="text-gray-500">
                <span className="font-semibold text-gray-700">{d.votes}</span> голосов
              </span>
              <span className="text-gray-500">
                <span className="font-semibold text-gray-700">Поддержка</span>: {d.support}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

