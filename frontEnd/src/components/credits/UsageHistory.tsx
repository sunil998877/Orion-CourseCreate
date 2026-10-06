import React, { useState, useMemo, useEffect } from 'react';
import {
  History,
  Search,
  BookOpen,
  Zap,
  Calendar,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Info,
  CheckCircle2,
  Clock,
  ListTree,
} from 'lucide-react';
import type { WalletTransaction } from '../../types/credits.types';
import { API_BASE } from '../../utils/api';

type Props = {
  items: WalletTransaction[];
  limit?: number;
  compact?: boolean;
  maxHeight?: string;
  fill?: boolean;
};

export interface CachedCourse {
  _id?: string;
  courseId?: string;
  title: string;
  moduleCount?: number;
  module?: number;
  createdAt?: string;
  modules?: Array<{
    moduleNumber: number | string;
    Title?: string;
    title?: string;
  }>;
}

const COURSES_CACHE_KEY = 'orion_user_courses_cache';

function getInitialCourses(): CachedCourse[] {
  try {
    const raw = sessionStorage.getItem(COURSES_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Itemized module detail within a course
export interface ModuleDetail {
  moduleNumber: number | string;
  title?: string;
  reservedAmount: number;
  refundAmount: number;
  netCost: number;
  referenceId?: string;
  status: 'COMPLETED' | 'IN_PROGRESS';
  timestamp?: string;
}

// Formatted unified activity item
export interface ActivityItem {
  id: string;
  title: string;
  courseName?: string;
  courseId?: string;
  isCourseGroup?: boolean;
  moduleCount?: number;
  modules?: ModuleDetail[];
  type: 'COURSE_COMPLETE' | 'COURSE_PENDING' | 'MODULE_COMPLETE' | 'RECHARGE' | 'PLAN_RESET' | 'REFUND' | 'ADJUSTMENT' | 'OTHER';
  badgeLabel: string;
  badgeStyle: string;
  netAmount: number;
  reservedAmount?: number;
  refundAmount?: number;
  actualCost?: number;
  dateStr: string;
  rawDate: Date;
  referenceId?: string | null;
  rawTransactions: WalletTransaction[];
  icon: React.ElementType;
}

const formatDate = (iso?: string) => {
  if (!iso) return 'Recent';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return 'Recent';
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
};

const formatFullDate = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const UsageHistory: React.FC<Props> = ({ items, limit, compact = false, maxHeight, fill = false }) => {
  // viewMode: 'course' = Unified course level (e.g. 1 Course, 5 Modules = 400 cr)
  //           'module' = Per-module breakdown (e.g. 80 cr per module)
  //           'ledger' = Raw database entries
  const [viewMode, setViewMode] = useState<'course' | 'module' | 'ledger'>('course');
  const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'recharges' | 'refunds'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [userCourses, setUserCourses] = useState<CachedCourse[]>(getInitialCourses);

  // Fetch user courses to match courseId or cluster to real course title
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let cancelled = false;
    fetch(`${API_BASE}/courses/get-user-courses`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          setUserCourses(data);
          try {
            sessionStorage.setItem(COURSES_CACHE_KEY, JSON.stringify(data));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Could not fetch user courses for usage history:', err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Helper to match a group or module transaction with the user's real course
  const resolveCourse = useMemo(() => {
    return (cId?: string, date?: Date, refId?: string, modCount?: number): CachedCourse | null => {
      if (!userCourses || userCourses.length === 0) return null;

      // 1. Direct courseId or _id match
      if (cId) {
        const target = cId.toLowerCase();
        const direct = userCourses.find((c) => {
          const cidStr = String(c.courseId || '').toLowerCase();
          const idStr = String(c._id || '').toLowerCase();
          return (cidStr && cidStr === target) || (idStr && idStr === target);
        });
        if (direct) return direct;
      }

      // 2. Reference ID substring match
      if (refId) {
        const refLower = refId.toLowerCase();
        const refMatch = userCourses.find((c) => {
          const cidStr = String(c.courseId || '').toLowerCase();
          const idStr = String(c._id || '').toLowerCase();
          return (cidStr && refLower.includes(cidStr)) || (idStr && refLower.includes(idStr));
        });
        if (refMatch) return refMatch;
      }

      // 3. If user has only one course in their account, match it directly
      if (userCourses.length === 1) {
        return userCourses[0];
      }

      // 4. Time proximity match (closest createdAt) with bonus for moduleCount match
      if (date) {
        const targetTime = date.getTime();
        let best: CachedCourse | null = null;
        let smallestDiff = Infinity;

        for (const c of userCourses) {
          if (!c.createdAt) continue;
          const courseTime = new Date(c.createdAt).getTime();
          const diff = Math.abs(targetTime - courseTime);
          const countMatch = modCount && (c.moduleCount || c.module || c.modules?.length) === modCount;
          const weightedDiff = countMatch ? diff * 0.4 : diff;

          if (weightedDiff < smallestDiff) {
            smallestDiff = weightedDiff;
            best = c;
          }
        }

        if (best && smallestDiff < 14 * 24 * 60 * 60 * 1000) {
          return best;
        }
      }

      return userCourses[0] || null;
    };
  }, [userCourses]);

  // 1. Process Raw Transactions into Module-Level Pairs (Hold + Refund = Net ~80 cr)
  const moduleActivities = useMemo<ActivityItem[]>(() => {
    if (!items || items.length === 0) return [];

    const sorted = [...items].sort((a, b) => {
      const timeA = new Date(a.created_at || a.createdAt || 0).getTime();
      const timeB = new Date(b.created_at || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    const usedIndices = new Set<number>();
    const activities: ActivityItem[] = [];

    // Pass 1: Match exact referenceId (e.g. courseId_mod_1)
    for (let i = 0; i < sorted.length; i++) {
      if (usedIndices.has(i)) continue;
      const tx = sorted[i];
      const ref = tx.referenceId || tx.reference_id;

      if (tx.type === 'RECONCILE' && ref) {
        const reserveIdx = sorted.findIndex(
          (cand, idx) =>
            idx !== i &&
            !usedIndices.has(idx) &&
            cand.type === 'RESERVE' &&
            (cand.referenceId === ref || cand.reference_id === ref)
        );

        if (reserveIdx !== -1) {
          const reserveTx = sorted[reserveIdx];
          const reservedAmt = Math.abs(Number(reserveTx.amount) || 0);
          const refundAmt = Math.abs(Number(tx.amount) || 0);
          const netCost = reservedAmt - refundAmt;

          usedIndices.add(i);
          usedIndices.add(reserveIdx);

          // Check if ref has course and module info (e.g. "course_123_mod_1")
          const modMatch = ref.match(/^(.+?)_mod_(\d+)$/i) || ref.match(/^(.+?)_module_?(\d+)/i);
          const courseId = modMatch ? modMatch[1] : undefined;
          const modNum = modMatch ? modMatch[2] : undefined;

          const txDate = new Date(tx.created_at || tx.createdAt || 0);
          const matchedCourse = resolveCourse(courseId, txDate, ref);
          const courseTitle = matchedCourse?.title?.trim();
          const itemTitle = courseTitle && modNum
            ? `${courseTitle} (Module ${modNum})`
            : modNum
            ? `Module ${modNum} Generation`
            : (tx.action?.displayName || tx.action_name || 'Generate Course Module');

          activities.push({
            id: ref || `module-${i}`,
            courseId,
            courseName: courseTitle,
            title: itemTitle,
            type: 'MODULE_COMPLETE',
            badgeLabel: modNum ? `MODULE ${modNum}` : 'MODULE',
            badgeStyle: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
            netAmount: -netCost,
            reservedAmount: reservedAmt,
            refundAmount: refundAmt,
            actualCost: netCost,
            dateStr: formatDate(tx.created_at || tx.createdAt),
            rawDate: txDate,
            referenceId: ref,
            rawTransactions: [reserveTx, tx],
            icon: Layers,
          });
          continue;
        }
      }
    }

    // Pass 2: Match adjacent RESERVE (-250) & RECONCILE (+170) if referenceId was generic
    for (let i = 0; i < sorted.length; i++) {
      if (usedIndices.has(i)) continue;
      const tx = sorted[i];

      if (tx.type === 'RECONCILE') {
        const reserveIdx = sorted.findIndex(
          (cand, idx) =>
            idx !== i &&
            !usedIndices.has(idx) &&
            cand.type === 'RESERVE' &&
            cand.action_name === tx.action_name
        );

        if (reserveIdx !== -1) {
          const reserveTx = sorted[reserveIdx];
          const reservedAmt = Math.abs(Number(reserveTx.amount) || 0);
          const refundAmt = Math.abs(Number(tx.amount) || 0);
          const netCost = reservedAmt - refundAmt;

          usedIndices.add(i);
          usedIndices.add(reserveIdx);

          const ref = tx.referenceId || tx.reference_id || reserveTx.referenceId || reserveTx.reference_id || '';
          const modMatch = ref.match(/^(.+?)_mod_(\d+)$/i) || ref.match(/^(.+?)_module_?(\d+)/i);
          const courseId = modMatch ? modMatch[1] : undefined;
          const modNum = modMatch ? modMatch[2] : undefined;

          const txDate = new Date(tx.created_at || tx.createdAt || 0);
          const matchedCourse = resolveCourse(courseId, txDate, ref);
          const courseTitle = matchedCourse?.title?.trim();
          const itemTitle = courseTitle && modNum
            ? `${courseTitle} (Module ${modNum})`
            : modNum
            ? `Module ${modNum} Generation`
            : (tx.action_name || reserveTx.action_name || 'Generate Course Module');

          activities.push({
            id: `pair-${i}-${reserveIdx}`,
            courseId,
            courseName: courseTitle,
            title: itemTitle,
            type: 'MODULE_COMPLETE',
            badgeLabel: modNum ? `MODULE ${modNum}` : 'MODULE COMPLETE',
            badgeStyle: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
            netAmount: -netCost,
            reservedAmount: reservedAmt,
            refundAmount: refundAmt,
            actualCost: netCost,
            dateStr: formatDate(tx.created_at || tx.createdAt),
            rawDate: txDate,
            referenceId: ref || null,
            rawTransactions: [reserveTx, tx],
            icon: Layers,
          });
          continue;
        }
      }
    }

    // Pass 3: Process remaining single transactions (Recharges, Grants, Standalone Holds, etc.)
    for (let i = 0; i < sorted.length; i++) {
      if (usedIndices.has(i)) continue;
      const tx = sorted[i];
      usedIndices.add(i);

      const amt = Number(tx.amount) || 0;
      const actionTitle = tx.action?.displayName || tx.action_name || tx.type;

      if (tx.type === 'RESERVE') {
        const ref = tx.referenceId || tx.reference_id || '';
        const modMatch = ref.match(/^(.+?)_mod_(\d+)$/i);
        const courseId = modMatch ? modMatch[1] : undefined;

        activities.push({
          id: tx.id || tx._id || `tx-${i}`,
          courseId,
          title: modMatch ? `Module ${modMatch[2]} (In Progress)` : actionTitle,
          type: 'COURSE_PENDING',
          badgeLabel: 'HOLD IN PROGRESS',
          badgeStyle: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
          netAmount: -Math.abs(amt),
          reservedAmount: Math.abs(amt),
          actualCost: Math.abs(amt),
          dateStr: formatDate(tx.created_at || tx.createdAt),
          rawDate: new Date(tx.created_at || tx.createdAt || 0),
          referenceId: tx.referenceId || tx.reference_id,
          rawTransactions: [tx],
          icon: BookOpen,
        });
      } else if (tx.type === 'RECHARGE') {
        activities.push({
          id: tx.id || tx._id || `tx-${i}`,
          title: actionTitle === 'RECHARGE' ? 'Wallet Top-Up' : actionTitle,
          type: 'RECHARGE',
          badgeLabel: 'TOP-UP',
          badgeStyle: 'border-lime-500/30 bg-lime-500/10 text-lime-400',
          netAmount: Math.abs(amt),
          dateStr: formatDate(tx.created_at || tx.createdAt),
          rawDate: new Date(tx.created_at || tx.createdAt || 0),
          referenceId: tx.referenceId || tx.reference_id,
          rawTransactions: [tx],
          icon: Zap,
        });
      } else if (tx.type === 'PLAN_RESET') {
        activities.push({
          id: tx.id || tx._id || `tx-${i}`,
          title: 'Monthly Plan Credit Grant',
          type: 'PLAN_RESET',
          badgeLabel: 'PLAN GRANT',
          badgeStyle: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
          netAmount: Math.abs(amt),
          dateStr: formatDate(tx.created_at || tx.createdAt),
          rawDate: new Date(tx.created_at || tx.createdAt || 0),
          referenceId: tx.referenceId || tx.reference_id,
          rawTransactions: [tx],
          icon: Calendar,
        });
      } else if (tx.type === 'REFUND') {
        activities.push({
          id: tx.id || tx._id || `tx-${i}`,
          title: 'Credit Refund',
          type: 'REFUND',
          badgeLabel: 'REFUND',
          badgeStyle: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
          netAmount: Math.abs(amt),
          dateStr: formatDate(tx.created_at || tx.createdAt),
          rawDate: new Date(tx.created_at || tx.createdAt || 0),
          referenceId: tx.referenceId || tx.reference_id,
          rawTransactions: [tx],
          icon: RefreshCw,
        });
      } else if (tx.type === 'RECONCILE') {
        activities.push({
          id: tx.id || tx._id || `tx-${i}`,
          title: 'Unused Credits Refund',
          type: 'REFUND',
          badgeLabel: 'REFUND',
          badgeStyle: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
          netAmount: Math.abs(amt),
          dateStr: formatDate(tx.created_at || tx.createdAt),
          rawDate: new Date(tx.created_at || tx.createdAt || 0),
          referenceId: tx.referenceId || tx.reference_id,
          rawTransactions: [tx],
          icon: RefreshCw,
        });
      } else {
        activities.push({
          id: tx.id || tx._id || `tx-${i}`,
          title: actionTitle,
          type: 'OTHER',
          badgeLabel: tx.type,
          badgeStyle: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
          netAmount: amt,
          dateStr: formatDate(tx.created_at || tx.createdAt),
          rawDate: new Date(tx.created_at || tx.createdAt || 0),
          referenceId: tx.referenceId || tx.reference_id,
          rawTransactions: [tx],
          icon: Sparkles,
        });
      }
    }

    return activities.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
  }, [items, resolveCourse]);

  // 2. Intelligent Aggregation by Course: Group modules belonging to the same course into a single Course item
  // e.g. 5 modules * 80 cr = 400 cr Course Activity!
  const courseActivities = useMemo<ActivityItem[]>(() => {
    if (!moduleActivities || moduleActivities.length === 0) return [];

    const nonModuleActivities: ActivityItem[] = [];
    const courseGroups = new Map<string, ActivityItem[]>();
    const unassignedModules: ActivityItem[] = [];

    // Separate modules from recharges/other
    for (const act of moduleActivities) {
      if (act.type === 'MODULE_COMPLETE' || act.type === 'COURSE_PENDING') {
        if (act.courseId) {
          const group = courseGroups.get(act.courseId) || [];
          group.push(act);
          courseGroups.set(act.courseId, group);
        } else {
          unassignedModules.push(act);
        }
      } else {
        nonModuleActivities.push(act);
      }
    }

    // Cluster unassigned modules that occurred close together (e.g. batch generation within 10 mins)
    if (unassignedModules.length > 0) {
      const sortedUnassigned = [...unassignedModules].sort(
        (a, b) => a.rawDate.getTime() - b.rawDate.getTime()
      );
      let currentCluster: ActivityItem[] = [];
      let clusterStartTime = 0;

      for (const mod of sortedUnassigned) {
        const modTime = mod.rawDate.getTime();
        if (currentCluster.length === 0 || modTime - clusterStartTime <= 10 * 60 * 1000) {
          currentCluster.push(mod);
          if (currentCluster.length === 1) clusterStartTime = modTime;
        } else {
          if (currentCluster.length > 1) {
            const clusterId = `cluster-${clusterStartTime}`;
            courseGroups.set(clusterId, currentCluster);
          } else {
            nonModuleActivities.push(currentCluster[0]);
          }
          currentCluster = [mod];
          clusterStartTime = modTime;
        }
      }

      if (currentCluster.length > 1) {
        courseGroups.set(`cluster-${clusterStartTime}`, currentCluster);
      } else if (currentCluster.length === 1) {
        nonModuleActivities.push(currentCluster[0]);
      }
    }

    // Convert Course Groups into Unified Course Activities
    const unifiedCourses: ActivityItem[] = [];

    courseGroups.forEach((mods, cId) => {
      // Sort modules by module number if possible
      mods.sort((a, b) => {
        const numA = parseInt(a.referenceId?.match(/_mod_(\d+)/)?.[1] || '0', 10);
        const numB = parseInt(b.referenceId?.match(/_mod_(\d+)/)?.[1] || '0', 10);
        return numA - numB;
      });

      const totalReserved = mods.reduce((sum, m) => sum + (m.reservedAmount || 0), 0);
      const totalRefunded = mods.reduce((sum, m) => sum + (m.refundAmount || 0), 0);
      const totalNetCost = mods.reduce((sum, m) => sum + (m.actualCost || Math.abs(m.netAmount)), 0);
      const latestDate = new Date(Math.max(...mods.map((m) => m.rawDate.getTime())));
      const moduleCount = mods.length;

      // Resolve actual course title from user courses
      const firstRef = mods.find((m) => m.referenceId)?.referenceId || undefined;
      const matchedCourse = resolveCourse(cId.startsWith('cluster-') ? undefined : cId, latestDate, firstRef, moduleCount);
      const courseTitle = matchedCourse?.title?.trim();
      const displayTitle = courseTitle
        ? `${courseTitle} (${moduleCount} Modules)`
        : `Full Course Generation (${moduleCount} Modules)`;

      const moduleDetails: ModuleDetail[] = mods.map((m, idx) => {
        const match = m.referenceId?.match(/_mod_(\d+)/);
        const modNumber = match ? parseInt(match[1], 10) : idx + 1;
        const modInfo = matchedCourse?.modules?.find(
          (item: any) => Number(item.moduleNumber) === Number(modNumber)
        );
        const modTitleText = modInfo?.Title || modInfo?.title;
        const moduleSubTitle = modTitleText ? `Module ${modNumber}: ${modTitleText}` : `Module ${modNumber}`;

        return {
          moduleNumber: modNumber,
          title: moduleSubTitle,
          reservedAmount: m.reservedAmount ?? 0,
          refundAmount: m.refundAmount ?? 0,
          netCost: m.actualCost ?? Math.abs(m.netAmount),
          referenceId: m.referenceId || undefined,
          status: m.type === 'COURSE_PENDING' ? 'IN_PROGRESS' : 'COMPLETED',
          timestamp: formatFullDate(m.rawDate.toISOString()),
        };
      });

      const allCompleted = mods.every((m) => m.type === 'MODULE_COMPLETE');

      unifiedCourses.push({
        id: `course-${cId}`,
        courseId: cId,
        courseName: courseTitle || undefined,
        isCourseGroup: true,
        title: displayTitle,
        type: allCompleted ? 'COURSE_COMPLETE' : 'COURSE_PENDING',
        badgeLabel: allCompleted ? `${moduleCount} modules` : `${moduleCount} in progress`,
        badgeStyle: allCompleted
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
          : 'border-amber-500/30 bg-amber-500/10 text-amber-400',
        netAmount: -totalNetCost,
        reservedAmount: totalReserved,
        refundAmount: totalRefunded,
        actualCost: totalNetCost,
        moduleCount,
        modules: moduleDetails,
        dateStr: formatDate(latestDate.toISOString()),
        rawDate: latestDate,
        referenceId: cId.startsWith('cluster-') ? null : cId,
        rawTransactions: mods.flatMap((m) => m.rawTransactions),
        icon: BookOpen,
      });
    });

    const combined = [...unifiedCourses, ...nonModuleActivities];
    return combined.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
  }, [moduleActivities, resolveCourse]);

  // Choose which activity list to display based on viewMode
  const activeActivities = viewMode === 'course' ? courseActivities : moduleActivities;

  // Filtered activities
  const filteredActivities = useMemo(() => {
    let list = activeActivities;

    if (activeTab === 'courses') {
      list = list.filter(
        (a) => a.type === 'COURSE_COMPLETE' || a.type === 'COURSE_PENDING' || a.type === 'MODULE_COMPLETE'
      );
    } else if (activeTab === 'recharges') {
      list = list.filter((a) => a.type === 'RECHARGE' || a.type === 'PLAN_RESET');
    } else if (activeTab === 'refunds') {
      list = list.filter((a) => a.type === 'REFUND');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.courseName && a.courseName.toLowerCase().includes(q)) ||
          a.badgeLabel.toLowerCase().includes(q) ||
          (a.referenceId && a.referenceId.toLowerCase().includes(q))
      );
    }

    return limit ? list.slice(0, limit) : list;
  }, [activeActivities, activeTab, searchQuery, limit]);

  const containerHeight = fill
    ? 'min-h-[280px] flex-1'
    : maxHeight || (compact ? 'max-h-[180px]' : 'max-h-[220px]');

  return (
    <div className={fill ? 'flex h-full min-h-0 flex-1 flex-col space-y-4' : compact ? 'space-y-3' : 'space-y-4'}>
      <div className="space-y-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-lime-500/30 bg-lime-500/10 text-lime-400 shadow-sm">
            <History className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className={`font-bold tracking-tight text-white ${compact ? 'text-sm' : 'text-base'}`}>
              Usage history
            </h3>
            {!compact && (
              <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
                Course charges, with holds and refunds reconciled automatically.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-[#0c121d] p-1 text-[11px]">
          {(
            [
              { id: 'course' as const, label: 'By course', title: 'One row per course' },
              { id: 'module' as const, label: 'By module', title: 'One row per module' },
              { id: 'ledger' as const, label: 'Ledger', title: 'Every wallet entry' },
            ]
          ).map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setViewMode(mode.id)}
              title={mode.title}
              className={`rounded-lg px-1 py-1.5 text-center font-semibold leading-none whitespace-nowrap transition ${
                viewMode === mode.id
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode !== 'ledger' && (
      <div className="space-y-2">
        <div className={compact
          ? 'grid grid-cols-4 gap-0.5 rounded-lg border border-white/10 bg-[#0c121d] p-0.5'
          : 'flex items-center gap-1 overflow-x-auto text-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'}>
          {(compact
            ? [
                { id: 'all', label: 'All' },
                { id: 'courses', label: 'Courses' },
                { id: 'recharges', label: 'Top-up' },
                { id: 'refunds', label: 'Refunds' },
              ]
            : [
                { id: 'all', label: 'All' },
                { id: 'courses', label: 'Course AI' },
                { id: 'recharges', label: 'Top-Ups' },
                { id: 'refunds', label: 'Refunds' },
              ]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'all' | 'courses' | 'recharges' | 'refunds')}
              className={compact
                ? `rounded-md px-1 py-1.5 text-center text-[10px] font-semibold leading-none whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`
                : `rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-white/10 font-semibold text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={viewMode === 'course' ? 'Search courses...' : 'Search activities...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#0c121d] py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-lime-500/50 focus:outline-none"
          />
        </div>
      </div>
      )}

      {/* Content list */}
      {viewMode === 'ledger' ? (
        // RAW AUDIT LEDGER VIEW (Individual Database Rows)
        items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0c121d]/60 p-8 text-center text-xs text-slate-400">
            No raw transactions recorded yet.
          </div>
        ) : (
          <div
            className={`space-y-1.5 overflow-y-auto pr-1 ${containerHeight} [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-lime-400/30`}
          >
            {items.map((tx, idx) => {
              const amt = Number(tx.amount) || 0;
              const isPositive = amt > 0;
              const dateStr = formatFullDate(tx.created_at || tx.createdAt);
              return (
                <div
                  key={tx.id || tx._id || `raw-${idx}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0c121d]/75 px-3 py-2 text-xs hover:border-white/20 hover:bg-[#131d2e]/80 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        tx.type === 'RECHARGE' || tx.type === 'PLAN_RESET'
                          ? 'bg-lime-500/20 text-lime-400'
                          : tx.type === 'RECONCILE' || tx.type === 'REFUND'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : tx.type === 'RESERVE'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-500/20 text-slate-300'
                      }`}
                    >
                      {tx.type}
                    </span>
                    <span className="truncate text-white font-medium">
                      {tx.action?.displayName || tx.action_name || tx.reason || 'Credit Adjustment'}
                    </span>
                    {tx.referenceId && (
                      <span className="hidden sm:inline font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                        {tx.referenceId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-slate-500 hidden md:inline">{dateStr}</span>
                    <span
                      className={`font-mono font-bold ${
                        isPositive ? 'text-lime-400' : 'text-slate-300'
                      }`}
                    >
                      {isPositive ? `+${amt}` : amt} cr
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        // BY COURSE (UNIFIED - e.g. 1 Course, 5 Modules = 400 cr) OR BY MODULE
        filteredActivities.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0c121d]/60 p-8 text-center text-xs text-slate-400">
            No transactions match your search or filter.
          </div>
        ) : (
          <div
            className={`space-y-2.5 overflow-y-auto pr-1 scroll-smooth ${containerHeight} [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-lime-400/30`}
          >
            {filteredActivities.map((act) => {
              const isExpanded = expandedId === act.id;
              const Icon = act.icon;
              const isCourse = act.isCourseGroup || act.type === 'COURSE_COMPLETE';
              const displayTitle = (act.courseName || act.title)
                .replace(/\s*\(\d+\s+Modules\)\s*$/i, '')
                .replace(/\s*\(Module \d+\)\s*$/i, '');
              const amountClass = act.netAmount > 0
                ? 'text-lime-400'
                : act.type === 'COURSE_PENDING'
                ? 'text-amber-400'
                : 'text-white';
              const amountLabel = act.netAmount > 0
                ? `+${act.netAmount.toLocaleString()} cr`
                : `${act.netAmount.toLocaleString()} cr`;

              return (
                <div
                  key={act.id}
                  onClick={() => setExpandedId(isExpanded ? null : act.id)}
                  className={`group cursor-pointer rounded-xl border transition-all ${
                    isExpanded
                      ? 'border-white/20 bg-[#101725] shadow-lg'
                      : 'border-white/10 bg-[#0c121d]/80 hover:border-white/20 hover:bg-[#101725]/60'
                  } ${compact ? 'px-2.5 py-2' : 'p-3.5'}`}
                >
                  {compact ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none ${act.badgeStyle}`}>
                          {act.badgeLabel}
                        </span>
                        <span className="truncate text-xs font-medium text-white" title={displayTitle}>
                          {displayTitle}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className={`whitespace-nowrap font-mono text-xs font-bold ${amountClass}`}>
                          {amountLabel}
                        </span>
                        <ChevronDown
                          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-white' : ''
                          }`}
                        />
                      </div>
                    </div>
                  ) : (
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${
                        isExpanded
                          ? 'border-lime-400/40 bg-lime-400/10 text-lime-400'
                          : 'border-white/10 bg-white/[0.04] text-slate-300 group-hover:border-white/20 group-hover:text-white'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 break-words text-[13px] font-semibold leading-5 text-white">
                          {displayTitle}
                        </p>
                        <div className="flex shrink-0 items-start gap-1">
                          <div className="text-right leading-tight">
                            <p className={`whitespace-nowrap font-mono text-sm font-semibold ${amountClass}`}>
                              {amountLabel}
                            </p>
                            {(isCourse || act.type === 'MODULE_COMPLETE') && (
                              <p className="text-[10px] text-slate-500">Net cost</p>
                            )}
                          </div>
                          <ChevronDown
                            className={`mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-white' : 'group-hover:text-slate-200'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="whitespace-nowrap text-[11px] text-slate-400">{act.dateStr}</span>
                        <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none ${act.badgeStyle}`}>
                          {act.badgeLabel}
                        </span>
                        {(isCourse || act.type === 'MODULE_COMPLETE' || act.type === 'REFUND') && (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-medium text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Reconciled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Expandable Breakdown Drawer */}
                  {isExpanded && (
                    <div className="mt-3.5 pt-3 border-t border-white/10 animate-fadeIn space-y-3">
                      {/* Visual Reconciliation Flow */}
                      <div className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                        <div className="flex items-center justify-between gap-3 px-3 py-2">
                          <span className="text-[11px] text-slate-400">Upfront hold</span>
                          <span className="whitespace-nowrap font-mono text-sm font-bold text-amber-400">
                            -{(act.reservedAmount ?? 0).toLocaleString()} cr
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 px-3 py-2">
                          <span className="text-[11px] text-slate-400">Refunded</span>
                          <span className="whitespace-nowrap font-mono text-sm font-bold text-emerald-400">
                            +{(act.refundAmount ?? 0).toLocaleString()} cr
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 px-3 py-2">
                          <span className="text-[11px] font-medium text-slate-300">Net billed</span>
                          <span className="whitespace-nowrap font-mono text-sm font-bold text-white">
                            {Math.abs(act.netAmount).toLocaleString()} cr
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-[10px] text-slate-400">
                          <span className="whitespace-nowrap">{formatFullDate(act.rawDate.toISOString())}</span>
                          {act.moduleCount ? (
                            <span className="font-medium text-slate-300">
                              {act.moduleCount} {act.moduleCount === 1 ? 'module' : 'modules'}
                            </span>
                          ) : null}
                        </div>

                        {act.courseName && (
                          <div className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium text-lime-400/90">
                            <BookOpen className="h-3 w-3 shrink-0" />
                            <span className="truncate">Course: {act.courseName}</span>
                          </div>
                        )}
                      </div>

                      {/* Itemized Module List if Course Group (Answers: 1 Course, 5 Modules = 400 credits) */}
                      {act.modules && act.modules.length > 0 && (
                        <div className="space-y-2 rounded-xl border border-white/10 bg-[#090f19]/80 p-3">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 border-b border-white/5 pb-1.5">
                            <span className="flex items-center gap-1.5 text-[#38ef7d]">
                              <ListTree className="h-3.5 w-3.5" />
                              <span>Itemized Module Breakdown ({act.modules.length} Modules)</span>
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              Total: {Math.abs(act.netAmount)} cr
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            {act.modules.map((m) => (
                              <div
                                key={`mod-${m.moduleNumber}`}
                                className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-[#10e760]" />
                                  <span className="font-semibold text-white">
                                    Module {m.moduleNumber}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    (Held {m.reservedAmount} cr → Refunded +{m.refundAmount} cr)
                                  </span>
                                </div>
                                <span className="font-mono font-bold text-slate-200">
                                  -{m.netCost} cr
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Explanation note */}
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-black/30 rounded-lg p-2.5">
                        <Info className="h-4 w-4 text-[#10e760] shrink-0" />
                        <span>
                          {act.moduleCount
                            ? `Held ${(act.reservedAmount ?? 0).toLocaleString()} credits across ${act.moduleCount} ${act.moduleCount === 1 ? 'module' : 'modules'}, refunded ${(act.refundAmount ?? 0).toLocaleString()}, and billed ${Math.abs(act.netAmount).toLocaleString()}.`
                            : `Held ${(act.reservedAmount ?? 0).toLocaleString()} credits upfront and refunded ${(act.refundAmount ?? 0).toLocaleString()} when generation finished.`}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default UsageHistory;
