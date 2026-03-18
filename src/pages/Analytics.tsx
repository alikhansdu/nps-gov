import kzMapImg from "../assets/kz-blank.svg";
import Header from "../components/Header";
import Footer from "../components/Footer";

const VoteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);
const TrendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);
const BarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const StatusDotIcon = ({ color = "#16a34a" }: { color?: string }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="9" opacity="0.25" fill={color} />
    <circle cx="12" cy="12" r="4" fill={color} stroke="none" />
  </svg>
);

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
  { label: "Карагандинская", pct: 0 },
  { label: "ВКО",            pct: 100 },
  { label: "Актюбинская",    pct: 77 },
  { label: "Павлодарская",   pct: 20 },
];

const ageGroups = [
  { label: "18-24", value: 55 },
  { label: "25-34", value: 90 },
  { label: "35-44", value: 70 },
  { label: "45-54", value: 45 },
  { label: "55-64", value: 50 },
  { label: "65+",   value: 60 },
];

const byTheme = [
  { label: "Инфра",     value: 60 },
  { label: "Здравоохр", value: 85 },
  { label: "Цифровиз",  value: 75 },
  { label: "Экономика", value: 50 },
  { label: "Экология",  value: 65 },
  { label: "Образов",   value: 55 },
  { label: "Другое",    value: 70 },
];

const dynamicsData = [
  { date: "25 Фев", value: 28000 },
  { date: "26 Фев", value: 44800 },
  { date: "27 Фев", value: 18000 },
  { date: "28 Фев", value: 10000 },
  { date: "29 Фев", value: 32000 },
  { date: "30 Фев", value: 30000 },
];

const decisions = [
  {
    date: "До 15 марта 2026",
    status: "Реализовано",
    statusColor: "#16a34a",
    statusBg: "rgba(22,163,74,0.1)",
    title: "Удовлетворённость системой образования",
    desc: "Выделено дополнительное финансирование на повышение квалификации учителей — 45 млрд тенге",
    votes: "384 920",
    support: "78%",
  },
  {
    date: "До 15 марта 2026",
    status: "В процессе",
    statusColor: "#d97706",
    statusBg: "rgba(217,119,6,0.1)",
    title: "Удовлетворённость системой образования",
    desc: "Выделено дополнительное финансирование на повышение квалификации учителей — 45 млрд тенге",
    votes: "384 920",
    support: "78%",
  },
  {
    date: "До 15 марта 2026",
    status: "Отклонено",
    statusColor: "#dc2626",
    statusBg: "rgba(220,38,38,0.1)",
    title: "Удовлетворённость системой образования",
    desc: "Выделено дополнительное финансирование на повышение квалификации учителей — 45 млрд тенге",
    votes: "384 920",
    support: "78%",
  },
  {
    date: "До 15 марта 2026",
    status: "Реализовано",
    statusColor: "#16a34a",
    statusBg: "rgba(22,163,74,0.1)",
    title: "Удовлетворённость системой образования",
    desc: "Выделено дополнительное финансирование на повышение квалификации учителей — 45 млрд тенге",
    votes: "384 920",
    support: "78%",
  },
];

const changes = [
  {
    status: "Реализовано",
    statusColor: "#16a34a",
    statusBg: "rgba(22,163,74,0.1)",
    title: "Улучшение качества образования",
    desc: "Повышение зарплат педагогов на 25%, программа переподготовки, новые учебники",
  },
  {
    status: "В процессе",
    statusColor: "#d97706",
    statusBg: "rgba(217,119,6,0.1)",
    title: "Улучшение качества образования",
    desc: "Повышение зарплат педагогов на 25%, программа переподготовки, новые учебники",
  },
  {
    status: "В процессе",
    statusColor: "#d97706",
    statusBg: "rgba(217,119,6,0.1)",
    title: "Улучшение качества образования",
    desc: "Повышение зарплат педагогов на 25%, программа переподготовки, новые учебники",
  },
];

function DonutChart() {
  const size = 252;
  const cx = size / 2;
  const cy = size / 2;
  const r = 86;
  const circ = 2 * Math.PI * r;
  const femaleArc = (54 / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0A1628" strokeWidth="40" />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none" stroke="#F5C518" strokeWidth="40"
        strokeDasharray={`${femaleArc} ${circ}`}
        strokeDashoffset={circ * 0.25}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </svg>
  );
}

