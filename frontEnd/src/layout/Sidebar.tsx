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
    return (<aside className="hidden md:flex md:flex-col fixed top-16 left-0 bottom-0 w-[250px] z-30 shrink-0 bg-[#101720]/95 border-r border-white/10 shadow-[12px_0_40px_rgba(0,0,0,0.12)]">
            <div className="w-full flex-1 overflow-y-auto">
                <div className="flex h-[78px] items-center border-b border-white/10 px-6">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Workspace</p>
                        <h1 className="mt-1 text-[17px] font-bold tracking-tight text-lime-300">Course Creator</h1>
                    </div>
                </div>
                <nav className="space-y-1.5 px-3 py-5 text-sm">
                    {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (<Link key={item.path} to={item.path} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 font-medium transition-all ${isActive
                    ? 'border-lime-300/25 bg-lime-300/[0.11] text-lime-300 shadow-[inset_3px_0_0_#bef264]'
                    : 'border-transparent text-white/60 hover:bg-white/[0.07] hover:text-white'}`}>
                                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-lime-400' : ''}`}/>
                                {item.name}
                            </Link>);
        })}
                </nav>
            </div>
            <CreditsTracker />
        </aside>);
}
