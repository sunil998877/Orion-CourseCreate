
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, BarChart } from 'lucide-react';
import CreditsTracker from '../components/credits/CreditsTracker';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/course-creator', icon: Home },
    { name: 'Course', path: '/course-dashboard', icon: BookOpen },
    { name: 'Analytics', path: '/analytics', icon: BarChart },
  ];

  return (
    <aside className="hidden md:flex md:flex-col fixed top-16 left-0 bottom-0 w-64 z-30 shrink-0 bg-white/5 backdrop-blur-md border-r border-white/10">
      <div className="w-full flex-1 overflow-y-auto">
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-lg font-semibold text-lime-400">Course Creator</h1>
        </div>
        <nav className="px-3 py-4 space-y-1 text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition font-medium ${isActive
                    ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-lime-400' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <CreditsTracker />
    </aside>
  );
}
