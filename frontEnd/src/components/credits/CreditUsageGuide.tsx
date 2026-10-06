import React from 'react';
import {
  BookOpen,
  FileText,
  HelpCircle,
  Headphones,
  RefreshCw,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';

const IMPORTANT_POINTS = [
  {
    icon: Zap,
    title: 'Upfront Hold & Refund',
    desc: 'A 250 cr/mod deposit is held during generation; unused credits refund instantly on finish (~80 cr net).',
    color: 'text-lime-400',
    bg: 'bg-lime-400/10 border-lime-400/20',
  },
  {
    icon: ShieldCheck,
    title: 'Zero Waste Guarantee',
    desc: 'You only pay for successful generations. Any cancelled or failed job releases 100% of held credits.',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10 border-sky-400/20',
  },
];

const ACTION_RATES = [
  {
    name: 'Full Course (per Module)',
    rate: '~80 cr',
    sub: 'Net after auto-refund',
    icon: BookOpen,
    category: 'Core AI',
    highlight: true,
  },
  {
    name: 'Module Slide Deck',
    rate: '~80 cr',
    sub: '10 presentation slides',
    icon: Layers,
    category: 'Slides',
  },
  {
    name: 'Workbook & Worksheets',
    rate: '20 cr',
    sub: 'Exercises & answer keys',
    icon: FileText,
    category: 'Practice',
  },
  {
    name: 'Course Outline & Syllabus',
    rate: '10 cr',
    sub: 'Structure & breakdown',
    icon: Layers,
    category: 'Planning',
  },
  {
    name: 'Quiz & Assessments',
    rate: '8 cr',
    sub: 'Multiple choice & scoring',
    icon: HelpCircle,
    category: 'Assess',
  },
  {
    name: 'AI Voiceover Narration',
    rate: '15 cr/m',
    sub: 'Neural audio narration',
    icon: Headphones,
    category: 'Audio',
  },
  {
    name: 'Section Regenerate / Edit',
    rate: '5 cr',
    sub: 'Targeted prompt refinement',
    icon: RefreshCw,
    category: 'Edit',
  },
];

const CreditUsageGuide: React.FC = () => {
  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lime-400 shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Credit Usage Guide</h2>
            <p className="text-[11px] text-slate-400">Standard rates and auto-reconciliation rules</p>
          </div>
        </div>

        <span className="rounded-full border border-lime-400/30 bg-lime-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-lime-400">
          Auto-Reconciled
        </span>
      </div>

      {/* Important Points Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {IMPORTANT_POINTS.map((pt) => {
          const Icon = pt.icon;
          return (
            <div
              key={pt.title}
              className="rounded-xl border border-white/10 bg-[#0c121d]/90 p-3 flex items-start gap-2.5"
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${pt.bg} ${pt.color}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-white tracking-tight">
                  {pt.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {pt.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rate Sheet Table / Cards */}
      <div className="flex-1 rounded-xl border border-white/10 bg-[#0c121d]/70 divide-y divide-white/5 overflow-hidden">
        <div className="px-3.5 py-2 bg-white/[0.02] flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <span>Action</span>
          <span>Cost</span>
        </div>

        {ACTION_RATES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="flex items-center justify-between px-3.5 py-2.5 hover:bg-white/[0.03] transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-slate-300">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-white truncate">
                      {item.name}
                    </span>
                    <span className="text-[9px] font-medium text-slate-500 rounded bg-white/5 px-1.5 py-0.2">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    {item.sub}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 ml-3">
                <span
                  className={`font-mono text-xs font-bold ${
                    item.highlight ? 'text-lime-400' : 'text-slate-200'
                  }`}
                >
                  {item.rate}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CreditUsageGuide;
