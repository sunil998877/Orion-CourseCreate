import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, BarChart, Settings } from 'lucide-react';
import CreditsTracker from '../components/credits/CreditsTracker';

export default function Sidebar() {
  const location = useLocation();
  const navItems = [
    { name: 'Home', path: '/course-creator', icon: Home },
    { name: 'Course', path: '/course-dashboard', icon: BookOpen },
    { name: 'Analytics', path: '/analytics', icon: BarChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-[250px] shrink-0 flex-col border-r border-white/10 bg-[#101720]/95 shadow-[12px_0_40px_rgba(0,0,0,0.12)] md:flex">
      <div className="w-full flex-1 overflow-y-auto overflow-x-hidden">
        <nav className="space-y-1.5 px-3 py-5 text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.name}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 font-medium transition-all ${
                  isActive
                    ? 'border-lime-300/25 bg-lime-300/[0.11] text-lime-300 shadow-[inset_3px_0_0_#bef264]'
                    : 'border-transparent text-white/60 hover:bg-white/[0.07] hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-lime-400' : ''}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <CreditsTracker />
    </aside>
  );
}
