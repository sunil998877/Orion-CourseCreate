import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, User, Camera, Shield, LogOut } from 'lucide-react';
import Logo from '../components/Logo';

export interface NotificationItem {
  _id?: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface UserInfo {
  username: string;
  email: string;
}

interface HeaderProps {
  onOpenMobileMenu: () => void;
  userInfo: UserInfo | null;
  avatarUrl: string | null;
  notifications: NotificationItem[];
  onOpenAvatarModal: () => void;
  onOpenChangePasswordModal: () => void;
  onLogout: () => void;
  onMarkAllRead: () => void;
  onRemoveAllNotifications: () => void;
  onFetchNotifications: () => void;
}

export default function Header({
  onOpenMobileMenu,
  userInfo,
  avatarUrl,
  notifications,
  onOpenAvatarModal,
  onOpenChangePasswordModal,
  onLogout,
  onMarkAllRead,
  onRemoveAllNotifications,
  onFetchNotifications,
}: HeaderProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);

  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const avatarDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(event.target as Node)) {
        setAvatarDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerSearch = () => {
    const q = searchTerm.trim();
    if (!q) return;
    navigate(`/course-dashboard?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg border-b border-white/10 h-16">
      <div className="h-16 px-3 md:px-6 flex items-center justify-between gap-2 md:gap-6">
        {/* Mobile menu button and Logo (Logo hidden on mobile) */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button
            type="button"
            className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-white/80" />
          </button>
          <Link to="/course-creator" className="hidden md:block shrink-0">
            <Logo className="h-9 md:h-14 w-auto" />
          </Link>
        </div>

        {/* Search Bar (Visible in top bar on both mobile and desktop) */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white/40" />
            <label htmlFor="search" className="sr-only">
              Search courses
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search courses"
              className="w-full h-9 md:h-10 rounded-full bg-white/5 border border-white/10 pl-9 md:pl-10 pr-3 md:pr-4 text-xs md:text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') triggerSearch();
              }}
            />
          </div>
        </div>

        {/* Right side items: Notifications & User Avatar dropdowns */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              className={`p-2 rounded-full border transition-all relative ${notifOpen ? 'bg-white/15 border-white/20' : 'bg-white/5 border-white/10 hover:bg-white/10 '
                }`}
              onClick={() => {
                setNotifOpen((v) => !v);
                if (!notifOpen) onFetchNotifications();
              }}
              aria-label="Notifications"
            >
              <Bell className={`w-5 h-5 transition-all ${notifOpen ? 'text-white' : 'text-white/70'}`} />
              {notifications.some((n) => !n.isRead) && (
                <span className="absolute top-1 right-2 w-2 h-2 bg-lime-500 rounded-full animate-pulse" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute top-full right-0 mt-2 z-50 w-80 max-md:fixed max-md:left-3 max-md:right-3 max-md:w-auto max-md:top-16 bg-[#0A0F1A]/95 border border-white/20 backdrop-blur-md rounded-xl shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-2">
                  <span className="text-sm text-white/80 font-semibold ">Notifications</span>
                  <div className="flex gap-2">
                    <button
                      className="text-xs px-2 py-1 rounded bg-lime-500/30 text-lime-200 hover:bg-lime-500/40 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAllRead();
                      }}
                    >
                      Mark all read
                    </button>
                    <button
                      className="text-xs px-2 py-1 rounded bg-red-500/30 text-red-200 hover:bg-red-500/40 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveAllNotifications();
                      }}
                    >
                      Remove all
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-white/80 text-sm">No notifications</div>
                  ) : (
                    notifications.map((n, i) => (
                      <div
                        key={n._id || i}
                        className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition flex items-start gap-3 ${!n.isRead ? 'bg-white/[0.02]' : ''
                          }`}
                      >
                        <div
                          className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.isRead ? 'bg-lime-500' : 'bg-transparent'
                            }`}
                        />
                        <div className="flex-1">
                          <div className="text-sm text-white font-medium">{n.title}</div>
                          <div className="text-xs text-white/85 mt-0.5 line-clamp-2">{n.message}</div>
                          <div className="text-[10px] text-white/60 mt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar Dropdown */}
          <div className="relative" ref={avatarDropdownRef}>
            <button
              className="rounded-full focus:outline-none transition-transform active:scale-95"
              onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
              aria-label="User menu"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-white/10"
                />
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                  <User className="w-5 h-5 md:w-6 md:h-6 text-white/70" />
                </div>
              )}
            </button>

            {avatarDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 z-50 w-64 max-md:w-[min(16rem,calc(100vw-1.5rem))] bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp">
                <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-white truncate">{userInfo?.username || 'User'}</span>
                    <span className="text-[10px] text-white/40 font-medium truncate uppercase tracking-widest">
                      {userInfo?.email || 'email@example.com'}
                    </span>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAvatarDropdownOpen(false);
                      onOpenAvatarModal();
                    }}
                    className="w-full px-4 py-3 text-sm text-left text-white/70 hover:bg-white/10 flex items-center gap-3 transition-all font-bold"
                  >
                    <Camera className="w-4 h-4 text-lime-400" />
                    Change Avatar
                  </button>
                  <div className="h-px bg-white/5 mx-2 my-1"></div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAvatarDropdownOpen(false);
                      onOpenChangePasswordModal();
                    }}
                    className="w-full px-4 py-3 text-sm text-left text-white/70 hover:bg-white/10 flex items-center gap-3 transition-all font-bold"
                  >
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Reset Password
                  </button>
                  <div className="h-px bg-white/5 mx-2 my-1"></div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAvatarDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-3 text-sm text-left text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-all font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
