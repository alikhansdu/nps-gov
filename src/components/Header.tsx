import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

interface HeaderProps {
  activeLang?: "RU" | "KZ";
  onLangChange?: (lang: "RU" | "KZ") => void;
  onLogin?: () => void;
  activeNav?: string;
}

const ShieldIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const navItems = [
  { label: "Главная", href: "/" },
  { label: "Опросы", href: "/surveys" },
  { label: "Аналитика", href: "/analytics" },
];

export default function Header({
  activeLang = "RU",
  onLangChange,
  onLogin,
  activeNav = "/",
}: HeaderProps) {
  return (
    <header
      className="w-full"
      style={{
        backgroundColor: "#0A1628",
        minHeight: "114px",
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-8 py-2 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <span className="text-xs" style={{ color: "#8899bb" }}>
          Официальный портал Республики Казахстан
        </span>

        <span
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "#8899bb" }}
        >
          <ShieldIcon /> Защищённое соединение
        </span>
      </div>

      {/* Main navigation */}
      <div className="flex items-center justify-between px-8 py-5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Герб РК"
            className="w-10 h-10 flex-shrink-0"
          />

          <div>
            <div className="text-white font-semibold text-sm leading-tight">
              nps.gov
            </div>

            <div
              className="text-xs"
              style={{ color: "#8899bb" }}
            >
              Национальная система опросов
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = activeNav === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className="px-4 py-2 text-sm rounded-lg transition-all duration-150"
                style={{
                  color: isActive ? "white" : "#8899bb",
                  backgroundColor: isActive
                    ? "rgba(255,255,255,0.08)"
                    : "transparent",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Language + Login */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center border rounded-lg overflow-hidden"
            style={{ borderColor: "rgba(255,255,255,0.15)" }}
          >
            {(["RU", "KZ"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => onLangChange?.(lang)}
                className="px-3 py-1.5 text-xs font-medium transition-colors duration-150"
                style={{
                  color: activeLang === lang ? "#0A1628" : "#8899bb",
                  backgroundColor: activeLang === lang ? "white" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (activeLang !== lang)
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)";
                }}
                onMouseLeave={(e) => {
                  if (activeLang !== lang)
                    e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* ВОЙТИ */}
          <Link
            to="/login"
            onClick={onLogin}
            className="px-4 py-2 text-sm font-semibold rounded-lg"
            style={{
              backgroundColor: "#F5C518",
              color: "#0A1628",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e6b800")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F5C518")}
          >
            ВОЙТИ
          </Link>
        </div>
      </div>
    </header>
  );
}
