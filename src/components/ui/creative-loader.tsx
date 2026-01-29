"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";

/**
 * A more professional, high-end loader for the Price Oracle.
 */
export function CreativeLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + Math.random() * 5 : prev));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 max-w-lg mx-auto w-full animate-in fade-in duration-700">
      {/* High-end Visual Indicator */}
      <div className="relative mb-12">
        {/* Animated Glow Rings */}
        <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl scale-150 animate-pulse"></div>
        <div className="absolute inset-0 bg-emerald-500/5 rounded-full blur-2xl scale-125 animate-pulse delay-700"></div>

        {/* Central Icon Container */}
        <div className="relative w-24 h-24 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex items-center justify-center border border-slate-100 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative">
            <Wand2 className="w-10 h-10 text-slate-800 animate-pulse" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-blue-500 animate-bounce" />
          </div>

          {/* Circular Progress Border */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-slate-50"
            />
            <circle
              cx="48"
              cy="48"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={2 * Math.PI * 46}
              strokeDashoffset={2 * Math.PI * 46 * (1 - progress / 100)}
              strokeLinecap="round"
              className="text-blue-600 transition-all duration-500 ease-out"
            />
          </svg>
        </div>
      </div>

      <div className="text-center space-y-4 w-full">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Consulting the Oracle
          </h3>
          <p className="text-slate-400 font-medium text-sm">
            Scanning thousands of data points for the best valuation...
          </p>
        </div>

        {/* Professional Stealth Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-6 border border-slate-50">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-2 mt-4">
          <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            AI Analysis In Progress
          </span>
        </div>
      </div>
    </div>
  );
}
