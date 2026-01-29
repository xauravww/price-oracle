export const dynamic = 'force-dynamic';

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
    <div className="max-w-7xl mx-auto overflow-x-hidden px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-6xl font-doto font-black text-black uppercase tracking-tighter leading-none">Price<br />Database<span className="text-emerald-500">.</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest mt-4 text-xs border-l-4 border-black pl-4">Manage and curate {totalCount} market price entries</p>
        </div>
        <Link href="/" className="group flex items-center gap-3 px-8 py-4 bg-black border-2 border-black text-white hover:bg-white hover:text-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
          <Plus className="w-5 h-5" />
          <span className="font-doto font-bold uppercase tracking-wider">Add Entry</span>
        </Link>
      </div>

      <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="p-6 border-b-2 border-black bg-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
            <input
              type="text"
              placeholder="SEARCH ENTRIES..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-black text-sm font-bold uppercase tracking-widest focus:outline-none focus:bg-yellow-50 placeholder:text-gray-400 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-black text-white border-b-2 border-black">
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] font-doto">Item Details</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] font-doto">Location</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] font-doto">Price</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] font-doto">Date Added</th>
                <th className="px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] font-doto text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-yellow-50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-bold text-black uppercase tracking-tight text-lg group-hover:underline decoration-2 underline-offset-4">{entry.item}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-widest bg-gray-100 inline-block px-1 border border-gray-200">{entry.id}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">{entry.location}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xl font-doto font-bold text-black">₹{entry.price.toLocaleString()}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                      {new Date(entry.timestamp).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/?q=${encodeURIComponent(`${entry.item} for ${entry.price}`)}`}
                        target="_blank"
                        className="p-2 border-2 border-black text-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                        title="View Analysis"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <form action={async () => {
                        "use server";
                        await deleteEntry(entry.id);
                      }}>
                        <button className="p-2 border-2 border-black text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]" title="Delete Entry">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <div className="p-6 border-2 border-black bg-gray-50 rounded-full">
                        <Database className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-bold uppercase tracking-widest">The database is currently empty.</p>
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
