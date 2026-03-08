import logo from "../assets/logo.svg";

const ShieldIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
  
  const PhoneIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.64 3.38 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.72 16z" />
    </svg>
  );
  
  const MailIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
  
  const GlobeIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
  
  const Logo = () => (
    <div className="flex items-center gap-3">
      <img
      src={logo}
      alt="Герб Республики Казахстан"
      className="w-10 h-10 flex-shrink-0"
    />
      <div>
        <div className="text-white font-semibold text-sm leading-tight">nps.gov</div>
        <div className="text-xs leading-tight" style={{ color: "#8899bb" }}>
          Национальная система опросов
        </div>
      </div>
    </div>
  );
  
  export default function Footer() {
    const navLinks = [
      { label: "Главная", to: "/" },
      { label: "Активные опросы", to: "/surveys" },
      { label: "Аналитика", to: "/analytics" },
    ];
  
    const contacts = [
      { icon: <PhoneIcon />, label: "1414", href: "tel:1414" },
      { icon: <MailIcon />, label: "info@nps.gov.kz", href: "mailto:info@nps.gov.kz" },
      { icon: <GlobeIcon />, label: "nps.gov.kz", href: "https://nps.gov.kz" },
    ];
  
    return (
      <footer style={{ backgroundColor: "#0A1628" }} className="w-full">
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
  
          {/* Main content */}
          <div className="flex flex-col md:flex-row md:justify-between gap-8 mb-8">
  
            {/* Left: Logo + description */}
            <div className="flex flex-col gap-4 md:max-w-xs">
              <Logo />
              <p className="text-sm leading-relaxed" style={{ color: "#8899bb" }}>
                Официальная платформа Республики Казахстан<br className="hidden md:block" />
                для сбора общественного мнения граждан.
              </p>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs w-fit"
                style={{ backgroundColor: "rgba(0,188,212,0.1)", color: "#00BCD4", border: "1px solid rgba(0,188,212,0.2)" }}
              >
                <ShieldIcon />
                <span>Сертифицировано НЦТ РК</span>
              </div>
            </div>
  
            {/* Right: Nav + Contacts */}
            <div className="flex flex-col sm:flex-row gap-10">
              {/* Navigation */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-4">Навигация</h3>
                <ul className="flex flex-col gap-3">
                  {navLinks.map((link) => (
                    <li key={link.to}>
                      <a
                        href={link.to}
                        className="text-sm transition-colors duration-200 hover:text-cyan-400"
                        style={{ color: "#8899bb" }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
  
              {/* Contacts */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-4">Контакты</h3>
                <ul className="flex flex-col gap-3">
                  {contacts.map((c) => (
                    <li key={c.label}>
                      <a
                        href={c.href}
                        className="flex items-center gap-2 text-sm transition-colors duration-200 hover:text-cyan-400"
                        style={{ color: "#8899bb" }}
                        target={c.href.startsWith("http") ? "_blank" : undefined}
                        rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      >
                        <span style={{ color: "#8899bb" }}>{c.icon}</span>
                        {c.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
  
          {/* Divider */}
          <div className="w-full h-px mb-6" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
  
          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <p className="text-xs leading-relaxed" style={{ color: "#8899bb" }}>
              © 2025 nps.gov — Национальная система опросов РК.{" "}
              <br className="sm:hidden" />
              Все права защищены.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
              <a
                href="/privacy"
                className="text-xs transition-colors duration-200 hover:text-cyan-400"
                style={{ color: "#8899bb" }}
              >
                Политика конфиденциальности
              </a>
              <a
                href="/terms"
                className="text-xs transition-colors duration-200 hover:text-cyan-400"
                style={{ color: "#8899bb" }}
              >
                Условия использования
              </a>
            </div>
          </div>
  
        </div>
      </footer>
    );
  }
  