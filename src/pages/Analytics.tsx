import Header from "../components/Header";
import Footer from "../components/Footer";

// ─── Icons ───────────────────────────────────────────────
const VoteIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>;
const TrendIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const BarIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const ClockIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const CheckIcon  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const CircleIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/></svg>;
const ExternalIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;

// ─── Mock Data ───────────────────────────────────────────
const stats = [
  { value: "4,218,650", label: "Всего голосов",      icon: <VoteIcon /> },
  { value: "67.4%",     label: "Уровень участия",    icon: <TrendIcon /> },
  { value: "2 840",     label: "Онлайн сейчас",      icon: <BarIcon /> },
  { value: "17",        label: "Завершённых опросов", icon: <ClockIcon /> },
];

const closedSurveys = [
  { label: "Алматы",         pct: 68 },
  { label: "Астана",         pct: 35 },
  { label: "Шымкент",        pct: 65 },
  { label: "Карагандинская", pct: 0  },
  { label: "ВКО",            pct: 100 },
  { label: "Актюбинская",    pct: 77 },
  { label: "Павлодарская",   pct: 20 },
];

const ageGroups = [
  { label: "18-24", value: 55 },
  { label: "25-34", value: 90 },
  { label: "35-44", value: 70 },
  { label: "55-54", value: 45 },
  { label: "55-64", value: 50 },
  { label: "65+",   value: 60 },
];

const byTheme = [
  { label: "18-24", value: 60 },
  { label: "25-34", value: 85 },
  { label: "35-44", value: 75 },
  { label: "45-54", value: 50 },
  { label: "55-64", value: 65 },
  { label: "65-74", value: 55 },
  { label: "65+",   value: 70 },
];

const dynamicsData = [
  { date: "25 фев", value: 10000 },
  { date: "26 фев", value: 20000 },
  { date: "27 фев", value: 44800 },
  { date: "28 фев", value: 35000 },
  { date: "29 фев", value: 28000 },
  { date: "30 фев", value: 25000 },
];

const decisions = [
  { date: "До 15 марта 2026", status: "Реализовано", statusColor: "#16a34a", statusBg: "rgba(22,163,74,0.1)", title: "Удовлетворённость системой образования", desc: "Выделено дополнительное финансирование на повышение квалификации учителей — 45 млрд тенге", votes: "384 920", support: "78%" },
  { date: "До 15 марта 2026", status: "В процессе",  statusColor: "#d97706", statusBg: "rgba(217,119,6,0.1)",  title: "Удовлетворённость системой образования", desc: "Выделено дополнительное финансирование на повышение квалификации учителей — 45 млрд тенге", votes: "384 920", support: "78%" },
  { date: "До 15 марта 2026", status: "Отклонено",   statusColor: "#dc2626", statusBg: "rgba(220,38,38,0.1)",  title: "Удовлетворённость системой образования", desc: "Выделено дополнительное финансирование на повышение квалификации учителей — 45 млрд тенге", votes: "384 920", support: "78%" },
  { date: "До 15 марта 2026", status: "Реализовано", statusColor: "#16a34a", statusBg: "rgba(22,163,74,0.1)", title: "Удовлетворённость системой образования", desc: "Выделено дополнительное финансирование на повышение квалификации учителей — 45 млрд тенге", votes: "384 920", support: "78%" },
];

const changes = [
  { status: "Реализовано", statusColor: "#16a34a", statusBg: "rgba(22,163,74,0.1)", title: "Улучшение качества образования", desc: "Повышение зарплат педагогов на 25%, программа переподготовки, новые учебники" },
  { status: "В процессе",  statusColor: "#d97706", statusBg: "rgba(217,119,6,0.1)",  title: "Улучшение качества образования", desc: "Повышение зарплат педагогов на 25%, программа переподготовки, новые учебники" },
  { status: "В процессе",  statusColor: "#d97706", statusBg: "rgba(217,119,6,0.1)",  title: "Улучшение качества образования", desc: "Повышение зарплат педагогов на 25%, программа переподготовки, новые учебники" },
];

// ─── Donut Chart ──────────────────────────────────────────
function DonutChart() {
  const female = 54;
  const male = 46;
  const r = 60;
  const circ = 2 * Math.PI * r;
  const femaleArc = (female / 100) * circ;
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r={r} fill="none" stroke="#0A1628" strokeWidth="28" />
      <circle cx="80" cy="80" r={r} fill="none" stroke="#F5C518" strokeWidth="28"
        strokeDasharray={`${femaleArc} ${circ}`}
        strokeDashoffset={circ * 0.25}
        transform="rotate(-90 80 80)" />
    </svg>
  );
}

