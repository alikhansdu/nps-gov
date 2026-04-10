import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import { TOKEN_KEY } from "../api/client";
import { FRONTEND_ONLY } from "../config/frontendMode";
import { getMockSurveys } from "../mocks/surveyStore";

type DraftSurvey = {
  id: number;
  title: string;
  category: string | null;
  updated_at: string | null;
};

const PlusIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const SearchIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const EditIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;

const CATEGORY_MAP: Record<number, string> = {
  1: "Инфраструктура",
  2: "Цифровизация",
  3: "Экология",
  4: "Экономика",
  5: "Здравоохранение",
  6: "Образование",
  7: "Социальная политика",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) +
    ", " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminDrafts() {
  const navigate = useNavigate();
  const [drafts, setDrafts]   = useState<DraftSurvey[]>([]);
  const [search, setSearch]   = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  const token = localStorage.getItem(TOKEN_KEY);
  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    if (FRONTEND_ONLY) {
      const mock = getMockSurveys()
        .filter((s) => s.status === "draft")
        .map((s, i) => ({
          id: s.id,
          title: s.title,
          category: CATEGORY_MAP[(i % 7) + 1] ?? null,
          updated_at: s.end_date ?? new Date().toISOString(),
        }));
      setDrafts(mock);
      return;
    }

    fetch("/api/v1/surveys?status_filter=draft", { headers: authHeader })
      .then((r) => r.ok ? r.json() : [])
      .then((data: { id: number; title: string; end_date: string | null; created_at: string }[]) => {
        setDrafts(
          data.map((s, i) => ({
            id: s.id,
            title: s.title,
            category: CATEGORY_MAP[(i % 7) + 1] ?? null,
            updated_at: s.end_date ?? s.created_at,
          }))
        );
      })
      .catch(() => setDrafts([]));
  }, [authHeader]);

  const filtered = drafts.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить черновик?")) return;
    setDeleting(id);
    try {
      if (!FRONTEND_ONLY) {
        await fetch(`/api/v1/surveys/${id}`, {
          method: "DELETE",
          headers: authHeader,
        });
      }
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: "40px 32px 40px 48px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Черновики</h1>
          <button
            onClick={() => navigate("/admin/create")}
            className="flex items-center gap-2 text-sm font-semibold text-white"
            style={{
              backgroundColor: "#0A1628",
              borderRadius: "10px",
              padding: "10px 18px",
              cursor: "pointer",
              border: "none",
            }}
          >
            <PlusIcon /> Создать новый опрос
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm text-gray-700 outline-none"
            style={{
              border: "1px solid #E4E4E7",
              borderRadius: "10px",
              padding: "10px 14px 10px 38px",
              backgroundColor: "white",
            }}
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E4E4E7] rounded-xl overflow-hidden">
          {/* Table header */}
          <div
            className="grid text-xs font-medium text-gray-400 border-b border-gray-100"
            style={{ gridTemplateColumns: "1fr 180px 220px 80px", padding: "12px 20px" }}
          >
            <span>Название опроса</span>
            <span>Категория</span>
            <span>Дата изменения</span>
            <span />
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400">Нет черновиков</p>
          ) : (
            filtered.map((d) => (
              <div
                key={d.id}
                className="grid items-center border-b border-gray-100 hover:bg-gray-50 transition-colors"
                style={{ gridTemplateColumns: "1fr 180px 220px 80px", padding: "14px 20px" }}
              >
                <span className="text-sm text-gray-800 pr-4 truncate">{d.title}</span>
                <span className="text-sm text-gray-500">{d.category ?? "—"}</span>
                <span className="text-sm text-gray-500">{formatDate(d.updated_at)}</span>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => navigate(`/admin/create?edit=${d.id}`)}
                    className="text-gray-400 hover:text-gray-700 transition-colors"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    title="Редактировать"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    disabled={deleting === d.id}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    title="Удалить"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Footer */}
          <div
            className="flex items-center justify-between text-xs text-gray-400"
            style={{ padding: "12px 20px" }}
          >
            <span>Показано {filtered.length} из {drafts.length} черновиков...</span>
            <span>{filtered.length}</span>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
