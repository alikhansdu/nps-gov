import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DatePicker, { registerLocale } from "react-datepicker";
import { ru } from "date-fns/locale/ru";
import "react-datepicker/dist/react-datepicker.css";
import AdminLayout from "../layouts/AdminLayout";
import { TOKEN_KEY } from "../api/client";
import { FRONTEND_ONLY } from "../config/frontendMode";
import { addMockSurvey } from "../mocks/surveyStore";

registerLocale("ru", ru);

const PlusIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const CalIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const DragIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="19" r="1" fill="currentColor"/><circle cx="15" cy="5" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="19" r="1" fill="currentColor"/></svg>;
const XIcon       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ChevronDown = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;

type Region = { id: number; name: string };

interface Question {
  id: number;
  text: string;
  type: string;
  options: string[];
  required: boolean;
}

const QUESTION_TYPES = ["Один вариант", "Множественный выбор", "Текстовый ответ", "Шкала"];

const CATEGORIES = [
  "Инфраструктура", "Цифровизация", "Экология",
  "Экономика", "Здравоохранение", "Образование", "Социальная политика",
];

const TYPE_MAP: Record<string, "single" | "multiple" | "text"> = {
  "Один вариант":        "single",
  "Множественный выбор": "multiple",
  "Текстовый ответ":     "text",
  "Шкала":               "single",
};

const REVERSE_TYPE_MAP: Record<string, string> = {
  "single":   "Один вариант",
  "multiple": "Множественный выбор",
  "text":     "Текстовый ответ",
};

