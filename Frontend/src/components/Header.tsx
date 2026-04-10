import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { useAuth } from "../context/AuthContext";

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

const PersonIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const navItems = [
  { label: "Главная",   href: "/" },
  { label: "Опросы",    href: "/surveys" },
  { label: "Аналитика", href: "/analytics" },
];

function UserDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center rounded-full transition-all duration-150"
        style={{
          width: "40px",
          height: "40px",
          backgroundColor: "rgba(255,255,255,0.10)",
          border: "2px solid rgba(255,255,255,0.18)",
          color: "#c8d8f0",
          overflow: "hidden",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#EAB308")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)")}
      >
        {user.avatar ? (
          <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <PersonIcon />
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 z-50 rounded-xl overflow-hidden"
          style={{
            minWidth: "140px",
            backgroundColor: "#0f1e36",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <button
            onClick={() => { setOpen(false); logout(); navigate("/"); }}
            className="w-full text-center px-4 py-3 text-sm font-medium transition-colors"
            style={{ color: "#f87171" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(248,113,113,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header({
  activeLang = "RU",
  onLangChange,
  onLogin,
  activeNav = "/",
}: HeaderProps) {
  const { user, logout } = useAuth(); // ← здесь берём юзера
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full" style={{ backgroundColor: "#0A1628", minHeight: "114px" }}>
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
      <div className="px-6 lg:px-20 flex items-center justify-between py-5">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Герб РК" className="w-10 h-10 flex-shrink-0" />
          <div>
            <div className="text-white font-semibold text-sm leading-tight">nps.gov</div>
            <div className="text-xs" style={{ color: "#8899bb" }}>Национальная система опросов</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = activeNav === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className="px-4 py-2 text-sm transition-all duration-150"
                style={{
                  color: "white",
                  backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                  border: isActive ? "1px solid rgba(255,255,255,0.35)" : "1px solid transparent",
                  fontWeight: isActive ? 500 : 400,
                  borderRadius: 0,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <div
            className="flex items-center"
            style={{
              width: "103px", height: "40px", borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.10)", padding: "2px", gap: "2px", boxSizing: "border-box",
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

          {/* Аватар или Войти */}
          {user ? (
            <UserDropdown />
          ) : (
            <Link
              to="/user-login"
              onClick={onLogin}
              className="hidden sm:flex items-center justify-center text-sm font-medium transition-colors duration-150"
              style={{
                width: "74px", height: "40px", backgroundColor: "#EAB308",
                color: "#FAFAFA", borderRadius: "8px", whiteSpace: "nowrap", flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ca9e06")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#EAB308")}
            >
              Войти
            </Link>
          )}

          {/* Burger */}
          <button
            className="sm:hidden rounded-xl flex items-center justify-center"
            style={{ width: "44px", height: "44px", backgroundColor: "#ffffff", color: "#EAB308", border: "1px solid rgba(255,255,255,0.12)" }}
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
                className="px-4 py-3 text-sm transition-all"
                style={{
                  color: "white",
                  backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                  border: isActive ? "1px solid rgba(255,255,255,0.35)" : "1px solid transparent",
                  fontWeight: isActive ? 500 : 400,
                  borderRadius: 0,
                }}
              >
                {item.label}
              </Link>
            );
          })}

          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="mt-2 px-4 py-3 text-sm rounded-lg"
                style={{ color: "#8899bb", backgroundColor: "rgba(255,255,255,0.04)" }}
              >
                👤 {user.name ?? "Мой профиль"}
              </Link>
              <button
                onClick={() => { setMenuOpen(false); logout(); }}
                className="mt-1 px-4 py-3 text-sm font-medium text-left rounded-lg"
                style={{ color: "#f87171", backgroundColor: "rgba(248,113,113,0.06)" }}
              >
                Выйти
              </button>
            </>
          ) : (
            <Link
              to="/user-login"
              onClick={() => { setMenuOpen(false); onLogin?.(); }}
              className="mt-2 px-4 py-3 text-sm font-medium text-center"
              style={{ backgroundColor: "#EAB308", color: "#FAFAFA", borderRadius: "8px" }}
            >
              Войти
            </Link>
          )}
        </div>
      )}
    </header>
  );
}