import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Coins,
  Users,
  CreditCard,
  ReceiptText,
  BookOpen,
  TrendingUp,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearAdminSession } from "@/utils/adminAuth";
import brandLogo from "@/assests/logo3.svg";
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const menuItems: MenuItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Pricing Rules", href: "/admin/pricing", icon: Coins, badge: "6 SKUs" },
  { title: "User Wallets", href: "/admin/users", icon: Users },
  { title: "Recharges & Plans", href: "/admin/recharges", icon: CreditCard },
  { title: "Credit Ledger", href: "/admin/transactions", icon: ReceiptText },
  { title: "Generated Courses", href: "/admin/courses", icon: BookOpen },
  { title: "Cost & Margins", href: "/admin/analytics", icon: TrendingUp },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (href: string) => {
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    clearAdminSession();
    window.location.href = "/admin/login";
  };

  const logoMark = (
    <Link
      to="/admin"
      className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/15 dark:bg-[#111827]"
      aria-label="Orion AI"
    >
      <img src={brandLogo} alt="Orion AI" className="h-8 w-8 object-contain" />
    </Link>
  );

  return (
    <TooltipProvider delay={100}>
      <SidebarHeader className="h-16 shrink-0 overflow-visible border-b border-[var(--admin-border)] p-0">
        <div
          className={cn(
            "flex h-16 items-center gap-3 px-3",
            isCollapsed && "justify-center px-0"
          )}
        >
          {logoMark}
          {!isCollapsed && (
            <div className="min-w-0 flex flex-col">
              <span className="truncate text-base font-bold tracking-tight text-[var(--admin-text)]">
                Orion AI
              </span>
              <span className="truncate text-[11px] font-medium text-[var(--admin-muted)]">
                Course Creator Admin
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className={cn("bg-transparent p-3", isCollapsed && "px-2 py-4")}>
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            const linkContent = (
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isCollapsed && "mx-auto h-11 w-11 justify-center rounded-xl px-0",
                  active
                    ? "border border-slate-200 bg-slate-100 font-semibold text-slate-900 dark:border-white/15 dark:bg-white/[0.08] dark:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    active ? "text-lime-600 dark:text-lime-400" : "text-slate-500 dark:text-white/70"
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.title}</span>}
                {!isCollapsed && item.badge && (
                  <span className="ml-auto rounded border border-lime-500/30 bg-lime-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-lime-700 dark:border-lime-400/20 dark:bg-lime-400/10 dark:text-lime-400">
                    {item.badge}
                  </span>
                )}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}
        </nav>
      </SidebarContent>

      <SidebarFooter className="border-t border-[var(--admin-border)] p-3">
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger>
              <button
                type="button"
                onClick={handleLogout}
                className="mx-auto flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-white/70 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                <LogOut className="h-5 w-5 shrink-0" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-white/80 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5">
              <LogOut className="h-4 w-4 shrink-0" />
            </span>
            <span className="font-medium">Logout</span>
          </button>
        )}
      </SidebarFooter>
    </TooltipProvider>
  );
}
