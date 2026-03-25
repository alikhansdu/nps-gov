interface ActionCardProps {
  labelTop?: string;
  title?: string;
  labelBody?: string;
  description?: string;
  badge?: string;
  linkText?: string;
  onLinkClick?: () => void;
}

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ExternalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export default function ActionCard({
  labelTop = "Какие действия предприняты:",
  title = "Улучшение качества образования",
  labelBody = "Какие действия предприняты:",
  description = "Повышение зарплат педагогов на 25%, программа переподготовки, новые учебники",
  badge = "Реализовано",
  linkText = "Подробнее",
  onLinkClick,
}: ActionCardProps) {
  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 shadow-sm w-full max-w-sm flex flex-col gap-4">

      {/* Icon */}
      <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
        <CheckIcon />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-gray-400">{labelTop}</p>
        <h3 className="text-base font-bold text-gray-900 leading-snug">{title}</h3>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xs text-gray-400">{labelBody}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-1">
        <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-50 rounded-full">
          {badge}
        </span>
        <button
          onClick={onLinkClick}
          className="flex items-center gap-1 text-sm font-medium text-[#00BCD4] hover:underline transition-colors"
        >
          {linkText}
          <ExternalIcon />
        </button>
      </div>

    </div>
  );
}
