import { useEffect, useState } from "react";
import type { Survey } from "../types";

export function useSurveys() {
  const [allSurveys, setAllSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const res = await fetch("/api/v1/surveys");
        if (!res.ok) throw new Error("Ошибка загрузки опросов");
        const data = await res.json();
        setAllSurveys(data);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Ошибка загрузки опросов";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  const getAll = () => allSurveys;

  const getById = (id: number) => allSurveys.find((s) => s.id === id);

  const filter = ({ status = "all", category, search }: { status?: string; category?: string; search?: string }) => {
    return allSurveys.filter((s) => {
      const matchStatus = status === "all" || s.status === status;
      const matchCategory = !category || category === "Все" || s.category === category;
      const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase().trim());
      return matchStatus && matchCategory && matchSearch;
    });
  };

  return { getAll, getById, filter, loading, error };
}