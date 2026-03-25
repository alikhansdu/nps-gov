import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!menuOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header
      className="w-full"
      style={{ backgroundColor: "#0A1628", minHeight: "114px" }}
    >
      {/* Top bar */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b px-6 md:px-20"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
        }}
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
        className="flex items-center justify-between py-5 px-6 md:px-20"
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
            className="hidden sm:flex items-center"
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
            className="sm:hidden p-1 rounded-lg"
            style={{ color: "white" }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden fixed inset-0 z-50">
          <button
            aria-label="Close menu"
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
            onClick={() => setMenuOpen(false)}
          />

          <div
            className="absolute left-0 right-0 px-6 pb-6"
            style={{
              top: "114px",
              backgroundColor: "#0A1628",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="pt-4 flex flex-col gap-3">
              {navItems.map((item) => {
                const isActive = activeNav === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="w-full px-4 py-3 text-sm rounded-lg"
                    style={{
                      backgroundColor: isActive ? "rgba(248,250,252,0.96)" : "transparent",
                      color: isActive ? "#0A1628" : "rgba(255,255,255,0.92)",
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onLangChange?.("RU")}
                    className="h-10 px-4 text-xs font-semibold rounded-lg"
                    style={{
                      backgroundColor: activeLang === "RU" ? "rgba(248,250,252,0.96)" : "transparent",
                      color: activeLang === "RU" ? "#0A1628" : "rgba(255,255,255,0.92)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    RU
                  </button>
                  <button
                    onClick={() => onLangChange?.("KZ")}
                    className="h-10 px-4 text-xs font-semibold rounded-lg"
                    style={{
                      backgroundColor: activeLang === "KZ" ? "rgba(248,250,252,0.96)" : "transparent",
                      color: activeLang === "KZ" ? "#0A1628" : "rgba(255,255,255,0.92)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    KZ
                  </button>
                </div>

                <Link
                  to="/login"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogin?.();
                  }}
                  className="w-full h-10 flex items-center justify-center text-sm font-semibold"
                  style={{
                    backgroundColor: "#EAB308",
                    color: "#FAFAFA",
                    borderRadius: "10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Войти
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}