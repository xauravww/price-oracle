import Link from 'next/link';
import { Search, Database, LayoutDashboard, FileText } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Search className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">PriceOracle</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="/demo" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              App
            </Link>
            <Link href="/docs" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Documentation
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/admin/dashboard" 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
