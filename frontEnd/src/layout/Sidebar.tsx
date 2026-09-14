import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, BarChart, Settings, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import CreditsTracker from '../components/credits/CreditsTracker';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const navItems = [
    { name: 'Home', path: '/course-creator', icon: Home },
    { name: 'Course', path: '/course-dashboard', icon: BookOpen },
    { name: 'Analytics', path: '/analytics', icon: BarChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex md:flex-col fixed top-16 left-0 bottom-0 z-30 shrink-0 bg-[#101720]/95 border-r border-white/10 shadow-[12px_0_40px_rgba(0,0,0,0.12)] transition-[width] duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[250px]'
      }`}
    >
      <div className="flex items-center justify-end border-b border-white/10 px-2 py-2">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <div className="w-full flex-1 overflow-y-auto">
        <nav className={`space-y-1.5 py-4 text-sm ${collapsed ? 'px-2' : 'px-3'}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.name : undefined}
                className={`flex items-center rounded-lg border font-medium transition-all ${
                  collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
                } ${
                  isActive
                    ? 'border-lime-300/25 bg-lime-300/[0.11] text-lime-300 shadow-[inset_3px_0_0_#bef264]'
                    : 'border-transparent text-white/60 hover:bg-white/[0.07] hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-lime-400' : ''}`} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <CreditsTracker collapsed={collapsed} />
    </aside>
  );
}
