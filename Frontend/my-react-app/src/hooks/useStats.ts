import { useEffect, useState } from "react";
import { getOverview, type StatsOverview } from "../api/stats";

interface UseStatsResult {
  data: StatsOverview | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStats(): UseStatsResult {
  const [data, setData] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOverview();
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

