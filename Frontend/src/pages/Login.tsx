import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

export default function Login() {
  const [iin, setIin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!iin || !password) {
      setError("Введите данные для входа");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ iin, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.detail ?? "Неверный ИИН или пароль");
        return;
      }

      const { access_token } = await res.json();
      localStorage.setItem("access_token", access_token);

      navigate("/admin");
    } catch {
      setError("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f3f4f6" }}>
      <Header activeNav="" />

      <main className="flex-1 flex items-center justify-center" style={{ padding: "80px 24px" }}>
        <div
          className="bg-white rounded-2xl w-full flex flex-col items-center"
          style={{
            maxWidth: "420px",
            padding: "40px 40px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            gap: "24px",
          }}
        >
          {/* Icon */}
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: "56px", height: "56px", backgroundColor: "rgba(10,22,40,0.06)" }}
          >
            <ShieldIcon />
          </div>

          {/* Title */}
          <div className="text-center flex flex-col" style={{ gap: "6px" }}>
            <h1 className="font-bold text-gray-900" style={{ fontSize: "20px" }}>
              Панель администратора
            </h1>
            <p className="text-gray-500" style={{ fontSize: "13px", lineHeight: "1.6" }}>
              Доступ только для верифицированных<br />государственных органов
            </p>
          </div>

          {/* Fields */}
          <div className="w-full flex flex-col" style={{ gap: "16px" }}>
            <div className="flex flex-col" style={{ gap: "6px" }}>
              <label className="text-sm font-medium text-gray-700">ИИН</label>
              <input
                type="text"
                placeholder="123456789012"
                value={iin}
                onChange={(e) => {
                  setIin(e.target.value);
                  setError(null);
                }}
                className="w-full text-sm text-gray-800 outline-none"
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "10px 14px",
                }}
              />
            </div>

            <div className="flex flex-col" style={{ gap: "6px" }}>
              <label className="text-sm font-medium text-gray-700">Пароль / ЭЦП</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className="w-full text-sm text-gray-800 outline-none"
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "10px 14px",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {error && (
              <p className="text-xs font-medium" style={{ color: "#dc2626" }}>
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full text-sm font-semibold text-white"
              style={{
                backgroundColor: loading ? "#6b7280" : "#0A1628",
                borderRadius: "8px",
                padding: "12px",
                marginTop: "8px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Входим..." : "Войти в систему"}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center" style={{ lineHeight: "1.6" }}>
            Для получения доступа обратитесь в службу<br />технической поддержки
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}