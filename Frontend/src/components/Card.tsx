import type { ReactNode } from "react";

// --- Input ---
interface InputProps {
  label?: string;
  placeholder?: string;
  description?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
}

export function Input({
  label,
  placeholder = "Placeholder",
  description,
  value,
  onChange,
  type = "text",
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-800">{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-[#E4E4E7] rounded-lg outline-none placeholder-gray-400 text-gray-700 focus:border-[#00BCD4] transition-colors duration-150"
      />
      {description && (
        <p className="text-xs text-gray-400">{description}</p>
      )}
    </div>
  );
}

// --- Card ---
interface CardProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  buttonText?: string;
  onSubmit?: () => void;
  className?: string;
}

export default function Card({
  title = "Title Text",
  description = "This is a card description.",
  children,
  buttonText = "Deploy",
  onSubmit,
  className = "",
}: CardProps) {
  return (
    <div
      className={`bg-white border border-[#E4E4E7] rounded-xl p-6 flex flex-col gap-5 shadow-sm w-full max-w-sm ${className}`}
    >
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4">
        {children ?? (
          <>
            <Input
              label="Label"
              placeholder="Placeholder"
              description="This is an input description."
            />
            <Input
              label="Label"
              placeholder="Placeholder"
              description="This is an input description."
            />
          </>
        )}
      </div>

      {/* Button */}
      {buttonText && (
        <button
          onClick={onSubmit}
          className="w-full py-3 bg-[#18181B] hover:bg-[#27272a] text-white text-sm font-medium rounded-lg transition-colors duration-200"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
