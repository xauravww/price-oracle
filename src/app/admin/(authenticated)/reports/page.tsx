"use client";

import React, { useState, useEffect } from 'react';
import { 
  AlertCircle,
  Trash2, 
  ExternalLink, 
  Loader2,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  FileWarning
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getReportedUrls, deleteReportedUrl } from "@/lib/actions";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to remove this report?")) return;
    await deleteReportedUrl(id);
    await loadReports();
  }

  // Pagination Logic
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const paginatedReports = reports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-6 lg:py-10 space-y-8 max-w-5xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Missing Prices</h1>
        <p className="text-muted-foreground text-base max-w-2xl">
          Analyze URLs reported by users where the AI failed to extract price data.
        </p>
      </div>

      <Card className="shadow-sm border-muted-foreground/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileWarning className="w-5 h-5 text-amber-500" />
            Reported URLs
          </CardTitle>
          <CardDescription>Review and manage unparsed market data sources.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-muted/10">
              <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No reports found.</p>
              <p className="text-sm text-muted-foreground/70 mt-1">URLs with missing prices will appear here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4">
                {paginatedReports.map((report) => (
                  <div 
                    key={report.id} 
                    className="flex flex-col p-5 border rounded-2xl hover:bg-muted/30 transition-all gap-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-lg truncate">{report.title || 'Untitled Source'}</h4>
                          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                            {report.status}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5 truncate">
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            <a href={report.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline text-blue-600">
                              {report.url}
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Search className="w-3.5 h-3.5" />
                            <span>Query: <span className="font-medium text-foreground">{report.query}</span></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(report.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                          onClick={() => handleDelete(report.id)}
                          title="Remove Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, reports.length)} of {reports.length} reports
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
