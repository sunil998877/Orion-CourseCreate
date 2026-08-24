import {
  ShieldCheck,
  BookOpen,
  Layers,
  FileSpreadsheet,
  Mic,
  Eye,
  Plus,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminUserItem } from "@/services/adminService";

interface UsersTableProps {
  users: AdminUserItem[];
  loading: boolean;
  onViewDetails: (user: AdminUserItem) => void;
  onAdjustCredits: (user: AdminUserItem) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading,
  onViewDetails,
  onAdjustCredits,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-200 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/50">
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Plan & Recharges</th>
              <th className="px-6 py-4 font-semibold">Courses Created</th>
              <th className="px-6 py-4 font-semibold">Live Balance</th>
              <th className="px-6 py-4 font-semibold">Lifetime Spent</th>
              <th className="px-6 py-4 font-semibold">Data Consumed</th>
              <th className="px-6 py-4 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {users.length > 0 ? (
              users.map((user) => {
                const balance = user.wallet?.balance || 0;
                const reserved = user.wallet?.reserved || 0;
                const lifetimeUsed = user.wallet?.lifetimeUsed || 0;
                const planName = user.wallet?.plan?.name || "Free";
                const coursesCount = user.courseCount ?? 0;
                const rechargeCount = user.rechargeCount ?? 0;
                const totalRechargedINR = user.totalRechargedINR ?? 0;
                const planSubCount = user.planSubscriptionCount ?? 0;

                // Derived raw data estimation based on lifetime spent
                const gammaCredits = user.gammaCreditsSpent || 0;
                const openaiCredits = user.openaiCreditsSpent || 0;
                const audioCredits = user.audioCreditsSpent || 0;

                return (
                  <tr
                    key={user.id}
                    onClick={() => onViewDetails(user)}
                    className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-500/10 font-bold text-lime-700 dark:bg-lime-400/10 dark:text-lime-400 border border-lime-500/20">
                          {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-lime-600 dark:text-white dark:group-hover:text-lime-400 transition-colors flex items-center gap-1.5">
                            {user.username}
                            {user.isVerified && (
                              <span title="Verified User" className="inline-flex items-center">
                                <ShieldCheck className="h-3.5 w-3.5 text-lime-500" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-white/40">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span
                          className={cn(
                            "inline-block rounded-md px-2 py-0.5 text-[10px] font-bold border",
                            planName === "Team" &&
                              "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
                            planName === "Pro" &&
                              "bg-lime-500/10 text-lime-700 border-lime-500/30 dark:text-lime-400",
                            planName === "Free" &&
                              "bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/10 dark:text-white/60 dark:border-white/10"
                          )}
                        >
                          {planName} Plan
                        </span>

                        <div className="flex flex-wrap items-center gap-1">
                          {rechargeCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-lime-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-lime-700 dark:text-lime-400 border border-lime-500/20">
                              <Zap className="h-2.5 w-2.5" />
                              {rechargeCount} Top-up{rechargeCount > 1 ? "s" : ""} (₹{totalRechargedINR})
                            </span>
                          )}
                          {planSubCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-purple-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              <Layers className="h-2.5 w-2.5" />
                              {planSubCount} Plan{planSubCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                        <BookOpen className="h-3.5 w-3.5 text-lime-500" />
                        {coursesCount} {coursesCount === 1 ? "Course" : "Courses"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {balance.toLocaleString()} cr
                      </div>
                      {reserved > 0 ? (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          ({reserved} cr hold)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-white/40">Ready</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-bold text-lime-600 dark:text-lime-400">
                      {lifetimeUsed.toLocaleString()} cr
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          <Layers className="h-3 w-3" /> {gammaCredits.toLocaleString()} Gamma cr
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <FileSpreadsheet className="h-3 w-3" /> {openaiCredits.toLocaleString()} cr
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Mic className="h-3 w-3" /> {audioCredits.toLocaleString()} cr
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onViewDetails(user)}
                          className="inline-flex items-center gap-1 rounded-lg border border-lime-500/30 bg-lime-500/10 px-2.5 py-1 text-xs font-semibold text-lime-700 hover:bg-lime-500/20 cursor-pointer dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-400"
                          title="Open Full User Profile, Courses & Deductions"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => onAdjustCredits(user)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                          title="Adjust Credits"
                        >
                          <Plus className="h-3 w-3" />
                          Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  {loading ? "Fetching users from MongoDB..." : "No users found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
