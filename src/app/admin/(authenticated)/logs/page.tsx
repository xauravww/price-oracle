
export const dynamic = 'force-dynamic';

import { Activity, Filter, Download, Terminal } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import prisma from "@/lib/db";

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const limit = 15;
  const offset = (currentPage - 1) * limit;

  // Fetch paginated logs using Prisma
  const [logs, totalCount] = await Promise.all([
    prisma.log.findMany({
      orderBy: { timestamp: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.log.count(),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="max-w-7xl mx-auto overflow-x-hidden px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b-4 border-black pb-8">
        <div>
          <h1 className="text-3xl md:text-6xl font-doto font-black uppercase tracking-tighter leading-none mb-4">System<br />Logs</h1>
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-gray-400" />
            <p className="font-mono text-sm text-gray-500">{totalCount} recorded operations</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-black font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-black border-2 border-black font-bold uppercase tracking-widest text-xs text-white hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-black text-white border-b-2 border-black">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] font-doto">Timestamp</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] font-doto">Query</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] font-doto">Result</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] font-doto">Latency</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.2em] font-doto">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/5">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-yellow-50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs">
                    <div className="font-bold text-black">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-gray-400">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-600 truncate max-w-xs group-hover:text-black font-mono">
                      {log.query}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-black font-doto">
                      ₹{log.priceResult?.toLocaleString() || '0'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-2 bg-gray-200 border border-black overflow-hidden relative">
                        <div
                          className={`h-full absolute top-0 left-0 ${log.responseTime > 1000 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min((log.responseTime / 2000) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold font-mono">{log.responseTime}ms</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-0.5 border border-black text-[10px] font-black uppercase tracking-wider ${log.status === 'success'
                      ? 'bg-emerald-300 text-black'
                      : 'bg-red-300 text-black'
                      }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center bg-gray-50">
                    <div className="flex flex-col items-center gap-4">
                      <Activity className="w-12 h-12 text-gray-300" />
                      <p className="font-doto font-bold uppercase text-gray-400">System Idle. No logs.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    </div>
  );
}
