import { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import { TOKEN_KEY } from "../api/client";
import { FRONTEND_ONLY } from "../config/frontendMode";

// ─── Types ────────────────────────────────────────────────
type SurveyStatus = "draft" | "active" | "completed";

type Survey = {
  id: number;
  title: string;
  description: string | null;
  status: SurveyStatus;
  region_id: number | null;
  created_by: number;
  created_at: string;
  end_date: string | null;
  total_responses: number;
};

type User = {
  id: number;
  full_name: string;
  email: string;
  role: string;
  region_id: number | null;
  created_at: string;
  is_active: boolean;
};

type Tab = "surveys" | "users";

// ─── Helpers ─────────────────────────────────────────────
function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU");
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const BASE = "/api/v1/admin";

const STATUS_LABEL: Record<SurveyStatus, string> = {
  draft:     "Черновик",
  active:    "Активный",
  completed: "Завершён",
};

const STATUS_NEXT: Record<SurveyStatus, SurveyStatus | null> = {
  draft:     "active",
  active:    "completed",
  completed: null,
};

// ─── New Survey Form State ────────────────────────────────
type NewSurvey = {
  title: string;
  description: string;
  end_date: string;
  region_id: string;
};

const EMPTY_FORM: NewSurvey = { title: "", description: "", end_date: "", region_id: "" };

// ─── Badge ────────────────────────────────────────────────
function Badge({ status }: { status: SurveyStatus }) {
  const colors: Record<SurveyStatus, string> = {
    draft:     "background:#F3F4F6;color:#374151",
    active:    "background:#D1FAE5;color:#065F46",
    completed: "background:#E0E7FF;color:#3730A3",
  };
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-medium"
      style={Object.fromEntries(colors[status].split(";").map((s) => s.split(":")))}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

// ─── Surveys Tab ──────────────────────────────────────────
function SurveysTab() {
  const [surveys, setSurveys]       = useState<Survey[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [form, setForm]             = useState<NewSurvey>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState<string | null>(null);
  const [showForm, setShowForm]     = useState(false);

  const mockSurveys: Survey[] = [
    { id: 1, title: "Удовлетворенность системой образования", description: "Демо-данные", status: "active", region_id: 2, created_by: 1, created_at: "2026-03-20T10:00:00Z", end_date: null, total_responses: 1267 },
    { id: 2, title: "Качество госуслуг в регионах", description: "Демо-данные", status: "draft", region_id: null, created_by: 1, created_at: "2026-03-21T10:00:00Z", end_date: null, total_responses: 0 },
    { id: 3, title: "Общественный транспорт", description: "Демо-данные", status: "completed", region_id: 1, created_by: 1, created_at: "2026-03-22T10:00:00Z", end_date: null, total_responses: 776 },
  ];

  const loadSurveys = useCallback(() => {
    if (FRONTEND_ONLY) {
      setSurveys(mockSurveys);
      setError(null);
      setLoading(false);
      return;
    }
    // Avoid calling setState synchronously within effect callback chain.
    // eslint/react-hooks rule: set-state-in-effect
    queueMicrotask(() => setLoading(true));
    fetch(`${BASE}/surveys`, { headers: authHeaders() })
      .then((r) => {
        if (r.status === 403) throw new Error("Нет доступа (403)");
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Survey[]) => { setSurveys(data); setError(null); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadSurveys(); }, [loadSurveys]);

  async function handleDelete(id: number) {
    if (FRONTEND_ONLY) {
      setSurveys((prev) => prev.filter((s) => s.id !== id));
      return;
    }
    if (!confirm("Удалить опрос?")) return;
    const r = await fetch(`${BASE}/surveys/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (r.ok) setSurveys((prev) => prev.filter((s) => s.id !== id));
    else alert("Ошибка при удалении");
  }

  async function handleStatusChange(survey: Survey) {
    if (FRONTEND_ONLY) {
      const next = STATUS_NEXT[survey.status];
      if (!next) return;
      setSurveys((prev) => prev.map((s) => (s.id === survey.id ? { ...s, status: next } : s)));
      return;
    }
    const next = STATUS_NEXT[survey.status];
    if (!next) return;
    const r = await fetch(`${BASE}/surveys/${survey.id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status: next }),
    });
    if (r.ok) {
      setSurveys((prev) =>
        prev.map((s) => (s.id === survey.id ? { ...s, status: next } : s))
      );
    } else {
      alert("Ошибка при изменении статуса");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    if (FRONTEND_ONLY) {
      setForm(EMPTY_FORM);
      setShowForm(false);
      setFormError(null);
      setSubmitting(false);
      return;
    }
    e.preventDefault();
    if (!form.title.trim()) { setFormError("Заголовок обязателен"); return; }
    setSubmitting(true);
    setFormError(null);
    const body = {
      title:       form.title.trim(),
      description: form.description.trim() || null,
      end_date:    form.end_date || null,
      region_id:   form.region_id ? Number(form.region_id) : null,
    };
    const r = await fetch(`${BASE}/surveys`, {
      method:  "POST",
      headers: authHeaders(),
      body:    JSON.stringify(body),
    });
    if (r.ok) {
      setForm(EMPTY_FORM);
      setShowForm(false);
      loadSurveys();
    } else {
      const data = await r.json().catch(() => ({}));
      setFormError(data?.detail ?? "Ошибка при создании");
    }
    setSubmitting(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Опросы</h2>
        <button
          onClick={() => { setShowForm((v) => !v); setFormError(null); }}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          {showForm ? "Отмена" : "+ Создать опрос"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 border border-gray-200 rounded p-4 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Заголовок *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Срок окончания</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Описание</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">ID региона</label>
              <input
                type="number"
                value={form.region_id}
                onChange={(e) => setForm((f) => ({ ...f, region_id: e.target.value }))}
                placeholder="пусто = вся РК"
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>
          {formError && <p className="text-xs text-red-600 mb-2">{formError}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-1.5 text-sm bg-gray-900 text-white rounded disabled:opacity-50"
          >
            {submitting ? "Сохранение..." : "Сохранить"}
          </button>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-sm text-gray-500">Загрузка...</p>
      ) : error ? (
        <p className="text-sm text-red-600">Ошибка: {error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-2 pr-4 font-medium text-gray-600 w-10">ID</th>
                <th className="py-2 pr-4 font-medium text-gray-600">Заголовок</th>
                <th className="py-2 pr-4 font-medium text-gray-600">Статус</th>
                <th className="py-2 pr-4 font-medium text-gray-600">Регион</th>
                <th className="py-2 pr-4 font-medium text-gray-600">Ответов</th>
                <th className="py-2 pr-4 font-medium text-gray-600">Срок</th>
                <th className="py-2 font-medium text-gray-600">Действия</th>
              </tr>
            </thead>
            <tbody>
              {surveys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-gray-400">Нет опросов</td>
                </tr>
              ) : (
                surveys.map((s) => (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 pr-4 text-gray-400">{s.id}</td>
                    <td className="py-2 pr-4 max-w-xs">
                      <span className="line-clamp-1">{s.title}</span>
                    </td>
                    <td className="py-2 pr-4"><Badge status={s.status} /></td>
                    <td className="py-2 pr-4 text-gray-500">{s.region_id ?? "Вся РК"}</td>
                    <td className="py-2 pr-4 text-gray-500">{s.total_responses.toLocaleString("ru-RU")}</td>
                    <td className="py-2 pr-4 text-gray-500">{fmtDate(s.end_date)}</td>
                    <td className="py-2 flex items-center gap-2">
                      {STATUS_NEXT[s.status] && (
                        <button
                          onClick={() => handleStatusChange(s)}
                          className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                        >
                          → {STATUS_LABEL[STATUS_NEXT[s.status]!]}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const mockUsers: User[] = [
    { id: 1, full_name: "Demo Admin Gov", email: "admin@example.com", role: "government", region_id: 2, created_at: "2026-03-21T10:00:00Z", is_active: true },
    { id: 2, full_name: "Demo Citizen", email: "citizen@example.com", role: "citizen", region_id: 1, created_at: "2026-03-21T10:00:00Z", is_active: true },
  ];

  useEffect(() => {
    if (FRONTEND_ONLY) {
      setUsers(mockUsers);
      setError(null);
      setLoading(false);
      return;
    }

    fetch(`${BASE}/users`, { headers: authHeaders() })
      .then((r) => {
        if (r.status === 403) throw new Error("Нет доступа (403)");
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: User[]) => { setUsers(data); setError(null); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleToggleActive(user: User) {
    if (FRONTEND_ONLY) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u)));
      return;
    }
    const r = await fetch(`${BASE}/users/${user.id}/active`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ is_active: !user.is_active }),
    });
    if (r.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      );
    } else {
      alert("Ошибка при изменении статуса пользователя");
    }
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-4">Пользователи</h2>
      {loading ? (
        <p className="text-sm text-gray-500">Загрузка...</p>
      ) : error ? (
        <p className="text-sm text-red-600">Ошибка: {error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-2 pr-4 font-medium text-gray-600 w-10">ID</th>
                <th className="py-2 pr-4 font-medium text-gray-600">Имя</th>
                <th className="py-2 pr-4 font-medium text-gray-600">Email</th>
                <th className="py-2 pr-4 font-medium text-gray-600">Роль</th>
                <th className="py-2 pr-4 font-medium text-gray-600">Регион</th>
                <th className="py-2 pr-4 font-medium text-gray-600">Дата регистрации</th>
                <th className="py-2 font-medium text-gray-600">Статус</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-gray-400">Нет пользователей</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 pr-4 text-gray-400">{u.id}</td>
                    <td className="py-2 pr-4">{u.full_name}</td>
                    <td className="py-2 pr-4 text-gray-500">{u.email}</td>
                    <td className="py-2 pr-4 text-gray-500">{u.role}</td>
                    <td className="py-2 pr-4 text-gray-500">{u.region_id ?? "—"}</td>
                    <td className="py-2 pr-4 text-gray-500">{fmtDate(u.created_at)}</td>
                    <td className="py-2">
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`text-xs px-2 py-0.5 rounded border ${
                          u.is_active
                            ? "border-green-300 text-green-700 hover:bg-green-50"
                            : "border-red-300 text-red-600 hover:bg-red-50"
                        }`}
                      >
                        {u.is_active ? "Активен" : "Заблокирован"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("surveys");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header activeNav="/admin" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-10">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Панель администратора</h1>
        <p className="text-sm text-gray-500 mb-6">Управление опросами и пользователями</p>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 mb-6">
          {(["surveys", "users"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "surveys" ? "Опросы" : "Пользователи"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {tab === "surveys" ? <SurveysTab /> : <UsersTab />}
        </div>
      </main>

    </div>
  );
}
