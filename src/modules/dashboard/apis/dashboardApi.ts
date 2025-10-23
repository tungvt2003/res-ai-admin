import api from "../../../shares/configs/axios";
import { ApiResponse } from "../../../shares/types/response";

export interface DashboardStats {
  totalLecturers: number;
  totalBlogs: number;
  totalUsers: number;
  totalCategories: number;
}

type DashboardStatsResponse = ApiResponse<DashboardStats>;

class DashboardClient {
  private client = api;

  constructor() {
    this.client = api;
  }

  // ---------------- Get Dashboard Stats ----------------
  async getStats(): Promise<DashboardStatsResponse> {
    const response = await this.client.get<DashboardStatsResponse>("/dashboard/stats");
    return response.data;
  }
}

const DashboardApi = new DashboardClient();
export { DashboardApi };
