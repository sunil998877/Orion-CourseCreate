import React from "react";
import { SidebarProvider, Sidebar } from "../components/ui/sidebar";
import AdminSidebar from "../components/admin/Sidebar";
import AdminNav from "../components/admin/Nav";
import { useTheme } from "../contextAPI/ThemeContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isDark } = useTheme();

  return (
    <div id="admin-shell" className={isDark ? "dark h-screen w-full" : "h-screen w-full"}>
      <SidebarProvider defaultOpen={true}>
        <Sidebar>
          <AdminSidebar />
        </Sidebar>
        <div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto bg-[var(--admin-page)] text-[var(--admin-text)]">
          <AdminNav />
          <main className="flex-1 p-4 md:p-6 lg:p-8 text-[var(--admin-text)]">{children}</main>
        </div>
      </SidebarProvider>
    </div>
  );
}
