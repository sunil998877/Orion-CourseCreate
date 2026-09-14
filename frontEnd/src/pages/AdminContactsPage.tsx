import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Mail, Trash2, Eye } from 'lucide-react';
import { fetchAdminContacts, updateAdminContactStatus, deleteAdminContact } from '../services/adminService';
import { cn } from '../lib/utils';

const STATUS_OPTIONS = ['ALL', 'new', 'read', 'replied', 'archived'] as const;

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminContacts(search, statusFilter);
      setContacts(data.contacts || []);
    } catch (err: any) {
      console.error('Failed to load contacts:', err);
      setError(err.message || 'Failed to load contact submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContacts();
    }, 300);
    return () => clearTimeout(timer);
  }, [statusFilter, search]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setBusyId(id);
      await updateAdminContactStatus(id, status);
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
      if (selected?.id === id) setSelected({ ...selected, status });
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this contact submission?')) return;
    try {
      setBusyId(id);
      await deleteAdminContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete contact');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8 transition-colors duration-200">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-xs font-semibold text-lime-700 dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-400">
              <Mail className="h-3.5 w-3.5" />
              LANDING INQUIRIES
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Contact Form Submissions
          </h1>
          <p className="text-xs text-slate-500 dark:text-white/60">
            Messages submitted from the ORION landing page contact form.
          </p>
        </div>

        <button
          onClick={fetchContacts}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 cursor-pointer"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-semibold text-amber-700 dark:text-amber-400">
          Notice: {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, email, phone..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder-white/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setStatusFilter(t)}
              className={cn(
                'rounded-xl px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer capitalize',
                statusFilter === t
                  ? 'bg-lime-500/10 text-lime-700 border-lime-500/30 dark:bg-lime-400/10 dark:text-lime-400 dark:border-lime-400/30'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/60'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/50">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Company</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {contacts.length > 0 ? (
                contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{c.fullName}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-white/80">{c.company}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-white/80">{c.email}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-white/80">{c.phone}</td>
                    <td className="px-6 py-4">
                      <select
                        value={c.status}
                        disabled={busyId === c.id}
                        onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs capitalize dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        <option value="new">new</option>
                        <option value="read">read</option>
                        <option value="replied">replied</option>
                        <option value="archived">archived</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(c);
                            if (c.status === 'new') handleStatusChange(c.id, 'read');
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                        <button
                          type="button"
                          disabled={busyId === c.id}
                          onClick={() => handleDelete(c.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-white/50">
                    {loading ? 'Loading contact submissions...' : 'No contact submissions yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#0b1220]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selected.fullName}</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
              {selected.company} · {selected.email} · {selected.phone}
            </p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/80 whitespace-pre-wrap">
              {selected.message || 'No message provided.'}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl bg-lime-500 px-4 py-2 text-xs font-bold text-black hover:bg-lime-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
