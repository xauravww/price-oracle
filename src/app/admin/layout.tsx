
import { 
  LayoutDashboard, 
  History, 
  Database, 
  Home,
  LogOut
} from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: History, label: "Logs", href: "/admin/logs" },
    { icon: Database, label: "Database", href: "/admin/database" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 pb-24">
        {children}
      </main>

      {/* Floating Dock Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <nav className="bg-white/80 backdrop-blur-xl border border-slate-200 px-4 py-3 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2">
          <Link 
            href="/"
            className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
            title="Public Site"
          >
            <Home className="w-6 h-6" />
          </Link>
          
          <div className="w-px h-6 bg-slate-200 mx-2" />

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
            >
              <item.icon className="w-6 h-6" />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-bold">
                {item.label}
              </span>
            </Link>
          ))}

          <div className="w-px h-6 bg-slate-200 mx-2" />

          <button 
            className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
            title="Logout"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </nav>
      </div>
    </div>
  );
}
