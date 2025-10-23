import React from "react";
import { useGetDashboardStatsQuery } from "../../modules/dashboard/hooks/queries/use-get-dashboard-stats.query";
import { Users, BookOpen, UserCheck, FolderOpen } from "lucide-react";

export default function DashboardAnalytics() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery();

  return (
    <div className="min-h-screen">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Báo cáo tổng quan</h1>
          <p className="text-sm text-slate-500">Thống kê tổng quan về hệ thống</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
          {/* Card 1: Số lượng giảng viên */}
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Số lượng giảng viên</div>
                <div className="mt-2 text-2xl font-bold text-slate-800">
                  {statsLoading ? "..." : stats?.totalLecturers || 0}
                </div>
                <div className="text-xs text-blue-600 mt-1">Giảng viên trong hệ thống</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Card 2: Số lượng bài blog */}
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Số lượng bài blog</div>
                <div className="mt-2 text-2xl font-bold text-slate-800">
                  {statsLoading ? "..." : stats?.totalBlogs || 0}
                </div>
                <div className="text-xs text-green-600 mt-1">Bài viết đã xuất bản</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Card 3: Số lượng user đăng ký */}
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Số lượng user</div>
                <div className="mt-2 text-2xl font-bold text-slate-800">
                  {statsLoading ? "..." : stats?.totalUsers || 0}
                </div>
                <div className="text-xs text-purple-600 mt-1">Người dùng đã đăng ký</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Card 4: Số danh mục bài viết */}
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Số danh mục</div>
                <div className="mt-2 text-2xl font-bold text-slate-800">
                  {statsLoading ? "..." : stats?.totalCategories || 0}
                </div>
                <div className="text-xs text-orange-600 mt-1">Danh mục bài viết</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <FolderOpen className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
