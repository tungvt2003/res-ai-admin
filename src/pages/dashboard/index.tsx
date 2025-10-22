import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTranslation } from "react-i18next";

const visitorsData = [
  { date: "2025-09-01", visitors: 320 },
  { date: "2025-09-02", visitors: 450 },
  { date: "2025-09-03", visitors: 380 },
  { date: "2025-09-04", visitors: 520 },
  { date: "2025-09-05", visitors: 610 },
  { date: "2025-09-06", visitors: 700 },
  { date: "2025-09-07", visitors: 660 },
];

const revenueData = [
  { name: "Dịch vụ A", revenue: 4000 },
  { name: "Dịch vụ B", revenue: 3000 },
  { name: "Dịch vụ C", revenue: 2000 },
  { name: "Dịch vụ D", revenue: 2780 },
  { name: "Dịch vụ E", revenue: 1890 },
];

const statusData = [
  { name: "completed", value: 400 },
  { name: "processing", value: 300 },
  { name: "canceled", value: 100 },
];

const COLORS = ["#4F46E5", "#06B6D4", "#F97316"];

export default function DashboardAnalytics() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">{t("dashboard.title")}</h1>
            <p className="text-sm text-slate-500">{t("dashboard.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-3 py-2 bg-white border rounded-md shadow-sm text-sm hover:shadow">
              {t("dashboard.export")}
            </button>
            <button className="px-3 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm hover:opacity-95">
              {t("dashboard.createReport")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <div className="text-sm text-slate-500">{t("dashboard.metrics.visitors")}</div>
            <div className="mt-2 text-2xl font-bold text-slate-800">4,120</div>
            <div className="text-xs text-green-600 mt-1">
              +12.4% {t("dashboard.metrics.comparedToLastWeek")}
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <div className="text-sm text-slate-500">{t("dashboard.metrics.revenue")}</div>
            <div className="mt-2 text-2xl font-bold text-slate-800">₫186,400,000</div>
            <div className="text-xs text-red-500 mt-1">
              -3.2% {t("dashboard.metrics.comparedToLastMonth")}
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <div className="text-sm text-slate-500">{t("dashboard.metrics.orders")}</div>
            <div className="mt-2 text-2xl font-bold text-slate-800">1,240</div>
            <div className="text-xs text-green-600 mt-1">
              +8.1% {t("dashboard.metrics.comparedToLastWeek")}
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <div className="text-sm text-slate-500">{t("dashboard.metrics.completionRate")}</div>
            <div className="mt-2 text-2xl font-bold text-slate-800">78%</div>
            <div className="text-xs text-green-600 mt-1">{t("dashboard.metrics.stable")}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-medium text-slate-700">
                  {t("dashboard.charts.traffic.title")}
                </h3>
                <p className="text-xs text-slate-500">{t("dashboard.charts.traffic.subtitle")}</p>
              </div>
              <div className="text-xs text-slate-500">{t("dashboard.charts.traffic.thisWeek")}</div>
            </div>

            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <AreaChart
                  data={visitorsData}
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#4F46E5"
                    fillOpacity={1}
                    fill="url(#colorVisitors)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="text-xs text-slate-500">
                  {t("dashboard.charts.traffic.avgSession")}
                </div>
                <div className="text-lg font-semibold">00:03:25</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="text-xs text-slate-500">
                  {t("dashboard.charts.traffic.bounceRate")}
                </div>
                <div className="text-lg font-semibold">28%</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-medium text-slate-700">
                  {t("dashboard.charts.orderStatus.title")}
                </h3>
                <p className="text-xs text-slate-500">
                  {t("dashboard.charts.orderStatus.subtitle")}
                </p>
              </div>
              <div className="text-xs text-slate-500">
                {t("dashboard.charts.orderStatus.month")}
              </div>
            </div>

            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4">
              {statusData.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        background: COLORS[i % COLORS.length],
                        borderRadius: 3,
                      }}
                    />
                    <div>{t(`dashboard.charts.orderStatus.${s.name}`)}</div>
                  </div>
                  <div className="text-slate-600">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-medium text-slate-700">
                  {t("dashboard.charts.revenueByService.title")}
                </h3>
                <p className="text-xs text-slate-500">
                  {t("dashboard.charts.revenueByService.subtitle")}
                </p>
              </div>
              <div className="text-xs text-slate-500">
                {t("dashboard.charts.orderStatus.month")}
              </div>
            </div>

            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#06B6D4" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 text-sm text-slate-500">
              {t("dashboard.charts.revenueByService.hint")}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="mb-3">
              <h3 className="text-sm font-medium text-slate-700">
                {t("dashboard.charts.recentActivity.title")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("dashboard.charts.recentActivity.subtitle")}
              </p>
            </div>

            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <div>
                  <div className="font-medium">
                    {t("dashboard.activities.orderCompleted", { id: 2345 })}
                  </div>
                  <div className="text-slate-500 text-xs">{t("dashboard.time.twoHoursAgo")}</div>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2" />
                <div>
                  <div className="font-medium">
                    {t("dashboard.activities.doctorAdded", { name: "A" })}
                  </div>
                  <div className="text-slate-500 text-xs">{t("dashboard.time.yesterday")}</div>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2" />
                <div>
                  <div className="font-medium">{t("dashboard.activities.backupCompleted")}</div>
                  <div className="text-slate-500 text-xs">{t("dashboard.time.threeDaysAgo")}</div>
                </div>
              </li>
            </ul>

            <div className="mt-4 text-xs text-slate-500">
              {t("dashboard.charts.recentActivity.viewMore")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
