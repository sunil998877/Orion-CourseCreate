import React, { useEffect, useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Camera,
  Moon,
  Sun,
  Mail,
  LogOut,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contextAPI/ThemeContext';
import { cn } from '../lib/utils';
import ChangePasswordModal from '../layout/ChangePasswordModal';
import AvatarCropModal from '../components/AvatarCropModal';
import { API_BASE, ORIGIN } from '../utils/api';
import PageTransition from '../components/PageTransition';

function resolveAvatarUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
  return `${ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { isDark, setTheme } = useTheme();
  const [username, setUsername] = useState(() => localStorage.getItem('username') || 'User');
  const [email, setEmail] = useState(() => localStorage.getItem('email') || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() =>
    resolveAvatarUrl(localStorage.getItem('avatar'))
  );
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saved, setSaved] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoadingProfile(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const user = await res.json();
          if (user.username) {
            setUsername(user.username);
            localStorage.setItem('username', user.username);
          }
          if (user.email) {
            setEmail(user.email);
            localStorage.setItem('email', user.email);
          }
          if (user.avatar) {
            const resolved = resolveAvatarUrl(user.avatar);
            setAvatarUrl(resolved);
            localStorage.setItem('avatar', user.avatar);
          }
        }
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const handleThemeSave = (theme: 'light' | 'dark') => {
    setTheme(theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarCropped = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/profile/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('avatar', data.avatar);
        setAvatarUrl(resolveAvatarUrl(data.avatar));
        setAvatarOpen(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Avatar upload failed', error);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('courseStatus');
    localStorage.removeItem('avatar');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    navigate('/');
  };

  return (
    <PageTransition>
      <div className="w-full space-y-6 pb-10">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-6 md:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-lime-500/10 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-lime-400">
              <Settings className="h-3.5 w-3.5" />
              Account
            </span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white md:text-3xl">Settings</h1>
            <p className="mt-1 text-sm text-white/50">Manage your profile, security, and appearance.</p>
          </div>
        </div>

        {saved && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Preferences updated.
          </div>
        )}

        <section className="rounded-2xl border border-white/10 bg-[#0e1522]/80 p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <User className="h-4 w-4 text-lime-400" />
              Profile
            </h2>
            {loadingProfile && <Loader2 className="h-4 w-4 animate-spin text-white/40" />}
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="h-16 w-16 rounded-full border border-white/15 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-lime-500/30 bg-lime-500/10 text-lg font-bold text-lime-300">
                    {getInitials(username)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-white">{username}</p>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-white/50">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {email || 'No email on file'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAvatarOpen(true)}
              disabled={uploading}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-lime-500/30 bg-lime-500/10 px-4 py-2.5 text-xs font-bold text-lime-400 transition hover:bg-lime-500/20 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              Change Avatar
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0e1522]/80 p-5 md:p-6">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
            <Shield className="h-4 w-4 text-lime-400" />
            Security
          </h2>
          <p className="mb-4 text-xs text-white/50">Update your password to keep your account secure.</p>
          <button
            type="button"
            onClick={() => setPasswordOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-lime-500/30 bg-lime-500/10 px-4 py-2.5 text-xs font-bold text-lime-400 transition hover:bg-lime-500/20"
          >
            <Shield className="h-4 w-4" />
            Reset Password
          </button>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0e1522]/80 p-5 md:p-6">
          <h2 className="mb-2 text-sm font-bold text-white">Appearance</h2>
          <p className="mb-4 text-xs text-white/50">Choose light or dark mode for this browser.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleThemeSave('light')}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                !isDark
                  ? 'border-lime-500 bg-lime-500/10 shadow-[0_0_20px_rgba(163,230,53,0.12)]'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20'
              )}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15">
                <Sun className="h-5 w-5 text-amber-400" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-white">Light</span>
                <span className="block text-[11px] text-white/50">Bright panels</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleThemeSave('dark')}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                isDark
                  ? 'border-lime-400 bg-lime-400/10 shadow-[0_0_20px_rgba(163,230,53,0.12)]'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20'
              )}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/15">
                <Moon className="h-5 w-5 text-indigo-300" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-white">Dark</span>
                <span className="block text-[11px] text-white/50">Navy panels</span>
              </span>
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-5 md:p-6">
          <h2 className="mb-2 text-sm font-bold text-white">Session</h2>
          <p className="mb-4 text-xs text-white/50">Sign out of ORION on this device.</p>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400 transition hover:bg-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </section>

        <ChangePasswordModal isOpen={passwordOpen} onClose={() => setPasswordOpen(false)} />
        <AvatarCropModal
          open={avatarOpen}
          onClose={() => setAvatarOpen(false)}
          onCropped={handleAvatarCropped}
        />
      </div>
    </PageTransition>
  );
}
