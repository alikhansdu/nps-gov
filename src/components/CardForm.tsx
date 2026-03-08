import { useState } from "react";

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

interface CardFormProps {
  title?: string;
  description?: string;
  onCancel?: () => void;
  onSubmit?: () => void;
  buttonText?: string;
}

export default function CardForm({
  title = "Title Text",
  description = "This is a card description.",
  onCancel,
  onSubmit,
  buttonText = "Deploy",
}: CardFormProps) {
  const [form, setForm] = useState({
    field1: "",
    field2: "",
    date: "",
    field3: "",
    select: "",
    field4: "",
  });

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 shadow-sm w-full max-w-2xl">

      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>

      {/* Grid 2 колонки */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

        {/* Row 1 */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-800">Label</label>
          <input
            type="text"
            value={form.field1}
            onChange={(e) => set("field1")(e.target.value)}
            placeholder="Placeholder"
            className="w-full px-3 py-2 text-sm border border-[#E4E4E7] rounded-lg outline-none placeholder-gray-400 focus:border-[#00BCD4] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-800">Label</label>
          <input
            type="text"
            value={form.field2}
            onChange={(e) => set("field2")(e.target.value)}
            placeholder="Placeholder"
            className="w-full px-3 py-2 text-sm border border-[#E4E4E7] rounded-lg outline-none placeholder-gray-400 focus:border-[#00BCD4] transition-colors"
          />
        </div>

        {/* Row 2 — Date picker */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-800">Label</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <CalendarIcon />
            </span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date")(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#E4E4E7] rounded-lg outline-none text-gray-500 focus:border-[#00BCD4] transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-800">Label</label>
          <input
            type="text"
            value={form.field3}
            onChange={(e) => set("field3")(e.target.value)}
            placeholder="Placeholder"
            className="w-full px-3 py-2 text-sm border border-[#E4E4E7] rounded-lg outline-none placeholder-gray-400 focus:border-[#00BCD4] transition-colors"
          />
        </div>

        {/* Row 3 — Select */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-800">Label</label>
          <div className="relative">
            <select
              value={form.select}
              onChange={(e) => set("select")(e.target.value)}
              className="w-full appearance-none px-3 py-2 text-sm border border-[#E4E4E7] rounded-lg outline-none text-gray-500 focus:border-[#00BCD4] transition-colors bg-white"
            >
              <option value="" disabled>Placeholder</option>
              <option value="option1">Вариант 1</option>
              <option value="option2">Вариант 2</option>
              <option value="option3">Вариант 3</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <ChevronIcon />
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-800">Label</label>
          <input
            type="text"
            value={form.field4}
            onChange={(e) => set("field4")(e.target.value)}
            placeholder="Placeholder"
            className="w-full px-3 py-2 text-sm border border-[#E4E4E7] rounded-lg outline-none placeholder-gray-400 focus:border-[#00BCD4] transition-colors"
          />
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-[#E4E4E7] rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="px-6 py-2 text-sm font-medium text-white bg-[#18181B] hover:bg-[#27272a] rounded-lg transition-colors"
        >
          {buttonText}
        </button>
      </div>

    </div>
  );
}