// ─── Custom Select with dropdown ─────────────────────────
function CustomSelect({
  value,
  options,
  onChange,
  style,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative" style={style}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 outline-none"
        style={{ minWidth: 0 }}
      >
        <span className="truncate">{value}</span>
        <ChevronDown />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          style={{ minWidth: "100%", width: "max-content" }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              {opt === value && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {opt !== value && <span style={{ width: 12 }} />}
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Simple native select ────────────────────────────────
function Select({
  children,
  value,
  onChange,
  style,
}: {
  children: React.ReactNode;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  style?: React.CSSProperties;
}) {
  return (
    <div className="relative" style={style}>
      <select
        value={value ?? ""}
        onChange={onChange}
        className="w-full pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg outline-none text-gray-700 bg-white appearance-none"
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center"><ChevronDown /></div>
    </div>
  );
}

// ─── Toggle ──────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="relative flex-shrink-0 rounded-full transition-colors"
      style={{ width: "44px", height: "26px", backgroundColor: value ? "#0A1628" : "#D1D5DB" }}
    >
      <div
        className="absolute top-1 w-4.5 h-4.5 bg-white rounded-full transition-all shadow-sm"
        style={{ width: "18px", height: "18px", top: "4px", left: value ? "22px" : "4px" }}
      />
    </button>
  );
}

export default function AdminCreateSurvey() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token    = localStorage.getItem(TOKEN_KEY);

  const [editId, setEditId]       = useState<number | null>(null);
  const [title, setTitle]         = useState("");
  const [description, setDesc]    = useState("");
  const [category, setCategory]   = useState("Инфраструктура");
  const [regionId, setRegionId]   = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate]     = useState<Date | null>(null);
  const [anonymous, setAnonymous] = useState(true);
  const [comments, setComments]   = useState(false);
  const [regions, setRegions]     = useState<Region[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, text: "", type: "Один вариант", options: ["Вариант 1", "Вариант 2"], required: false },
  ]);

  // IDs of questions originally loaded from backend (used for deletion on edit save)
  const originalQuestionIdsRef = useRef<number[]>([]);

  // Load regions
  useEffect(() => {
    if (FRONTEND_ONLY) {
      setRegions([
        { id: 1, name: "Алматы" },
        { id: 2, name: "Астана" },
        { id: 3, name: "Шымкент" },
      ]);
      return;
    }
    fetch("/api/v1/regions")
      .then((r) => r.ok ? r.json() : [])
      .then(setRegions)
      .catch(() => {});
  }, []);

  // Load survey data if editing
  useEffect(() => {
    const idParam = searchParams.get("edit");
    if (!idParam) return;
    const numId = parseInt(idParam, 10);
    if (isNaN(numId)) return;
    setEditId(numId);

    if (FRONTEND_ONLY) return;

    fetch(`/api/v1/surveys/${numId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject(new Error("Не удалось загрузить опрос")))
      .then((data) => {
        setTitle(data.title ?? "");
        setDesc(data.description ?? "");
        setRegionId(data.region_id ? String(data.region_id) : "");
        setEndDate(data.end_date ? new Date(data.end_date) : null);

        if (data.questions?.length) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sorted = [...data.questions].sort((a: any, b: any) => a.order_index - b.order_index);
          originalQuestionIdsRef.current = sorted.map((q: { id: number }) => q.id);
          setQuestions(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sorted.map((q: any) => ({
              id: q.id,
              text: q.question_text,
              type: REVERSE_TYPE_MAP[q.question_type] ?? "Один вариант",
              options: [...q.options]
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .sort((a: any, b: any) => a.order_index - b.order_index)
                .map((o: { option_text: string }) => o.option_text),
              required: false,
            }))
          );
        }
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Не удалось загрузить опрос"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addQuestion = () =>
    setQuestions((prev) => [...prev, { id: Date.now(), text: "", type: "Один вариант", options: ["Вариант 1", "Вариант 2"], required: false }]);

  const removeQuestion = (id: number) => setQuestions((prev) => prev.filter((q) => q.id !== id));

  const updateQuestion = <K extends keyof Question>(id: number, field: K, value: Question[K]) =>
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, [field]: value } : q));

  const addOption = (id: number) =>
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, options: [...q.options, `Вариант ${q.options.length + 1}`] } : q));

  const removeOption = (id: number, oi: number) =>
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, options: q.options.filter((_, i) => i !== oi) } : q));

  const updateOption = (id: number, oi: number, val: string) =>
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, options: q.options.map((o, i) => i === oi ? val : o) } : q));

  const handleSubmit = async (status: "active" | "draft") => {
    if (!title.trim()) { setError("Введите название опроса"); return; }
    if (!endDate) { setError("Выберите дату окончания опроса"); return; }
    setSubmitting(true);
    setError(null);

    try {
      if (FRONTEND_ONLY) {
        if (!editId) {
          addMockSurvey({
            title: title.trim(),
            description: description.trim() || null,
            status,
            region_id: regionId ? parseInt(regionId, 10) : null,
            end_date: toApiDate(endDate),
          });
        }
        navigate("/admin");
        return;
      }

      let surveyId: number;

      if (editId) {
        // ── Edit mode: update survey fields ──────────────────────────────
        const updateRes = await fetch(`/api/v1/surveys/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            title:       title.trim(),
            description: description.trim() || null,
            category:    category || null,
            region_id:   regionId ? parseInt(regionId) : null,
            end_date:    endDate || null,
          }),
        });
        if (!updateRes.ok) {
          const data = await updateRes.json().catch(() => ({}));
          throw new Error(data?.detail ?? "Ошибка обновления опроса");
        }

        // Update status separately
        await fetch(`/api/v1/surveys/${editId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status }),
        });

        // Delete all original questions (cascade removes options too)
        for (const qId of originalQuestionIdsRef.current) {
          await fetch(`/api/v1/questions/${qId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        originalQuestionIdsRef.current = [];

        surveyId = editId;
      } else {
        // ── Create mode ───────────────────────────────────────────────────
        const surveyRes = await fetch("/api/v1/surveys", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            title:       title.trim(),
            description: description.trim() || null,
            category:    category || null,
            status,
            region_id:   regionId ? parseInt(regionId) : null,
            end_date:    endDate || null,
          }),
        });
        if (!surveyRes.ok) {
          const data = await surveyRes.json().catch(() => ({}));
          throw new Error(data?.detail ?? "Ошибка создания опроса");
        }
        const survey = await surveyRes.json();
        surveyId = survey.id;
      }

      // ── Create questions (both create and edit modes) ─────────────────
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.text.trim()) continue;
        const questionType = TYPE_MAP[q.type] ?? "single";

        const qRes = await fetch(`/api/v1/surveys/${surveyId}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ question_text: q.text, question_type: questionType, order_index: i }),
        });

        if (!qRes.ok) {
          const data = await qRes.json().catch(() => ({}));
          throw new Error(data?.detail ?? "Ошибка создания вопроса");
        }

        const createdQuestion = await qRes.json().catch(() => null) as { id: number } | null;

        if (questionType !== "text" && createdQuestion?.id != null) {
          for (let oi = 0; oi < q.options.length; oi++) {
            const optText = q.options[oi]?.trim();
            if (!optText) continue;
            const optRes = await fetch(`/api/v1/questions/${createdQuestion.id}/options`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ option_text: optText, order_index: oi }),
            });
            if (!optRes.ok) {
              const data = await optRes.json().catch(() => ({}));
              throw new Error(data?.detail ?? "Ошибка создания варианта ответа");
            }
          }
        }
      }

      navigate("/admin");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Format Date → "YYYY-MM-DD" for API
  const toApiDate = (d: Date | null) =>
    d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : null;

  const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors text-gray-700 placeholder-gray-400 bg-white";
  const labelCls = "text-sm font-medium text-gray-700";

  return (
    <AdminLayout>
      <div className="flex flex-col" style={{ padding: "clamp(20px,4vw,40px) clamp(16px,4vw,48px)", gap: "24px" }}>

        <h1 className="text-2xl font-bold text-gray-900">{editId ? "Редактировать опрос" : "Создать опрос"}</h1>

        {/* ── Информация ── */}
        <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-gray-900">Информация об опросе</h2>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Название опроса *</label>
            <input type="text" placeholder="Введите название..." className={inputCls}
              value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Описание</label>
            <textarea placeholder="Опишите цель опроса..." rows={3}
              className={`${inputCls} resize-none`}
              value={description} onChange={(e) => setDesc(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Категория</label>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>География</label>
              <Select value={regionId} onChange={(e) => setRegionId(e.target.value)}>
                <option value="">Вся РК</option>
                {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Дата начала</label>
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white">
                <span className="text-gray-400 flex-shrink-0"><CalIcon /></span>
                <DatePicker
                  locale="ru"
                  selected={startDate}
                  onChange={(d: Date | null) => setStartDate(d)}
                  dateFormat="dd.MM.yyyy"
                  placeholderText="дд.мм.гггг"
                  maxDate={new Date("2100-12-31")}
                  className="flex-1 w-full text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  wrapperClassName="flex-1"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Дата окончания *</label>
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white">
                <span className="text-gray-400 flex-shrink-0"><CalIcon /></span>
                <DatePicker
                  locale="ru"
                  selected={endDate}
                  onChange={(d: Date | null) => { setEndDate(d); setError(null); }}
                  dateFormat="dd.MM.yyyy"
                  placeholderText="дд.мм.гггг"
                  minDate={today}
                  maxDate={new Date("2100-12-31")}
                  className="flex-1 w-full text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  wrapperClassName="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { label: "Анонимное голосование", val: anonymous, set: setAnonymous },
              { label: "Разрешить комментарии", val: comments,  set: setComments },
            ].map(({ label, val, set }) => (
              <div key={label} className="flex items-center gap-3">
                <Toggle value={val} onChange={set} />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Вопросы ── */}
        <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Вопросы</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white"
              style={{ backgroundColor: "#0A1628" }}
            >
              <PlusIcon /> Добавить вопрос
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="border border-[#E4E4E7] rounded-xl p-5 flex flex-col gap-4">

                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <DragIcon />
                    <span className="text-sm font-semibold text-gray-900">Вопрос {idx + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(q.id)}
                    className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                  >
                    Удалить вопрос
                  </button>
                </div>

                {/* Question text */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Введите вопрос"
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
                    className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors text-gray-800 placeholder-gray-400 bg-white"
                  />
                  {q.text && (
                    <button
                      type="button"
                      onClick={() => updateQuestion(q.id, "text", "")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <XIcon />
                    </button>
                  )}
                </div>

                {/* Type + Required */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <CustomSelect
                    value={q.type}
                    options={QUESTION_TYPES}
                    onChange={(v) => updateQuestion(q.id, "type", v)}
                    style={{ width: "220px" }}
                  />
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => updateQuestion(q.id, "required", e.target.checked)}
                      className="w-4 h-4 border-gray-300 rounded"
                      style={{ accentColor: "#0A1628" }}
                    />
                    Обязательный вопрос
                  </label>
                </div>

                {/* Options */}
                {q.type !== "Текстовый ответ" && (
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(q.id, oi, e.target.value)}
                          className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors text-gray-700 placeholder-gray-400 bg-white"
                          placeholder={`Вариант ${oi + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(q.id, oi)}
                          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                        >
                          <XIcon />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOption(q.id)}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mt-1 w-fit"
                    >
                      <PlusIcon /> Добавить вариант
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add question bottom */}
          <button
            type="button"
            onClick={addQuestion}
            className="w-full py-3 text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <PlusIcon /> Добавить вопрос
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => handleSubmit("active")}
            disabled={submitting}
            className="flex-1 py-3 text-sm font-semibold rounded-lg text-white transition-colors"
            style={{ backgroundColor: submitting ? "#9CA3AF" : "#0A1628", minWidth: "160px" }}
          >
            {submitting ? "Сохранение..." : "Опубликовать опрос"}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            disabled={submitting}
            className="flex-1 py-3 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            style={{ minWidth: "160px" }}
          >
            Сохранить как черновик
          </button>
        </div>

      </div>
    </AdminLayout>
  );
}
