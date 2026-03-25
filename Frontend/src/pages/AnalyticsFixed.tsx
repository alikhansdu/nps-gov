import { useEffect, useMemo, useState } from "react";
import kzMapImg from "../assets/kz-blank.svg";
import Header from "../components/Header";
import Footer from "../components/Footer";

type StatsOverview = {
  draft_surveys?: number;
  active_surveys: number;
  completed_surveys: number;
  total_responses: number;
  activity_last_7_days: Array<{ date: string; responses_count: number }>;
};

function formatRuNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("ru-RU");
}

export default function AnalyticsFixed() {
  const [overview, setOverview] = useState<StatsOverview | null>(null);

  useEffect(() => {
    fetch("/api/v1/stats/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setOverview(data))
      .catch(() => {});
  }, []);

  const cards = useMemo(
    () => [
      { label: "Всего голосов", value: formatRuNumber(overview?.total_responses) },
      { label: "Активных опросов", value: formatRuNumber(overview?.active_surveys) },
      { label: "Завершённых опросов", value: formatRuNumber(overview?.completed_surveys) },
    ],
    [overview]
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FAFC" }}>
      <Header activeNav="/analytics" />

      <div
        className="w-full border-b border-gray-200"
        style={{ paddingTop: "28px", paddingBottom: "28px", backgroundColor: "#FFFFFF" }}
      >
        <div className="px-6 lg:px-20">
          <h1 className="text-2xl font-bold text-gray-900">Аналитика</h1>
          <p className="text-sm text-gray-500 mt-1">
            Публичная статистика голосований Республики Казахстан
          </p>
        </div>
      </div>

      <main className="flex-1 w-full flex flex-col px-6 lg:px-20 py-10 gap-10">
        <section className="w-full max-w-[1280px] mx-auto flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map((c) => (
              <div
                key={c.label}
                className="bg-white border border-[#E4E4E7] rounded-xl p-5 shadow-sm flex flex-col gap-2"
              >
                <div className="text-sm text-gray-500">{c.label}</div>
                <div className="text-2xl font-bold text-gray-900 tracking-tight">{c.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E4E4E7] rounded-xl p-10 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Карта Казахстана</h3>
              <p className="text-xs text-gray-400 mb-3">Сводка по регионам</p>
              <div className="flex items-center justify-center">
                <img
                  src={kzMapImg}
                  alt="Карта Казахстана"
                  style={{
                    width: "100%",
                    maxHeight: "320px",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>

            <div className="bg-white border border-[#E4E4E7] rounded-xl p-10 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Активность за последние 7 дней
              </h3>
              <div className="flex flex-col gap-3">
                {(overview?.activity_last_7_days ?? []).map((d) => (
                  <div
                    key={d.date}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="text-xs text-gray-500">{d.date}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatRuNumber(d.responses_count)}
                    </span>
                  </div>
                ))}
                {!(overview?.activity_last_7_days?.length) && (
                  <div className="text-sm text-gray-500">Нет данных</div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

