"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A refined, premium loader with a technical/minimal aesthetic.
 * No gradients, clean lines, and sophisticated motion.
 */
export function CreativeLoader() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-32 px-6 w-full animate-in fade-in duration-1000">
      <div className="relative flex flex-col items-center">
        {/* Outer Ring */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-slate-100/50 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-slate-900 rounded-full border-t-transparent animate-spin duration-[1.5s] ease-in-out"></div>

          {/* Inner Geometric Element */}
          <div className="w-8 h-8 bg-slate-900 rounded-lg animate-pulse"></div>
        </div>

        <div className="mt-12 text-center space-y-3">
          <h3 className="text-lg font-medium text-slate-900 tracking-tight">
            Consulting Oracle
          </h3>
          <p className="text-sm font-mono text-slate-400 uppercase tracking-widest text-[10px]">
            Analyzing Market Data{dots}
          </p>
        </div>
      </div>
    </div>
  );
}
