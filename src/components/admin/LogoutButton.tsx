"use client";

import { LogOut } from "lucide-react";
import { adminLogout } from "@/lib/actions";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => adminLogout()}
      className="p-2 md:p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
      title="Logout"
    >
      <LogOut className="w-5 h-5 md:w-6 md:h-6" />
    </button>
  );
}
