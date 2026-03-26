import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { TOKEN_KEY } from "../api/client";
import { FRONTEND_ONLY } from "../config/frontendMode";
import { useAuth } from "../context/AuthContext";

export default function UserLogin() {
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (!digits) return "";
    let result = "+7";
    if (digits.length > 1) result += " " + digits.slice(1, 4);
    if (digits.length > 4) result += " " + digits.slice(4, 7);
    if (digits.length > 7) result += " " + digits.slice(7, 9);
    if (digits.length > 9) result += " " + digits.slice(9, 11);
    return result;
  };

  const handleSubmit = async () => {
    if (!phone || !password) {
      setError("Введите данные для входа");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (FRONTEND_ONLY) {
        localStorage.setItem(TOKEN_KEY, "mock.frontend.token");
        login({ name: "Пользователь" });
        navigate("/");
        return;
      }

      const res = await fetch("/api/v1/auth/user-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\D/g, ""), password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail = data?.detail;
        setError(Array.isArray(detail) ? detail[0]?.msg : detail ?? "Неверный пароль. Попробуйте еще раз");
        return;
      }

      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.access_token);
      login({ name: data.full_name ?? data.username ?? phone });
      navigate("/");
    } catch {
      setError("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f3f4f6" }}>
      <Header activeNav="" />

      <main className="flex-1 flex items-center justify-center" style={{ padding: "60px 24px" }}>
        <div
          className="bg-white rounded-2xl w-full"
          style={{
            maxWidth: "735px",
            padding: "40px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          <h1 className="font-bold text-gray-900 mb-1" style={{ fontSize: "24px" }}>
            Вход в систему
          </h1>
          <p className="text-gray-500 mb-6" style={{ fontSize: "14px" }}>
            Войдите, чтобы продолжить участие в опросах и просматривать аналитику
          </p>

          <div className="flex flex-col" style={{ gap: "16px" }}>
            {/* Phone */}
            <div className="flex flex-col" style={{ gap: "6px" }}>
              <label className="text-sm font-medium text-gray-700">Номер телефона</label>
              <input
                type="tel"
                placeholder="+7 ___ __ __"
                value={phone}
                onChange={(e) => { setPhone(formatPhone(e.target.value)); setError(null); }}
                className="w-full text-sm text-gray-800 outline-none"
                style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px" }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col" style={{ gap: "6px" }}>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Пароль</label>
                <a href="#" className="text-sm text-gray-400 hover:text-gray-600">
                  Забыли пароль?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Ввести пароль"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  className="w-full text-sm text-gray-800 outline-none"
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "10px 40px 10px 14px",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    {showPass ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>

            {error && (
              <p className="text-xs font-medium" style={{ color: "#dc2626" }}>{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full text-sm font-semibold text-white"
              style={{
                backgroundColor: loading ? "#6b7280" : "#0A1628",
                borderRadius: "8px",
                padding: "12px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Входим..." : "Войти"}
            </button>

            <p className="text-sm text-center text-gray-500">
              Еще нет аккаунта?{" "}
              <Link to="/register" className="font-medium underline text-gray-800">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}