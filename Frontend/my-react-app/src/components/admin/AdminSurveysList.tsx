import { Link } from "react-router-dom";

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

interface SurveyRow {
  id: number;
  title: string;
  status: string;
  statusColor: string;
  statusBg: string;
  votes: string;
  date: string | null;
}

export default function AdminSurveysList({ items, getRowHref }: { items: SurveyRow[]; getRowHref?: (id: number) => string }) {
  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">Мои опросы</h2>
        <Link
          to="/admin/create"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <PlusIcon /> Создать
        </Link>
      </div>
      <div className="flex flex-col divide-y divide-gray-100">
        {items.map((s) => {
          const href = getRowHref?.(s.id);
          const inner = (
            <>
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: s.statusColor }} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: s.statusBg, color: s.statusColor }}>
                      {s.status}
                    </span>
                    <span className="text-xs text-gray-400">{s.votes}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {s.date && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <ClockIcon /> {s.date}
                  </span>
                )}
                <ChevronRight />
              </div>
            </>
          );
          return href ? (
            <Link
              key={s.id}
              to={href}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {inner}
            </Link>
          ) : (
            <div key={s.id} className="flex items-center justify-between px-5 py-3.5">
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}

