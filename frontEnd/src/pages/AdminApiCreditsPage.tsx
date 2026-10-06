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
    ArrowUpRight,
    Zap,
    Clock,
    Plus,
    Video,
    Sliders
} from "lucide-react";
import {
    fetchAdminApiBalances,
    refreshAdminApiBalances,
    updateAdminApiKey,
    updateAdminApiBalance,
    AdminApiBalanceItem
} from "@/services/adminService";
import { cn } from "@/lib/utils";

export default function AdminApiCreditsPage() {
    const [balances, setBalances] = useState<AdminApiBalanceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [keyModalItem, setKeyModalItem] = useState<AdminApiBalanceItem | null>(null);
    const [newApiKey, setNewApiKey] = useState("");
    const [savingKey, setSavingKey] = useState(false);

    const [balanceModalItem, setBalanceModalItem] = useState<AdminApiBalanceItem | null>(null);
    const [newBalance, setNewBalance] = useState("");
    const [newQuotaLimit, setNewQuotaLimit] = useState("");
    const [savingBalance, setSavingBalance] = useState(false);

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

    const openBalanceModal = (item: AdminApiBalanceItem) => {
        setBalanceModalItem(item);
        setNewBalance(String(item.balance ?? 0));
        setNewQuotaLimit(item.quotaLimit ? String(item.quotaLimit) : "");
    };

    const handleSaveBalance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!balanceModalItem) return;

        try {
            setSavingBalance(true);
            const balNum = parseInt(newBalance, 10);
            const quotaNum = newQuotaLimit ? parseInt(newQuotaLimit, 10) : undefined;
            await updateAdminApiBalance({
                provider: balanceModalItem.provider,
                balance: isNaN(balNum) ? 0 : balNum,
                quotaLimit: quotaNum && !isNaN(quotaNum) ? quotaNum : undefined,
            });

            setToastMessage(`Balance for ${balanceModalItem.displayName} updated successfully`);
            setTimeout(() => setToastMessage(null), 4000);
            setBalanceModalItem(null);
            await loadData(false);
        } catch (err: any) {
            alert(err.message || "Failed to update balance");
        } finally {
            setSavingBalance(false);
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
            case "heygen":
                return <Video className="h-6 w-6 text-indigo-400" />;
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
                        <XCircle className="h-3.5 w-3.5" /> Out of Credits
                    </span>
                );
            case "action_required":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="h-3.5 w-3.5" /> Action Required
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
        if (bal <= 0 || item.status === "exhausted") {
            return "0 operations remaining (Out of credits — recharge required)";
        }
        if (item.provider === "gamma") {
            const decks = Math.floor(bal / 40);
            return `~${decks.toLocaleString()} presentation decks remaining (~40 credits per 10-slide deck)`;
        }
        if (item.provider === "elevenlabs") {
            const chapters = Math.floor(bal / 2000);
            return `~${chapters.toLocaleString()} audio voiceovers remaining (~2,000 chars per voiceover)`;
        }
        if (item.provider === "openai") {
            const ops = Math.floor(bal / 1500);
            return `~${ops.toLocaleString()} script & outline operations (~1,500 tokens each)`;
        }
        if (item.provider === "heygen") {
            const vids = Math.floor(bal / 1);
            return `~${vids.toLocaleString()} video minutes remaining (~1 credit per video minute)`;
        }
        return "";
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
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

            <div className="w-full grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {balances.map((item) => {
                    const hasLimit = item.quotaLimit && item.quotaLimit > 0;
                    const balanceNum = item.balance !== null && item.balance !== undefined ? item.balance : 0;
                    const isExhausted = item.status === "exhausted" || balanceNum <= 0;
                    const percent = hasLimit
                        ? isExhausted
                            ? 0
                            : Math.min(100, Math.max(0, Math.round((balanceNum / item.quotaLimit!) * 100)))
                        : null;

                    const isLow = !isExhausted && balanceNum < item.lowCreditThreshold;
                    const rawUnit = (item.unit || "units").trim();
                    const normalizedUnit = rawUnit.toLowerCase().includes("token") ? "tokens" : rawUnit;

                    return (
                        <div
                            key={item.provider}
                            className={cn(
                                "flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition-all dark:bg-[#111827]/80 w-full",
                                isExhausted
                                    ? "border-red-500/50 ring-1 ring-red-500/20 bg-red-500/[0.02]"
                                    : isLow
                                        ? "border-amber-500/40 ring-1 ring-amber-500/20"
                                        : "border-slate-200 dark:border-white/10"
                            )}
                        >
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-2.5">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 dark:border-white/10 dark:bg-white/5 shrink-0">
                                            {getProviderIcon(item.provider)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight" title={item.displayName}>
                                                {item.displayName}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="shrink-0">{getStatusBadge(item.status, item.keyConfigured)}</div>
                                </div>

                                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-medium text-slate-500 dark:text-white/50">
                                            Current Available Balance
                                        </span>
                                    </div>

                                    <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className={cn(
                                                "font-mono text-2xl xl:text-3xl font-extrabold tracking-tight",
                                                isExhausted ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"
                                            )}>
                                                {balanceNum.toLocaleString()}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-500 dark:text-white/60 uppercase">
                                                {normalizedUnit}
                                            </span>
                                        </div>
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
                                                <span className={isExhausted ? "text-red-500 font-bold" : ""}>{percent}%</span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-500",
                                                        isExhausted
                                                            ? "bg-red-500 dark:bg-red-400"
                                                            : percent > 40
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

                                    <div className="mt-3 text-[11px] text-slate-500 dark:text-white/60 flex items-start gap-1.5">
                                        <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                                        <span className="leading-snug">{getCapacityEstimate(item)}</span>
                                    </div>
                                </div>

                                <div className="space-y-1 text-xs">
                                    <div className={cn("text-[11px] flex items-start gap-1.5", isExhausted ? "text-red-600 dark:text-red-400 font-medium" : "text-slate-500 dark:text-white/60")}>
                                        {isExhausted ? (
                                            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                                        ) : (
                                            <Info className="h-3.5 w-3.5 text-slate-400 dark:text-white/40 mt-0.5 shrink-0" />
                                        )}
                                        <span className="line-clamp-2">{item.liveCheckMessage || (isExhausted ? "Quota exhausted. Recharge required." : "Ready")}</span>
                                    </div>

                                    {item.lastCheckedAt && (
                                        <div className="text-[10px] text-slate-400 dark:text-white/40 flex items-center gap-1">
                                            <Clock className="h-3 w-3 shrink-0" />
                                            Last checked: {new Date(item.lastCheckedAt).toLocaleTimeString()}
                                            {item.meta?.latencyMs && ` (${item.meta.latencyMs}ms)`}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
                                <a
                                    href={item.rechargeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition shadow-sm",
                                        isExhausted
                                            ? "bg-red-600 text-white hover:bg-red-500 active:scale-98"
                                            : "bg-lime-500 text-slate-950 hover:bg-lime-400 active:scale-98"
                                    )}
                                >
                                    <span>Recharge {item.displayName.split(" ")[0]}</span>
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </a>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openBalanceModal(item)}
                                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10 cursor-pointer shadow-sm transition"
                                        title="Manually adjust or reset balance"
                                    >
                                        <Sliders className="h-3.5 w-3.5" />
                                        <span>Edit Balance</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openKeyModal(item)}
                                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10 cursor-pointer shadow-sm transition"
                                        title="Add or update API key"
                                    >
                                        <KeyRound className="h-3.5 w-3.5" />
                                        <span>Change Key</span>
                                    </button>
                                </div>
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
                                                    : keyModalItem.provider === "heygen"
                                                        ? "sk_V2_..."
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

            {balanceModalItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/15 dark:bg-[#111827]">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Sliders className="h-5 w-5 text-lime-500" />
                            Edit {balanceModalItem.displayName} Balance
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-white/60 mt-1">
                            Manually adjust the available balance and quota limit for this provider.
                        </p>

                        <form onSubmit={handleSaveBalance} className="mt-5 space-y-4 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 dark:text-white/80 block mb-1">
                                    Current Available Balance ({balanceModalItem.unit})
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={newBalance}
                                    onChange={(e) => setNewBalance(e.target.value)}
                                    placeholder="0"
                                    className="w-full font-mono rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white outline-none focus:border-lime-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 dark:text-white/80 block mb-1">
                                    Quota Limit (Optional)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={newQuotaLimit}
                                    onChange={(e) => setNewQuotaLimit(e.target.value)}
                                    placeholder="1000000"
                                    className="w-full font-mono rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white outline-none focus:border-lime-500"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setBalanceModalItem(null)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingBalance}
                                    className="rounded-xl bg-lime-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-lime-400 disabled:opacity-50 cursor-pointer"
                                >
                                    {savingBalance ? "Saving..." : "Save Balance"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
}
