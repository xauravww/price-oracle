import {
  LayoutDashboard,
  History,
  Database,
  Home,
  Globe,
  FileWarning,
  Zap,
  Menu
} from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: History, label: "System Logs", href: "/admin/logs" },
    { icon: Database, label: "Database", href: "/admin/database" },
    { icon: Globe, label: "Market Sources", href: "/admin/sources" },
    { icon: FileWarning, label: "Price Reports", href: "/admin/reports" },
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col md:flex-row">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
        <svg className="absolute top-0 right-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M 4 0 L 0 0 0 4" fill="none" stroke="currentColor" strokeWidth="0.1" />
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 border-r-2 border-black bg-white z-20 h-screen sticky top-0">
        <div className="h-20 flex items-center px-6 border-b-2 border-black bg-black text-white">
          <Zap className="w-6 h-6 mr-3 fill-white" />
          <span className="font-doto font-bold text-xl uppercase tracking-tighter">PriceOracle<span className="text-emerald-500">.</span></span>
        </div>

        <div className="flex-1 py-8 px-6 space-y-8 overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">
              <span className="w-2 h-2 bg-emerald-500 rounded-none"></span>
              Console
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 p-3 border-2 border-transparent hover:border-black hover:bg-gray-50 transition-all group"
                >
                  <item.icon className="w-5 h-5 text-gray-500 group-hover:text-black transition-colors" />
                  <span className="font-bold text-sm uppercase tracking-wide text-gray-600 group-hover:text-black">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="pt-8 border-t-2 border-black/10">
            <Link
              href="/"
              className="flex items-center gap-4 p-3 border-2 border-dashed border-gray-300 hover:border-black hover:bg-gray-50 transition-all group text-gray-500 hover:text-black"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium text-sm">Public Site</span>
            </Link>
          </div>
        </div>

        <div className="p-6 border-t-2 border-black bg-gray-50">
          <LogoutButton className="w-full bg-white border-2 border-black hover:bg-red-600 hover:text-white hover:border-red-600" />
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden sticky top-0 z-50 bg-white border-b-2 border-black px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 -ml-2 hover:bg-gray-100 rounded-none border border-transparent hover:border-black transition-all">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 border-r-4 border-black font-sans">
              <div className="h-20 flex items-center px-6 border-b-2 border-black bg-black text-white">
                <Zap className="w-6 h-6 mr-3 fill-white" />
                <span className="font-doto font-bold text-xl uppercase tracking-tighter">PriceOracle<span className="text-emerald-500">.</span></span>
              </div>
              <div className="p-6 space-y-8">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">
                    <span className="w-2 h-2 bg-emerald-500 rounded-none"></span>
                    Console
                  </div>
                  <nav className="space-y-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-4 p-3 border-2 border-transparent hover:border-black hover:bg-gray-50 transition-all group"
                      >
                        <item.icon className="w-5 h-5 text-black" />
                        <span className="font-bold text-sm uppercase tracking-wide text-black">{item.label}</span>
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="pt-8 border-t-2 border-black/10">
                  <Link
                    href="/"
                    className="flex items-center gap-4 p-3 border-2 border-dashed border-gray-300 hover:border-black hover:bg-gray-50 transition-all group text-gray-500 hover:text-black"
                  >
                    <Home className="w-5 h-5" />
                    <span className="font-medium text-sm">Public Site</span>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <span className="font-doto font-bold text-lg uppercase tracking-tighter">PriceOracle<span className="text-black">.</span></span>
          </div>
        </div>
        <LogoutButton className="!p-1 border-0" />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 min-w-0 p-4 md:p-12 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
