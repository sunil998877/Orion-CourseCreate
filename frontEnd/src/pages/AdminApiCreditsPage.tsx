import React, { useState, useEffect } from "react";
import {
    KeyRound,
    RefreshCw,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Layers,
    Sparkles,
    Mic,
    Info,
    Edit3,
    ArrowUpRight,
    Zap,
    Clock,
    Eye,
    EyeOff,
    Copy,
    Check,
    Plus
} from "lucide-react";
import {
    fetchAdminApiBalances,
    refreshAdminApiBalances,
    updateAdminApiBalance,
    updateAdminApiKey,
    AdminApiBalanceItem
} from "@/services/adminService";
import { cn } from "@/lib/utils";

export default function AdminApiCreditsPage() {
    const [balances, setBalances] = useState<AdminApiBalanceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const [keyModalItem, setKeyModalItem] = useState<AdminApiBalanceItem | null>(null);
    const [newApiKey, setNewApiKey] = useState("");
    const [savingKey, setSavingKey] = useState(false);

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
                setToastMessage("Live API balances and key health refreshed successfully");
                setTimeout(() => setToastMessage(null), 3500);
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

    const toggleRevealKey = (provider: string) => {
        setRevealedKeys(prev => ({
            ...prev,
            [provider]: !prev[provider]
        }));
    };

    const handleCopyKey = async (provider: string, keyVal?: string) => {
        if (!keyVal) return;
        try {
            await navigator.clipboard.writeText(keyVal);
            setCopiedKey(provider);
            setTimeout(() => setCopiedKey(null), 2000);
        } catch (_) {}
    };

    const openKeyModal = (item: AdminApiBalanceItem) => {
        setKeyModalItem(item);
        setNewApiKey(item.keyFull || "");
    };

    const handleSaveApiKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyModalItem || !newApiKey.trim()) return;

        try {
            setSavingKey(true);
            await updateAdminApiKey({
                provider: keyModalItem.provider,
                apiKey: newApiKey.trim()
            });

            setToastMessage(`API key for ${keyModalItem.displayName} updated successfully`);
            setTimeout(() => setToastMessage(null), 4000);
            setKeyModalItem(null);
            await loadData(false);
        } catch (err: any) {
            alert(err.message || "Failed to update API key");
        } finally {
            setSavingKey(false);
        }
    };

    const openEditModal = (item: AdminApiBalanceItem) => {
        setEditItem(item);
        setEditBalance(item.balance !== null && item.balance !== undefined ? String(item.balance) : "0");
        setEditQuota(item.quotaLimit !== null && item.quotaLimit !== undefined ? String(item.quotaLimit) : "");
        setEditThreshold(String(item.lowCreditThreshold || 100));
        setEditNotes(item.meta?.adminNotes || "");
    };

    const handleSaveBalance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editItem) return;

        try {
            setSaving(true);
            const numBal = editBalance.trim() !== "" ? Number(editBalance) : 0;
            const numQuota = editQuota.trim() !== "" ? Number(editQuota) : undefined;
            const numThresh = editThreshold.trim() !== "" ? Number(editThreshold) : undefined;

            await updateAdminApiBalance({
                provider: editItem.provider,
                balance: numBal,
                quotaLimit: numQuota,
                lowCreditThreshold: numThresh,
                notes: editNotes
            });

            setToastMessage(`Updated ${editItem.displayName} balance to ${numBal.toLocaleString()} ${editItem.unit}`);
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
                        <AlertTriangle className="h-3.5 w-3.5" /> Low Credits
                    </span>
                );
            case "exhausted":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
                        <XCircle className="h-3.5 w-3.5" /> Depleted
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Active
                    </span>
                );
        }
    };

    const getCapacityEstimate = (item: AdminApiBalanceItem) => {
        const bal = item.balance ?? 0;
        if (item.provider === "gamma") {
            const decks = Math.floor(bal / 40);
            return `~${decks} presentation decks remaining (~40 credits per 10-slide deck)`;
        }
        if (item.provider === "elevenlabs") {
            const chapters = Math.floor(bal / 2000);
            return `~${chapters} audio voiceovers remaining (~2,000 chars per voiceover)`;
        }
        if (item.provider === "openai") {
            return `~${Math.floor(bal / 1500)} script & outline operations (~1,500 tokens each)`;
        }
        return "";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                        <KeyRound className="h-6 w-6 text-lime-500 dark:text-lime-400" />
                        AI Provider API Credits & Quotas
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-white/60 mt-1">
                        View API keys, update credentials, monitor remaining generation credits, and recharge external providers
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

            {toastMessage && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {toastMessage}
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                {balances.map((item) => {
                    const hasLimit = item.quotaLimit && item.quotaLimit > 0;
                    const balanceNum = item.balance !== null && item.balance !== undefined ? item.balance : 0;
                    const percent = hasLimit
                        ? Math.min(100, Math.max(0, Math.round((balanceNum / item.quotaLimit!) * 100)))
                        : null;

                    const isLow = balanceNum < item.lowCreditThreshold;
                    const isRevealed = Boolean(revealedKeys[item.provider]);
                    const keyToDisplay = isRevealed
                        ? (item.keyFull || item.keyMasked)
                        : item.keyMasked;

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
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 dark:border-white/10 dark:bg-white/5 shrink-0">
                                            {getProviderIcon(item.provider)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                                {item.displayName}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="font-mono text-[11px] text-slate-500 dark:text-white/60 select-all">
                                                    {keyToDisplay || "No key configured"}
                                                </span>

                                                {item.keyConfigured && (
                                                    <div className="flex items-center gap-1 ml-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleRevealKey(item.provider)}
                                                            className="p-1 text-slate-400 hover:text-slate-700 dark:text-white/40 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                                                            title={isRevealed ? "Hide API key" : "View full API key"}
                                                        >
                                                            {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>{getStatusBadge(item.status, item.keyConfigured)}</div>
                                </div>

                                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-medium text-slate-500 dark:text-white/50">
                                            Current Available Balance
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(item)}
                                            className="inline-flex items-center gap-1 text-[11px] font-bold text-lime-600 hover:text-lime-700 dark:text-lime-400 dark:hover:underline cursor-pointer"
                                        >
                                            <Edit3 className="h-3 w-3" /> Edit Balance
                                        </button>
                                    </div>

                                    <div className="mt-1.5 flex items-baseline gap-2">
                                        <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                            {balanceNum.toLocaleString()}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-500 dark:text-white/60 uppercase">
                                            {item.unit}
                                        </span>
                                        {hasLimit && (
                                            <span className="text-xs text-slate-400 dark:text-white/40">
                                                / {item.quotaLimit!.toLocaleString()} limit
                                            </span>
                                        )}
                                    </div>

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

                                    <div className="mt-3 text-[11px] text-slate-500 dark:text-white/60 flex items-center gap-1.5">
                                        <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                        <span>{getCapacityEstimate(item)}</span>
                                    </div>
                                </div>

                                <div className="space-y-1 text-xs">
                                    <div className="text-[11px] text-slate-500 dark:text-white/60 flex items-start gap-1.5">
                                        <Info className="h-3.5 w-3.5 text-slate-400 dark:text-white/40 mt-0.5 shrink-0" />
                                        <span>{item.liveCheckMessage || "Ready"}</span>
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

                            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center gap-2">
                                <a
                                    href={item.rechargeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-lime-500 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-lime-400 active:scale-98 shadow-sm"
                                >
                                    <span>Recharge {item.displayName.split(" ")[0]}</span>
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </a>

                                <button
                                    type="button"
                                    onClick={() => openKeyModal(item)}
                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10 cursor-pointer"
                                    title="Add or update API key"
                                >
                                    <KeyRound className="h-3.5 w-3.5" />
                                    <span>Change Key</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {keyModalItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/15 dark:bg-[#111827]">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-lime-500" />
                            Add / Update {keyModalItem.displayName} API Key
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-white/60 mt-1">
                            Paste your API key below. It will be verified and stored for generation tasks.
                        </p>

                        <form onSubmit={handleSaveApiKey} className="mt-5 space-y-4 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 dark:text-white/80 block mb-1">
                                    API Key
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newApiKey}
                                        onChange={(e) => setNewApiKey(e.target.value)}
                                        placeholder={
                                            keyModalItem.provider === "gamma"
                                                ? "sk-gamma-..."
                                                : keyModalItem.provider === "elevenlabs"
                                                    ? "sk_..."
                                                    : "sk-proj-..."
                                        }
                                        className="w-full font-mono rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white outline-none focus:border-lime-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setKeyModalItem(null)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingKey}
                                    className="rounded-xl bg-lime-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-lime-400 disabled:opacity-50 cursor-pointer"
                                >
                                    {savingKey ? "Verifying..." : "Save & Verify Key"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/15 dark:bg-[#111827]">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Edit3 className="h-5 w-5 text-lime-500" />
                            Update {editItem.displayName} Credit Balance
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-white/60 mt-1">
                            Set the current available number of credits / quota for this provider.
                        </p>

                        <form onSubmit={handleSaveBalance} className="mt-5 space-y-4 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 dark:text-white/80 block mb-1">
                                    Current Number of Credits ({editItem.unit})
                                </label>
                                <input
                                    type="number"
                                    value={editBalance}
                                    onChange={(e) => setEditBalance(e.target.value)}
                                    placeholder="e.g. 5000"
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white outline-none focus:border-lime-500"
                                    required
                                />
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
                                    Low-Credit Warning Alert Threshold
                                </label>
                                <input
                                    type="number"
                                    value={editThreshold}
                                    onChange={(e) => setEditThreshold(e.target.value)}
                                    placeholder="e.g. 200"
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white outline-none focus:border-lime-500"
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 dark:text-white/80 block mb-1">
                                    Recharge Notes (optional)
                                </label>
                                <input
                                    type="text"
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    placeholder="e.g. Recharged $50"
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
                                    {saving ? "Saving..." : "Save Balance"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
