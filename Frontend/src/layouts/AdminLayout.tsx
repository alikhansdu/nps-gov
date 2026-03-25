import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.svg";

const OverviewIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const AnalyticsIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const ReportsIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const LogoutIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const navItems = [
  { label: "Обзор",       href: "/admin",          icon: <OverviewIcon /> },
  { label: "Аналитика",   href: "/admin/analytics", icon: <AnalyticsIcon /> },
  { label: "Отчёты и AI", href: "/admin/reports",   icon: <ReportsIcon /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0A1628" }}>

      {/* Sidebar — 256px */}
      <aside
        style={{
          width: "256px",
          backgroundColor: "#0A1628",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          height: "100vh",
          position: "sticky",
          top: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <img
            src={logo}
            alt="Герб РК"
            style={{ width: "40px", height: "40px", flexShrink: 0, objectFit: "contain" }}
          />
          <div style={{ overflow: "hidden" }}>
            <div style={{ color: "#ffffff", fontSize: "13px", fontWeight: 600, lineHeight: 1.3 }}>
              nps.gov
            </div>
            <div style={{ color: "#8899bb", fontSize: "11px", marginTop: "2px", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Национальная система опросов
            </div>
          </div>
        </div>

        {/* Nav — 240px wide, 32px height per item */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, padding: "12px 8px" }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "0 12px",
                  height: "32px",
                  borderRadius: "8px",
                  color: isActive ? "#0A1628" : "#6b7fa8",
                  backgroundColor: isActive ? "#ffffff" : "transparent",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "14px",
                  textDecoration: "none",
                  transition: "background-color 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout — красный */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "8px 8px 16px" }}>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "0 12px",
              height: "32px",
              borderRadius: "8px",
              color: "#ef4444",
              fontSize: "14px",
              textDecoration: "none",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <LogoutIcon /> Выйти
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto" style={{ padding: "16px 16px 16px 0" }}>
        <div
          style={{
            backgroundColor: "#F8FAFC",
            borderTop: "1px solid #E4E4E7",
            borderRight: "1px solid #E4E4E7",
            borderBottom: "1px solid #E4E4E7",
            borderLeft: "none",
            borderRadius: "0 16px 16px 0",
            minHeight: "100%",
          }}
        >
          {children}
        </div>
      </main>

    </div>
  );
}