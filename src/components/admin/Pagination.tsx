
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export default function Pagination({ totalPages, currentPage }: PaginationProps) {
  const searchParams = useSearchParams();
  
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <Link
        href={createPageURL(currentPage - 1)}
        className={`p-2 rounded-xl border border-slate-200 transition-all ${
          currentPage <= 1 
            ? "pointer-events-none opacity-30" 
            : "hover:bg-white hover:shadow-sm"
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </Link>

      <div className="flex items-center gap-1">
        {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;
          const isCurrent = page === currentPage;
          
          return (
            <Link
              key={page}
              href={createPageURL(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                isCurrent 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                  : "text-slate-500 hover:bg-white hover:border-slate-200 border border-transparent"
              }`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      <Link
        href={createPageURL(currentPage + 1)}
        className={`p-2 rounded-xl border border-slate-200 transition-all ${
          currentPage >= totalPages 
            ? "pointer-events-none opacity-30" 
            : "hover:bg-white hover:shadow-sm"
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </Link>
    </div>
  );
}
