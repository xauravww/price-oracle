
import { Activity, Filter, Download } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import db from "@/lib/db";

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const limit = 15;
  const offset = (currentPage - 1) * limit;

  // Fetch paginated logs directly for now or we could update actions.ts
  const logs = db.prepare('SELECT * FROM logs ORDER BY timestamp DESC LIMIT ? OFFSET ?').all(limit, offset) as { id: string, timestamp: string, query: string, price_result: number, response_time: number, status: string }[];
  const totalCount = (db.prepare('SELECT COUNT(*) as count FROM logs').get() as { count: number }).count;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Logs</h1>
          <p className="text-slate-500 mt-2 text-lg">Detailed history of {totalCount} system operations</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-900 rounded-xl text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Query</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Result</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Latency</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="text-sm font-bold text-slate-900">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm font-medium text-slate-600 max-w-xs truncate group-hover:text-slate-900 transition-colors">
                      {log.query}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm font-black text-slate-900">
                      ₹{log.price_result?.toLocaleString() || '0'}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${log.response_time > 1000 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                          style={{ width: `${Math.min((log.response_time / 2000) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-500">{log.response_time}ms</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      log.status === 'success' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Activity className="w-12 h-12 text-slate-200" />
                      <p className="text-slate-400 font-medium">No logs recorded in the system yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination totalPages={totalPages} currentPage={currentPage} />
    </div>
  );
}
