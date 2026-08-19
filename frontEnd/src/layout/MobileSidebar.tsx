
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, BarChart, X } from 'lucide-react';
import CreditsTracker from '../components/credits/CreditsTracker';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const location = useLocation();

  if (!isOpen) return null;

  const navItems = [
    { name: 'Home', path: '/course-creator', icon: Home },
    { name: 'Course', path: '/course-dashboard', icon: BookOpen },
    { name: 'Analytics', path: '/analytics', icon: BarChart },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="absolute top-0 bottom-0 left-0 w-[min(18rem,85vw)] max-w-full bg-[#0b1220]/95 border-r border-white/10 backdrop-blur-md shadow-2xl flex flex-col">
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-lime-400">Course Creator</h1>
          <button
            type="button"
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition font-medium ${isActive
                    ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                onClick={onClose}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-lime-400' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <CreditsTracker />
      </aside>
    </div>
  );
}
