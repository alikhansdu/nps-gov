import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { register } from "../api/auth";

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.5 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8.1 3.1l5.7-5.7C34.2 6 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 12 24 12c3.1 0 5.9 1.2 8.1 3.1l5.7-5.7C34.2 6 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.8-5.3l-6.4-5.4C29.4 34.7 26.8 36 24 36c-5.2 0-9.5-3.3-11.1-7.9l-6.6 5.1C9.5 39.7 16.3 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.2 3-3.5 5.3-6.4 6.7l.1.1 6.4 5.4C38 37.9 44 33 44 24c0-1.2-.1-2.3-.4-3.5z"/>
  </svg>
);

export default function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const canSubmit = Boolean(name && phone && password && password2 && password === password2 && agree);

  const handleRegister = async () => {
    if (!canSubmit) return;
    try {
      setLoading(true);
      setError(null);
      await register({
        iin: phone.replace(/\D/g, "").slice(0, 12).padEnd(12, "0"),
        name,
        email: null,
        password,
        role: "citizen",
      });
      navigate("/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка регистрации");
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
          style={{ maxWidth: "560px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
        >
          <div className="p-6 md:p-10 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold text-gray-900">Регистрация</h1>
              <p className="text-sm text-gray-500">Создайте аккаунт для участия в опросах</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Имя</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введите имя"
                  className="w-full px-4 py-2.5 text-sm border border-[#E4E4E7] rounded-lg outline-none focus:border-gray-400 transition-colors text-gray-800 placeholder-gray-400 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Номер телефона</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 ____"
                  className="w-full px-4 py-2.5 text-sm border border-[#E4E4E7] rounded-lg outline-none focus:border-gray-400 transition-colors text-gray-800 placeholder-gray-400 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="w-full px-4 py-2.5 text-sm border border-[#E4E4E7] rounded-lg outline-none focus:border-gray-400 transition-colors text-gray-800 placeholder-gray-400 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Повторите пароль</label>
                <input
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  placeholder="Введите пароль"
                  className="w-full px-4 py-2.5 text-sm border border-[#E4E4E7] rounded-lg outline-none focus:border-gray-400 transition-colors text-gray-800 placeholder-gray-400 bg-white"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="accent-[#0A1628]"
                />
                <span>
                  Я соглашаюсь с{" "}
                  <a href="#" className="text-gray-900 underline underline-offset-2">
                    Правилами
                  </a>{" "}
                  &{" "}
                  <a href="#" className="text-gray-900 underline underline-offset-2">
                    Политикой конфиденциальности
                  </a>
                </span>
              </label>
            </div>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleRegister}
              className="w-full h-11 rounded-lg text-sm font-semibold transition-colors"
              style={{
                backgroundColor: canSubmit && !loading ? "#111827" : "rgba(17,24,39,0.55)",
                color: "white",
                cursor: canSubmit && !loading ? "pointer" : "not-allowed",
              }}
            >
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex items-center gap-3">
              <div className="h-px bg-[#E4E4E7] flex-1" />
              <div className="text-xs text-gray-400">или</div>
              <div className="h-px bg-[#E4E4E7] flex-1" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full h-11 rounded-lg border border-[#E4E4E7] bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <GoogleIcon />
                Продолжить через Google
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin-login")}
                className="w-full h-11 rounded-lg border border-[#E4E4E7] bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
              >
                Войти как Администратор
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              Уже есть аккаунт?{" "}
              <Link to="/login" className="text-gray-900 font-semibold">
                Войти
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

