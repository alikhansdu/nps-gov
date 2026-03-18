import { Link } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";

const BarIcon      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const EditIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const CheckIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const UsersIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ClockIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const PlusIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const ChevronRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;

const stats = [
  { value: "3",       label: "Активных опросов", icon: <BarIcon /> },
  { value: "2",       label: "Черновики",         icon: <EditIcon /> },
  { value: "8",       label: "Завершённые",        icon: <CheckIcon /> },
  { value: "527 770", label: "Всего голосов",      icon: <UsersIcon /> },
];

const surveys = [
  { id: 1, title: "Развитие общественного транспорта", status: "Активный", statusColor: "#16a34a", statusBg: "rgba(22,163,74,0.1)",   votes: "142 850 голосов", date: "15 мар 2026" },
  { id: 2, title: "Развитие общественного транспорта", status: "Черновик",  statusColor: "#d97706", statusBg: "rgba(217,119,6,0.1)",   votes: "142 850 голосов", date: null },
  { id: 3, title: "Развитие общественного транспорта", status: "Завершён",  statusColor: "#6b7280", statusBg: "rgba(107,114,128,0.1)", votes: "142 850 голосов", date: "10 фев 2026" },
];

const dynamicsData = [
  { date: "25 Фев", value: 28000 },
  { date: "26 Фев", value: 44000 },
  { date: "27 Фев", value: 18000 },
  { date: "28 Фев", value: 10000 },
  { date: "29 Фев", value: 32000 },
  { date: "30 Фев", value: 30000 },
];

function AreaChart() {
  const W = 1188, H = 320;
  const padL = 40, padR = 8, padT = 16, padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const max = 60000;
  const ticks = [60000, 45000, 30000, 15000, 0];

  const toY = (v: number) => padT + chartH - (v / max) * chartH;
  const toX = (i: number) => padL + (i / (dynamicsData.length - 1)) * chartW;

  const pts = dynamicsData.map((d, i) => ({ x: toX(i), y: toY(d.value) }));

  const curve = pts.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = pts[i - 1];
    const dx = (p.x - prev.x) * 0.45;
    return `${acc} C${prev.x + dx},${prev.y} ${p.x - dx},${p.y} ${p.x},${p.y}`;
  }, "");

  const bottomY = padT + chartH;
  const area = `${curve} L${pts[pts.length - 1].x},${bottomY} L${pts[0].x},${bottomY} Z`;

  return (
    <div style={{ width: "100%" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "320px", display: "block" }}
        preserveAspectRatio="none"
      >
        {ticks.map((t) => (
          <text
            key={t}
            x={padL - 6} y={toY(t)}
            textAnchor="end" dominantBaseline="middle"
            fontSize="11" fill="#9aabb8" fontFamily="inherit"
          >
            {t === 0 ? "0" : `${t / 1000}k`}
          </text>
        ))}
        <path d={area} fill="#a8b4c4" fillOpacity="0.78" />
        <path
          d={curve} fill="none"
          stroke="#8a9ab2" strokeWidth="1.5"
          strokeLinejoin="round" strokeLinecap="round"
        />
        {dynamicsData.map((d, i) => (
          <text
            key={i}
            x={toX(i)} y={H - 4}
            textAnchor="middle" dominantBaseline="auto"
            fontSize="11" fill="#9aabb8" fontFamily="inherit"
          >
            {d.date}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function AdminOverview() {
  return (
    <AdminLayout>
      <div style={{ padding: "40px 32px 40px 48px", display: "flex", flexDirection: "column", gap: "20px" }}>

        <h1 className="text-2xl font-bold text-gray-900">Обзор</h1>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white border border-[#E4E4E7] rounded-xl p-5 flex flex-col gap-3">
              <span className="text-gray-400">{s.icon}</span>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* My surveys */}
        <div className="bg-white border border-[#E4E4E7] rounded-xl overflow-hidden">
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
            {surveys.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-1 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: s.statusColor }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-xs font-medium px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: s.statusBg, color: s.statusColor }}
                      >
                        {s.status}
                      </span>
                      <span className="text-xs text-gray-400">{s.votes}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <ClockIcon /> {s.date ?? "—"}
                  </span>
                  <ChevronRight />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity chart */}
        <div
          className="bg-white border border-[#E4E4E7] rounded-xl"
          style={{ padding: "20px 24px", display: "flex", flexDirection: "column" }}
        >
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Активность за 7 дней</h2>
          <p className="text-xs text-gray-400 mb-3">Ежедневная активность голосований</p>
          <AreaChart />
        </div>

      </div>
    </AdminLayout>
  );
}