import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { login } from "../api/auth";
import { TOKEN_KEY } from "../api/client";

const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

export default function AdminLogin() {
  const [bin, setBin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!bin || !password) {
      setError("Введите данные для входа");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = await login({ iin: bin, password });
      localStorage.setItem(TOKEN_KEY, token.access_token);
      navigate("/admin");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8FAFC" }}>
      <Header activeNav="" />

      <main className="flex-1 flex items-center justify-center px-6 py-10 md:py-20">
        <div
          className="bg-white border border-[#E4E4E7] rounded-2xl w-full flex flex-col items-center"
          style={{
            maxWidth: "420px",
            padding: "40px 40px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            gap: "24px",
          }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: "56px", height: "56px", backgroundColor: "rgba(10,22,40,0.06)" }}
          >
            <ShieldIcon />
          </div>

          <div className="text-center flex flex-col" style={{ gap: "6px" }}>
            <h1 className="font-bold text-gray-900" style={{ fontSize: "20px" }}>
              Панель администратора
            </h1>
            <p className="text-gray-500" style={{ fontSize: "13px", lineHeight: "1.6" }}>
              Доступ только для верифицированных
              <br />
              государственных органов
            </p>
          </div>

          <div className="w-full flex flex-col" style={{ gap: "16px" }}>
            <div className="flex flex-col" style={{ gap: "6px" }}>
              <label className="text-sm font-medium text-gray-700">БИН государственного органа</label>
              <input
                type="text"
                placeholder="12345678"
                value={bin}
                onChange={(e) => {
                  setBin(e.target.value);
                  setError(null);
                }}
                className="w-full text-sm text-gray-800 outline-none"
                style={{
                  border: "1px solid #E4E4E7",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#9ca3af")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E4E4E7")}
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
                  border: "1px solid #E4E4E7",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#9ca3af")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E4E4E7")}
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
                backgroundColor: loading ? "#6B7280" : "#0A1628",
                borderRadius: "8px",
                padding: "12px",
                marginTop: "8px",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#16275a")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0A1628")}
            >
              {loading ? "Вход..." : "Войти в систему"}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center" style={{ lineHeight: "1.6" }}>
            Для получения доступа обратитесь в службу
            <br />
            технической поддержки
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

