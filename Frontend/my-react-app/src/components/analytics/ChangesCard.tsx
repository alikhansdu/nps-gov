import type { AnalyticsChange } from "../../types";

const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const StatusDotIcon = ({ color }: { color: string }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="9" opacity="0.25" fill={color} />
    <circle cx="12" cy="12" r="4" fill={color} stroke="none" />
  </svg>
);

export default function ChangesCard({ items }: { items: AnalyticsChange[] }) {
  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 shadow-sm flex flex-col gap-6" style={{ width: "100%" }}>
      <h3 className="text-sm font-semibold text-gray-900">Принятые изменения</h3>
      {items.map((c, i) => (
        <div key={i} className="border border-[#E4E4E7] rounded-xl bg-white px-5 py-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: c.statusBg }}>
              <StatusDotIcon color={c.statusColor} />
            </span>
            <span>Какие действия предприняты:</span>
          </div>
          <h4 className="text-sm font-semibold text-gray-900">{c.title}</h4>
          <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: c.statusBg, color: c.statusColor }}>
              {c.status}
            </span>
            <a href="#" className="flex items-center gap-1 text-xs font-medium" style={{ color: "#2563EB" }}>
              Подробнее <ExternalIcon />
            </a>
          </div>
        </div>
      ))}

      <div
        className="rounded-lg p-4 text-xs text-gray-500 leading-relaxed"
        style={{ backgroundColor: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)" }}
      >
        Все решения принимаются в соответствии с Законом РК «О доступе к информации» и публикуются в открытом доступе на данном портале.
      </div>
    </div>
  );
}

