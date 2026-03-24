import type { ReactNode } from "react";

interface ButtonGroupItem {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
}

interface ButtonGroupProps {
  buttons?: ButtonGroupItem[];
}

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="5" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="19" cy="12" r="1" fill="currentColor" />
  </svg>
);

const defaultButtons: ButtonGroupItem[] = [
  { label: "New",  icon: <PlusIcon /> },
  { label: "Edit", icon: <EditIcon /> },
  { label: "Send", icon: <SendIcon /> },
  { label: "",     icon: <MoreIcon /> },
];

export default function ButtonGroup({ buttons = defaultButtons }: ButtonGroupProps) {
  return (
    <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
      {buttons.map((btn, index) => (
        <button
          key={index}
          onClick={btn.onClick}
          className={`
            flex items-center gap-2 px-4 h-10
            text-sm font-medium text-gray-800
            hover:bg-gray-100 transition-colors duration-150
            ${index !== buttons.length - 1 ? "border-r border-gray-200" : ""}
          `}
        >
          <span className="text-gray-700">{btn.icon}</span>
          {btn.label && <span>{btn.label}</span>}
        </button>
      ))}
    </div>
  );
}
