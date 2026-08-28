import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, ReceiptText, ArrowUpRight } from 'lucide-react';
import { getAdminTransactions } from '../services/adminService';
import { cn } from '../lib/utils';
export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const fetchTx = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAdminTransactions(typeFilter, search);
            setTransactions(Array.isArray(data) ? data : data?.transactions || []);
        }
        catch (err: any) {
            console.error('Failed to load transactions:', err);
            setError(err.message || 'Failed to load transaction ledger');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTx();
        }, 300);
        return () => clearTimeout(timer);
    }, [typeFilter, search]);
    return (<div className="space-y-8 transition-colors duration-200">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-xs font-semibold text-lime-700 dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-400">
              <ReceiptText className="h-3.5 w-3.5"/>
              FINANCIAL AUDIT LEDGER
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Live Credit Transactions Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-white/60">
            Real-time audit log of holds, charges, adjustments, and refunds recorded in MongoDB.
          </p>
        </div>

        <button onClick={fetchTx} disabled={loading} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 cursor-pointer">
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")}/>
          Refresh Ledger
        </button>
      </div>

      {error && (<div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-semibold text-amber-700 dark:text-amber-400">
          Notice: {error}
        </div>)}


      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-white/40"/>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by reference ID, reason, or user..." className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder-white/40"/>
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "RESERVE", "RECONCILE", "RECHARGE", "ADJUSTMENT", "REFUND"].map((t) => (<button key={t} type="button" onClick={() => setTypeFilter(t)} className={cn("rounded-xl px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer", typeFilter === t
                ? "bg-lime-500/10 text-lime-700 border-lime-500/30 dark:bg-lime-400/10 dark:text-lime-400 dark:border-lime-400/30"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/60")}>
              {t}
            </button>))}
        </div>
      </div>


      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/50">
                <th className="px-6 py-4 font-semibold">TX ID</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Action / Reason</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {transactions.length > 0 ? (transactions.map((tx: any) => {
            const isPositive = tx.amount > 0;
            return (<tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-500">{String(tx.id).slice(-8)}</td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {tx.user?.username || tx.user?.email || "System"}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-white/80">
                        {tx.action?.displayName || tx.reason || tx.type}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-md px-2 py-0.5 text-[10px] font-bold border border-lime-500/30 bg-lime-500/10 text-lime-600 dark:text-lime-400">
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold">
                        <span className={isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-white"}>
                          {isPositive ? `+${tx.amount}` : tx.amount} cr
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-white/70">
                          {tx.status || "COMPLETED"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>);
        })) : (<tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    {loading ? "Loading transactions from database..." : "No transactions found."}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
