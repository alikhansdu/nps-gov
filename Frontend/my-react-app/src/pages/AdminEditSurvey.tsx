import { useState } from "react";
import type { ChangeEvent, CSSProperties, ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import { createQuestion } from "../api/questions";
import { createOption } from "../api/options";
import { useSurvey } from "../hooks/useSurvey";
import type { QuestionDto, QuestionType } from "../api/surveys";
import LoadingSpinner from "../components/LoadingSpinner";

const PlusIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const XIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ChevronDown = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;

/** Local select — same markup as AdminCreateSurvey */
function Select({ children, value, onChange, style }: { children: ReactNode; value: string; onChange: (e: ChangeEvent<HTMLSelectElement>) => void; style?: CSSProperties }) {
  return (
    <div className="relative" style={style}>
      <select
        value={value}
        onChange={onChange}
        className="w-full pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg outline-none text-gray-700 bg-white appearance-none"
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <ChevronDown />
      </div>
    </div>
  );
}

/** Maps Russian UI label to API question_type */
function mapQuestionType(type: string): QuestionType {
  if (type === "Множественный выбор") return "multiple";
  if (type === "Текстовый ответ") return "text";
  return "single";
}

/** Maps API type to Russian label for display */
function questionTypeLabel(t: QuestionType): string {
  if (t === "multiple") return "Множественный выбор";
  if (t === "text") return "Текстовый ответ";
  return "Один вариант";
}

/** Renders one existing question block (read-only) */
function ExistingQuestionBlock({ q, index }: { q: QuestionDto; index: number }) {
  return (
    <div className="border border-[#E4E4E7] rounded-xl p-4 flex flex-col gap-3">
      <span className="text-sm font-semibold text-gray-900">Вопрос {index + 1}</span>
      <p className="text-sm text-gray-800">{q.question_text}</p>
      <p className="text-xs text-gray-500">Тип: {questionTypeLabel(q.question_type)}</p>
      {(q.question_type === "single" || q.question_type === "multiple") && q.options?.length > 0 && (
        <ul className="text-sm text-gray-600 list-disc list-inside flex flex-col gap-1">
          {q.options.map((o) => (
            <li key={o.id}>{o.option_text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminEditSurvey() {
  const params = useParams();
  const surveyId = Number(params.id);
  const validId = Number.isFinite(surveyId) && surveyId > 0 ? surveyId : null;
  const { data: surveyData, loading, error, refetch } = useSurvey(validId);

  const [qText, setQText] = useState("");
  const [qType, setQType] = useState("Один вариант");
  const [optList, setOptList] = useState(["Вариант 1", "Вариант 2"]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors text-gray-700 placeholder-gray-400 bg-white";
  const labelCls = "text-sm font-medium text-gray-700";

  const addOpt = () => setOptList((prev) => [...prev, `Вариант ${prev.length + 1}`]);
  const removeOpt = (oi: number) => setOptList((prev) => prev.filter((_, i) => i !== oi));
  const updateOpt = (oi: number, val: string) => setOptList((prev) => prev.map((o, i) => (i === oi ? val : o)));

  const statusLabel =
    surveyData?.status === "active" ? "Активный" : surveyData?.status === "completed" ? "Завершён" : "Черновик";
  const statusColor =
    surveyData?.status === "active" ? "#16a34a" : surveyData?.status === "completed" ? "#6b7280" : "#d97706";
  const statusBg =
    surveyData?.status === "active" ? "rgba(22,163,74,0.1)" : surveyData?.status === "completed" ? "rgba(107,114,128,0.1)" : "rgba(217,119,6,0.1)";

  const handleAddQuestion = async () => {
    if (!validId || !surveyData) return;
    if (!qText.trim()) {
      setFormError("Введите текст вопроса");
      return;
    }
    try {
      setSaving(true);
      setFormError(null);
      const order_index = surveyData.questions?.length ?? 0;
      const created = await createQuestion(validId, {
        question_text: qText.trim(),
        question_type: mapQuestionType(qType),
        order_index,
      });
      if (qType === "Один вариант" || qType === "Множественный выбор") {
        let j = 0;
        for (const text of optList) {
          if (!text.trim()) continue;
          await createOption(created.id, { option_text: text.trim(), order_index: j });
          j += 1;
        }
      }
      setQText("");
      setQType("Один вариант");
      setOptList(["Вариант 1", "Вариант 2"]);
      await refetch();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="px-6 pt-6 pb-0 md:px-12 md:pt-10 md:pb-0 flex flex-col gap-6">
        <Link to="/admin" className="text-sm text-gray-500 hover:text-gray-800 w-fit">
          ← К обзору
        </Link>

        {!validId && <p className="text-sm text-red-600">Некорректная ссылка на опрос</p>}
        {validId && loading && <LoadingSpinner />}
        {validId && error && <p className="text-sm text-red-600">{error}</p>}

        {surveyData && (
          <>
            <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{surveyData.title}</h1>
                <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: statusBg, color: statusColor }}>
                  {statusLabel}
                </span>
              </div>
            </div>

            <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 flex flex-col gap-5">
              <h2 className="text-sm font-semibold text-gray-900">Текущие вопросы</h2>
              {surveyData.questions.length === 0 ? (
                <p className="text-sm text-gray-500">Пока нет вопросов</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {[...surveyData.questions].sort((a, b) => a.order_index - b.order_index).map((q, idx) => (
                    <ExistingQuestionBlock key={q.id} q={q} index={idx} />
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 flex flex-col gap-5">
              <h2 className="text-sm font-semibold text-gray-900">Добавить вопрос</h2>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Текст вопроса</label>
                <input
                  type="text"
                  placeholder="Введите вопрос"
                  className={inputCls}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Тип вопроса</label>
                <Select value={qType} onChange={(e) => setQType(e.target.value)} style={{ maxWidth: "280px" }}>
                  <option>Один вариант</option>
                  <option>Множественный выбор</option>
                  <option>Текстовый ответ</option>
                </Select>
              </div>

              {(qType === "Один вариант" || qType === "Множественный выбор") && (
                <div className="flex flex-col gap-2">
                  {optList.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOpt(oi, e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors bg-white flex-1"
                        style={{ color: "#9CA3AF", fontWeight: 400 }}
                      />
                      <button type="button" onClick={() => removeOpt(oi)} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                        <XIcon />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOpt}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mt-1 w-fit"
                  >
                    <PlusIcon /> Добавить вариант
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => void handleAddQuestion()}
                disabled={saving}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-lg text-white transition-colors"
                style={{ backgroundColor: saving ? "#6B7280" : "#0A1628" }}
              >
                <PlusIcon /> Добавить вопрос
              </button>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
