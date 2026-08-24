import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Minus,
  Check,
  X,
  Zap,
  Layers,
  FileSpreadsheet,
  Mic,
  BarChart3,
  Sparkles,
  Eye,
  RefreshCw,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Headphones,
  ShieldCheck,
  ArrowRight,
  TrendingDown,
  Hash
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchAdminUsers,
  fetchAdminUserDetails,
  adjustUserCreditsApi,
  AdminUserItem,
  AdminUserDetailsResponse,
  AdminUserCourseDetail,
} from "@/services/adminService";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);


  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<AdminUserDetailsResponse | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"courses" | "raw" | "ledger">("courses");
  const [courseSearch, setCourseSearch] = useState("");
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);


  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [adjustType, setAdjustType] = useState<"ADD" | "DEDUCT">("ADD");
  const [adjustAmount, setAdjustAmount] = useState<number>(100);
  const [adjustReason, setAdjustReason] = useState("SUPPORT_COMPENSATION");
  const [customNote, setCustomNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAdminUsers(searchTerm);
      setUsers(res.users);
    } catch (err: any) {
      console.error("Failed to load users:", err);
      setError(err.message || "Failed to load users from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenUserDetails = async (user: AdminUserItem) => {
    setActiveUserId(user.id);
    setActiveTab("courses");
    setCourseSearch("");
    setExpandedCourseId(null);
    setDetailsLoading(true);
    setDetailsError(null);

    try {
      const data = await fetchAdminUserDetails(user.id);
      setUserDetails(data);
    } catch (err: any) {
      console.error("Failed to load user details:", err);
      setDetailsError(err.message || "Failed to fetch user courses and details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseUserDetails = () => {
    setActiveUserId(null);
    setUserDetails(null);
    setDetailsError(null);
  };

  const filteredUsers = users.filter((u) => {
    const planName = u.wallet?.plan?.name || "Free";
    if (planFilter === "ALL") return true;
    return planName.toLowerCase() === planFilter.toLowerCase();
  });

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || adjustAmount <= 0) return;

    try {
      setIsSubmitting(true);
      const finalAmount = adjustType === "ADD" ? adjustAmount : -adjustAmount;
      await adjustUserCreditsApi({
        userId: selectedUser.id,
        amount: finalAmount,
        reason: adjustReason,
        notes: customNote,
      });

      setSuccessToast(
        `Successfully ${adjustType === "ADD" ? "credited" : "deducted"} ${adjustAmount} credits for ${selectedUser.username}`
      );
      setSelectedUser(null);
      loadUsers();

      if (activeUserId === selectedUser.id) {
        const data = await fetchAdminUserDetails(selectedUser.id);
        setUserDetails(data);
      }

      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      alert("Adjustment failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  const displayedCourses = (userDetails?.courses || []).filter((c) => {
    if (!courseSearch) return true;
    const s = courseSearch.toLowerCase();
    return (
      c.title?.toLowerCase().includes(s) ||
      c.courseId?.toLowerCase().includes(s) ||
      c.type?.toLowerCase().includes(s) ||
      c.level?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-8 transition-colors duration-200">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-xs font-semibold text-lime-700 dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-400">
              <Users className="h-3.5 w-3.5" />
              CUSTOMER PROFILES & COURSE CONSUMPTION
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            User Wallets & Generated Courses
          </h1>
          <p className="text-xs text-slate-500 dark:text-white/60">
            Click on any user to inspect their full profile, all generated courses, and credit deductions per course.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 cursor-pointer"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </button>
          {successToast && (
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 animate-in fade-in">
              <Check className="h-4 w-4" />
              {successToast}
            </div>
          )}
        </div>
      </div>


      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by username or email..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder-white/40 dark:focus:border-lime-400"
          />
        </div>

        <div className="flex items-center gap-2 max-md:flex-wrap">
          {["ALL", "Free", "Pro", "Team"].map((plan) => (
            <button
              key={plan}
              type="button"
              onClick={() => setPlanFilter(plan)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer",
                planFilter === plan
                  ? "bg-lime-500/10 text-lime-700 border-lime-500/30 dark:bg-lime-400/10 dark:text-lime-400 dark:border-lime-400/30"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/60"
              )}
            >
              {plan === "ALL" ? "All Plans" : `${plan} Plan`}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-semibold text-amber-700 dark:text-amber-400">
          Notice: {error}
        </div>
      )}


      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-200 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/50">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Courses Created</th>
                <th className="px-6 py-4 font-semibold">Live Balance</th>
                <th className="px-6 py-4 font-semibold">Lifetime Spent</th>
                <th className="px-6 py-4 font-semibold">Data Consumed</th>
                <th className="px-6 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const balance = user.wallet?.balance || 0;
                  const reserved = user.wallet?.reserved || 0;
                  const lifetimeUsed = user.wallet?.lifetimeUsed || 0;
                  const planName = user.wallet?.plan?.name || "Free";
                  const coursesCount = user.courseCount ?? 0;


                  const gammaDecks = Math.floor((lifetimeUsed * 0.62) / 250);
                  const gammaCredits = gammaDecks * 500;
                  const openaiTokens = Math.round((lifetimeUsed * 0.24) * 120);
                  const audioMinutes = Math.round((lifetimeUsed * 0.14) / 15);

                  return (
                    <tr
                      key={user.id}
                      onClick={() => handleOpenUserDetails(user)}
                      className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] font-bold text-white/80 dark:bg-white/[0.06] dark:text-white/80 border border-white/15">
                            {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-lime-600 dark:text-white dark:group-hover:text-lime-300 transition-colors flex items-center gap-1.5">
                              {user.username}
                              {user.isVerified && (
                                <ShieldCheck className="h-3.5 w-3.5 text-lime-400" title="Verified User" />
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
                              planName === "Team" && "bg-white/[0.08] text-white/80 border-white/15",
                              planName === "Pro" && "bg-lime-400/10 text-lime-300 border-lime-400/25",
                              planName === "Free" && "bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/10 dark:text-white/60 dark:border-white/10"
                            )}
                          >
                            {planName} Plan
                          </span>

                          <div className="flex flex-wrap items-center gap-1">
                            {(user.rechargeCount ?? 0) > 0 && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-semibold text-white/65 border border-white/10">
                                <Zap className="h-2.5 w-2.5" />
                                {user.rechargeCount} Top-up{(user.rechargeCount ?? 0) > 1 ? "s" : ""} (₹{user.totalRechargedINR})
                              </span>
                            )}
                            {(user.planSubscriptionCount ?? 0) > 0 && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-semibold text-white/65 border border-white/10">
                                <Layers className="h-2.5 w-2.5" />
                                {user.planSubscriptionCount} Plan{(user.planSubscriptionCount ?? 0) > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                          <BookOpen className="h-3.5 w-3.5 text-white/60" />
                          {coursesCount} {coursesCount === 1 ? "Course" : "Courses"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                          {balance.toLocaleString()} cr
                        </div>
                        {reserved > 0 ? (
                          <span className="text-[10px] font-semibold text-white/60">
                            ({reserved} cr hold)
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 dark:text-white/40">Ready</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm font-bold text-lime-300">
                        {lifetimeUsed.toLocaleString()} cr
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-white/65 border border-white/10">
                            <Layers className="h-3 w-3" /> {gammaCredits.toLocaleString()} Gamma cr
                          </span>
                          <span className="inline-flex items-center gap-1 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-white/65 border border-white/10">
                            <FileSpreadsheet className="h-3 w-3" /> {openaiTokens.toLocaleString()} Tok
                          </span>
                          <span className="inline-flex items-center gap-1 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-white/65 border border-white/10">
                            <Mic className="h-3 w-3" /> {audioMinutes}m
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenUserDetails(user)}
                            className="inline-flex items-center gap-1 rounded-lg border border-lime-400/25 bg-lime-400/10 px-2.5 py-1 text-xs font-semibold text-lime-300 hover:bg-lime-400/20 cursor-pointer"
                            title="Open Full User Profile, Courses & Deductions"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedUser(user)}
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


      {activeUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in">
          <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-white/10 dark:bg-[#0b1220] dark:text-white">


            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] max-md:flex-col max-md:items-start max-md:gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-500/10 text-lg font-black text-lime-700 dark:bg-lime-400/10 dark:text-lime-400 border border-lime-500/30">
                  {userDetails?.user?.username ? userDetails.user.username.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {userDetails?.user?.username || "Loading..."}
                    </h2>
                    <span className="rounded-full bg-lime-500/10 px-2.5 py-0.5 text-[10px] font-bold text-lime-700 dark:text-lime-400 border border-lime-500/30">
                      {userDetails?.user?.wallet?.plan?.name || "Free"} Plan
                    </span>
                    {userDetails?.user?.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-white/50 flex flex-wrap items-center gap-2 mt-0.5">
                    <span>{userDetails?.user?.email}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">ID: {userDetails?.user?.id}</span>
                    <span>•</span>
                    <span>Joined {userDetails?.user?.joinedDate ? new Date(userDetails.user.joinedDate).toLocaleDateString() : "-"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {userDetails && (
                  <button
                    type="button"
                    onClick={() => setSelectedUser(userDetails.user)}
                    className="inline-flex items-center gap-1 rounded-xl border border-lime-500/30 bg-lime-500/10 px-3 py-1.5 text-xs font-bold text-lime-700 hover:bg-lime-500/20 cursor-pointer dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-400"
                  >
                    <Plus className="h-3.5 w-3.5" /> Adjust Credits
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCloseUserDetails}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Financial & Course Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/25 dark:bg-white/[0.01]">
              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="text-[11px] font-semibold text-slate-400 dark:text-white/40 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-lime-500" />
                  Live Balance
                </div>
                <div className="mt-1 text-lg font-black font-mono text-slate-900 dark:text-white">
                  {(userDetails?.summary?.currentBalance ?? userDetails?.user?.wallet?.balance ?? 0).toLocaleString()} cr
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {(userDetails?.summary?.reservedCredits ?? 0) > 0 ? (
                    <span className="text-amber-500 font-semibold">{userDetails?.summary?.reservedCredits} cr on hold</span>
                  ) : (
                    "No pending hold"
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="text-[11px] font-semibold text-slate-400 dark:text-white/40 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-purple-500" />
                  Courses Generated
                </div>
                <div className="mt-1 text-lg font-black font-mono text-purple-600 dark:text-purple-400">
                  {userDetails?.summary?.totalCourses ?? (userDetails?.courses?.length ?? 0)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">AI-created courses</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="text-[11px] font-semibold text-slate-400 dark:text-white/40 flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-lime-500" />
                  Course Credits Spent
                </div>
                <div className="mt-1 text-lg font-black font-mono text-lime-600 dark:text-lime-400">
                  {(userDetails?.summary?.totalCreditsUsedOnCourses ?? 0).toLocaleString()} cr
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Avg {Math.round((userDetails?.summary?.totalCreditsUsedOnCourses || 0) / (userDetails?.summary?.totalCourses || 1))} cr / course
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="text-[11px] font-semibold text-slate-400 dark:text-white/40 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Lifetime Billed
                </div>
                <div className="mt-1 text-lg font-black font-mono text-slate-900 dark:text-white">
                  {(userDetails?.summary?.lifetimeSpent ?? userDetails?.user?.wallet?.lifetimeUsed ?? 0).toLocaleString()} cr
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  ≈ ₹{(userDetails?.summary?.lifetimeSpent ?? 0).toLocaleString()}
                </div>
              </div>
            </div>


            <div className="flex items-center gap-2 border-b border-slate-200 px-6 pt-3 dark:border-white/10 overflow-x-auto max-md:px-3">
              <button
                type="button"
                onClick={() => setActiveTab("courses")}
                className={cn(
                  "flex items-center gap-2 pb-3 px-1 text-xs font-bold border-b-2 transition-colors cursor-pointer",
                  activeTab === "courses"
                    ? "border-lime-500 text-lime-700 dark:border-lime-400 dark:text-lime-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-white/60 dark:hover:text-white"
                )}
              >
                <BookOpen className="h-4 w-4" />
                Generated Courses & Credits ({userDetails?.courses?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("raw")}
                className={cn(
                  "flex items-center gap-2 pb-3 px-1 text-xs font-bold border-b-2 transition-colors cursor-pointer",
                  activeTab === "raw"
                    ? "border-lime-500 text-lime-700 dark:border-lime-400 dark:text-lime-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-white/60 dark:hover:text-white"
                )}
              >
                <BarChart3 className="h-4 w-4" />
                Raw Provider Breakdown
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ledger")}
                className={cn(
                  "flex items-center gap-2 pb-3 px-1 text-xs font-bold border-b-2 transition-colors cursor-pointer",
                  activeTab === "ledger"
                    ? "border-lime-500 text-lime-700 dark:border-lime-400 dark:text-lime-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-white/60 dark:hover:text-white"
                )}
              >
                <Clock className="h-4 w-4" />
                User Ledger Transactions ({userDetails?.recentTransactions?.length || 0})
              </button>
            </div>


            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                  <RefreshCw className="h-8 w-8 animate-spin text-lime-500" />
                  <p className="text-xs font-semibold">Loading user courses and credit consumption...</p>
                </div>
              ) : detailsError ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-xs font-semibold text-red-600 dark:text-red-400">
                  {detailsError}
                </div>
              ) : (
                <>

                  {activeTab === "courses" && (
                    <div className="space-y-4">

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-sm">
                          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={courseSearch}
                            onChange={(e) => setCourseSearch(e.target.value)}
                            placeholder="Filter user courses..."
                            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-lime-500 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white"
                          />
                        </div>
                        <div className="text-xs text-slate-500 dark:text-white/50">
                          Total Courses: <span className="font-bold text-slate-900 dark:text-white">{userDetails?.courses?.length || 0}</span> | Credits Spent: <span className="font-bold text-lime-600 dark:text-lime-400 font-mono">{(userDetails?.summary?.totalCreditsUsedOnCourses || 0).toLocaleString()} cr</span>
                        </div>
                      </div>

                      {displayedCourses.length > 0 ? (
                        <div className="space-y-4">
                          {displayedCourses.map((course) => {
                            const isExpanded = expandedCourseId === course.id;
                            const hasGammaSlides = course.modules?.some((m) => m.gammaUrl);

                            return (
                              <div
                                key={course.id}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all dark:border-white/10 dark:bg-white/[0.02]"
                              >

                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                  <div className="flex-1 space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                                        {course.title || "Untitled Course"}
                                      </h3>
                                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-white/70">
                                        {course.level || "Beginner"}
                                      </span>
                                      {course.type && (
                                        <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                          {course.type}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-white/60 line-clamp-2">
                                      {course.description || "AI generated multi-module interactive course."}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 dark:text-white/40 pt-1">
                                      <span className="font-mono">ID: {course.courseId}</span>
                                      <span>•</span>
                                      <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
                                      <span>•</span>
                                      <span>{course.moduleCount} Modules</span>
                                    </div>
                                  </div>


                                  <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-1 rounded-2xl border border-lime-500/30 bg-lime-500/10 px-4 py-2.5 text-right dark:border-lime-400/30 dark:bg-lime-400/10 min-w-[140px]">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-lime-700 dark:text-lime-400 flex items-center gap-1">
                                      <CreditCard className="h-3 w-3" />
                                      Credits Deducted
                                    </div>
                                    <div className="text-xl font-black font-mono text-lime-700 dark:text-lime-300">
                                      {course.totalCreditsUsed.toLocaleString()} cr
                                    </div>
                                    <div className="text-[10px] text-lime-600/80 dark:text-lime-400/80 font-medium">
                                      ≈ ₹{course.totalCreditsUsed}
                                    </div>
                                  </div>
                                </div>


                                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-white/5">
                                  <span className="text-[11px] font-bold text-slate-400 dark:text-white/40 mr-1">
                                    Deduction Breakdown:
                                  </span>


                                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/20 bg-purple-500/5 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300">
                                    <Layers className="h-3.5 w-3.5 text-purple-500" />
                                    Gamma Slides: <strong className="font-mono">{course.breakdown.gammaCredits} cr</strong>
                                    <span className="text-[10px] opacity-75">({course.breakdown.gammaDecksCount} decks)</span>
                                  </span>


                                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                                    AI Content & Outline: <strong className="font-mono">{course.breakdown.openaiCredits} cr</strong>
                                  </span>


                                  {course.breakdown.audioCredits > 0 && (
                                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                                      <Mic className="h-3.5 w-3.5 text-amber-500" />
                                      Podcast Voice: <strong className="font-mono">{course.breakdown.audioCredits} cr</strong>
                                    </span>
                                  )}


                                  <div className="ml-auto flex items-center gap-2">
                                    {course.audioUrl && (
                                      <a
                                        href={course.audioUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-[11px] font-bold text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
                                      >
                                        <Headphones className="h-3 w-3" /> Audio ↗
                                      </a>
                                    )}
                                    {course.ebookUrl && (
                                      <a
                                        href={course.ebookUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-2 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-500/20 dark:text-blue-400"
                                      >
                                        <FileText className="h-3 w-3" /> Ebook PDF ↗
                                      </a>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                                    >
                                      {isExpanded ? (
                                        <>Hide Modules <ChevronUp className="h-3.5 w-3.5" /></>
                                      ) : (
                                        <>Inspect Modules ({course.modules?.length || 0}) <ChevronDown className="h-3.5 w-3.5" /></>
                                      )}
                                    </button>
                                  </div>
                                </div>


                                {isExpanded && (
                                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/75 p-4 dark:border-white/10 dark:bg-white/[0.02] space-y-3 animate-in fade-in">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-white/80">
                                      <span>Course Modules & Slide Assets</span>
                                      <span className="text-[11px] text-slate-400">Each Gamma slide deck costs 250 cr</span>
                                    </div>

                                    <div className="grid gap-2.5 sm:grid-cols-2">
                                      {course.modules && course.modules.length > 0 ? (
                                        course.modules.map((mod) => (
                                          <div
                                            key={mod.moduleId || mod.moduleNumber}
                                            className="flex flex-col justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-white/10 dark:bg-white/[0.03]"
                                          >
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="flex items-start gap-2">
                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-700 dark:bg-white/10 dark:text-white">
                                                  #{mod.moduleNumber}
                                                </span>
                                                <span className="font-semibold text-xs text-slate-900 dark:text-white">
                                                  {mod.title}
                                                </span>
                                              </div>
                                              <span
                                                className={cn(
                                                  "rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase",
                                                  mod.status === "completed" || mod.gammaUrl
                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                    : mod.status === "generating"
                                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                      : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-white/50"
                                                )}
                                              >
                                                {mod.gammaUrl ? "Slides Ready" : mod.status}
                                              </span>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-white/5 dark:text-white/50">
                                              <span>{mod.quizCount > 0 ? `${mod.quizCount} Quizzes` : "Standard Module"}</span>
                                              {mod.gammaUrl ? (
                                                <a
                                                  href={mod.gammaUrl}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="inline-flex items-center gap-1 font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                                >
                                                  Open Slides <ExternalLink className="h-3 w-3" />
                                                </a>
                                              ) : (
                                                <span className="text-slate-400 text-[10px]">No slides generated</span>
                                              )}
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="col-span-2 text-center py-3 text-xs text-slate-400">
                                          No module objects recorded for this course.
                                        </div>
                                      )}
                                    </div>


                                    {course.transactions && course.transactions.length > 0 && (
                                      <div className="mt-3 border-t border-slate-200 pt-3 dark:border-white/10">
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                          Audited Ledger Entries for this Course ({course.transactions.length})
                                        </div>
                                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                          {course.transactions.map((tx) => (
                                            <div
                                              key={tx.id}
                                              className="flex items-center justify-between text-[11px] rounded-lg bg-white p-2 border border-slate-200 dark:bg-white/[0.02] dark:border-white/5"
                                            >
                                              <span className="font-mono text-slate-500">{tx.referenceId}</span>
                                              <span className="font-semibold text-slate-700 dark:text-white/80">
                                                {tx.action?.displayName || tx.type}
                                              </span>
                                              <span className="font-mono font-bold text-red-600 dark:text-red-400">
                                                -{Math.abs(tx.amount)} cr
                                              </span>
                                              <span className="text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                          <BookOpen className="h-10 w-10 text-slate-300 dark:text-white/20 mb-2" />
                          <h4 className="text-sm font-bold text-slate-700 dark:text-white/80">
                            {courseSearch ? "No matching courses found" : "No courses generated yet"}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm">
                            {courseSearch
                              ? "Try adjusting your search terms."
                              : "This user has not generated any courses yet. Once they create a course, full credit consumption details will appear here."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "raw" && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-white/10 dark:bg-white/[0.02]">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-lime-500" />
                          <span className="font-semibold text-slate-800 dark:text-white">
                            Raw Provider Load Distribution: <strong className="text-purple-600 dark:text-purple-400">Gamma AI (62%) + OpenAI (24%) + ElevenLabs (14%)</strong>
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-3.5 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                          <div className="text-[11px] font-medium text-slate-500 dark:text-white/50">Total Orion Credits Spent</div>
                          <div className="mt-1 text-xl font-extrabold text-lime-600 dark:text-lime-400 font-mono">
                            {(userDetails?.summary?.lifetimeSpent || 0).toLocaleString()} cr
                          </div>
                          <div className="text-[10px] text-slate-400">Billed: ₹{(userDetails?.summary?.lifetimeSpent || 0).toLocaleString()}</div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                          <div className="text-[11px] font-medium text-slate-500 dark:text-white/50">Actual Raw Provider Cost</div>
                          <div className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                            ₹{Math.round((userDetails?.summary?.lifetimeSpent || 0) * 0.68).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">Gamma + OpenAI + ElevenLabs</div>
                        </div>

                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                          <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Net Platform Margin</div>
                          <div className="mt-1 text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                            +₹{Math.round((userDetails?.summary?.lifetimeSpent || 0) * 0.32).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-emerald-600/80 dark:text-emerald-300">+32.4% Margin</div>
                        </div>
                      </div>


                      <div className="space-y-3 mt-4">

                        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 dark:border-purple-500/20 dark:bg-purple-500/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400">
                                <Layers className="h-4 w-4" />
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white text-xs">Gamma AI (Slide Decks)</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                              {Math.floor(((userDetails?.summary?.lifetimeSpent || 0) * 0.62) / 250) * 500} Gamma Credits
                            </span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-purple-500/10 pt-2.5 text-slate-600 dark:text-white/70">
                            <div>Courses Generated: <span className="font-bold text-slate-900 dark:text-white">{Math.floor(((userDetails?.summary?.lifetimeSpent || 0) * 0.62) / 250)} decks</span></div>
                            <div>Raw API Cost: <span className="font-bold text-slate-900 dark:text-white">₹{Math.round((userDetails?.summary?.lifetimeSpent || 0) * 0.47)}</span></div>
                          </div>
                        </div>


                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                <FileSpreadsheet className="h-4 w-4" />
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white text-xs">OpenAI GPT-4o (Text, Outlines & Workbooks)</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {Math.round((userDetails?.summary?.lifetimeSpent || 0) * 0.24 * 120).toLocaleString()} Total Tokens
                            </span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-emerald-500/10 pt-2.5 text-slate-600 dark:text-white/70">
                            <div>Actions Count: <span className="font-bold text-slate-900 dark:text-white">{Math.round(((userDetails?.summary?.lifetimeSpent || 0) * 0.24) / 12)} modules</span></div>
                            <div>Raw Token Cost: <span className="font-bold text-slate-900 dark:text-white">₹{Math.round((userDetails?.summary?.lifetimeSpent || 0) * 0.16)}</span></div>
                          </div>
                        </div>


                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                <Mic className="h-4 w-4" />
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white text-xs">ElevenLabs (AI Podcasts & Voiceovers)</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                              {Math.round((((userDetails?.summary?.lifetimeSpent || 0) * 0.14) / 15) * 1500).toLocaleString()} Characters
                            </span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-amber-500/10 pt-2.5 text-slate-600 dark:text-white/70">
                            <div>Audio Generated: <span className="font-bold text-slate-900 dark:text-white">{Math.round(((userDetails?.summary?.lifetimeSpent || 0) * 0.14) / 15)} minutes</span></div>
                            <div>Raw Voice Cost: <span className="font-bold text-slate-900 dark:text-white">₹{Math.round((userDetails?.summary?.lifetimeSpent || 0) * 0.09)}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}


                  {activeTab === "ledger" && (
                    <div className="space-y-4">
                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/50">
                                <th className="px-4 py-3 font-semibold">Type</th>
                                <th className="px-4 py-3 font-semibold">Action / Description</th>
                                <th className="px-4 py-3 font-semibold">Reference</th>
                                <th className="px-4 py-3 font-semibold">Amount</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 text-right font-semibold">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                              {userDetails?.recentTransactions && userDetails.recentTransactions.length > 0 ? (
                                userDetails.recentTransactions.map((tx) => {
                                  const isPositive = tx.amount > 0 && (tx.type === "RECHARGE" || tx.type === "PLAN_RESET" || (tx.type === "ADJUSTMENT" && tx.amount > 0));
                                  return (
                                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                                      <td className="px-4 py-3 font-bold">
                                        <span
                                          className={cn(
                                            "rounded-md px-2 py-0.5 text-[10px] font-bold",
                                            tx.type === "RECHARGE" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                                            tx.type === "PLAN_RESET" && "bg-purple-500/10 text-purple-600 dark:text-purple-400",
                                            tx.type === "RECONCILE" && "bg-red-500/10 text-red-600 dark:text-red-400",
                                            tx.type === "ADJUSTMENT" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                                            tx.type === "RESERVE" && "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                          )}
                                        >
                                          {tx.type}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-slate-800 dark:text-white/80">
                                        {tx.action?.displayName || tx.reason || tx.type}
                                      </td>
                                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                                        {tx.referenceId || "-"}
                                      </td>
                                      <td className="px-4 py-3 font-mono font-bold">
                                        <span className={isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                                          {isPositive ? "+" : ""}{tx.amount} cr
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-white/70">
                                          {tx.status}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-right text-slate-400">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={6} className="py-6 text-center text-slate-400">
                                    No transaction records found for this user.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>


            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] max-md:flex-col max-md:items-stretch max-md:gap-3">
              <div className="text-xs text-slate-400">
                User MongoDB ID: <span className="font-mono text-slate-600 dark:text-white/60">{userDetails?.user?.id || activeUserId}</span>
              </div>
              <button
                type="button"
                onClick={handleCloseUserDetails}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer dark:bg-white dark:text-black dark:hover:bg-slate-200"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}


      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0b1220] dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Manual Credit Adjustment</h3>
                <p className="text-xs text-slate-500 dark:text-white/50">{selectedUser.username} ({selectedUser.email})</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
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
                  onClick={() => setSelectedUser(null)}
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
      )}
    </div>
  );
}
