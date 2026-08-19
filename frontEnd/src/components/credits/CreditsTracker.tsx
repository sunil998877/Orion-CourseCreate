import React, { useEffect, useRef, useState } from 'react';
import { Plus, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCredits } from '../../contextAPI/CreditsContext';
import CreditsPopover from './CreditsPopover';

const CreditsTracker: React.FC = () => {
  const navigate = useNavigate();
  const { credits, transactions, usagePercentage } = useCredits();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToAddCredits = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setPopoverOpen(false);
    navigate('/add-credits');
  };

  return (
    <div ref={containerRef} className="relative mt-auto border-t border-white/10 p-3">
      {popoverOpen && (
        <CreditsPopover
          credits={credits}
          usagePercentage={usagePercentage}
          usageHistory={transactions}
          onClose={() => setPopoverOpen(false)}
          onAddCredits={goToAddCredits}
        />
      )}

      <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm transition hover:border-lime-500/20">
        <button
          type="button"
          onClick={() => setPopoverOpen((prev) => !prev)}
          className="w-full rounded-t-xl p-3 text-left transition hover:bg-white/5"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-lime-500/20 bg-lime-500/10">
                <Zap size={16} className="text-lime-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Credits</p>
                <p className="text-[10px] text-white/40">AI Usage</p>
              </div>
            </div>
            <span className="text-[10px] text-white/50">
              {usagePercentage > 0 && usagePercentage < 10 && usagePercentage % 1 !== 0
                ? usagePercentage.toFixed(1)
                : Math.round(usagePercentage)}% used
            </span>
          </div>

          <div className="mb-2 flex items-end justify-between">
            <div>
              <span className="text-lg font-bold text-white">
                {credits.remaining.toLocaleString()}
              </span>
              <span className="ml-1 text-xs text-white/40">
                / {credits.total.toLocaleString()}
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-wider text-white/40">remaining</span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-500 transition-all duration-500"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </button>

        <div className="border-t border-white/5 p-2">
          <button
            type="button"
            onClick={goToAddCredits}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-lime-500/20 bg-lime-500/10 px-3 py-2 text-xs font-bold text-lime-400 transition hover:bg-lime-500/20 hover:text-lime-300"
          >
            <Plus size={14} />
            Add Credits
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditsTracker;