// ─── Area Chart ───────────────────────────────────────────
function AreaChart() {
  const w = 560, h = 120;
  const max = 50000;
  const points = dynamicsData.map((d, i) => ({
    x: (i / (dynamicsData.length - 1)) * w,
    y: h - (d.value / max) * h,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${pathD} L${w},${h} L0,${h} Z`;
  const peak = points[2];

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${h + 30}`} style={{ width: "100%", height: "150px" }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9CA3AF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#9CA3AF" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#areaGrad)" />
        <path d={pathD} fill="none" stroke="#6B7280" strokeWidth="2" />
        {/* Peak dot */}
        <circle cx={peak.x} cy={peak.y} r="4" fill="#0A1628" />
        <text x={peak.x} y={peak.y - 10} textAnchor="middle" fontSize="10" fill="#374151">44 800</text>
        {/* X labels */}
        {dynamicsData.map((d, i) => (
          <text key={i} x={(i / (dynamicsData.length - 1)) * w} y={h + 20}
            textAnchor="middle" fontSize="9" fill="#9CA3AF">{d.date}</text>
        ))}
      </svg>
    </div>
  );
}

// ─── Kazakhstan Map (simplified SVG) ─────────────────────
function KazakhstanMap() {
  return (
    <div className="flex items-center justify-center" style={{ height: "160px" }}>
      <svg viewBox="0 0 300 180" style={{ width: "100%", height: "100%" }}>
        {/* Simplified Kazakhstan regions */}
        <g fill="#D1D5DB" stroke="white" strokeWidth="1">
          <path d="M20,60 L80,40 L140,50 L160,80 L120,100 L60,90 Z" />
          <path d="M140,50 L200,30 L240,50 L220,80 L160,80 Z" />
          <path d="M60,90 L120,100 L130,130 L80,140 L40,120 Z" />
          <path d="M120,100 L160,80 L180,110 L160,140 L130,130 Z" />
          <path d="M160,80 L220,80 L240,110 L200,130 L180,110 Z" />
          <path d="M220,80 L270,60 L280,90 L260,120 L240,110 Z" />
          <path d="M240,110 L260,120 L250,150 L220,155 L200,130 Z" />
          <path d="M80,140 L130,130 L140,160 L100,165 L70,155 Z" />
          <path d="M130,130 L160,140 L165,165 L140,160 Z" />
          <path d="M160,140 L200,130 L210,155 L165,165 Z" />
        </g>
        {/* Region dots */}
        <circle cx="80" cy="75" r="3" fill="#00BCD4" />
        <circle cx="185" cy="60" r="3" fill="#00BCD4" />
        <circle cx="140" cy="115" r="3" fill="#00BCD4" />
        <circle cx="195" cy="100" r="3" fill="#00BCD4" />
        <circle cx="250" cy="95" r="3" fill="#00BCD4" />
      </svg>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────
export default function Analytics() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header activeNav="/analytics" />

      {/* Page title */}
      <div className="w-full bg-white border-b border-gray-200" style={{ paddingTop: "28px", paddingBottom: "28px" }}>
        <div style={{ paddingLeft: "80px", paddingRight: "80px" }}>
          <h1 className="text-2xl font-bold text-gray-900">Аналитика</h1>
          <p className="text-sm text-gray-500 mt-1">Публичная статистика голосований Республики Казахстан</p>
        </div>
      </div>

      <main className="flex-1 w-full flex flex-col"
        style={{ paddingLeft: "80px", paddingRight: "80px", paddingTop: "40px", paddingBottom: "40px", gap: "40px" }}>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
              <span className="text-gray-400">{s.icon}</span>
              <div>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Map + Closed surveys */}
        <div className="grid grid-cols-2 gap-5">
          {/* Map */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Карта Казахстана</h3>
            <p className="text-xs text-gray-400 mb-3">Активность по регионам</p>
            <KazakhstanMap />
          </div>

          {/* Closed surveys */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Завершённые опросы</h3>
            <div className="flex flex-col gap-3">
              {closedSurveys.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-28 flex-shrink-0">{s.label}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: "#0A1628" }} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-8 text-right">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Age groups + Donut + By theme */}
        <div className="grid grid-cols-3 gap-5">
          {/* Age bar chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Возрастные группы</h3>
            <div className="flex flex-col gap-2.5">
              {ageGroups.map((g, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-10 flex-shrink-0">{g.label}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-sm overflow-hidden">
                    <div className="h-full rounded-sm" style={{ width: `${g.value}%`, backgroundColor: "#0A1628" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Donut chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 self-start">Возрастные группы</h3>
            <DonutChart />
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#0A1628" }} />
                <span className="text-xs text-gray-500">Женщины — 54%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#F5C518" }} />
                <span className="text-xs text-gray-500">Мужчины — 46%</span>
              </div>
            </div>
          </div>

          {/* By theme */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">По тематике</h3>
            <div className="flex flex-col gap-2.5">
              {byTheme.map((g, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-10 flex-shrink-0">{g.label}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-sm overflow-hidden">
                    <div className="h-full rounded-sm" style={{ width: `${g.value}%`, backgroundColor: "#F5C518" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamics */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Динамика участия</h3>
          <p className="text-xs text-gray-400 mb-4">Ежедневная активность голосований за последние 7 дней</p>
          <AreaChart />
        </div>

        {/* Decisions + Changes */}
        <div className="grid grid-cols-2 gap-5">

          {/* Decisions timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-5">Хронология решений</h3>
            <div className="flex flex-col gap-4">
              {decisions.map((d, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{d.date}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: d.statusBg, color: d.statusColor }}>
                      {d.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">{d.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{d.desc}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                    <span>{d.votes} голосов</span>
                    <span>Поддержка: {d.support}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accepted changes */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-gray-900">Принятые изменения</h3>
            {changes.map((c, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-4 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span>Какие действия предприняты:</span>
                </div>
                <h4 className="text-sm font-semibold text-gray-900">{c.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: c.statusBg, color: c.statusColor }}>
                    {c.status}
                  </span>
                  <a href="#" className="flex items-center gap-1 text-xs font-medium"
                    style={{ color: "#00BCD4" }}>
                    Подробнее <ExternalIcon />
                  </a>
                </div>
              </div>
            ))}

            {/* Legal notice */}
            <div className="rounded-lg p-4 text-xs text-gray-500 leading-relaxed"
              style={{ backgroundColor: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)" }}>
              Все решения принимаются в соответствии с Законом РК «О доступе к информации» и публикуются в открытом доступе на данном портале.
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
