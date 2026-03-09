import { useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";

const BarIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const EditIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const CheckIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const UsersIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ClockIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const PlusIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const ChevronRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;

const stats = [
  { value: "3",       label: "Активных опросов", icon: <BarIcon /> },
  { value: "2",       label: "Черновики",         icon: <EditIcon /> },
  { value: "8",       label: "Завершённые",        icon: <CheckIcon /> },
  { value: "527 770", label: "Всего голосов",      icon: <UsersIcon /> },
];

const surveys = [
  { id: 1, title: "Развитие общественного транспорта", status: "Активный", statusColor: "#16a34a", statusBg: "rgba(22,163,74,0.1)", votes: "142 850 голосов", date: "15 мар 2026" },
  { id: 2, title: "Развитие общественного транспорта", status: "Черновик",  statusColor: "#d97706", statusBg: "rgba(217,119,6,0.1)",  votes: "142 850 голосов", date: null },
  { id: 3, title: "Развитие общественного транспорта", status: "Завершён",  statusColor: "#6b7280", statusBg: "rgba(107,114,128,0.1)", votes: "142 850 голосов", date: "10 фев 2026" },
];

const dynamicsData = [
  { date: "25 Фев", value: 28000 },
  { date: "26 Фев", value: 44000 },
  { date: "27 Фев", value: 35000 },
  { date: "28 Фев", value: 12000 },
  { date: "29 Фев", value: 28000 },
  { date: "30 Фев", value: 32000 },
];

function AreaChart() {
  const w = 600, h = 140;
  const max = 50000;
  const pts = dynamicsData.map((d, i) => ({
    x: 20 + (i / (dynamicsData.length - 1)) * (w - 40),
    y: h - (d.value / max) * h,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${pathD} L${pts[pts.length-1].x},${h} L${pts[0].x},${h} Z`;
  const yLabels = [60000, 45000, 30000, 15000, 0];

  return (
    <svg viewBox={`0 0 ${w} ${h + 30}`} style={{ width: "100%", height: "180px" }}>
      <defs>
        <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9CA3AF" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#9CA3AF" stopOpacity="0.05"/>
        </linearGradient>
      </defs>
      {yLabels.map((val, i) => {
        const y = h - (val / max) * h;
        return (
          <g key={i}>
            <line x1="20" y1={y} x2={w - 20} y2={y} stroke="#F3F4F6" strokeWidth="1"/>
            <text x="15" y={y + 4} textAnchor="end" fontSize="9" fill="#9CA3AF">{val === 0 ? "0" : `${val/1000}k`}</text>
          </g>
        );
      })}
      <path d={areaD} fill="url(#aGrad)"/>
      <path d={pathD} fill="none" stroke="#6B7280" strokeWidth="2"/>
      {dynamicsData.map((d, i) => (
        <text key={i} x={pts[i].x} y={h + 20} textAnchor="middle" fontSize="9" fill="#9CA3AF">{d.date}</text>
      ))}
    </svg>
  );
}

export default function AdminOverview() {
  return (
    <AdminLayout>
      <div style={{ padding: "40px 48px", gap: "48px", display: "flex", flexDirection: "column" }}>

        <h1 className="text-2xl font-bold text-gray-900">Обзор</h1>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
              <span className="text-gray-400">{s.icon}</span>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* My surveys */}
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Мои опросы</h2>
            <Link to="/admin/create"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              <PlusIcon /> Создать
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-gray-100">
            {surveys.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: s.statusColor }} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: s.statusBg, color: s.statusColor }}>
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
              </div>
            ))}
          </div>
        </div>

        {/* Activity chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Активность за 7 дней</h2>
          <AreaChart />
        </div>

      </div>
    </AdminLayout>
  );
}
