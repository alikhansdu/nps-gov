import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";

const TrashIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const PlusIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const CalIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const DragIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="19" r="1" fill="currentColor"/><circle cx="15" cy="5" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="19" r="1" fill="currentColor"/></svg>;
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

const TYPE_MAP: Record<string, "single" | "multiple" | "text"> = {
  "Один вариант":        "single",
  "Множественный выбор": "multiple",
  "Текстовый ответ":     "text",
};

function Select({ className, children, value, onChange, style }: any) {
  return (
    <div className="relative" style={style}>
      <select value={value} onChange={onChange}
        className={`w-full pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg outline-none text-gray-700 bg-white appearance-none ${className ?? ""}`}>
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center"><ChevronDown /></div>
    </div>
  );
}

export default function AdminCreateSurvey() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("access_token");

  const [title, setTitle]           = useState("");
  const [description, setDesc]      = useState("");
  const [regionId, setRegionId]     = useState<string>("");
  const [endDate, setEndDate]       = useState("");
  const [anonymous, setAnonymous]   = useState(true);
  const [comments, setComments]     = useState(false);
  const [regions, setRegions]       = useState<Region[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [questions, setQuestions]   = useState<Question[]>([
    { id: 1, text: "", type: "Один вариант", options: ["Вариант 1", "Вариант 2"], required: false },
  ]);

  useEffect(() => {
    fetch("/api/v1/regions")
      .then((r) => r.ok ? r.json() : [])
      .then(setRegions)
      .catch(() => {});
  }, []);

  const addQuestion = () =>
    setQuestions((prev) => [...prev, { id: Date.now(), text: "", type: "Один вариант", options: ["Вариант 1", "Вариант 2"], required: false }]);

  const removeQuestion = (id: number) => setQuestions((prev) => prev.filter((q) => q.id !== id));

  const updateQuestion = (id: number, field: keyof Question, value: any) =>
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, [field]: value } : q));

  const addOption = (id: number) =>
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, options: [...q.options, `Вариант ${q.options.length + 1}`] } : q));

  const removeOption = (id: number, oi: number) =>
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, options: q.options.filter((_, i) => i !== oi) } : q));

  const updateOption = (id: number, oi: number, val: string) =>
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, options: q.options.map((o, i) => i === oi ? val : o) } : q));

  const handleSubmit = async (status: "active" | "draft") => {
    if (!title.trim()) { setError("Введите название опроса"); return; }
    setSubmitting(true);
    setError(null);

    try {
      // 1. Создаём опрос
      const surveyRes = await fetch("/api/v1/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title:       title.trim(),
          description: description.trim() || null,
          status,
          region_id:   regionId ? parseInt(regionId) : null,
          end_date:    endDate || null,
        }),
      });

      if (!surveyRes.ok) throw new Error("Ошибка создания опроса");
      const survey = await surveyRes.json();

      // 2. Создаём вопросы
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.text.trim()) continue;
        await fetch("/api/v1/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            survey_id:     survey.id,
            question_text: q.text,
            question_type: TYPE_MAP[q.type] ?? "single",
            order_index:   i,
            options: q.type !== "Текстовый ответ"
              ? q.options.map((opt, oi) => ({ option_text: opt, order_index: oi }))
              : [],
          }),
        });
      }

      navigate("/admin");
    } catch (e: any) {
      setError(e.message ?? "Ошибка");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors text-gray-700 placeholder-gray-400 bg-white";
  const labelCls = "text-sm font-medium text-gray-700";

  return (
    <AdminLayout>
      <div style={{ padding: "40px 32px 40px 48px", display: "flex", flexDirection: "column", gap: "24px" }}>

        <h1 className="text-2xl font-bold text-gray-900">Создать опрос</h1>

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
              <Select value={regionId} onChange={(e: any) => setRegionId(e.target.value)}>
                <option value="">Вся РК</option>
                {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Дата начала</label>
              <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg">
                <span className="text-gray-400"><CalIcon /></span>
                <input type="text" placeholder="дд.мм.гггг"
                  className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Дата окончания</label>
              <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg">
                <span className="text-gray-400"><CalIcon /></span>
                <input type="date" placeholder="дд.мм.гггг"
                  className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { label: "Анонимное голосование", val: anonymous, set: setAnonymous },
              { label: "Разрешить комментарии", val: comments,  set: setComments },
            ].map(({ label, val, set }) => (
              <div key={label} className="flex items-center gap-3">
                <button onClick={() => set(!val)} className="relative flex-shrink-0 rounded-full transition-colors"
                  style={{ width: "40px", height: "24px", backgroundColor: val ? "#0A1628" : "#D1D5DB" }}>
                  <div className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all"
                    style={{ left: val ? "22px" : "2px" }} />
                </button>
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100" />

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Вопросы</h2>
            <button onClick={addQuestion}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-white transition-colors"
              style={{ backgroundColor: "#0A1628" }}>
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
                  <button onClick={() => removeQuestion(q.id)}
                    className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 transition-colors">
                    <TrashIcon /> Удалить вопрос
                  </button>
                </div>

                <input type="text" placeholder="Введите вопрос" value={q.text}
                  onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
                  className={inputCls} />

                <div className="flex items-center justify-between gap-4">
                  <Select value={q.type} onChange={(e: any) => updateQuestion(q.id, "type", e.target.value)} style={{ width: "200px" }}>
                    <option>Один вариант</option>
                    <option>Множественный выбор</option>
                    <option>Текстовый ответ</option>
                    <option>Шкала</option>
                  </Select>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={q.required}
                      onChange={(e) => updateQuestion(q.id, "required", e.target.checked)}
                      className="w-4 h-4 border-gray-300 rounded" />
                    Обязательный вопрос
                  </label>
                </div>

                {q.type !== "Текстовый ответ" && (
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input type="text" value={opt}
                          onChange={(e) => updateOption(q.id, oi, e.target.value)}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors bg-white flex-1"
                          style={{ color: "#9CA3AF", fontWeight: 400 }} />
                        <button onClick={() => removeOption(q.id, oi)}
                          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                          <XIcon />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addOption(q.id)}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mt-1 w-fit">
                      <PlusIcon /> Добавить вариант
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={addQuestion}
            className="w-full py-3 text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2">
            <PlusIcon /> Добавить вопрос
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSubmit("active")}
            disabled={submitting}
            className="py-3 text-sm font-semibold rounded-lg text-white transition-colors"
            style={{ backgroundColor: submitting ? "#9CA3AF" : "#0A1628" }}
          >
            {submitting ? "Сохранение..." : "Опубликовать опрос"}
          </button>
          <button
            onClick={() => handleSubmit("draft")}
            disabled={submitting}
            className="py-3 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Сохранить как черновик
          </button>
        </div>

      </div>
    </AdminLayout>
  );
}