import { useMemo } from "react";
import { surveys } from "../data/surveys";
import type { Survey, SurveyStatus } from "../types";

type StatusFilter = SurveyStatus | "all";

interface FilterParams {
  status?: StatusFilter;
  category?: string;
  search?: string;
}

export function useSurveys() {
  const allSurveys = useMemo<Survey[]>(() => surveys, []);

  const getAll = () => allSurveys;

  const getById = (id: number) => allSurveys.find((s) => s.id === id);

  const filter = ({ status = "all", category, search }: FilterParams) => {
    return allSurveys.filter((s) => {
      const matchStatus = status === "all" || s.status === status;
      const matchCategory =
        !category || category === "Все" || s.category === category;
      const matchSearch =
        !search ||
        s.title.toLowerCase().includes(search.toLowerCase().trim());
      return matchStatus && matchCategory && matchSearch;
    });
  };

  return {
    getAll,
    getById,
    filter,
  };
}

