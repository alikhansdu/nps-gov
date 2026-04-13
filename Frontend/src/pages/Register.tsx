import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DatePicker, { registerLocale } from "react-datepicker";
import { ru } from "date-fns/locale/ru";
import "react-datepicker/dist/react-datepicker.css";
import { useGoogleLogin } from "@react-oauth/google";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { TOKEN_KEY } from "../api/client";
import { FRONTEND_ONLY } from "../config/frontendMode";
import { useAuth } from "../context/AuthContext";

registerLocale("ru", ru);

export default function Register() {
  const [name, setName]         = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [gender, setGender]     = useState<"male" | "female" | "">("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [agreed, setAgreed]     = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleSuccess = async (tokenResponse: { access_token: string }) => {
    try {
      // Exchange Google access token for user info, then call our backend
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const userInfo = await userInfoRes.json();

      const res = await fetch("/api/v1/auth/google-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: tokenResponse.access_token, email: userInfo.email, name: userInfo.name }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.detail ?? "Ошибка входа через Google");
        return;
      }

      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.access_token);
      login({ name: userInfo.name ?? "Пользователь" });
      navigate("/");
    } catch {
      setError("Ошибка соединения с сервером");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError("Ошибка входа через Google"),
  });

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

  // Convert Date → "YYYY-MM-DD" for API
  const toApiDate = (d: Date | null): string | null => {
    if (!d) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

      const birth_date = toApiDate(birthDate);

      const res = await fetch("/api/v1/auth/user-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone.replace(/\D/g, ""),
          password,
          birth_date,
          gender: gender || null,
        }),
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

  const inputStyle = {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "10px 14px",
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f3f4f6" }}>
      <Header activeNav="" />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-14">
        <div
          className="bg-white rounded-2xl w-full"
          style={{
            maxWidth: "735px",
            padding: "clamp(20px, 5vw, 40px)",
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
                style={inputStyle}
              />
            </div>

            {/* Birth date */}
            <div className="flex flex-col" style={{ gap: "6px" }}>
              <label className="text-sm font-medium text-gray-700">Дата рождения</label>
              <DatePicker
                  locale="ru"
                  selected={birthDate}
                  onChange={(d: Date | null) => { setBirthDate(d); setError(null); }}
                  dateFormat="dd.MM.yyyy"
                  placeholderText="ДД.ММ.ГГГГ"
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  maxDate={new Date()}
                  yearDropdownItemNumber={100}
                  scrollableYearDropdown
                  className="w-full text-sm text-gray-800 outline-none"
                  wrapperClassName="w-full"
                  customInput={
                    <div className="relative w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#9ca3af" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </span>
                      <input
                        readOnly
                        placeholder="ДД.ММ.ГГГГ"
                        value={birthDate ? birthDate.toLocaleDateString("ru-RU") : ""}
                        className="w-full text-sm text-gray-800 outline-none cursor-pointer"
                        style={{ ...inputStyle, paddingLeft: "36px" }}
                      />
                    </div>
                  }
                />
            </div>

            {/* Gender */}
            <div className="flex flex-col" style={{ gap: "6px" }}>
              <label className="text-sm font-medium text-gray-700">Пол</label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {(["male", "female"] as const).map((val) => {
                  const label = val === "male" ? "Мужской" : "Женский";
                  const selected = gender === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => { setGender(val); setError(null); }}
                      className="flex-1 flex items-center gap-2 text-sm text-gray-700 transition-all"
                      style={{
                        ...inputStyle,
                        border: selected ? "1px solid #0A1628" : "1px solid #e5e7eb",
                        backgroundColor: selected ? "rgba(10,22,40,0.04)" : "white",
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                        style={{ borderColor: selected ? "#0A1628" : "#d1d5db" }}
                      >
                        {selected && (
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#0A1628" }} />
                        )}
                      </div>
                      {label}
                    </button>
                  );
                })}
              </div>
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
                style={inputStyle}
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
                style={inputStyle}
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
                style={inputStyle}
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
            <div className="flex flex-col gap-2 sm:gap-3">
              <button
                onClick={() => googleLogin()}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-700"
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
                className="w-full text-sm font-medium text-gray-700"
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
