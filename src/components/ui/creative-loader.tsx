"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A refined, premium loader with a technical/minimal aesthetic.
 * No gradients, clean lines, and sophisticated motion.
 */
export function CreativeLoader() {
  return (
    <div className="flex flex-col items-center justify-center animate-in fade-in duration-1000">
      <div className="relative flex flex-col items-center">
        {/* Outer Ring */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-slate-100/50 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-slate-900 rounded-full border-t-transparent animate-spin duration-[1.5s] ease-in-out"></div>

          {/* Inner Geometric Element */}
          <div className="w-8 h-8 bg-slate-900 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
