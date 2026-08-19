import React from 'react';
import { History } from 'lucide-react';
import type { WalletTransaction } from '../../types/credits.types';

type Props = {
  items: WalletTransaction[];
  limit?: number;
  compact?: boolean;
  maxHeight?: string;
};



const formatDate = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
};

type TxType = WalletTransaction['type'];

const TYPE_CONFIG: Record<
  TxType,
  {
    label: string;
    badgeStyle: string;
  }
> = {
  RESERVE: {
    label: 'RESERVED',
    badgeStyle: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  RECONCILE: {
    label: 'RECONCILE',
    badgeStyle: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
  },
  REFUND: {
    label: 'REFUND',
    badgeStyle: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  RECHARGE: {
    label: 'RECHARGE',
    badgeStyle: 'border-lime-500/30 bg-lime-500/10 text-lime-400',
  },
  PLAN_RESET: {
    label: 'PLAN RESET',
    badgeStyle: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  },
  ADJUSTMENT: {
    label: 'ADJUSTMENT',
    badgeStyle: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  },
};

const getBadgeStyle = (tx: WalletTransaction): string => {
  if (tx.type === 'RECONCILE') {
    if (tx.amount > 0) return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
    if (tx.amount < 0) return 'border-orange-500/30 bg-orange-500/10 text-orange-400';
    return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400';
  }
  return TYPE_CONFIG[tx.type]?.badgeStyle || 'border-white/20 bg-white/10 text-white/70';
};

const getBadgeLabel = (tx: WalletTransaction): string => {
  return TYPE_CONFIG[tx.type]?.label || tx.type;
};

const getActionName = (tx: WalletTransaction): string => {
  if (tx.action?.displayName) return tx.action.displayName;
  if (tx.action_name) return tx.action_name;
  if (tx.type === 'RECHARGE') return 'Wallet Top-Up';
  if (tx.type === 'REFUND') return 'Credit Refund';
  if (tx.type === 'PLAN_RESET') return 'Monthly Plan Reset';
  if (tx.type === 'ADJUSTMENT') return 'Balance Adjustment';
  if (tx.type === 'RESERVE') return 'Credit Reservation';
  if (tx.type === 'RECONCILE') return 'Usage Reconciliation';
  return tx.type;
};

const formatAmount = (tx: WalletTransaction) => {
  const amt = Number(tx.amount);
  if (isNaN(amt) || amt === 0) {
    return { text: '0 cr', color: 'text-white/50' };
  }
  if (amt > 0) {
    return { text: `+${amt.toLocaleString()} cr`, color: 'text-lime-400' };
  }

  const absVal = Math.abs(amt);
  const color = tx.type === 'RESERVE' ? 'text-amber-400' : 'text-red-400';
  return { text: `-${absVal.toLocaleString()} cr`, color };
};



const UsageHistory: React.FC<Props> = ({ items, limit, compact = false, maxHeight }) => {
  const containerMaxHeight = maxHeight || (compact ? 'max-h-[200px]' : 'max-h-[320px]');
  const displayedItems = limit ? items.slice(0, limit) : items;

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-lime-400" />
          <h3 className={`font-semibold text-white ${compact ? 'text-xs' : 'text-sm'}`}>
            Transaction History
          </h3>
        </div>
        {items.length > 0 && (
          <span className="text-[10px] font-medium text-white/40">
            {items.length} {items.length === 1 ? 'entry' : 'entries'}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-white/40 py-2">No transactions yet.</p>
      ) : (
        <div
          className={`space-y-1.5 overflow-y-auto pr-1 scroll-smooth ${containerMaxHeight} [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-lime-400/40`}
        >
          {displayedItems.map((tx, idx) => {
            const badgeStyle = getBadgeStyle(tx);
            const badgeLabel = getBadgeLabel(tx);
            const actionTitle = getActionName(tx);
            const { text: amountText, color: amountColor } = formatAmount(tx);
            const dateStr = formatDate(tx.created_at || tx.createdAt);
            const key = tx.id || tx._id || `tx-${idx}`;

            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2 transition-colors hover:bg-white/[0.06]"
              >
                <div className="min-w-0 flex items-center gap-2">
                  {/* Type badge */}
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase ${badgeStyle}`}
                  >
                    {badgeLabel}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs text-white/80">{actionTitle}</p>
                    <p className="text-[10px] text-white/30">{dateStr}</p>
                  </div>
                </div>
                <span className={`ml-3 shrink-0 text-xs font-semibold ${amountColor}`}>
                  {amountText}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UsageHistory;
