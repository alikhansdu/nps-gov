import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { login } from "../api/auth";
import { TOKEN_KEY } from "../api/client";

export default function UserLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const canSubmit = Boolean(phone && password);

  const handleLogin = async () => {
    if (!canSubmit) return;
    try {
      setLoading(true);
      setError(null);
      const iin = phone.replace(/\D/g, "").slice(0, 12).padEnd(12, "0");
      const res = await login({ iin, password });
      localStorage.setItem(TOKEN_KEY, res.access_token);
      navigate("/surveys");
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
          className="bg-white border border-[#E4E4E7] rounded-2xl w-full"
          style={{ maxWidth: "640px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
        >
          <div className="p-6 md:p-10 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold text-gray-900">Вход в систему</h1>
              <p className="text-sm text-gray-500">
                Войдите, чтобы продолжить участие в опросах и просматривать аналитику
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Номер телефона</label>
                <input
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError(null);
                  }}
                  placeholder="+7 ____"
                  className="w-full px-4 py-2.5 text-sm border border-[#E4E4E7] rounded-lg outline-none focus:border-gray-400 transition-colors text-gray-800 placeholder-gray-400 bg-white"
                />
              </div>

              <div className="flex items-end justify-between gap-3">
                <label className="text-xs font-semibold text-gray-700">Пароль</label>
                <a href="#" className="text-xs text-gray-500 underline underline-offset-2">
                  Забыли пароль?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Введите пароль"
                className="w-full px-4 py-2.5 text-sm border border-[#E4E4E7] rounded-lg outline-none focus:border-gray-400 transition-colors text-gray-800 placeholder-gray-400 bg-white"
              />
            </div>

            <button
              type="button"
              disabled={!canSubmit || loading}
              onClick={handleLogin}
              className="w-full h-11 rounded-lg text-sm font-semibold transition-colors"
              style={{
                backgroundColor: canSubmit && !loading ? "#111827" : "rgba(17,24,39,0.55)",
                color: "white",
                cursor: canSubmit && !loading ? "pointer" : "not-allowed",
              }}
            >
              {loading ? "Вход..." : "Войти"}
            </button>
            {error && <p className="text-xs text-red-600 text-center">{error}</p>}

            <div className="text-xs text-gray-500 text-center">
              Еще нет аккаунта?{" "}
              <Link to="/register" className="text-gray-900 font-semibold underline underline-offset-2">
                Зарегистрироваться
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

