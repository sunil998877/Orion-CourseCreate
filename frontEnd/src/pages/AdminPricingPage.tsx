import React, { useState, useEffect } from "react";
import { Coins, Edit3, Check, X, Sparkles, Layers, FileSpreadsheet, Mic, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchAdminPricingRules, updatePricingRuleApi, AdminPricingRuleItem } from "@/services/adminService";
export default function AdminPricingPage() {
    const [skus, setSkus] = useState<AdminPricingRuleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editCost, setEditCost] = useState<number>(0);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const loadRules = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchAdminPricingRules();
            setSkus(data);
        }
        catch (err: any) {
            console.error("Failed to load pricing rules:", err);
            setError(err.message || "Failed to load pricing rules");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadRules();
    }, []);
    const startEdit = (sku: AdminPricingRuleItem) => {
        setEditingId(sku._id);
        setEditCost(sku.creditCost);
    };
    const saveEdit = async (id: string) => {
        try {
            await updatePricingRuleApi(id, { creditCost: editCost });
            setSkus((prev) => prev.map((sku) => (sku._id === id ? { ...sku, creditCost: editCost } : sku)));
            setEditingId(null);
            setSaveSuccess("Pricing Rule updated in MongoDB live!");
            setTimeout(() => setSaveSuccess(null), 3000);
        }
        catch (err: any) {
            alert("Error saving rule: " + err.message);
        }
    };
    const toggleStatus = async (sku: AdminPricingRuleItem) => {
        try {
            const newStatus = !sku.isActive;
            await updatePricingRuleApi(sku._id, { isActive: newStatus });
            setSkus((prev) => prev.map((s) => (s._id === sku._id ? { ...s, isActive: newStatus } : s)));
            setSaveSuccess(`Rule ${sku.actionKey} ${newStatus ? "Activated" : "Disabled"}`);
            setTimeout(() => setSaveSuccess(null), 2500);
        }
        catch (err: any) {
            alert("Error toggling status: " + err.message);
        }
    };
    return (<div className="space-y-8 transition-colors duration-200">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-xs font-semibold text-lime-700 dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-400">
              <Coins className="h-3.5 w-3.5"/>
              DYNAMIC PRICING RULES (SKUs)
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Live Database Pricing Rules
          </h1>
          <p className="text-xs text-slate-500 dark:text-white/60">
            Tune Orion Credit deductions per billable action directly in MongoDB without deploying code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={loadRules} disabled={loading} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 cursor-pointer">
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")}/>
            Refresh Rules
          </button>
          {saveSuccess && (<div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 animate-in fade-in">
              <Check className="h-4 w-4"/>
              {saveSuccess}
            </div>)}
        </div>
      </div>

      {error && (<div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-400 font-semibold">
          Notice: {error}
        </div>)}


      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-slate-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400"/>
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-100">Live Calibration: 1 Orion Credit = ₹1.00 INR</p>
            <p className="mt-0.5 text-blue-700 dark:text-blue-300/80">
              Changes made in this table update the MongoDB <code className="font-mono">pricingrules</code> collection instantly for all active users.
            </p>
          </div>
        </div>
      </div>


      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-200 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/50">
                <th className="px-6 py-4 font-semibold">Action / SKU</th>
                <th className="px-6 py-4 font-semibold">Action Key</th>
                <th className="px-6 py-4 font-semibold">Provider</th>
                <th className="px-6 py-4 font-semibold">Orion Credit Cost</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Live Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {skus.length > 0 ? (skus.map((sku) => {
            const isEditing = editingId === sku._id;
            return (<tr key={sku._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{sku.displayName}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-600 dark:text-white/70">
                        {sku.actionKey}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border", sku.provider === "gamma" && "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400", sku.provider === "openai" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400", sku.provider === "elevenlabs" && "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400")}>
                          {sku.provider === "gamma" && <Layers className="h-3 w-3"/>}
                          {sku.provider === "openai" && <FileSpreadsheet className="h-3 w-3"/>}
                          {sku.provider === "elevenlabs" && <Mic className="h-3 w-3"/>}
                          {sku.provider}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (<div className="flex items-center gap-2">
                            <input type="number" value={editCost} onChange={(e) => setEditCost(Number(e.target.value))} className="w-20 rounded-lg border border-lime-500 bg-white px-2 py-1 font-mono text-xs font-bold text-slate-900 outline-none dark:border-lime-400 dark:bg-slate-900 dark:text-white"/>
                            <span className="text-[11px] text-slate-400">cr</span>
                          </div>) : (<div className="font-mono text-sm font-bold text-lime-600 dark:text-lime-400">
                            {sku.creditCost} credits
                            <span className="ml-1 text-[11px] font-normal text-slate-400 dark:text-white/40">(₹{sku.creditCost})</span>
                          </div>)}
                      </td>
                      <td className="px-6 py-4">
                        <button type="button" onClick={() => toggleStatus(sku)} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer", sku.isActive
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
                    : "bg-slate-200 text-slate-600 border-slate-300 dark:bg-white/10 dark:text-white/40 dark:border-white/10")}>
                          {sku.isActive ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (<div className="flex items-center justify-end gap-1.5">
                            <button type="button" onClick={() => saveEdit(sku._id)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-500/10 text-lime-600 border border-lime-500/30 hover:bg-lime-500/20 cursor-pointer dark:text-lime-400" title="Save">
                              <Check className="h-4 w-4"/>
                            </button>
                            <button type="button" onClick={() => setEditingId(null)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 cursor-pointer dark:bg-white/5 dark:text-white/60 dark:border-white/10" title="Cancel">
                              <X className="h-4 w-4"/>
                            </button>
                          </div>) : (<button type="button" onClick={() => startEdit(sku)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10">
                            <Edit3 className="h-3.5 w-3.5"/>
                            Edit Cost
                          </button>)}
                      </td>
                    </tr>);
        })) : (<tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    {loading ? "Loading Pricing Rules from Database..." : "No Pricing Rules found."}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
