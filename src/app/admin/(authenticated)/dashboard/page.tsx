
export const dynamic = 'force-dynamic';

import { getStats } from "@/lib/actions";
import {
  Search,
  CheckCircle,
  Clock,
  Zap,
  Database
} from "lucide-react";
import DashboardCharts from "@/components/admin/DashboardCharts";

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-2 text-lg">Real-time system performance and analytics</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/admin/database"
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <Database className="w-4 h-4" />
            View Database
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 bg-blue-50 rounded-2xl">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Queries</p>
          <p className="text-4xl font-black text-slate-900 mt-1">{stats.totalQueries}</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 bg-emerald-50 rounded-2xl">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Stable</span>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Success Rate</p>
          <p className="text-4xl font-black text-slate-900 mt-1">{stats.successRate}%</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 bg-amber-50 rounded-2xl">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <div className="flex items-center gap-1 text-amber-600">
              <Zap className="w-4 h-4 fill-current" />
              <span className="text-xs font-bold">Fast</span>
            </div>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Avg Latency</p>
          <p className="text-4xl font-black text-slate-900 mt-1">{stats.avgResponseTime}<span className="text-lg ml-1">ms</span></p>
        </div>
      </div>

      <DashboardCharts dailyQueries={stats.dailyQueries} />
    </div>
  );
}
