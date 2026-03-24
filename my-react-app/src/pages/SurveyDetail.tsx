import { useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { submitResponse } from "../api/responses";
import { useSurvey } from "../hooks/useSurvey";
import LoadingSpinner from "../components/LoadingSpinner";

// ─── Icons ───────────────────────────────────────────────
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const MessageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// ─── Page ─────────────────────────────────────────────────
export default function SurveyDetail() {
  const params = useParams();
  const surveyId = Number(params.id);
  const { data: surveyData, loading, error } = useSurvey(Number.isNaN(surveyId) ? null : surveyId);
  const [selected, setSelected] = useState<number | null>(null);
  const [comment, setComment]   = useState("");
  const [voted, setVoted]       = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const options = surveyData?.questions?.[0]?.options ?? [];
  const questionText = surveyData?.questions?.[0]?.question_text ?? "Вопрос недоступен";

  const handleVote = async () => {
    if (selected === null) return;
    if (!surveyData?.questions?.[0]) return;
    try {
      setSubmitting(true);
      setSubmitError(null);
      await submitResponse(surveyData.id, [
        {
          question_id: surveyData.questions[0].id,
          option_id: options[selected]?.id ?? null,
          text_answer: comment || null,
        },
      ]);
      setVoted(true);
    } catch (e) {
      if (e instanceof Error && e.message.includes("already exists")) {
        setSubmitError("Вы уже проголосовали в этом опросе");
        return;
      }
      setSubmitError(e instanceof Error ? e.message : "Ошибка отправки голоса");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FAFC" }}>
      <Header activeNav="" />

      <main className="flex-1 w-full px-6 md:px-20 pt-10 pb-6">
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-5">

        {/* Back */}
        <Link to="/surveys" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit">
          <ChevronLeft /> Все опросы
        </Link>

        {/* Survey info card */}
        <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 flex flex-col gap-4">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full w-fit"
            style={{ backgroundColor: "rgba(22,163,74,0.12)", color: "#16A34A" }}>
            {surveyData?.status === "active" ? "Активный" : surveyData?.status === "completed" ? "Завершённый" : "Черновик"}
          </span>

          <h1 className="text-[32px] leading-[36px] md:text-2xl md:leading-normal font-bold text-gray-900">{surveyData?.title ?? "Опрос"}</h1>
          <p className="text-sm text-gray-500 leading-relaxed">{surveyData?.description ?? ""}</p>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-1">Инициатор</p>
              <p className="text-sm font-medium text-gray-800">Государственный орган</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Срок окончания</p>
              <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                <ClockIcon /> {surveyData?.end_date ? `До ${new Date(surveyData.end_date).toLocaleDateString("ru-RU")}` : "Без срока"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Количество голосов</p>
              <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                <UsersIcon /> —
              </p>
            </div>
          </div>
        </div>

        {/* Voting card */}
        {!voted ? (
          <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 flex flex-col gap-5">
            <h2 className="text-lg font-semibold text-gray-900">{questionText}</h2>

            {/* Options */}
            <div className="flex flex-col gap-3">
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border text-left text-sm transition-all"
                  style={{
                    borderColor: selected === i ? "#0A1628" : "#E4E4E7",
                    backgroundColor: selected === i ? "rgba(10,22,40,0.04)" : "white",
                    color: "#374151",
                  }}
                >
                  {/* Radio */}
                  <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                    style={{ borderColor: selected === i ? "#0A1628" : "#D1D5DB" }}>
                    {selected === i && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#0A1628" }} />
                    )}
                  </div>
                  {opt.option_text}
                </button>
              ))}
            </div>

            {/* Comment */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-500 flex items-center gap-1.5">
                <MessageIcon /> Комментарий (необязательно)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Поделитесь своими мыслями или предложениями..."
                rows={4}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg resize-none outline-none focus:border-gray-400 transition-colors text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleVote}
              disabled={selected === null || submitting}
              className="w-full py-3 text-sm font-semibold rounded-lg transition-colors"
              style={{
                backgroundColor: selected !== null && !submitting ? "#0A1628" : "#9CA3AF",
                color: "white",
                cursor: selected !== null && !submitting ? "pointer" : "not-allowed",
              }}
            >
              {submitting ? "Отправка..." : "Подтвердить голос"}
            </button>
            {submitError && <p className="text-xs text-red-600">{submitError}</p>}

            {/* Security notice */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg"
              style={{ backgroundColor: "#E8F1FF", border: "1px solid #BBD7FF" }}>
              <span style={{ color: "#0A1628" }}><ShieldIcon /></span>
              <div>
                <p className="text-sm font-medium text-gray-800">Безопасное голосование</p>
                <p className="text-xs mt-0.5" style={{ color: "#2563EB" }}>
                  Голосование доступно только гражданам РК через верификацию ЭЦП. Ваши данные защищены.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Success state */
          <div className="bg-white border border-gray-200 rounded-xl p-10 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(0,188,212,0.1)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00BCD4" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Ваш голос принят!</h2>
            <p className="text-sm text-gray-500">Спасибо за участие. Ваш голос учтён и будет передан в государственные органы.</p>
            <Link to="/surveys"
              className="mt-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-colors"
              style={{ backgroundColor: "#0A1628", color: "white" }}>
              Вернуться к опросам
            </Link>
          </div>
        )}
        {loading && <LoadingSpinner />}
        {error && <p className="text-sm text-red-600">{error}</p>}

        </div>
      </main>

      <Footer />
    </div>
  );
}
