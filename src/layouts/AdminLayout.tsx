import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.svg";

const OverviewIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const AnalyticsIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const ReportsIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const LogoutIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const navItems = [
  { label: "Обзор",      href: "/admin",           icon: <OverviewIcon /> },
  { label: "Аналитика",  href: "/admin/analytics",  icon: <AnalyticsIcon /> },
  { label: "Отчёты и AI", href: "/admin/reports",   icon: <ReportsIcon /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f9fafb" }}>
      {/* Sidebar */}
      <aside className="flex flex-col flex-shrink-0 h-screen sticky top-0"
        style={{ width: "200px", backgroundColor: "#0A1628" }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <img src={logo} alt="Герб РК" className="w-8 h-8 flex-shrink-0" />
          <div>
            <div className="text-white font-semibold text-xs leading-tight">nps.gov</div>
            <div className="text-xs leading-tight" style={{ color: "#8899bb", fontSize: "10px" }}>Нац. система опросов</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-2 py-4 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={{
                  color: isActive ? "white" : "#8899bb",
                  backgroundColor: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                  fontWeight: isActive ? 500 : 400,
                }}>
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <Link to="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors"
            style={{ color: "#8899bb" }}>
            <LogoutIcon /> Выйти
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