function AreaChart() {
  const W = 1188;
  const H = 246;
  const padL = 40;
  const padR = 8;
  const padT = 16;
  const padB = 28;
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
    const tension = 0.45;
    const dx = (p.x - prev.x) * tension;
    return `${acc} C${prev.x + dx},${prev.y} ${p.x - dx},${p.y} ${p.x},${p.y}`;
  }, "");

  const bottomY = padT + chartH;
  const area = `${curve} L${pts[pts.length - 1].x},${bottomY} L${pts[0].x},${bottomY} Z`;

  const peakIdx = dynamicsData.reduce(
    (maxI, d, i, arr) => (d.value > arr[maxI].value ? i : maxI), 0
  );
  const peakX = toX(peakIdx);
  const peakY = toY(dynamicsData[peakIdx].value);

  return (
    <div style={{ width: "100%" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "246px", display: "block" }}
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

        <circle cx={peakX} cy={peakY} r="5" fill="#1e2d45" stroke="#8a9ab2" strokeWidth="1.5" />
        <text
          x={peakX + 8} y={peakY - 14}
          textAnchor="start" dominantBaseline="middle"
          fontSize="12" fill="#1e293b" fontFamily="inherit" fontWeight="600"
        >
          44 800
        </text>

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

function KazakhstanMap() {
  return (
    <div className="flex items-center justify-center">
      <img
        src={kzMapImg}
        alt="Карта Казахстана"
        style={{ width: "100%", maxHeight: "320px", height: "auto", objectFit: "contain" }}
      />
    </div>
  );
}

export default function Analytics() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FAFC" }}>
      <Header activeNav="/analytics" />

      <div
        className="w-full border-b border-gray-200"
        style={{ paddingTop: "28px", paddingBottom: "28px", backgroundColor: "#FFFFFF" }}
      >
        <div className="px-6 lg:px-20">
          <h1 className="text-2xl font-bold text-gray-900">Аналитика</h1>
          <p className="text-sm text-gray-500 mt-1">Публичная статистика голосований Республики Казахстан</p>
        </div>
      </div>

      <main className="flex-1 w-full flex flex-col px-6 lg:px-20 py-10 gap-10">
        <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-10">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div
                key={i}
                className="bg-white border border-[#E4E4E7] rounded-xl p-5 shadow-sm flex flex-col gap-4"
              >
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

          {/* Map + Closed surveys */}
          <div className="grid grid-cols-1 lg:[grid-template-columns:1fr_522px] gap-6">
            <div className="bg-white border border-[#E4E4E7] rounded-xl p-10 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Карта Казахстана</h3>
              <p className="text-xs text-gray-400 mb-3">Активность по регионам</p>
              <KazakhstanMap />
            </div>

            <div className="bg-white border border-[#E4E4E7] rounded-xl p-10 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Завершённые опросы</h3>
              <div className="flex flex-col gap-4">
                {closedSurveys.map((s, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
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
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${s.pct}%`, backgroundColor: "#00132D" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Age groups + Donut + By theme */}
          <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
            <div className="bg-white border border-[#E4E4E7] rounded-xl p-10 shadow-sm w-full lg:w-[413px]">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Возрастные группы</h3>
              <div className="flex flex-col gap-2.5" style={{ height: "320px", justifyContent: "space-between" }}>
                {ageGroups.map((g, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-10 flex-shrink-0">{g.label}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#F4F4F5" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${g.value}%`, backgroundColor: "#00132D" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E4E4E7] rounded-xl p-10 shadow-sm flex flex-col items-center w-full lg:w-[413px]">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 self-start">Гендерное распределение</h3>
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

            <div className="bg-white border border-[#E4E4E7] rounded-xl p-10 shadow-sm flex flex-col w-full lg:w-[413px]">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">По тематике</h3>
              <div className="flex flex-col gap-2.5" style={{ height: "320px", justifyContent: "space-between" }}>
                {byTheme.map((g, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16 flex-shrink-0">{g.label}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#F4F4F5" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${g.value}%`, backgroundColor: "#F5C518" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamics */}
          <div
            className="bg-white border border-[#E4E4E7] rounded-xl shadow-sm"
            style={{ padding: "24px", minHeight: "390px", display: "flex", flexDirection: "column" }}
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Динамика участия</h3>
            <p className="text-xs text-gray-400 mb-4">Ежедневная активность голосований за последние 7 дней</p>
            <div style={{ flex: 1 }}>
              <AreaChart />
            </div>
          </div>

          {/* Decisions + Changes */}
          <div className="grid grid-cols-1 lg:[grid-template-columns:1fr_413px] gap-6">

            <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-5">Хронология решений</h3>
              <div className="flex flex-col gap-4">
                {decisions.map((d, i) => (
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
                        <span className="font-semibold text-gray-700">{d.votes}</span>{" "}голосов
                      </span>
                      <span className="text-gray-500">
                        <span className="font-semibold text-gray-700">Поддержка</span>: {d.support}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 shadow-sm flex flex-col gap-6" style={{ width: "100%" }}>
              <h3 className="text-sm font-semibold text-gray-900">Принятые изменения</h3>
              {changes.map((c, i) => (
                <div key={i} className="border border-[#E4E4E7] rounded-xl bg-white px-5 py-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full"
                      style={{ backgroundColor: c.statusBg }}
                    >
                      <StatusDotIcon color={c.statusColor} />
                    </span>
                    <span>Какие действия предприняты:</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">{c.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: c.statusBg, color: c.statusColor }}
                    >
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
                style={{
                  backgroundColor: "rgba(96,165,250,0.1)",
                  border: "1px solid rgba(96,165,250,0.3)",
                }}
              >
                Все решения принимаются в соответствии с Законом РК «О доступе к информации»
                и публикуются в открытом доступе на данном портале.
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}