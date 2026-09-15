import React, { useState, useEffect } from "react";
import {
    KeyRound,
    RefreshCw,
    ExternalLink,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Layers,
    Sparkles,
    Mic,
    ShieldCheck,
    CreditCard,
    Info,
    Edit3,
    ArrowUpRight,
    Zap,
    Clock,
    DollarSign
} from "lucide-react";
import {
    fetchAdminApiBalances,
    refreshAdminApiBalances,
    updateAdminApiBalance,
    AdminApiBalanceItem
} from "@/services/adminService";
import { cn } from "@/lib/utils";

export default function AdminApiCreditsPage() {
    const [balances, setBalances] = useState<AdminApiBalanceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editItem, setEditItem] = useState<AdminApiBalanceItem | null>(null);
    const [editBalance, setEditBalance] = useState<string>("");
    const [editQuota, setEditQuota] = useState<string>("");
    const [editThreshold, setEditThreshold] = useState<string>("");
    const [editNotes, setEditNotes] = useState<string>("");
    const [saving, setSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const loadData = async (forceLive = false) => {
        try {
            if (forceLive) setRefreshing(true);
            else setLoading(true);
            setError(null);

            const data = forceLive
                ? await refreshAdminApiBalances()
                : await fetchAdminApiBalances();

            setBalances(data);
            if (forceLive) {
                setToastMessage("Live API balances and key health refreshed successfully!");
                setTimeout(() => setToastMessage(null), 4000);
            }
        } catch (err: any) {
            console.error("Failed to load API balances:", err);
            setError(err.message || "Failed to load API balances");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData(false);
    }, []);

    const openEditModal = (item: AdminApiBalanceItem) => {
        setEditItem(item);
        setEditBalance(item.balance !== null ? String(item.balance) : "");
        setEditQuota(item.quotaLimit !== null ? String(item.quotaLimit) : "");
        setEditThreshold(String(item.lowCreditThreshold || 100));
        setEditNotes(item.meta?.adminNotes || "");
    };

    const handleSaveBalance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editItem) return;

        try {
            setSaving(true);
            const numBal = editBalance.trim() !== "" ? Number(editBalance) : undefined;
            const numQuota = editQuota.trim() !== "" ? Number(editQuota) : undefined;
            const numThresh = editThreshold.trim() !== "" ? Number(editThreshold) : undefined;

            await updateAdminApiBalance({
                provider: editItem.provider,
                balance: numBal,
                quotaLimit: numQuota,
                lowCreditThreshold: numThresh,
                notes: editNotes
            });

            setToastMessage(`Updated ${editItem.displayName} balance successfully`);
            setTimeout(() => setToastMessage(null), 4000);
            setEditItem(null);
            await loadData(false);
        } catch (err: any) {
            alert(err.message || "Failed to update balance");
        } finally {
            setSaving(false);
        }
    };

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case "gamma":
                return <Layers className="h-6 w-6 text-purple-400" />;
            case "openai":
                return <Sparkles className="h-6 w-6 text-emerald-400" />;
            case "elevenlabs":
                return <Mic className="h-6 w-6 text-sky-400" />;
            default:
                return <KeyRound className="h-6 w-6 text-lime-400" />;
        }
    };

    const getStatusBadge = (status: string, keyConfigured: boolean) => {
        if (!keyConfigured) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-500 dark:text-red-400">
                    <XCircle className="h-3.5 w-3.5" /> Not Configured
                </span>
            );
        }
        switch (status) {
            case "healthy":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Active & Healthy
                    </span>
                );
            case "low_credits":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 animate-pulse">
                        <AlertTriangle className="h-3.5 w-3.5" /> Low Credits (Recharge Soon)
                    </span>
                );
            case "exhausted":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
                        <XCircle className="h-3.5 w-3.5" /> Depleted (Recharge Needed)
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <Info className="h-3.5 w-3.5" /> Active (TTS Scoped)
                    </span>
                );
        }
    };

    const getCapacityEstimate = (item: AdminApiBalanceItem) => {
        if (item.provider === "gamma") {
            if (item.balance !== null) {
                const decks = Math.floor(item.balance / 40);
                return `~${decks} presentation decks remaining (~40 credits per 10-slide deck)`;
            }
            return "Consumes ~40 credits per slide deck generation";
        }
        if (item.provider === "elevenlabs") {
            if (item.balance !== null) {
                const chapters = Math.floor(item.balance / 2000);
                return `~${chapters} audio summaries remaining (~2,000 chars per voiceover)`;
            }
            return "Consumes ~2,000 characters per course voiceover";
        }
        if (item.provider === "openai") {
            return "Used for course syllabus outlines & summary script generations";
        }
        return "";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                        <KeyRound className="h-6 w-6 text-lime-500 dark:text-lime-400" />
                        AI Provider API Credits & Quotas
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-white/60 mt-1">
                        Monitor live API keys, check remaining generation balances, and recharge external providers (Gamma, OpenAI, ElevenLabs)
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => loadData(true)}
                        disabled={refreshing || loading}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:hover:bg-white/10 cursor-pointer"
                    >
                        <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin text-lime-400")} />
                        {refreshing ? "Checking Live APIs..." : "Refresh Live Status"}
                    </button>
                </div>
            </div>

            {/* Notification Toast */}
            {toastMessage && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {toastMessage}
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Provider Cards */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                {balances.map((item) => {
                    const hasLimit = item.quotaLimit && item.quotaLimit > 0;
                    const percent = hasLimit && item.balance !== null
                        ? Math.min(100, Math.max(0, Math.round((item.balance / item.quotaLimit!) * 100)))
                        : null;

                    const isLow = item.balance !== null && item.balance < item.lowCreditThreshold;

                    return (
                        <div
                            key={item.provider}
                            className={cn(
                                "flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all dark:bg-[#111827]/80",
                                isLow
                                    ? "border-amber-500/40 ring-1 ring-amber-500/20"
                                    : "border-slate-200 dark:border-white/10"
                            )}
                        >
                            <div className="space-y-4">
                                {/* Top row: Icon, Name, Badge */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                                            {getProviderIcon(item.provider)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                                {item.displayName}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="font-mono text-[11px] text-slate-400 dark:text-white/40">
                                                    {item.keyMasked || "No key set"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>{getStatusBadge(item.status, item.keyConfigured)}</div>
                                </div>

                                {/* Main Balance KPI */}
                                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                                    <div className="text-[11px] font-medium text-slate-500 dark:text-white/50">
                                        Current Available Balance
                                    </div>
                                    <div className="mt-1 flex items-baseline gap-2">
                                        <span className="font-mono text-2xl font-extrabold text-slate-900 dark:text-white">
                                            {item.balance !== null
                                                ? item.balance.toLocaleString()
                                                : item.keyConfigured
                                                    ? "Active"
                                                    : "—"}
                                        </span>
                                        {item.balance !== null && (
                                            <span className="text-xs font-semibold text-slate-500 dark:text-white/60">
                                                {item.unit}
                                            </span>
                                        )}
                                        {hasLimit && (
                                            <span className="text-xs text-slate-400 dark:text-white/40">
                                                / {item.quotaLimit!.toLocaleString()} limit
                                            </span>
                                        )}
                                    </div>

                                    {/* Progress bar if percentage available */}
                                    {percent !== null && (
                                        <div className="mt-3 space-y-1">
                                            <div className="flex justify-between text-[10px] font-semibold text-slate-400 dark:text-white/50">
                                                <span>Remaining Quota</span>
                                                <span>{percent}%</span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-500",
                                                        percent > 40
                                                            ? "bg-emerald-500 dark:bg-emerald-400"
                                                            : percent > 15
                                                                ? "bg-amber-500 dark:bg-amber-400"
                                                                : "bg-red-500 dark:bg-red-400"
                                                    )}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Capacity estimate helper text */}
                                    <div className="mt-2.5 text-[11px] text-slate-500 dark:text-white/60 flex items-center gap-1.5">
                                        <Zap className="h-3 w-3 text-amber-500 shrink-0" />
                                        <span>{getCapacityEstimate(item)}</span>
                                    </div>
                                </div>

                                {/* Status Details / Diagnostic */}
                                <div className="space-y-1.5 text-xs">
                                    <div className="text-[11px] text-slate-500 dark:text-white/60 flex items-start gap-1.5">
                                        <Info className="h-3.5 w-3.5 text-slate-400 dark:text-white/40 mt-0.5 shrink-0" />
                                        <span>{item.liveCheckMessage || "No live check data yet"}</span>
                                    </div>

                                    {item.lastCheckedAt && (
                                        <div className="text-[10px] text-slate-400 dark:text-white/40 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Last checked: {new Date(item.lastCheckedAt).toLocaleTimeString()}
                                            {item.meta?.latencyMs && ` (${item.meta.latencyMs}ms)`}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bottom Actions: Recharge & Edit */}
                            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                                <a
                                    href={item.rechargeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-lime-500 px-3.5 py-2 text-xs font-bold text-slate-950 transition hover:bg-lime-400 active:scale-98 shadow-sm"
                                >
                                    <span>Recharge {item.displayName.split(" ")[0]}</span>
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </a>

                                <button
                                    type="button"
                                    onClick={() => openEditModal(item)}
                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10 cursor-pointer"
                                    title="Manually sync or adjust known balance"
                                >
                                    <Edit3 className="h-3.5 w-3.5" />
                                    <span>Sync</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Explanatory Help Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]/60">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Info className="h-4 w-4 text-lime-500 dark:text-lime-400" />
                    How Orion Manages AI Provider API Balances & Recharges
                </h4>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-white/70">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-white/5 dark:bg-white/[0.02]">
                        <div className="font-bold text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1">
                            <Layers className="h-3.5 w-3.5" /> Gamma AI Presentations
                        </div>
                        <p>
                            Gamma slide generation deducts ~40 credits per 10-slide deck. Whenever a deck finishes generating, Orion captures the remaining workspace credits directly from Gamma's completion response. Click <strong>Recharge Gamma</strong> to add more slide credits on gamma.app.
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-white/5 dark:bg-white/[0.02]">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5" /> OpenAI (GPT-4o)
                        </div>
                        <p>
                            Powers syllabus creation, module generation, and script writing. OpenAI uses prepaid balances with hard auto-recharge limits. Click <strong>Recharge OpenAI</strong> to view prepaid balance and auto-reload settings on the OpenAI platform.
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-white/5 dark:bg-white/[0.02]">
                        <div className="font-bold text-sky-600 dark:text-sky-400 mb-1 flex items-center gap-1">
                            <Mic className="h-3.5 w-3.5" /> ElevenLabs Voice Synthesizer
                        </div>
                        <p>
                            Generates voice narration (~1,500–2,000 characters per lesson). If your API key has the <code>user_read</code> permission in ElevenLabs, Orion automatically queries and displays the live remaining character count. Click <strong>Recharge ElevenLabs</strong> to upgrade or top up.
                        </p>
                    </div>
                </div>
            </div>

            {/* Manual Sync Modal */}
            {editItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/15 dark:bg-[#111827]">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Edit3 className="h-5 w-5 text-lime-500" />
                            Sync {editItem.displayName} Balance
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-white/60 mt-1">
                            Manually record your newly recharged balance or adjust the low-credit alert threshold.
                        </p>

                        <form onSubmit={handleSaveBalance} className="mt-5 space-y-4 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 dark:text-white/80 block mb-1">
                                    Current Available Balance ({editItem.unit})
                                </label>
                                <input
                                    type="number"
                                    value={editBalance}
                                    onChange={(e) => setEditBalance(e.target.value)}
                                    placeholder="e.g. 5000"
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white outline-none focus:border-lime-500"
                                />
                                <span className="text-[10px] text-slate-400 dark:text-white/40 mt-1 block">
                                    Leave blank to keep unassigned.
                                </span>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 dark:text-white/80 block mb-1">
                                    Quota Limit (optional)
                                </label>
                                <input
                                    type="number"
                                    value={editQuota}
                                    onChange={(e) => setEditQuota(e.target.value)}
                                    placeholder="e.g. 30000"
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white outline-none focus:border-lime-500"
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 dark:text-white/80 block mb-1">
                                    Low-Credit Alert Warning Threshold
                                </label>
                                <input
                                    type="number"
                                    value={editThreshold}
                                    onChange={(e) => setEditThreshold(e.target.value)}
                                    placeholder="e.g. 200"
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white outline-none focus:border-lime-500"
                                />
                                <span className="text-[10px] text-slate-400 dark:text-white/40 mt-1 block">
                                    When balance falls below this number, admin will see a "Recharge Soon" warning.
                                </span>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 dark:text-white/80 block mb-1">
                                    Recharge Notes / Plan details
                                </label>
                                <input
                                    type="text"
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    placeholder="e.g. Recharged $50 on Sept 15"
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white outline-none focus:border-lime-500"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditItem(null)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-lime-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-lime-400 disabled:opacity-50 cursor-pointer"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
