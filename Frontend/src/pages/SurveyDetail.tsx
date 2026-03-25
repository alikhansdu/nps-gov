import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { TOKEN_KEY } from "../api/client";

// ─── Types ───────────────────────────────────────────────
interface Option {
  id: number;
  option_text: string;
  order_index: number;
}

interface Question {
  id: number;
  question_text: string;
  question_type: "single" | "multiple" | "text";
  options: Option[];
}

interface Survey {
  id: number;
  title: string;
  description: string | null;
  status: string;
  end_date: string | null;
  total_responses: number;
  questions: Question[];
}

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
  const { id } = useParams<{ id: string }>();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // answers: { [question_id]: { option_id?: number, text_answer?: string } }
  const [answers, setAnswers] = useState<Record<number, { option_id?: number; text_answer?: string }>>({});
  const [comment, setComment] = useState("");
  const [voted, setVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Fetch survey ────────────────────────────────────────
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await fetch(`/api/v1/surveys/${id}`);
        if (!res.ok) throw new Error("Опрос не найден");
        const data: Survey = await res.json();
        setSurvey(data);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Ошибка загрузки опроса";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [id]);

  // ── Select option ────────────────────────────────────────
  const handleSelect = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { option_id: optionId } }));
  };

  // ── Submit ───────────────────────────────────────────────
  const handleVote = async () => {
    if (!survey) return;
    setSubmitting(true);
    setSubmitError(null);

    const token = localStorage.getItem(TOKEN_KEY);

    try {
      for (const question of survey.questions) {
        const answer = answers[question.id];

        // text вопрос — берём comment
        const text_answer =
          question.question_type === "text" ? comment || null : null;

        const option_id = answer?.option_id ?? null;

        // пропускаем если нет ответа на text-вопрос и нет option
        if (option_id === null && text_answer === null) continue;

        const res = await fetch("/api/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            survey_id: survey.id,
            question_id: question.id,
            option_id,
            text_answer,
          }),
        });

        if (res.status === 409) continue; // уже отвечал — ок
        if (!res.ok) throw new Error("Ошибка при отправке ответа");
      }

      setVoted(true);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Ошибка при отправке ответа";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Все обязательные вопросы отвечены? ───────────────────
  const allAnswered =
    survey?.questions.every((q) => {
      if (q.question_type === "text") return comment.trim().length > 0 || true; // текст необязателен
      return answers[q.id]?.option_id !== undefined;
    }) ?? false;

  // ─── Render ───────────────────────────────────────────────
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Загрузка...</div>;
  if (error || !survey) return <div className="min-h-screen flex items-center justify-center text-red-500">{error ?? "Ошибка"}</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header activeNav="" />

      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col gap-5"
        style={{ paddingLeft: "80px", paddingRight: "80px", paddingTop: "40px", paddingBottom: "24px" }}>

        <Link to="/surveys" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit">
          <ChevronLeft /> Все опросы
        </Link>

        {/* Survey info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full w-fit"
            style={{ backgroundColor: "rgba(0,188,212,0.1)", color: "#16A34A" }}>
            {survey.status === "active" ? "Активный" : survey.status}
          </span>
          <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
          {survey.description && <p className="text-sm text-gray-500 leading-relaxed">{survey.description}</p>}

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            {survey.end_date && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Срок окончания</p>
                <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                  <ClockIcon /> {survey.end_date}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 mb-1">Количество голосов</p>
              <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                <UsersIcon /> {survey.total_responses.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Voting */}
        {!voted ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-6">

            {survey.questions.map((question) => (
              <div key={question.id} className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold text-gray-900">{question.question_text}</h2>

                {question.question_type !== "text" && (
                  <div className="flex flex-col gap-3">
                    {question.options.map((opt) => {
                      const isSelected = answers[question.id]?.option_id === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelect(question.id, opt.id)}
                          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border text-left text-sm transition-all"
                          style={{
                            borderColor: isSelected ? "#0A1628" : "#E5E7EB",
                            backgroundColor: isSelected ? "rgba(10,22,40,0.04)" : "white",
                            color: "#374151",
                          }}
                        >
                          <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                            style={{ borderColor: isSelected ? "#0A1628" : "#D1D5DB" }}>
                            {isSelected && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#0A1628" }} />}
                          </div>
                          {opt.option_text}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Comment */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-500 flex items-center gap-1.5">
                <MessageIcon /> Комментарий (необязательно)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Поделитесь своими мыслями..."
                rows={4}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg resize-none outline-none focus:border-gray-400 transition-colors text-gray-700 placeholder-gray-400"
              />
            </div>

            {submitError && (
              <p className="text-sm text-red-500">{submitError}</p>
            )}

            <button
              onClick={handleVote}
              disabled={!allAnswered || submitting}
              className="w-full py-3 text-sm font-semibold rounded-lg transition-colors"
              style={{
                backgroundColor: allAnswered && !submitting ? "#0A1628" : "#9CA3AF",
                color: "white",
                cursor: allAnswered && !submitting ? "pointer" : "not-allowed",
              }}
            >
              {submitting ? "Отправка..." : "Подтвердить голос"}
            </button>

            <div className="flex items-start gap-3 px-4 py-3 rounded-lg"
              style={{ backgroundColor: "rgba(96,165,250,0.2)", border: "1px solid rgba(96,165,250,0.8)" }}>
              <ShieldIcon />
              <div>
                <p className="text-sm font-medium text-gray-800">Безопасное голосование</p>
                <p className="text-xs mt-0.5" style={{ color: "#3B82F6" }}>
                  Голосование доступно только гражданам РК через верификацию ЭЦП. Ваши данные защищены.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-10 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(0,188,212,0.1)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00BCD4" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Ваш голос принят!</h2>
            <p className="text-sm text-gray-500">Спасибо за участие. Ваш голос учтён и будет передан в государственные органы.</p>
            <Link to="/surveys" className="mt-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-colors"
              style={{ backgroundColor: "#0A1628", color: "white" }}>
              Вернуться к опросам
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}