import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

interface HeaderProps {
  activeLang?: "RU" | "KZ";
  onLangChange?: (lang: "RU" | "KZ") => void;
  onLogin?: () => void;
  activeNav?: string;
}

const ShieldIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const navItems = [
  { label: "Главная",   href: "/" },
  { label: "Опросы",    href: "/surveys" },
  { label: "Аналитика", href: "/analytics" },
];

export default function Header({
  activeLang = "RU",
  onLangChange,
  onLogin,
  activeNav = "/",
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="w-full"
      style={{ backgroundColor: "#0A1628", minHeight: "114px" }}
    >
      {/* Top bar */}
      <div
        className="px-6 lg:px-20 flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <span className="text-xs text-center sm:text-left" style={{ color: "#8899bb" }}>
          Официальный портал Республики Казахстан
        </span>
        <span className="flex items-center justify-center sm:justify-start gap-1.5 text-xs" style={{ color: "#8899bb" }}>
          <ShieldIcon /> Защищённое соединение
        </span>
      </div>

      {/* Main navigation */}
      <div
        className="px-6 lg:px-20 flex items-center justify-between py-5"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Герб РК" className="w-10 h-10 flex-shrink-0" />
          <div>
            <div className="text-white font-semibold text-sm leading-tight">nps.gov</div>
            <div className="text-xs" style={{ color: "#8899bb" }}>Национальная система опросов</div>
          </div>
        </Link>

        {/* Navigation — desktop only */}
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
                  backgroundColor: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Language + Login + Burger */}
        <div className="flex items-center gap-3">

          {/* Language switcher */}
          <div
            className="flex items-center"
            style={{
              width: "103px",
              height: "40px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.10)",
              padding: "2px",
              gap: "2px",
              boxSizing: "border-box",
            }}
          >
            {(["RU", "KZ"] as const).map((lang) => {
              const isActive = activeLang === lang;
              return (
                <button
                  key={lang}
                  onClick={() => onLangChange?.(lang)}
                  className="flex-1 h-full text-xs font-medium text-center transition-all duration-150"
                  style={{
                    color: isActive ? "#0A1628" : "#FFFFFF",
                    backgroundColor: isActive ? "#F8FAFC" : "transparent",
                    borderRadius: "6px",
                  }}
                >
                  {lang}
                </button>
              );
            })}
          </div>

          {/* ВОЙТИ — desktop only */}
          <Link
            to="/login"
            onClick={onLogin}
            className="hidden sm:flex items-center justify-center text-sm font-medium transition-colors duration-150"
            style={{
              width: "74px",
              height: "40px",
              backgroundColor: "#EAB308",
              color: "#FAFAFA",
              borderRadius: "8px",
              whiteSpace: "nowrap",
              flexShrink: 0,
              textAlign: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ca9e06")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#EAB308")}
          >
            Войти
          </Link>

          {/* Burger — mobile only */}
          <button
            className="sm:hidden rounded-xl flex items-center justify-center"
            style={{
              width: "44px",
              height: "44px",
              backgroundColor: "#ffffff",
              color: "#EAB308",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="sm:hidden px-6 lg:px-20 border-t flex flex-col pb-4 gap-1"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          {navItems.map((item) => {
            const isActive = activeNav === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-sm rounded-lg transition-all"
                style={{
                  color: isActive ? "white" : "#8899bb",
                  backgroundColor: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/login"
            onClick={() => { setMenuOpen(false); onLogin?.(); }}
            className="mt-2 px-4 py-3 text-sm font-medium text-center"
            style={{ backgroundColor: "#EAB308", color: "#FAFAFA", borderRadius: "8px" }}
          >
            Войти
          </Link>
        </div>
      )}
    </header>
  );
}