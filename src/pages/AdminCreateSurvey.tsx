import { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const PlusIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const CalIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

interface Question {
  id: number;
  text: string;
  type: string;
  options: string[];
}

export default function AdminCreateSurvey() {
  const [anonymous, setAnonymous] = useState(true);
  const [comments, setComments] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = () => {
    setQuestions(prev => [...prev, { id: Date.now(), text: "", type: "Один вариант", options: ["Вариант 1", "Вариант 2"] }]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const addOption = (id: number) => {
    setQuestions(prev => prev.map(q => q.id === id
      ? { ...q, options: [...q.options, `Вариант ${q.options.length + 1}`] }
      : q));
  };

  return (
    <AdminLayout>
      <div style={{ padding: "40px 48px", gap: "32px", display: "flex", flexDirection: "column" }}>

        <h1 className="text-2xl font-bold text-gray-900">Создать опрос</h1>

        {/* Main form card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-5">

          <h2 className="text-base font-semibold text-gray-900">Информация об опросе</h2>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-600">Название опроса *</label>
            <input type="text" placeholder="Введите название..."
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors text-gray-700 placeholder-gray-400" />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-600">Описание</label>
            <textarea placeholder="Опишите цель опроса..." rows={4}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors text-gray-700 placeholder-gray-400 resize-none" />
          </div>

          {/* Type + Geography */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-600">Тип опроса</label>
              <select className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none text-gray-700 bg-white">
                <option>Множественный выбор</option>
                <option>Один вариант</option>
                <option>Открытый вопрос</option>
                <option>Шкала оценки</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-600">География</label>
              <select className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none text-gray-700 bg-white">
                <option>Вся РК</option>
                <option>Алматы</option>
                <option>Астана</option>
                <option>Шымкент</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-600">Дата начала</label>
              <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg">
                <span className="text-gray-400"><CalIcon /></span>
                <input type="text" placeholder="дд. мм.гггг"
                  className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-600">Дата окончания</label>
              <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg">
                <span className="text-gray-400"><CalIcon /></span>
                <input type="text" placeholder="дд. мм.гггг"
                  className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3">
            {/* Anonymous */}
            <div className="flex items-center gap-3">
              <button onClick={() => setAnonymous(!anonymous)}
                className="relative w-10 h-6 rounded-full transition-colors flex-shrink-0"
                style={{ backgroundColor: anonymous ? "#0A1628" : "#D1D5DB" }}>
                <div className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all"
                  style={{ left: anonymous ? "22px" : "2px" }} />
              </button>
              <span className="text-sm text-gray-700">Анонимное голосование</span>
            </div>
            {/* Comments */}
            <div className="flex items-center gap-3">
              <button onClick={() => setComments(!comments)}
                className="relative w-10 h-6 rounded-full transition-colors flex-shrink-0"
                style={{ backgroundColor: comments ? "#0A1628" : "#D1D5DB" }}>
                <div className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all"
                  style={{ left: comments ? "22px" : "2px" }} />
              </button>
              <span className="text-sm text-gray-700">Разрешить комментарии</span>
            </div>
          </div>

          {/* Question builder */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Конструктор вопросов</h2>
              <button onClick={addQuestion}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors"
                style={{ backgroundColor: "#0A1628" }}>
                <PlusIcon /> Добавить вопрос
              </button>
            </div>

            {questions.map((q, idx) => (
              <div key={q.id} className="border border-gray-200 rounded-xl p-4 mb-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Вопрос {idx + 1}</span>
                  <button onClick={() => removeQuestion(q.id)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors">
                    <TrashIcon /> Удалить вопрос
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-gray-600">Текст вопроса</label>
                  <input type="text" placeholder="Введите вопрос"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-gray-600">Тип ответа</label>
                  <select className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none bg-white text-gray-700">
                    <option>Один вариант</option>
                    <option>Множественный выбор</option>
                    <option>Открытый ответ</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600">Варианты ответа</label>
                  {q.options.map((opt, oi) => (
                    <input key={oi} type="text" defaultValue={opt}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors" />
                  ))}
                  <button onClick={() => addOption(q.id)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mt-1">
                    <PlusIcon /> Добавить вариант
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="py-3 text-sm font-semibold rounded-lg text-white transition-colors"
            style={{ backgroundColor: "#6B7280" }}>
            Опубликовать опрос
          </button>
          <button className="py-3 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            Сохранить как черновик
          </button>
        </div>

      </div>
    </AdminLayout>
  );
}
