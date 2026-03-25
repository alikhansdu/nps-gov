import type { AnalyticsClosedSurvey } from "../../types";

export default function ClosedSurveysCard({ items }: { items: AnalyticsClosedSurvey[] }) {
  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-10 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">Завершённые опросы</h3>
      <div className="flex flex-col gap-4">
        {items.map((s, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex items-center justify-between" style={{ width: "442px", maxWidth: "100%" }}>
              <span className="text-xs font-normal" style={{ color: "rgba(0,19,45,0.6)" }}>
                {s.label}
              </span>
              <span className="text-xs font-semibold" style={{ color: "#00132D" }}>
                {s.pct}%
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: "#F4F4F5", width: "442px", maxWidth: "100%" }}
            >
              <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: "#00132D" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

