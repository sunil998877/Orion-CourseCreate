import { useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE } from '../utils/api';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setError('');
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Password updated successfully!');
        handleClose();
      } else {
        setError(data.message || 'Failed to update password');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0e1320] border border-white/10 shadow-2xl p-6 md:p-8 animate-scale-in">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-white bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
              Update Password
            </h3>
            <p className="text-xs text-white/70">
              Verify your current password to secure your account and set a new password.
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-500/10 p-3 border border-red-500/30 text-sm text-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="current-password" className="mb-1 block text-xs font-medium text-white/80">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <Lock size={16} />
              </div>
              <input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                required
                value={formData.currentPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                className="block w-full rounded-lg border border-white/10 bg-black px-3 py-2 pl-10 pr-10 text-white placeholder:text-gray-700 focus:border-lime-500/50 focus:outline-none focus:ring-1 focus:ring-lime-500/30"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="new-password" className="mb-1 block text-xs font-medium text-white/80">
              New Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <Lock size={16} />
              </div>
              <input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                required
                value={formData.newPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="block w-full rounded-lg border border-white/10 bg-black px-3 py-2 pl-10 pr-10 text-white placeholder:text-gray-700 focus:border-lime-500/50 focus:outline-none focus:ring-1 focus:ring-lime-500/30"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="mb-1 block text-xs font-medium text-white/80">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <Lock size={16} />
              </div>
              <input
                id="confirm-new-password"
                type={showNewPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="block w-full rounded-lg border border-white/10 bg-black px-3 py-2 pl-10 pr-10 text-white placeholder:text-gray-700 focus:border-lime-500/50 focus:outline-none focus:ring-1 focus:ring-lime-500/30"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm font-semibold text-white hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-gradient-to-r from-lime-400 to-emerald-500 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-lime-300 hover:to-emerald-400 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
