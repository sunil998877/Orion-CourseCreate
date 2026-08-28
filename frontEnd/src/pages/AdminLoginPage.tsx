import { FormEvent, useState } from 'react';
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../utils/api';
export default function AdminLoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || 'Unable to sign in');
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminEmail', data.email);
            localStorage.setItem('adminUsername', data.username || 'Administrator');
            navigate('/admin', { replace: true });
        }
        catch (loginError) {
            setError(loginError instanceof Error ? loginError.message : 'Unable to sign in');
        }
        finally {
            setLoading(false);
        }
    };
    return (<main className="flex min-h-screen items-center justify-center bg-[#070c16] px-4 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-lime-400/25 bg-lime-400/10 text-lime-300">
            <ShieldCheck className="h-6 w-6"/>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-lime-300/70">Restricted access</p>
            <h1 className="text-2xl font-bold">Admin sign in</h1>
          </div>
        </div>
        {error && <p className="mb-4 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
        <label className="mb-4 block text-sm text-white/70">
          Admin email
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"/>
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 py-3 pl-10 pr-3 text-white outline-none focus:border-lime-300/50"/>
          </div>
        </label>
        <label className="mb-6 block text-sm text-white/70">
          Admin password
          <div className="relative mt-2">
            <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"/>
            <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-white/10 bg-black/30 py-3 pl-10 pr-3 text-white outline-none focus:border-lime-300/50"/>
          </div>
        </label>
        <button disabled={loading} className="w-full rounded-lg bg-lime-300 py-3 font-bold text-slate-950 transition hover:bg-lime-200 disabled:opacity-60">
          {loading ? 'Signing in...' : 'Enter admin panel'}
        </button>
        <p className="mt-5 text-center text-xs text-white/45">
          Course creators should use the{' '}
          <a href="/login" className="text-lime-300 hover:underline">user login</a>.
        </p>
      </form>
    </main>);
}
