import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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
  created_at: string | null;
  total_responses: number;
  creator_name?: string;
  questions: Question[];
}

interface OptionResult {
  id: number;
  option_text: string;
  order_index: number;
  votes_count: number;
  percentage: number;
}

interface QuestionResult {
  id: number;
  question_text: string;
  question_type: string;
  order_index: number;
  options: OptionResult[];
  total_votes: number;
}

interface SurveyResults {
  survey_id: number;
  title: string;
  status: string;
  total_responses: number;
  questions: QuestionResult[];
}

interface CompletedSurveyItem {
  id: number;
  title: string;
  total_responses: number;
  end_date: string | null;
}

// ─── Icons ───────────────────────────────────────────────
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
const CheckSmallIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Bar colors by rank ───────────────────────────────────
const BAR_COLORS = ["#0d9488", "#0A1628", "#374151", "#6B7280", "#9CA3AF"];

// ─── Format date ─────────────────────────────────────────

function formatMonthDay(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Results view ─────────────────────────────────────────
function SurveyResultsView({
  survey,
  results,
  completedSurveys,
  myVote,
}: {
  survey: Survey;
  results: SurveyResults;
  completedSurveys: CompletedSurveyItem[];
  myVote: Record<string, number | null>;
}) {
  const periodStart = survey.created_at
    ? new Date(survey.created_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })
    : null;
  const periodEnd = survey.end_date
    ? new Date(survey.end_date).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeNav="" />
      <main
        className="flex-1 w-full flex flex-col gap-4 sm:gap-5 px-4 sm:px-6 max-w-3xl mx-auto"
        style={{ paddingTop: "28px", paddingBottom: "40px" }}
      >
        <Link
          to="/surveys"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ChevronLeft /> Все опросы
        </Link>

        {/* ── Survey header ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
          {/* Badge */}
          <span
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit"
            style={{ backgroundColor: "rgba(107,114,128,0.1)", color: "#374151", border: "1px solid #d1d5db" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
            </svg>
            Завершён
          </span>

          <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>

          {/* Meta row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-6 sm:gap-8">
              {survey.creator_name && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Инициатор</p>
                  <p className="text-sm font-medium text-gray-800">{survey.creator_name}</p>
                </div>
              )}
              {(periodStart || periodEnd) && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Период проведения</p>
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    <ClockIcon />
                    {periodStart && periodEnd ? `${periodStart} — ${periodEnd}` : periodEnd ?? periodStart}
                  </p>
                </div>
              )}
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-gray-400 mb-0.5">Всего проголосовало</p>
              <p className="text-2xl font-bold text-gray-900 flex items-center gap-1 sm:justify-end">
                <UsersIcon />
                {results.total_responses.toLocaleString("ru-RU")}
              </p>
              <p className="text-xs text-gray-400">граждан Казахстана</p>
            </div>
          </div>
        </div>

        {/* ── Questions with results ── */}
        {results.questions.map((question) => (
          <div key={question.id} className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-5">
            <h2 className="text-base font-semibold text-gray-900">{question.question_text}</h2>

            <div className="flex flex-col gap-4">
              {question.options.map((opt, idx) => {
                const color = BAR_COLORS[idx] ?? BAR_COLORS[BAR_COLORS.length - 1];
                const isMyChoice = myVote[String(question.id)] === opt.id;

                return (
                  <div key={opt.id} className="flex flex-col gap-1.5">
                    {/* Option label row */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Number badge */}
                        <span
                          className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 font-semibold"
                          style={{ backgroundColor: color }}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-sm text-gray-800 leading-snug">{opt.option_text}</span>
                        {/* Ваш выбор badge */}
                        {isMyChoice && (
                          <span
                            className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded flex-shrink-0"
                            style={{ backgroundColor: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" }}
                          >
                            <CheckSmallIcon /> Ваш выбор
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                        {opt.votes_count.toLocaleString("ru-RU")} голосов&nbsp;
                        <span className="font-bold text-gray-900">{opt.percentage}%</span>
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: "#F3F4F6" }}>
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${opt.percentage}%`, backgroundColor: color, transition: "width 0.6s ease" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── Bottom row: methodology + other surveys ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Methodology */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-900">О методологии опроса</h3>
            <div className="flex flex-col gap-2">
              {[
                "Анонимное голосование — личность не раскрывается",
                "Каждый гражданин может проголосовать только один раз",
                "Результаты верифицированы через систему eGov",
                "Данные использованы при формировании госпрограммы",
              ].map((text) => (
                <div key={text} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="flex-shrink-0 mt-0.5" style={{ color: "#16A34A" }}>✓</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Other completed surveys */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-900">Другие завершённые опросы</h3>
            {completedSurveys.length === 0 ? (
              <p className="text-sm text-gray-400">Нет других опросов</p>
            ) : (
              <div className="flex flex-col divide-y divide-gray-100">
                {completedSurveys.map((s) => (
                  <Link
                    key={s.id}
                    to={`/surveys/${s.id}`}
                    className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-medium text-gray-800 truncate">{s.title}</span>
                      <span className="text-xs text-gray-400">
                        {s.total_responses.toLocaleString("ru-RU")} участников
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap ml-3 flex-shrink-0">
                      <ClockIcon />
                      {formatMonthDay(s.end_date)}
                      <ChevronRight />
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Link
              to="/surveys"
              className="text-sm font-medium flex items-center gap-1 mt-1"
              style={{ color: "#2563EB" }}
            >
              Все открытые результаты <span>→</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────
export default function SurveyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [results, setResults] = useState<SurveyResults | null>(null);
  const [completedSurveys, setCompletedSurveys] = useState<CompletedSurveyItem[]>([]);
  const [myVote, setMyVote] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        if (data.status === "completed") {
          const token = localStorage.getItem(TOKEN_KEY);
          const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

          const [resultsRes, completedRes, myVoteRes] = await Promise.all([
            fetch(`/api/v1/surveys/${id}/results`),
            fetch(`/api/v1/surveys?status_filter=completed`),
            fetch(`/api/v1/surveys/${id}/my-vote`, { headers }),
          ]);

          if (resultsRes.ok) setResults(await resultsRes.json());
          if (completedRes.ok) {
            const all: CompletedSurveyItem[] = await completedRes.json();
            setCompletedSurveys(all.filter((s) => s.id !== Number(id)).slice(0, 3));
          }
          if (myVoteRes.ok) setMyVote(await myVoteRes.json());
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Ошибка загрузки опроса";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [id]);

  const handleSelect = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { option_id: optionId } }));
  };

  const handleVote = async () => {
    if (!survey) return;
    setSubmitting(true);
    setSubmitError(null);

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setSubmitError("Требуется авторизация. Войдите в систему.");
      setSubmitting(false);
      navigate("/user-login");
      return;
    }

    try {
      for (const question of survey.questions) {
        const answer = answers[question.id];
        const text_answer = question.question_type === "text" ? comment || null : null;
        const option_id = answer?.option_id ?? null;
        if (option_id === null && text_answer === null) continue;

        const res = await fetch("/api/v1/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ survey_id: survey.id, question_id: question.id, option_id, text_answer }),
        });

        if (res.status === 409) { setSubmitError("Вы уже проходили этот опрос."); setSubmitting(false); return; }
        if (res.status === 401) { setSubmitError("Сессия истекла."); setSubmitting(false); navigate("/user-login"); return; }
        if (!res.ok) throw new Error("Ошибка при отправке ответа");
      }
      setVoted(true);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Ошибка при отправке ответа");
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered =
    survey?.questions.every((q) => {
      if (q.question_type === "text") return true;
      return answers[q.id]?.option_id !== undefined;
    }) ?? false;

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Загрузка...</div>;
  if (error || !survey) return <div className="min-h-screen flex items-center justify-center text-red-500">{error ?? "Ошибка"}</div>;

  // ── Completed → show results ─────────────────────────────
  if (survey.status === "completed" && results) {
    return <SurveyResultsView survey={survey} results={results} completedSurveys={completedSurveys} myVote={myVote} />;
  }

  // ── Active → voting form ─────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeNav="" />

      <main className={`flex-1 w-full flex flex-col px-4 sm:px-6 ${voted ? "items-center justify-center" : "max-w-3xl mx-auto gap-4 sm:gap-5"}`}
        style={{ paddingTop: voted ? "0" : "28px", paddingBottom: "40px" }}>

        <Link to="/surveys" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit">
          <ChevronLeft /> Все опросы
        </Link>

        {/* Survey info */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 flex flex-col gap-4">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full w-fit"
            style={{ backgroundColor: "rgba(22,163,74,0.1)", color: "#16A34A" }}>
            Активный
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{survey.title}</h1>
          {survey.description && <p className="text-sm text-gray-500 leading-relaxed">{survey.description}</p>}

          {/* Meta block */}
          <div className="rounded-lg p-4 flex flex-col gap-3" style={{ backgroundColor: "#F8FAFC" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {survey.creator_name && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Инициатор</p>
                  <p className="text-sm font-medium text-gray-800">{survey.creator_name}</p>
                </div>
              )}
              {survey.end_date && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Срок окончания</p>
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    <ClockIcon />
                    До {new Date(survey.end_date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              )}
            </div>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-400 mb-0.5">Количество голосов</p>
              <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                <UsersIcon /> {survey.total_responses.toLocaleString("ru-RU")}
              </p>
            </div>
          </div>
        </div>

        {!voted ? (
          <>
            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 flex flex-col gap-6">
              {survey.questions.map((question) => (
                <div key={question.id} className="flex flex-col gap-3">
                  <h2 className="text-base font-semibold text-gray-900">{question.question_text}</h2>
                  {question.question_type !== "text" && (
                    <div className="flex flex-col gap-2">
                      {question.options.map((opt) => {
                        const isSelected = answers[question.id]?.option_id === opt.id;
                        return (
                          <button key={opt.id} onClick={() => handleSelect(question.id, opt.id)}
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

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-500 flex items-center gap-1.5">
                  <MessageIcon /> Комментарий (необязательно)
                </label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                  placeholder="Поделитесь своими мыслями или предложениями..." rows={4}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg resize-none outline-none focus:border-gray-400 transition-colors text-gray-700 placeholder-gray-400" />
              </div>

              {submitError && <p className="text-sm text-red-500">{submitError}</p>}

              <button onClick={handleVote} disabled={!allAnswered || submitting}
                className="w-full py-3 text-sm font-semibold rounded-lg transition-colors"
                style={{
                  backgroundColor: allAnswered && !submitting ? "#0A1628" : "#9CA3AF",
                  color: "white",
                  cursor: allAnswered && !submitting ? "pointer" : "not-allowed",
                }}>
                {submitting ? "Отправка..." : "Подтвердить голос"}
              </button>
            </div>

            {/* Security notice — outside card */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg"
              style={{ backgroundColor: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.4)" }}>
              <ShieldIcon />
              <div>
                <p className="text-sm font-medium text-gray-800">Безопасное голосование</p>
                <p className="text-xs mt-0.5" style={{ color: "#3B82F6" }}>
                  Голосование доступно только гражданам РК через верификацию ЭЦП. Ваши данные защищены.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center py-10">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center gap-4 w-full max-w-sm">
              <div
                className="flex items-center justify-center"
                style={{ width: "56px", height: "56px", backgroundColor: "rgba(13,148,136,0.1)", borderRadius: "14px" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-gray-900">Ваш голос учтён!</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Благодарим за участие в опросе. Ваше мнение важно для развития Казахстана.
                </p>
              </div>
              <Link
                to="/surveys"
                className="w-full py-3 text-sm font-semibold rounded-lg text-center transition-colors"
                style={{ backgroundColor: "#0A1628", color: "white" }}
              >
                Другие опросы
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
