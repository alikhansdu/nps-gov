import { useState } from "react";

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="text-gray-400 flex-shrink-0"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

interface SearchInputProps {
  placeholder?: string;
  buttonText?: string;
  onSearch?: (value: string) => void;
}

export default function SearchInput({
  placeholder = "Placeholder",
  buttonText = "Button",
  onSearch,
}: SearchInputProps) {
  const [value, setValue] = useState("");

  const handleClick = () => {
    onSearch?.(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch?.(value);
  };

  return (
    <div className="flex items-center w-full max-w-lg">
      {/* Input */}
      <div className="flex items-center flex-1 bg-white rounded-l-lg px-4 py-2.5 gap-2 border border-r-0 border-gray-200">
        <SearchIcon />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
        />
      </div>

      {/* Button */}
      <button
        onClick={handleClick}
        className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-6 py-2.5 rounded-r-lg transition-colors duration-200 whitespace-nowrap"
      >
        {buttonText}
      </button>
    </div>
  );
}
