
import { getEntries, deleteEntry } from "@/lib/actions";
import { Trash2, Database, Search, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/admin/Pagination";

export default async function DatabasePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const { entries, totalPages, totalCount } = await getEntries(currentPage, 10);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Price Database</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage and curate {totalCount} market price entries</p>
        </div>
        <Link href="/" className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-900 rounded-2xl text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
          <Plus className="w-5 h-5" /> Add New Entry
        </Link>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search entries..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Item Details</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Location</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Price</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Date Added</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{entry.item}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-tighter">{entry.id}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm font-medium text-slate-600">{entry.location}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-lg font-black text-slate-900">₹{entry.price.toLocaleString()}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm text-slate-500 font-medium">
                      {new Date(entry.timestamp).toLocaleDateString('en-IN', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/?q=${encodeURIComponent(`${entry.item} for ${entry.price}`)}`}
                        target="_blank"
                        className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                        title="View Analysis"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                      <form action={async () => {
                        "use server";
                        await deleteEntry(entry.id);
                      }}>
                        <button className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all" title="Delete Entry">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Database className="w-12 h-12 text-slate-200" />
                      <p className="text-slate-400 font-medium">The database is currently empty.</p>
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
