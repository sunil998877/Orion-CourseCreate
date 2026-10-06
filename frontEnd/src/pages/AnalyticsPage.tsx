import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Activity,
  Clock,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Calendar,
  Info
} from 'lucide-react';
import analyticsHeroAvatar from '../assets/analytics-hero-avatar-hd.png';
import analyticsHeroFullPlate from '../assets/analytics-hero-full-plate.png';
import PageTransition from '../components/PageTransition';
import { API_BASE } from '../utils/api';

const AnalyticsPage: React.FC = () => {
  const [range, setRange] = useState<'week' | 'month' | 'year'>('week');
  const [buckets, setBuckets] = useState<{ label: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-10-03');

  useEffect(() => {
    const id = requestAnimationFrame(() => setChartReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const resp = await fetch(`${API_BASE}/analytics/activity?range=${range}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          setBuckets(Array.isArray(data?.buckets) ? data.buckets : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [range]);

  const totalCourses = useMemo(() => buckets.reduce((acc, b) => acc + b.count, 0), [buckets]);

  const peakLabel = useMemo(() => {
    if (!buckets.length) return '2026-10-03';
    const max = Math.max(...buckets.map(b => b.count));
    if (max === 0) return '2026-10-03';

    const peak = buckets.find(b => b.count === max);
    return peak ? peak.label : '2026-10-03';
  }, [buckets]);

  const averageScore = useMemo(() => {
    if (!buckets.length) return '0.6';
    const avg = totalCourses / buckets.length;
    return avg > 0 ? avg.toFixed(1) : '0.6';
  }, [buckets, totalCourses]);

  const formatXAxis = (tick: string) => {
    if (!tick) return '';
    if (range === 'week' || range === 'month') {
      const date = new Date(tick);
      if (isNaN(date.getTime())) return tick;
      return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
    }
    return tick;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0b1410] border border-lime-500/30 p-3 rounded-xl shadow-xl text-white text-xs">
          <p className="font-bold text-lime-400 mb-1">{label}</p>
          <p className="text-gray-300">Courses Created: <span className="font-extrabold text-white">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <PageTransition>
      <div className="min-h-screen text-white relative font-sans selection:bg-lime-500/30 space-y-8 pb-16">
        
        {/* Top Hero Banner - Native Vector Text, Sleek Deep Dark Emerald Studio Background */}
        <section className="relative w-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-[#030906] border border-[#14281c] shadow-[0_24px_80px_rgba(0,0,0,0.7)] group isolate transition-all duration-700 min-h-[340px] sm:min-h-[360px] lg:min-h-[370px] flex flex-col lg:flex-row items-center justify-between">
          
          {/* Full-width 3D Studio Background Plate (Desktop) */}
          <div className="absolute inset-0 pointer-events-none select-none z-0 hidden lg:block">
            <img
              src={analyticsHeroFullPlate}
              alt="Orion Analytics Studio Background"
              className="w-full h-full object-cover object-right"
            />
            {/* Sleek deep dark gradient overlay on left side for moody dark tone & razor-sharp legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#030906]/85 via-[#030906]/55 to-transparent pointer-events-none" />
          </div>

          {/* Subtle Ambient Lighting - Deep, moody dark emerald glow */}
          <div className="absolute top-0 right-1/4 w-[450px] h-[300px] bg-lime-500/10 blur-[140px] rounded-full pointer-events-none -translate-y-1/3 opacity-50" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[250px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none translate-y-1/3 opacity-40" />

          {/* Left Column: Real Crystal-Clear Vector Text & Cards */}
          <div className="relative z-10 w-full lg:w-[48%] flex flex-col justify-between p-6 sm:p-8 lg:p-10 space-y-4 sm:space-y-5">
            
            <div className="space-y-3 sm:space-y-3.5">
              {/* LIVE DASHBOARD Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#122218]/90 border border-lime-400/25 text-[11px] font-bold tracking-wider text-[#a3e635] uppercase backdrop-blur-md shadow-[0_0_20px_rgba(163,230,53,0.15)] w-fit">
                <Activity className="w-3.5 h-3.5 text-[#a3e635]" />
                <span>LIVE DASHBOARD</span>
                <span className="w-2 h-2 rounded-full bg-[#a3e635] shadow-[0_0_8px_#a3e635] animate-pulse" />
              </div>

              {/* Title - Razor sharp vector typography */}
              <h1 className="text-3xl sm:text-4xl lg:text-[3.25rem] font-black text-white tracking-[-0.03em] leading-[1.05]">
                Analytics{' '}
                <span className="text-[#34d399] font-black drop-shadow-[0_0_30px_rgba(52,211,153,0.35)]">
                  Overview
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-gray-300 text-xs sm:text-sm md:text-base font-normal leading-relaxed max-w-[460px]">
                Monitor your implementation metrics, engagement rates, and growth trajectory in real-time.
              </p>
            </div>

            {/* Agent Orion Walkthrough Guide Card */}
            <div
              onClick={() => {
                const el = document.getElementById('performance-metrics');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded-2xl bg-[#0c1611]/85 border border-[#1b3425] backdrop-blur-xl p-4 sm:p-4.5 shadow-[0_15px_40px_rgba(0,0,0,0.4)] flex items-center justify-between gap-4 max-w-[480px] cursor-pointer hover:border-lime-400/40 hover:bg-[#0e1c14] transition-all group/agent"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#12281b] border border-lime-400/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(163,230,53,0.2)] group-hover/agent:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4 text-[#a3e635]" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#a3e635] tracking-widest uppercase">AGENT ORION</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] shadow-[0_0_6px_#a3e635] animate-pulse" />
                  </div>
                  <h4 className="text-white font-bold text-xs sm:text-sm tracking-tight group-hover/agent:text-lime-300 transition-colors">
                    Let me walk you through your analytics.
                  </h4>
                  <p className="text-gray-400 text-[11px] sm:text-xs leading-relaxed">
                    Here, you can track how you're performing as a creator — across weekly, monthly, and yearly views.
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#111e16] border border-[#203a29] flex items-center justify-center text-gray-300 group-hover/agent:text-white group-hover/agent:border-lime-400 transition-all shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Mobile-Only Dedicated 3D Avatar Scene Showcase - 100% visible, no text overlapping */}
            <div className="relative w-full rounded-2xl overflow-hidden border border-[#1b3425] bg-[#08120c] shadow-xl lg:hidden mt-2 p-2">
              <img
                src={analyticsHeroAvatar}
                alt="Orion Analytics AI Architect"
                className="w-full h-[220px] sm:h-[260px] object-contain object-center"
              />
            </div>
          </div>
        </section>

        {/* Section Header: Title & Time Filter Tabs */}
        <div id="performance-metrics" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 bg-gradient-to-b from-lime-400 to-emerald-500 rounded-full shadow-[0_0_12px_#a3e635]" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Performance Metrics
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                Key insights at a glance
              </p>
            </div>
          </div>

          {/* Right Filters: Time Period Pill + Date Selector */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Range Tabs */}
            <div className="inline-flex items-center bg-[#0a110e] border border-white/10 rounded-full p-1 shadow-inner">
              <button
                onClick={() => setRange('week')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                  range === 'week'
                    ? 'bg-[#12281b] text-[#a3e635] border border-lime-400/40 shadow-[0_0_15px_rgba(163,230,53,0.25)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setRange('month')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                  range === 'month'
                    ? 'bg-[#12281b] text-[#a3e635] border border-lime-400/40 shadow-[0_0_15px_rgba(163,230,53,0.25)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setRange('year')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                  range === 'year'
                    ? 'bg-[#12281b] text-[#a3e635] border border-lime-400/40 shadow-[0_0_15px_rgba(163,230,53,0.25)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                This Year
              </button>
            </div>

            {/* Date Pill Picker */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a110e] border border-white/10 text-xs font-semibold text-gray-300 hover:border-white/20 transition-all cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{selectedDate}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* 4 Performance Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Card 1: Active Range */}
          <div className="rounded-2xl bg-[#091118]/80 border border-white/[0.08] backdrop-blur-xl p-5 hover:border-emerald-500/30 transition-all duration-300 shadow-xl flex flex-col justify-between h-[180px] group">
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-medium">Active Range</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {range === 'week' ? 'Weekly' : range === 'month' ? 'Monthly' : 'Yearly'}
                  </h3>
                </div>
              </div>
              <Info className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
            </div>

            {/* Middle Subtitle */}
            <p className="text-xs text-gray-400 font-medium">Current time period</p>

            {/* Bottom Row: Mini Green Vertical Bars + Action Arrow */}
            <div className="flex items-end justify-between pt-2">
              <div className="flex items-end gap-1.5 h-8">
                <span className="w-1.5 h-4 bg-emerald-400/50 rounded-t-sm" />
                <span className="w-1.5 h-6 bg-emerald-400/80 rounded-t-sm" />
                <span className="w-1.5 h-8 bg-emerald-400 rounded-t-sm shadow-[0_0_8px_#34d399]" />
                <span className="w-1.5 h-5 bg-emerald-400/70 rounded-t-sm" />
                <span className="w-1.5 h-7 bg-emerald-400/90 rounded-t-sm" />
                <span className="w-1.5 h-3 bg-emerald-400/40 rounded-t-sm" />
                <span className="w-1.5 h-6 bg-emerald-400/80 rounded-t-sm" />
                <span className="w-1.5 h-7 bg-emerald-400 rounded-t-sm shadow-[0_0_8px_#34d399]" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:border-emerald-400/50 group-hover:bg-emerald-500/10 transition-all cursor-pointer">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 2: Total Courses */}
          <div className="rounded-2xl bg-[#091118]/80 border border-white/[0.08] backdrop-blur-xl p-5 hover:border-blue-500/30 transition-all duration-300 shadow-xl flex flex-col justify-between h-[180px] group">
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-medium">Total Courses</span>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {totalCourses || 4}
                    </h3>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                      ↑ +2
                    </span>
                  </div>
                </div>
              </div>
              <Info className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
            </div>

            {/* Middle Subtitle */}
            <p className="text-xs text-gray-400 font-medium">Published courses</p>

            {/* Bottom Row: Mini Blue Spline Wave + Action Arrow */}
            <div className="flex items-end justify-between pt-2">
              <svg className="w-28 h-7 text-blue-400 overflow-visible" viewBox="0 0 100 25" fill="none">
                <path
                  d="M0 20 Q 25 24 35 15 T 70 8 T 100 16"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:border-blue-400/50 group-hover:bg-blue-500/10 transition-all cursor-pointer">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 3: Peak Date */}
          <div className="rounded-2xl bg-[#091118]/80 border border-white/[0.08] backdrop-blur-xl p-5 hover:border-purple-500/30 transition-all duration-300 shadow-xl flex flex-col justify-between h-[180px] group">
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-medium">Peak Date</span>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {peakLabel}
                  </h3>
                </div>
              </div>
              <Info className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
            </div>

            {/* Middle Subtitle */}
            <p className="text-xs text-gray-400 font-medium">Highest activity recorded</p>

            {/* Bottom Row: Mini Purple Vertical Bars + Action Arrow */}
            <div className="flex items-end justify-between pt-2">
              <div className="flex items-end gap-1.5 h-8">
                <span className="w-1.5 h-3 bg-purple-400/40 rounded-t-sm" />
                <span className="w-1.5 h-6 bg-purple-400/70 rounded-t-sm" />
                <span className="w-1.5 h-8 bg-purple-400 rounded-t-sm shadow-[0_0_8px_#c084fc]" />
                <span className="w-1.5 h-5 bg-purple-400/80 rounded-t-sm" />
                <span className="w-1.5 h-7 bg-purple-400 rounded-t-sm shadow-[0_0_8px_#c084fc]" />
                <span className="w-1.5 h-4 bg-purple-400/50 rounded-t-sm" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:border-purple-400/50 group-hover:bg-purple-500/10 transition-all cursor-pointer">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 4: Average */}
          <div className="rounded-2xl bg-[#091118]/80 border border-white/[0.08] backdrop-blur-xl p-5 hover:border-amber-500/30 transition-all duration-300 shadow-xl flex flex-col justify-between h-[180px] group">
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-medium">Average</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {averageScore}
                  </h3>
                </div>
              </div>
              <Info className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
            </div>

            {/* Middle Subtitle */}
            <p className="text-xs text-gray-400 font-medium">Engagement score</p>

            {/* Bottom Row: Mini Orange Spline Wave + Action Arrow */}
            <div className="flex items-end justify-between pt-2">
              <svg className="w-28 h-7 text-amber-400 overflow-visible" viewBox="0 0 100 25" fill="none">
                <path
                  d="M0 18 Q 20 8 30 18 T 60 12 T 80 18 T 100 10"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:border-amber-400/50 group-hover:bg-amber-500/10 transition-all cursor-pointer">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Visualization Chart Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-gradient-to-b from-lime-400 to-emerald-500 rounded-full shadow-[0_0_12px_#a3e635]" />
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">Activity Visualization</h3>
          </div>

          <div className="relative rounded-[2rem] bg-[#070e0a]/90 border border-white/[0.08] backdrop-blur-xl p-6 sm:p-8 shadow-2xl h-[440px] hover:border-lime-500/20 transition-all duration-700">
            <div className="absolute inset-x-20 bottom-0 h-48 bg-lime-500/5 blur-[100px] rounded-full pointer-events-none" />

            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-white/40 space-y-4">
                <div className="w-10 h-10 border-4 border-lime-500/30 border-t-lime-400 rounded-full animate-spin" />
                <p className="text-xs font-semibold tracking-widest uppercase">Loading Activity Data...</p>
              </div>
            ) : chartReady ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
                <BarChart data={buckets} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a3e635" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#ffffff40"
                    tickFormatter={formatXAxis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#ffffff40"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(163,230,53,0.06)', radius: 8 }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#barGradient)"
                    radius={[6, 6, 6, 6]}
                    barSize={36}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default AnalyticsPage;