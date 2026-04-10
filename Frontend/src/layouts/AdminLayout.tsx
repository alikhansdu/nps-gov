import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logo.svg";
import Footer from "../components/Footer";
import { TOKEN_KEY } from "../api/client";
import { FRONTEND_ONLY } from "../config/frontendMode";

const OverviewIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const AnalyticsIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const ReportsIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const DraftsIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>;
const LogoutIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const MenuIcon      = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>;
const XIcon         = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const navItems = [
  { label: "Обзор",       href: "/admin",           icon: <OverviewIcon /> },
  { label: "Аналитика",   href: "/admin/analytics", icon: <AnalyticsIcon /> },
  { label: "Отчёты и AI", href: "/admin/reports",   icon: <ReportsIcon /> },
  { label: "Черновики",   href: "/admin/drafts",    icon: <DraftsIcon /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem(TOKEN_KEY) ?? localStorage.getItem("access_token");

  useEffect(() => {
    if (!token && FRONTEND_ONLY) {
      localStorage.setItem(TOKEN_KEY, "mock.frontend.token");
      return;
    }
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  };

  if (!token && !FRONTEND_ONLY) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: "#0A1628" }}>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30" style={{ backgroundColor: "#0A1628" }}>

        {/* Logo row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: menuOpen ? "none" : "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <img src={logo} alt="Герб РК" style={{ width: "34px", height: "34px", flexShrink: 0, objectFit: "contain" }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ color: "#ffffff", fontSize: "13px", fontWeight: 600, lineHeight: 1.2 }}>nps.gov</div>
              <div style={{ color: "#8899bb", fontSize: "11px", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Национальная система опросов
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            style={{
              width: "40px", height: "40px", borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#FACC15", background: "transparent", flexShrink: 0,
            }}
          >
            {menuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Dropdown меню */}
        {menuOpen && (
          <div style={{
            backgroundColor: "#0A1628",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            paddingBottom: "16px",
          }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "13px 20px",
                    fontSize: "15px",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.72)",
                    backgroundColor: isActive ? "rgba(248,250,252,0.08)" : "transparent",
                    textDecoration: "none",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}

            <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.08)", margin: "8px 0" }} />

            <button
              onClick={handleLogout}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "13px 20px", fontSize: "15px",
                color: "#ef4444", background: "transparent",
                border: "none", cursor: "pointer",
              }}
            >
              Выйти
            </button>

            {/* RU / KZ */}
            <div style={{ display: "flex", gap: "8px", padding: "8px 20px 0" }}>
              {(["RU", "KZ"] as const).map((lang) => (
                <button
                  key={lang}
                  style={{
                    padding: "6px 18px", borderRadius: "8px",
                    fontSize: "13px", fontWeight: 600, cursor: "pointer",
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: lang === "RU" ? "#ffffff" : "transparent",
                    color: lang === "RU" ? "#0A1628" : "rgba(255,255,255,0.7)",
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs — только когда меню закрыто */}
        {!menuOpen && (
          <div style={{ padding: "10px 16px 12px" }}>
            <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "8px",
                      padding: "8px 12px", borderRadius: "10px",
                      color: isActive ? "#0A1628" : "rgba(255,255,255,0.72)",
                      backgroundColor: isActive ? "#ffffff" : "rgba(255,255,255,0.06)",
                      fontWeight: isActive ? 600 : 500, fontSize: "13px",
                      whiteSpace: "nowrap", textDecoration: "none",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-20"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar — md+ */}
      <aside
        className="hidden md:flex"
        style={{
          width: "256px", backgroundColor: "#0A1628",
          flexDirection: "column", flexShrink: 0,
          height: "100vh", position: "sticky", top: 0,
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <img src={logo} alt="Герб РК" style={{ width: "40px", height: "40px", flexShrink: 0, objectFit: "contain" }} />
          <div style={{ overflow: "hidden" }}>
            <div style={{ color: "#ffffff", fontSize: "13px", fontWeight: 600, lineHeight: 1.3 }}>nps.gov</div>
            <div style={{ color: "#8899bb", fontSize: "11px", marginTop: "2px", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Национальная система опросов
            </div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, padding: "12px 8px" }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "0 12px", height: "32px", borderRadius: "8px",
                  color: isActive ? "#0A1628" : "#6b7fa8",
                  backgroundColor: isActive ? "#ffffff" : "transparent",
                  fontWeight: isActive ? 600 : 400, fontSize: "14px",
                  textDecoration: "none", transition: "background-color 0.15s", whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "8px 8px 16px" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "0 12px", height: "32px", borderRadius: "8px",
              color: "#ef4444", fontSize: "14px",
              background: "transparent", border: "none", cursor: "pointer",
              width: "100%", transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <LogoutIcon /> Выйти
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto md:p-4 pb-20">
        <div className="bg-[#F8FAFC] md:border md:border-[#E4E4E7] md:rounded-2xl mb-4" style={{ paddingBottom: "80px" }}>
          {children}
        </div>
        <Footer />
      </main>

    </div>
  );
}