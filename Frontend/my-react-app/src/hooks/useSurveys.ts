import { useEffect, useState } from "react";
import { getSurveys, type GetSurveysFilters, type SurveyDto } from "../api/surveys";

interface UseSurveysResult {
  data: SurveyDto[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSurveys(filters?: GetSurveysFilters): UseSurveysResult {
  const [data, setData] = useState<SurveyDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSurveys(filters);
      setData(res);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load surveys";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.status_filter, filters?.region_id]);

  return { data, loading, error, refetch: fetchData };
}

