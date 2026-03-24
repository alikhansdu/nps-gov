import { useState } from "react";
import type { ChangeEvent } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { createSurvey, updateStatus } from "../api/surveys";
import { createQuestion } from "../api/questions";
import { createOption } from "../api/options";
import { useRegions } from "../hooks/useRegions";

const TrashIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const PlusIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const DragIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="19" r="1" fill="currentColor"/><circle cx="15" cy="5" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="19" r="1" fill="currentColor"/></svg>;
const XIcon       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ChevronDown = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;

interface Question {
  id: number;
  text: string;
  type: string;
  options: string[];
  required: boolean;
  scaleMin: number;
  scaleMax: number;
}

function Select({ children, value, onChange, style }: any) {
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

export default function AdminCreateSurvey() {
  const { data: regions } = useRegions();
  const [anonymous, setAnonymous] = useState(true);
  const [comments, setComments]   = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [regionId, setRegionId] = useState<number | null>(null);
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, text: "", type: "Один вариант", options: ["Вариант 1", "Вариант 2"], required: false, scaleMin: 0, scaleMax: 10 },
  ]);

  const addQuestion = () => setQuestions(prev => [...prev, {
    id: Date.now(), text: "", type: "Один вариант",
    options: ["Вариант 1", "Вариант 2"], required: false, scaleMin: 0, scaleMax: 10,
  }]);

  const removeQuestion = (id: number) => setQuestions(prev => prev.filter(q => q.id !== id));

  const updateQuestion = (id: number, field: keyof Question, value: any) =>
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));

  const addOption = (id: number) =>
    setQuestions(prev => prev.map(q =>
      q.id === id ? { ...q, options: [...q.options, `Вариант ${q.options.length + 1}`] } : q
    ));

  const removeOption = (id: number, oi: number) =>
    setQuestions(prev => prev.map(q =>
      q.id === id ? { ...q, options: q.options.filter((_, i) => i !== oi) } : q
    ));

  const updateOption = (id: number, oi: number, val: string) =>
    setQuestions(prev => prev.map(q =>
      q.id === id ? { ...q, options: q.options.map((o, i) => i === oi ? val : o) } : q
    ));

  const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors text-gray-700 placeholder-gray-400 bg-white";
  const labelCls = "text-sm font-medium text-gray-700";

  const mapQuestionType = (type: string): "single" | "multiple" | "text" => {
    if (type === "Множественный выбор") return "multiple";
    if (type === "Текстовый ответ") return "text";
    return "single";
  };

  const handleSubmit = async (status: "active" | "draft") => {
    if (!description.trim()) {
      setError("Введите описание опроса");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const survey = await createSurvey({
        title: title || "Новый опрос",
        description: description || null,
        status: "draft",
        region_id: regionId,
        end_date: endDate || null,
      });

      for (let i = 0; i < questions.length; i += 1) {
        const q = questions[i];
        if (!q.text.trim()) continue;
        const createdQ = await createQuestion(survey.id, {
          question_text: q.text,
          question_type: mapQuestionType(q.type),
          order_index: i,
        });
        if (q.type !== "Текстовый ответ" && q.type !== "Шкала") {
          for (let j = 0; j < q.options.length; j += 1) {
            const opt = q.options[j];
            if (!opt.trim()) continue;
            await createOption(createdQ.id, { option_text: opt, order_index: j });
          }
        }
      }

      if (status === "active") {
        await updateStatus(survey.id, "active");
      }
      setTitle("");
      setDescription("");
      setQuestions([{ id: Date.now(), text: "", type: "Один вариант", options: ["Вариант 1", "Вариант 2"], required: false, scaleMin: 0, scaleMax: 10 }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="px-6 pt-6 pb-0 md:px-12 md:pt-10 md:pb-0 flex flex-col gap-6">

        <h1 className="text-2xl font-bold text-gray-900">Создать опрос</h1>

        <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 flex flex-col gap-5">

          <h2 className="text-sm font-semibold text-gray-900">Информация об опросе</h2>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Название опроса *</label>
            <input type="text" placeholder="Введите название..." className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Описание *</label>
            <textarea placeholder="Опишите цель опроса..." rows={3} className={`${inputCls} resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Тип опроса</label>
              <Select>
                <option>Множественный выбор</option>
                <option>Один вариант</option>
                <option>Открытый вопрос</option>
                <option>Шкала оценки</option>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>География</label>
              <Select value={regionId ?? ""} onChange={(e: ChangeEvent<HTMLSelectElement>) => setRegionId(e.target.value ? Number(e.target.value) : null)}>
                <option value="">Вся РК</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Дата начала</label>
              <input
                type="date"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors bg-white text-gray-700"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Дата окончания</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors bg-white text-gray-700"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { label: "Анонимное голосование", val: anonymous, set: setAnonymous },
              { label: "Разрешить комментарии", val: comments,  set: setComments },
            ].map(({ label, val, set }) => (
              <div key={label} className="flex items-center gap-3">
                <button
                  onClick={() => set(!val)}
                  className="relative flex-shrink-0 rounded-full transition-colors"
                  style={{ width: "40px", height: "24px", backgroundColor: val ? "#0A1628" : "#D1D5DB" }}
                >
                  <div className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all" style={{ left: val ? "22px" : "2px" }} />
                </button>
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100" />

          {/* Вопросы */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Вопросы</h2>
            <button
              onClick={addQuestion}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-white transition-colors"
              style={{ backgroundColor: "#0A1628" }}
            >
              <PlusIcon /> Добавить вопрос
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="border border-[#E4E4E7] rounded-xl p-4 flex flex-col gap-3">

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <DragIcon />
                    <span className="text-sm font-semibold text-gray-900">Вопрос {idx + 1}</span>
                  </div>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                  >
                    <TrashIcon /> Удалить вопрос
                  </button>
                </div>

                {/* Поле вопроса с X внутри */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Введите вопрос"
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
                    className="w-full pl-3 pr-9 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors text-gray-700 placeholder-gray-400 bg-white"
                  />
                  {q.text && (
                    <button
                      onClick={() => updateQuestion(q.id, "text", "")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XIcon />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Select
                    value={q.type}
                    onChange={(e: any) => updateQuestion(q.id, "type", e.target.value)}
                    style={{ width: "200px" }}
                  >
                    <option>Один вариант</option>
                    <option>Множественный выбор</option>
                    <option>Текстовый ответ</option>
                    <option>Шкала</option>
                  </Select>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => updateQuestion(q.id, "required", e.target.checked)}
                      className="w-4 h-4 border-gray-300 rounded"
                    />
                    Обязательный вопрос
                  </label>
                </div>

                {/* Варианты — только для не-текстовых и не-шкала */}
                {(q.type === "Один вариант" || q.type === "Множественный выбор") && (
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(q.id, oi, e.target.value)}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors bg-white flex-1"
                          style={{ color: "#9CA3AF", fontWeight: 400 }}
                        />
                        <button onClick={() => removeOption(q.id, oi)} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                          <XIcon />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addOption(q.id)}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mt-1 w-fit"
                    >
                      <PlusIcon /> Добавить вариант
                    </button>
                  </div>
                )}

                {/* Шкала — от/до */}
                {q.type === "Шкала" && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">от</span>
                    <input
                      type="number"
                      value={q.scaleMin}
                      onChange={(e) => updateQuestion(q.id, "scaleMin", Number(e.target.value))}
                      className="w-20 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 text-gray-700 bg-white text-center"
                    />
                    <span className="text-sm text-gray-500">до</span>
                    <input
                      type="number"
                      value={q.scaleMax}
                      onChange={(e) => updateQuestion(q.id, "scaleMax", Number(e.target.value))}
                      className="w-20 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 text-gray-700 bg-white text-center"
                    />
                  </div>
                )}

              </div>
            ))}
          </div>

          <button
            onClick={addQuestion}
            className="w-full py-3 text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <PlusIcon /> Добавить вопрос
          </button>

        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => void handleSubmit("active")} disabled={saving} className="py-3 text-sm font-semibold rounded-lg text-white transition-colors" style={{ backgroundColor: "#6B7280" }}>
            Опубликовать опрос
          </button>
          <button onClick={() => void handleSubmit("draft")} disabled={saving} className="py-3 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            Сохранить как черновик
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}

      </div>
    </AdminLayout>
  );
}