import { useEffect, useState } from "react";
import { getRegions, type RegionDto } from "../api/regions";

interface UseRegionsResult {
  data: RegionDto[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRegions(): UseRegionsResult {
  const [data, setData] = useState<RegionDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRegions();
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load regions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

