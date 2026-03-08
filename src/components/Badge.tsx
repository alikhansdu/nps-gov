interface BadgeProps {
  text: string;
  variant?: "dark" | "primary" | "accent" | "success" | "danger";
}

const variantStyles = {
  dark:    "bg-[#18181B] text-white",
  primary: "bg-[#0A1628] text-white",
  accent:  "bg-[#00BCD4] text-white",
  success: "bg-green-600 text-white",
  danger:  "bg-red-600 text-white",
};

export default function Badge({ text, variant = "dark" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-0.5
        text-sm font-medium rounded-full
        ${variantStyles[variant]}
      `}
    >
      {text}
    </span>
  );
}
