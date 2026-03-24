import type { ReactNode } from "react";

interface ButtonProps {
  text?: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: "primary" | "dark" | "accent";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const CircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const variantStyles = {
  primary: "bg-[#0A1628] hover:bg-[#0d1f3c] text-white",
  dark:    "bg-[#18181B] hover:bg-[#27272a] text-white",
  accent:  "bg-[#00BCD4] hover:bg-[#00a8be] text-white",
};

export default function Button({
  text = "Button",
  onClick,
  icon = <CircleIcon />,
  variant = "dark",
  disabled = false,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2
        px-4 py-2 rounded-lg
        text-sm font-medium
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {text}
    </button>
  );
}
