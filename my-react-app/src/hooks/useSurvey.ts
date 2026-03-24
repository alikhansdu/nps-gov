import { useEffect, useState } from "react";
import { getSurvey, type SurveyDetailDto } from "../api/surveys";

interface UseSurveyResult {
  data: SurveyDetailDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSurvey(id: number | null): UseSurveyResult {
  const [data, setData] = useState<SurveyDetailDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) {
      setLoading(false);
      setData(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await getSurvey(id);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load survey");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { data, loading, error, refetch: fetchData };
}

