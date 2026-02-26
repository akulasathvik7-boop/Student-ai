/**
 * Dashboard API integration. Use with useApi() from context.
 */
export async function fetchDashboardStats(api) {
  const { data } = await api.get("/dashboard/stats");
  return data;
}
