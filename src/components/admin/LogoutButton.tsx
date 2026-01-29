"use client";

import { LogOut } from "lucide-react";
import { adminLogout } from "@/lib/actions";

export default function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => adminLogout()}
      className={`group flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-widest text-red-600 border-2 border-transparent hover:border-red-600 hover:bg-red-50 transition-all ${className}`}
      title="Logout"
    >
      <span className="hidden md:inline">Exit</span>
      <LogOut className="w-5 h-5" />
    </button>
  );
}
