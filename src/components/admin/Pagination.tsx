
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
    <div className="flex items-center justify-center gap-4 py-12">
      <Link
        href={createPageURL(currentPage - 1)}
        className={`p-3 border-2 border-black transition-all ${currentPage <= 1
            ? "pointer-events-none opacity-20 bg-gray-100"
            : "bg-white hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
          }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </Link>

      <div className="flex items-center gap-2">
        {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;
          const isCurrent = page === currentPage;

          return (
            <Link
              key={page}
              href={createPageURL(page)}
              className={`w-12 h-12 flex items-center justify-center font-bold font-doto text-sm transition-all border-2 border-black ${isCurrent
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-100"
                }`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      <Link
        href={createPageURL(currentPage + 1)}
        className={`p-3 border-2 border-black transition-all ${currentPage >= totalPages
            ? "pointer-events-none opacity-20 bg-gray-100"
            : "bg-white hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
          }`}
      >
        <ChevronRight className="w-5 h-5" />
      </Link>
    </div>
  );
}
