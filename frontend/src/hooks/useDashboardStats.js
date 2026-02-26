import { useEffect, useState } from "react";
import { useApi } from "../auth/ApiProvider";
import { fetchDashboardStats } from "../services/dashboardService";

export function useDashboardStats() {
  const api = useApi();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchDashboardStats(api);
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load dashboard stats.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [api]);

  return { stats, loading, error };
}
