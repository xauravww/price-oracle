"use client";

import React, { useState, useEffect } from 'react';
import {
  Trash2,
  ExternalLink,
  Loader2,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  FileWarning,
  AlertTriangle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getReportedUrls, deleteReportedUrl } from "@/lib/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    try {
      const data = await getReportedUrls();
      setReports(data);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (deleteId === null) return;
    await deleteReportedUrl(deleteId);
    setDeleteId(null);
    await loadReports();
  }

  // Pagination Logic
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const paginatedReports = reports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto font-sans text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b-4 border-black pb-8">
        <div>
          <h1 className="text-5xl md:text-6xl font-doto font-black uppercase tracking-tighter leading-[0.9] mb-4">
            Reported<br />Issues
          </h1>
          <p className="text-lg font-medium text-gray-500 max-w-xl border-l-4 border-black pl-4">
            User-flagged URLs where price extraction failed. Review and resolve to improve engine accuracy.
          </p>
        </div>
        <div className="bg-black text-white px-6 py-3 font-doto font-bold text-xl uppercase tracking-widest">
          {reports.length} <span className="text-gray-500 text-sm normal-case font-sans font-medium">Pending Review</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border-2 border-black p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 bg-slate-50 border border-black/10 m-2">
            <Loader2 className="w-12 h-12 animate-spin text-black" />
            <p className="font-bold uppercase tracking-widest text-sm">Synchronizing Reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 bg-slate-50 border border-black/10 m-2">
            <div className="w-20 h-20 bg-emerald-100 flex items-center justify-center border-2 border-black rounded-none">
              <FileWarning className="w-10 h-10 text-emerald-900" />
            </div>
            <div className="text-center">
              <h3 className="font-doto font-bold text-2xl uppercase mb-2">System Clear</h3>
              <p className="text-gray-500">No missing price reports found.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            <div className="grid gap-4">
              {paginatedReports.map((report) => (
                <div
                  key={report.id}
                  className="group relative bg-white border-2 border-black p-6 hover:bg-black hover:text-white transition-colors duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-3 min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-doto font-bold text-sm text-gray-400 group-hover:text-gray-600">#{report.id}</span>
                        <h4 className="font-bold text-lg truncate font-doto uppercase tracking-tight">{report.title || 'Untitled Source'}</h4>
                        <div className="px-2 py-0.5 border border-black text-[10px] font-bold uppercase tracking-wider bg-yellow-300 text-black group-hover:bg-white group-hover:border-white">
                          {report.status}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-gray-500 group-hover:text-gray-300">
                        <div className="flex items-center gap-2 truncate max-w-md">
                          <ExternalLink className="w-4 h-4 shrink-0" />
                          <a href={report.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline decoration-2 underline-offset-4">
                            {report.url}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4" />
                          <span>Query: <span className="font-bold text-black group-hover:text-white">{report.query}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(report.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-12 h-12 rounded-none border-2 border-transparent hover:border-white hover:bg-red-600 hover:text-white text-gray-400 group-hover:text-white transition-all"
                        onClick={() => setDeleteId(report.id)}
                        title="Remove Report"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t-2 border-black pt-6 mt-6">
                <p className="font-bold text-sm uppercase tracking-widest text-gray-500">
                  Page <span className="text-black">{currentPage}</span> of {totalPages}
                </p>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-12 h-12 border-2 border-black rounded-none hover:bg-black hover:text-white disabled:opacity-30"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-12 h-12 border-2 border-black rounded-none hover:bg-black hover:text-white disabled:opacity-30"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="border-4 border-black p-0 overflow-hidden gap-0 bg-white sm:rounded-none max-w-md shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader className="p-8 bg-black text-white">
            <DialogTitle className="font-doto font-bold text-2xl uppercase tracking-widest flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
              Delete Report?
            </DialogTitle>
          </DialogHeader>

          <div className="p-8 space-y-4">
            <p className="text-lg font-medium text-gray-700">
              This action cannot be undone. This report will be permanently removed from the database.
            </p>

            <div className="flex gap-4 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteId(null)}
                className="border-2 border-black rounded-none font-bold uppercase tracking-widest hover:bg-gray-100 flex-1 h-12 text-sm"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white border-2 border-black rounded-none font-bold uppercase tracking-widest flex-1 h-12 text-sm"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
