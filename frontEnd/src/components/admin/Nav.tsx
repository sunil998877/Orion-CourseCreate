import * as React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useTheme } from "@/contextAPI/ThemeContext";
import {
  Search,
  Moon,
  Sun,
  Settings,
  LogOut,
  User,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearAdminSession } from "@/utils/adminAuth";

interface QuickNavItem {
  title: string;
  href: string;
}

const quickNavItems: QuickNavItem[] = [
  { title: "Overview", href: "/admin" },
  { title: "Pricing", href: "/admin/pricing" },
  { title: "Wallets", href: "/admin/users" },
  { title: "Recharges", href: "/admin/recharges" },
  { title: "Ledger", href: "/admin/transactions" },
  { title: "Courses", href: "/admin/courses" },
];

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const { toggleTheme, isDark } = useTheme();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const username = localStorage.getItem("adminUsername") || "Administrator";
  const email = localStorage.getItem("adminEmail") || "";

  // Calculate initials e.g. "Admin" -> "AD"
  const getInitials = (name: string) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(username);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut for Cmd/Ctrl + K focus
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    navigate("/admin/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-nav)] px-4 text-[var(--admin-text)] transition-colors duration-200 md:px-6">
     
      <div className="flex items-center gap-4">
    
        <button
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

    
        <div className="hidden md:flex">
          <SidebarTrigger className="h-9 w-9 rounded-lg border border-slate-200 bg-slate-100 text-slate-700 transition-all hover:border-lime-500/40 hover:bg-lime-500/10 hover:text-lime-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:border-lime-400/40 dark:hover:bg-lime-400/10 dark:hover:text-lime-400" />
        </div>

        <div className="hidden h-5 w-[1px] bg-slate-200 dark:bg-white/10 md:block" />

      
        <nav className="hidden items-center gap-1 sm:flex md:gap-2">
          {quickNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "relative px-3.5 py-2 text-sm font-medium transition-all duration-200 rounded-lg",
                  active
                    ? "font-semibold text-slate-900 bg-slate-100 border border-slate-200 dark:text-white dark:bg-white/[0.08] dark:border-white/15"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/5"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      
      <div className="flex items-center gap-3">
        
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400 dark:text-white/40" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKUs, users, transactions..."
            className="h-9 w-44 rounded-xl border border-slate-200 bg-slate-100 pl-9 pr-12 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:w-60 focus:border-lime-500/50 focus:bg-white focus:ring-2 focus:ring-lime-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-white/40 dark:focus:border-lime-400/50 dark:focus:bg-[#0b1220] dark:focus:ring-lime-400/20 sm:w-56 sm:focus:w-72"
          />
          <div className="pointer-events-none absolute right-2.5 flex items-center gap-0.5 rounded-md border border-slate-200 bg-slate-200/60 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/40">
            <span className="text-[9px]">⌘</span>K
          </div>
        </div>

       
        <button
          type="button"
          onClick={() => toggleTheme()}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={isDark}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-2.5 text-slate-700 transition-colors hover:border-lime-500/40 hover:bg-lime-500/10 hover:text-lime-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:border-lime-400/40 dark:hover:bg-lime-400/10 dark:hover:text-lime-400 cursor-pointer"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
          <span className="hidden text-[11px] font-semibold sm:inline">{isDark ? "Light" : "Dark"}</span>
        </button>

        
        <button
          type="button"
          onClick={() => navigate("/admin/settings")}
          title="Settings"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition-colors hover:border-lime-500/40 hover:bg-lime-500/10 hover:text-lime-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:border-lime-400/40 dark:hover:bg-lime-400/10 dark:hover:text-lime-400 cursor-pointer"
        >
          <Settings className="h-4 w-4 transition-transform duration-200 hover:rotate-45" />
        </button>

        
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-200 hover:ring-2 hover:ring-slate-300 cursor-pointer dark:border-white/15 dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/10 dark:hover:ring-white/20"
          >
            {initials}
          </button>

         
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 text-slate-800 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 z-50 dark:border-white/10 dark:bg-[#0b1220]/95 dark:text-white">
           
              <div className="border-b border-slate-200 px-3 py-2.5 dark:border-white/10">
                <p className="text-xs font-semibold text-slate-900 truncate dark:text-white">{username}</p>
                <p className="text-[11px] text-slate-500 truncate dark:text-white/50">{email}</p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate("/admin/settings");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white cursor-pointer"
                >
                  <User className="h-3.5 w-3.5 text-lime-600 dark:text-lime-400" />
                  Orion System Settings
                </button>
              </div>

            
              <div className="border-t border-slate-200 pt-1 dark:border-white/10">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-600 cursor-pointer dark:text-red-400 dark:hover:text-red-300"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export { Nav };
