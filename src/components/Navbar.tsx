"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Home,
  LayoutDashboard,
  Settings,
  Database,
  History,
  Globe,
  FileWarning,
  LogOut,
  Terminal,
  BookOpen
} from 'lucide-react';
import { cn } from "@/lib/utils";
import LogoutButton from "@/components/admin/LogoutButton";

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  // Unified Navigation Items
  const publicItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Demo', icon: Terminal, href: '/demo' },
    { label: 'Docs', icon: BookOpen, href: '/docs' },
  ];

  const adminItems = [
    { label: 'Dash', icon: LayoutDashboard, href: '/admin/dashboard' },
    { label: 'Logs', icon: History, href: '/admin/logs' },
    { label: 'Data', icon: Database, href: '/admin/database' },
    { label: 'Sources', icon: Globe, href: '/admin/sources' },
    { label: 'Reports', icon: FileWarning, href: '/admin/reports' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[350px] sm:max-w-md md:w-auto md:max-w-4xl px-4">
      <div className="flex items-center gap-2 p-2 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-full overflow-x-auto mx-auto w-full md:w-auto justify-between md:justify-start">

        {/* Brand / Home Trigger */}
        <Link
          href="/"
          className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-full hover:scale-105 transition-transform shrink-0"
        >
          <Search className="w-5 h-5" />
        </Link>

        <div className="w-0.5 h-6 bg-black/10 mx-1 shrink-0"></div>

        {/* Dynamic Navigation Items */}
        <div className="flex items-center gap-1">
          {(isAdmin ? adminItems : publicItems).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap",
                  isActive
                    ? "bg-black text-white border-black"
                    : "bg-transparent text-gray-500 border-transparent hover:border-black hover:text-black hover:bg-gray-50"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline-block">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Admin Context Switcher / Login Link */}
        <div className="w-0.5 h-6 bg-black/10 mx-1 shrink-0"></div>

        {isAdmin ? (
          <LogoutButton className="!p-0 !border-0 !bg-transparent !text-red-500 hover:!bg-red-50 hover:!text-red-600 w-10 h-10 rounded-full flex items-center justify-center" />
        ) : (
          <Link
            href="/admin/dashboard"
            className="flex items-center justify-center w-10 h-10 rounded-full text-gray-400 hover:text-black hover:bg-gray-50 transition-colors shrink-0"
            title="Admin Access"
          >
            <Settings className="w-5 h-5" />
          </Link>
        )}

      </div>
    </div>
  );
}
