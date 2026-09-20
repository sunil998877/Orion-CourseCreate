import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE } from '../utils/api';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleAuthButtonProps {
  onSuccess?: (data: any) => void;
  text?: string;
  className?: string;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccess,
  text = 'Continue with Google',
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const navigate = useNavigate();

  const primaryClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const altClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID_ALT || '';



  const handleLoginSuccess = async (authPayload: { accessToken?: string; credential?: string; token?: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authPayload),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.removeItem('avatar');
        if (data.username) localStorage.setItem('username', data.username);
        if (data.email) localStorage.setItem('email', data.email);

        window.dispatchEvent(new Event('auth-changed'));
        toast.success(`Welcome ${data.username || ''}! Signed in with Google.`);

        if (onSuccess) {
          onSuccess(data);
        } else {
          navigate('/course-creator', { replace: true });
        }
      } else {
        toast.error(data.message || 'Google authentication failed.');
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      toast.error('Could not complete Google authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerOAuthFlow = (clientId: string, isRetry = false) => {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: (response: any) => {
          if (response.error) {
            console.warn(`Google OAuth error for ${clientId}:`, response);
            if (!isRetry && altClientId && altClientId !== clientId) {
              console.log('Retrying with alternative Google Client ID...');
              triggerOAuthFlow(altClientId, true);
              return;
            }
            setIsLoading(false);
            if (response.error !== 'popup_closed_by_user') {
              toast.error(`Google Sign-In error: ${response.error}`);
            }
            return;
          }
          if (response.access_token) {
            handleLoginSuccess({ accessToken: response.access_token });
          } else {
            setIsLoading(false);
          }
        },
      });

      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      console.error('Failed to trigger Google prompt:', err);
      if (!isRetry && altClientId && altClientId !== clientId) {
        triggerOAuthFlow(altClientId, true);
        return;
      }
      setIsLoading(false);
      toast.error('Failed to open Google sign-in window.');
    }
  };

  const handleGoogleClick = () => {
    const activeClientId = primaryClientId || altClientId;
    if (!activeClientId) {
      setShowConfigModal(true);
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      toast.info('Google services are initializing, please try again in a moment...');
      return;
    }

    console.log('[Google Auth] Current Browser Origin:', window.location.origin);
    console.log('[Google Auth] Using Google Client ID:', activeClientId);

    setIsLoading(true);
    triggerOAuthFlow(activeClientId, false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={isLoading}
        className={`w-full relative flex items-center justify-center rounded-full bg-[#18181b] hover:bg-[#27272a] border border-white/10 hover:border-white/20 py-2.5 px-4 shadow-lg transition-all duration-200 group active:scale-[0.99] disabled:opacity-50 ${className}`}
      >
        {/* Left circular Google icon badge matching screenshot */}
        <div className="absolute left-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 group-hover:scale-105">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        </div>

        {/* Center Text */}
        <span className="text-sm font-semibold text-white tracking-wide flex items-center justify-center">
          {isLoading ? (
            <>
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent align-[-0.125em]"></span>
              Connecting to Google...
            </>
          ) : (
            text
          )}
        </span>
      </button>

      {/* Helpful configuration modal if Client ID is not configured in .env */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl p-6 text-left animate-scale-in">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black text-xs font-bold">G</span>
              Google OAuth Setup
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
              To enable real Google Sign-In, please add your Google Client ID to your environment variables:
            </p>

            <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3 font-mono text-xs text-lime-400 mb-4 overflow-x-auto select-all">
              VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
            </div>

            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              You can obtain this Client ID for free in the{' '}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="text-lime-400 hover:underline"
              >
                Google Cloud Console
              </a>{' '}
              under APIs & Services &gt; Credentials &gt; OAuth 2.0 Client IDs.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleAuthButton;
