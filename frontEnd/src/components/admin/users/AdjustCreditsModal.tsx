import React, { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminUserItem, adjustUserCreditsApi } from "@/services/adminService";

interface AdjustCreditsModalProps {
  user: AdminUserItem | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const AdjustCreditsModal: React.FC<AdjustCreditsModalProps> = ({
  user,
  onClose,
  onSuccess,
}) => {
  const [adjustType, setAdjustType] = useState<"ADD" | "DEDUCT">("ADD");
  const [adjustAmount, setAdjustAmount] = useState<number>(100);
  const [adjustReason, setAdjustReason] = useState("SUPPORT_COMPENSATION");
  const [customNote, setCustomNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustAmount <= 0) return;

    try {
      setIsSubmitting(true);
      const finalAmount = adjustType === "ADD" ? adjustAmount : -adjustAmount;
      await adjustUserCreditsApi({
        userId: user.id,
        amount: finalAmount,
        reason: adjustReason,
        notes: customNote,
      });

      onSuccess(
        `Successfully ${adjustType === "ADD" ? "credited" : "deducted"} ${adjustAmount} credits for ${user.username}`
      );
      onClose();
    } catch (err: any) {
      alert("Adjustment failed: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0b1220] dark:text-white">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Manual Credit Adjustment</h3>
            <p className="text-xs text-slate-500 dark:text-white/50">{user.username} ({user.email})</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-white/70">Adjustment Direction</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType("ADD")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-colors cursor-pointer",
                  adjustType === "ADD"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
                    : "border-slate-200 text-slate-600 dark:border-white/10 dark:text-white/60"
                )}
              >
                <Plus className="h-3.5 w-3.5" /> Credit Wallet (+)
              </button>
              <button
                type="button"
                onClick={() => setAdjustType("DEDUCT")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-colors cursor-pointer",
                  adjustType === "DEDUCT"
                    ? "border-red-500 bg-red-500/10 text-red-600 dark:border-red-400 dark:text-red-400"
                    : "border-slate-200 text-slate-600 dark:border-white/10 dark:text-white/60"
                )}
              >
                <Minus className="h-3.5 w-3.5" /> Deduct Wallet (-)
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-white/70">Amount (Orion Credits)</label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(Number(e.target.value))}
                required
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-sm font-bold text-slate-900 outline-none focus:border-lime-500 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-lime-400"
              />
              <span className="text-xs font-semibold text-slate-500 dark:text-white/50">≈ ₹{adjustAmount}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-white/70">Audit Reason</label>
            <select
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 outline-none dark:border-white/10 dark:bg-[#0b1220] dark:text-white"
            >
              <option value="SUPPORT_COMPENSATION">Support: Failed Job Compensation</option>
              <option value="GOODWILL_BONUS">Goodwill / Promotional Bonus</option>
              <option value="MANUAL_CORRECTION">Correction of Overcharge</option>
              <option value="MANUAL_PENALTY">Policy Violation Deduct</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-white/70">Internal Audit Note (Optional)</label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Ticket #4892 Gamma slide timeout"
              className="mt-1.5 h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 placeholder-slate-400 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-white/40"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-lime-500 px-4 py-2 text-xs font-bold text-black hover:bg-lime-400 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSubmitting ? "Writing Ledger..." : "Confirm & Write to MongoDB"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
