import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { TOKEN_KEY } from "../api/client";
import { FRONTEND_ONLY } from "../config/frontendMode";

export default function Register() {
  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [agreed, setAgreed]       = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  const navigate = useNavigate();

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
    if (!name || !phone || !password || !confirm) {
      setError("Заполните все поля");
      return;
    }
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    if (!agreed) {
      setError("Примите условия использования");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (FRONTEND_ONLY) {
        localStorage.setItem(TOKEN_KEY, "mock.frontend.token");
        navigate("/");
        return;
      }

      const res = await fetch("/api/v1/auth/user-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phone.replace(/\D/g, ""), password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail = data?.detail;
        setError(Array.isArray(detail) ? detail[0]?.msg : detail ?? "Ошибка регистрации");
        return;
      }

      const { access_token } = await res.json();
      localStorage.setItem(TOKEN_KEY, access_token);
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
            Регистрация
          </h1>
          <p className="text-gray-500 mb-6" style={{ fontSize: "14px" }}>
            Создайте аккаунт для участия в опросах
          </p>

          <div className="flex flex-col" style={{ gap: "16px" }}>
            {/* Name */}
            <div className="flex flex-col" style={{ gap: "6px" }}>
              <label className="text-sm font-medium text-gray-700">Имя</label>
              <input
                type="text"
                placeholder="Введите имя"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null); }}
                className="w-full text-sm text-gray-800 outline-none"
                style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px" }}
              />
            </div>

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
              <label className="text-sm font-medium text-gray-700">Пароль</label>
              <input
                type="password"
                placeholder="Ввести пароль"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                className="w-full text-sm text-gray-800 outline-none"
                style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px" }}
              />
            </div>

            {/* Confirm */}
            <div className="flex flex-col" style={{ gap: "6px" }}>
              <label className="text-sm font-medium text-gray-700">Повторите пароль</label>
              <input
                type="password"
                placeholder="Ввести пароль"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(null); }}
                className="w-full text-sm text-gray-800 outline-none"
                style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px" }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {/* Agree */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5"
                style={{ accentColor: "#0A1628", width: "16px", height: "16px", flexShrink: 0 }}
              />
              <span className="text-sm text-gray-600">
                Я соглашаюсь с{" "}
                <a href="#" className="underline text-gray-800">
                  Правилами &amp; Политикой конфиденциальности
                </a>
              </span>
            </label>

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
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
              <span className="text-xs text-gray-400">или</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
            </div>

            {/* Social */}
            <div className="flex gap-3">
              <button
                className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-gray-700"
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Продолжить через Google
              </button>
              <button
                className="flex-1 text-sm font-medium text-gray-700"
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/login")}
              >
                Войти как Администратор
              </button>
            </div>

            <p className="text-sm text-center text-gray-500">
              Уже есть аккаунт?{" "}
              <Link to="/user-login" className="font-medium underline text-gray-800">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
