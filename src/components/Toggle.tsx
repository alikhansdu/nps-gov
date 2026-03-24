import { useState } from "react";

interface ToggleProps {
  defaultActive?: boolean;
  label?: string;
  showText?: boolean;
  onChange?: (active: boolean) => void;
}

export default function Toggle({
  defaultActive = false,
  label,
  showText = false,
  onChange,
}: ToggleProps) {
  const [active, setActive] = useState(defaultActive);

  const handleToggle = () => {
    const next = !active;
    setActive(next);
    onChange?.(next);
  };

  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      {label && <span className="text-sm text-gray-700">{label}</span>}

      <div
        onClick={handleToggle}
        className={`
          relative w-11 h-6 rounded-full transition-colors duration-200
          ${active ? "bg-[#00BCD4]" : "bg-gray-300"}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
            transition-transform duration-200
            ${active ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </div>

      {showText && (
        <span className="text-sm text-gray-600">
          {active ? "Вкл" : "Выкл"}
        </span>
      )}
    </label>
  );
}
