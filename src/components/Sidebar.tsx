import { useState } from "react";
import type { ReactNode } from "react";

interface NavItem {
  label: string;
  icon: ReactNode;
  href: string;
}

interface SidebarProps {
  title?: string;
  version?: string;
  items?: NavItem[];
  activeHref?: string;
  onLogout?: () => void;
  defaultCollapsed?: boolean;
}

const GridIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const AnalyticsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const ReportIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const MonitorIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00BCD4" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);
const ChevronIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8899bb" strokeWidth="2"
    style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const defaultItems: NavItem[] = [
  { label: "Playground",  icon: <GridIcon />,      href: "/" },
  { label: "Аналитика",   icon: <AnalyticsIcon />, href: "/analytics" },
  { label: "Отчёты и AI", icon: <ReportIcon />,    href: "/reports" },
];

export default function Sidebar({
  title = "Documentation",
  version = "v1.0.1",
  items = defaultItems,
  activeHref = "/",
  onLogout,
  defaultCollapsed = false,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <aside
      className="flex flex-col justify-between h-screen flex-shrink-0 transition-all duration-300"
      style={{
        width: collapsed ? "48px" : "256px",
        backgroundColor: "#00132D",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Top */}
      <div>
        {/* Header */}
        <div
          className="flex items-center px-3 py-4 border-b cursor-pointer"
          style={{ borderColor: "rgba(255,255,255,0.08)", justifyContent: collapsed ? "center" : "space-between" }}
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(0,188,212,0.15)" }}>
              <MonitorIcon />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-white text-sm font-semibold leading-tight truncate">{title}</p>
                <p className="text-xs truncate" style={{ color: "#8899bb" }}>{version}</p>
              </div>
            )}
          </div>
          {!collapsed && <ChevronIcon collapsed={collapsed} />}
        </div>

        {/* Nav */}
        <nav className="mt-2 px-2 flex flex-col gap-0.5">
          {items.map((item) => {
            const isActive = activeHref === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className="flex items-center rounded-lg text-sm transition-colors duration-150"
                style={{
                  gap: collapsed ? "0" : "12px",
                  padding: collapsed ? "8px" : "8px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  color: isActive ? "white" : "#8899bb",
                  backgroundColor: isActive ? "rgba(0,188,212,0.12)" : "transparent",
                }}
              >
                <span style={{ color: isActive ? "#00BCD4" : "#8899bb", flexShrink: 0 }}>
                  {item.icon}
                </span>
                {!collapsed && item.label}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="px-2 pb-4">
        <div className="h-px mb-3" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
        <button
          onClick={onLogout}
          title={collapsed ? "Выйти" : undefined}
          className="flex items-center rounded-lg text-sm w-full transition-colors hover:bg-white/5"
          style={{
            gap: collapsed ? "0" : "12px",
            padding: collapsed ? "8px" : "8px 12px",
            justifyContent: collapsed ? "center" : "flex-start",
            color: "#8899bb",
          }}
        >
          <LogoutIcon />
          {!collapsed && "Выйти"}
        </button>
      </div>
    </aside>
  );
}
