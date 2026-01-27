import { 
  LayoutDashboard, 
  History, 
  Database, 
  Home,
  Globe
} from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: History, label: "Logs", href: "/admin/logs" },
    { icon: Database, label: "Database", href: "/admin/database" },
    { icon: Globe, label: "Sources", href: "/admin/sources" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 pb-24">
        {children}
      </main>

      {/* Floating Dock Navigation */}
      <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[95vw]">
        <nav className="bg-white/80 backdrop-blur-xl border border-slate-200 px-2 py-2 md:px-4 md:py-3 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar">
          <Link 
            href="/"
            className="p-2 md:p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
            title="Public Site"
          >
            <Home className="w-5 h-5 md:w-6 md:h-6" />
          </Link>
          
          <div className="w-px h-5 md:h-6 bg-slate-200 mx-1 md:mx-2" />

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative p-2 md:p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
            >
              <item.icon className="w-5 h-5 md:w-6 md:h-6" />
              <span className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-bold">
                {item.label}
              </span>
            </Link>
          ))}

          <div className="w-px h-5 md:h-6 bg-slate-200 mx-1 md:mx-2" />

          <LogoutButton />
        </nav>
      </div>
    </div>
  );
}
