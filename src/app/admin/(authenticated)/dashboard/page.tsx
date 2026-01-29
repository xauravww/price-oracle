
export const dynamic = 'force-dynamic';

import { getStats } from "@/lib/actions";
import {
  Search,
  CheckCircle,
  Clock,
  Zap,
  Database,
  ArrowRight
} from "lucide-react";
import DashboardCharts from "@/components/admin/DashboardCharts";

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-black pb-8">
        <div>
          <h1 className="text-5xl md:text-6xl font-doto font-black uppercase tracking-tighter leading-none mb-4">
            System<br />Status
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 animate-pulse border border-black"></div>
            <p className="font-bold text-sm uppercase tracking-widest text-gray-500">Operational</p>
          </div>
        </div>
        <div className="flex gap-4">
          <a
            href="/admin/database"
            className="flex items-center gap-2 px-6 py-3 border-2 border-black bg-black text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <Database className="w-4 h-4" />
            Manage DB
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-50 transition-colors group">
          <div className="flex items-center justify-between mb-8">
            <div className="p-3 border-2 border-black bg-white group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Search className="w-6 h-6" />
            </div>
            <span className="font-mono text-xs font-bold text-blue-600">+12% / wk</span>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Total Operations</p>
          <p className="text-5xl font-doto font-bold text-black">{stats.totalQueries}</p>
        </div>

        <div className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-50 transition-colors group">
          <div className="flex items-center justify-between mb-8">
            <div className="p-3 border-2 border-black bg-white group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="font-mono text-xs font-bold text-emerald-600">Stable</span>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Success Rate</p>
          <p className="text-5xl font-doto font-bold text-black">{stats.successRate}%</p>
        </div>

        <div className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-50 transition-colors group">
          <div className="flex items-center justify-between mb-8">
            <div className="p-3 border-2 border-black bg-white group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Clock className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-amber-600 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-3 h-3 fill-current" />
              <span>Real-time</span>
            </div>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Avg Latency</p>
          <p className="text-5xl font-doto font-bold text-black">{stats.avgResponseTime}<span className="text-xl ml-1 font-sans text-gray-400">ms</span></p>
        </div>
      </div>

      <div className="border-4 border-black p-8 bg-white relative">
        <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-xs font-bold uppercase tracking-widest">Analytics</div>
        <DashboardCharts dailyQueries={stats.dailyQueries} />
      </div>
    </div>
  );
}
