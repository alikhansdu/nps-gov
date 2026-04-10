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
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Bar colors ──────────────────────────────────────────
const BAR_COLORS = ["#16A34A", "#0A1628", "#374151", "#6B7280", "#9CA3AF"];

// ─── Results view ─────────────────────────────────────────
function SurveyResultsView({
  survey,
  results,
  completedSurveys,
}: {
  survey: Survey;
  results: SurveyResults;
  completedSurveys: CompletedSurveyItem[];
}) {
  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header activeNav="" />
      <main
        className="flex-1 w-full max-w-7xl mx-auto flex flex-col gap-5"
        style={{ paddingLeft: "80px", paddingRight: "80px", paddingTop: "40px", paddingBottom: "24px" }}
      >
        <Link
          to="/surveys"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ChevronLeft /> Все опросы
        </Link>

        {/* Survey header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-3">
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full w-fit flex items-center gap-1"
            style={{ backgroundColor: "rgba(22,163,74,0.1)", color: "#16A34A" }}
          >
            <CheckIcon /> Завершён
          </span>
          <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>

          <div className="flex flex-wrap gap-6 pt-2 border-t border-gray-100 text-sm text-gray-500">
            {survey.creator_name && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Инициатор</p>
                <p className="font-medium text-gray-700">{survey.creator_name}</p>
              </div>
            )}
            {survey.end_date && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Период проведения</p>
                <p className="font-medium text-gray-700 flex items-center gap-1">
                  <ClockIcon /> до {formatDate(survey.end_date)}
                </p>
              </div>
            )}
            <div className="ml-auto text-right">
              <p className="text-xs text-gray-400 mb-0.5">Всего проголосовало</p>
              <p className="text-2xl font-bold text-gray-900 flex items-center gap-1 justify-end">
                <UsersIcon />
                {results.total_responses.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">граждан Казахстана</p>
            </div>
          </div>
        </div>

        <div className="flex gap-5 items-start">
          {/* Questions with results */}
          <div className="flex-1 flex flex-col gap-4">
            {results.questions.map((question) => (
              <div key={question.id} className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
                <h2 className="text-base font-semibold text-gray-900">{question.question_text}</h2>
                <div className="flex flex-col gap-3">
                  {question.options.map((opt, idx) => (
                    <div key={opt.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 font-medium"
                            style={{ backgroundColor: BAR_COLORS[idx % BAR_COLORS.length] }}
                          >
                            {idx + 1}
                          </span>
                          {opt.option_text}
                        </span>
                        <span className="text-gray-500 text-xs whitespace-nowrap ml-2">
                          {opt.votes_count.toLocaleString()} голосов&nbsp;
                          <span className="font-semibold text-gray-800">{opt.percentage}%</span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full" style={{ backgroundColor: "#F3F4F6" }}>
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${opt.percentage}%`,
                            backgroundColor: BAR_COLORS[idx % BAR_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4" style={{ width: "300px", flexShrink: 0 }}>
            {/* Methodology */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-gray-800">О методологии опроса</h3>
              <div className="flex flex-col gap-2 text-xs text-gray-600">
                {[
                  "Анонимное голосование — личность не раскрывается",
                  "Каждый гражданин может проголосовать только один раз",
                  "Результаты верифицированы через систему eGov",
                  "Данные использованы при формировании госпрограммы",
                ].map((text) => (
                  <div key={text} className="flex items-start gap-2">
                    <span style={{ color: "#16A34A" }}>✓</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Other completed surveys */}
            {completedSurveys.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-gray-800">Другие завершённые опросы</h3>
                <div className="flex flex-col divide-y divide-gray-100">
                  {completedSurveys.map((s) => (
                    <Link
                      key={s.id}
                      to={`/surveys/${s.id}`}
                      className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-gray-800 line-clamp-2">{s.title}</span>
                        <span className="text-xs text-gray-400">
                          {s.total_responses.toLocaleString()} участников
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap ml-2">
                        {s.end_date && (
                          <>
                            <ClockIcon />
                            {new Date(s.end_date).toLocaleDateString("ru-RU", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </>
                        )}
                        <ChevronRight />
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to="/surveys"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  Все открытые результаты <ChevronRight />
                </Link>
              </div>
            )}
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
          // Fetch results and other completed surveys in parallel
          const [resultsRes, completedRes] = await Promise.all([
            fetch(`/api/v1/surveys/${id}/results`),
            fetch(`/api/v1/surveys?status_filter=completed`),
          ]);
          if (resultsRes.ok) {
            setResults(await resultsRes.json());
          }
          if (completedRes.ok) {
            const all: CompletedSurveyItem[] = await completedRes.json();
            setCompletedSurveys(all.filter((s) => s.id !== Number(id)).slice(0, 5));
          }
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

        if (res.status === 409) {
          setSubmitError("Вы уже проходили этот опрос.");
          setSubmitting(false);
          return;
        }
        if (res.status === 401) {
          setSubmitError("Сессия истекла. Войдите снова.");
          setSubmitting(false);
          navigate("/user-login");
          return;
        }
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
      if (q.question_type === "text") return true;
      return answers[q.id]?.option_id !== undefined;
    }) ?? false;

  // ─── Render ───────────────────────────────────────────────
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Загрузка...</div>;
  if (error || !survey) return <div className="min-h-screen flex items-center justify-center text-red-500">{error ?? "Ошибка"}</div>;

  // ── Show results for completed surveys ───────────────────
  if (survey.status === "completed" && results) {
    return <SurveyResultsView survey={survey} results={results} completedSurveys={completedSurveys} />;
  }

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
