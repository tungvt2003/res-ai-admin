import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { DashboardApi, DashboardStats } from "../../apis/dashboardApi";

type Options = Omit<
  UseQueryOptions<DashboardStats, Error, DashboardStats, QueryKey>,
  "queryKey" | "queryFn"
>;

export function useGetDashboardStatsQuery(options?: Options) {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const response = await DashboardApi.getStats();
      return (
        response.data || {
          totalLecturers: 0,
          totalBlogs: 0,
          totalUsers: 0,
          totalCategories: 0,
        }
      );
    },
    ...options,
  });
}
