import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, Clock, TrendingUp, Activity, ChevronDown, Sparkles } from 'lucide-react';
import avtar3 from '../assests/avtar3.png';
import PageTransition from '../components/PageTransition';
import { API_BASE } from '../utils/api';

const AnalyticsPage: React.FC = () => {
  const [range, setRange] = useState<'week' | 'month' | 'year'>('week');
  const [buckets, setBuckets] = useState<{ label: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setChartReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Theme logic
  const theme = useMemo(() => {
    const t = (localStorage.getItem('theme') || 'blue').toLowerCase();
    const palettes: Record<string, { accent: string; accentSoft: string }> = {
      blue: { accent: '#3b82f6', accentSoft: 'rgba(59,130,246,0.1)' },
      emerald: { accent: '#10b981', accentSoft: 'rgba(16,185,129,0.1)' },
      purple: { accent: '#a855f7', accentSoft: 'rgba(168,85,247,0.1)' },
      rose: { accent: '#f43f5e', accentSoft: 'rgba(244,63,94,0.1)' },
      indigo: { accent: '#6366f1', accentSoft: 'rgba(99,102,241,0.1)' },
      lime: { accent: '#84cc16', accentSoft: 'rgba(132,204,22,0.1)' },
    };
    return palettes[t] || palettes.blue;
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
    if (!buckets.length) return '-';
    const max = Math.max(...buckets.map(b => b.count));
    if (max === 0) return '-';
    // Find the first bucket with max count
    const peak = buckets.find(b => b.count === max);
    return peak ? peak.label : '-';
  }, [buckets]);

  // Format X-axis tick
  const formatXAxis = (tick: string) => {
    if (!tick) return '';
    if (range === 'week' || range === 'month') {
      const date = new Date(tick);
      if (isNaN(date.getTime())) return tick;
      return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
    }
    return tick; // YYYY-MM
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-2 rounded shadow text-white text-xs">
          <p className="font-bold" style={{ color: theme.accent }}>{label}</p>
          <p>Courses Created: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  const rangeOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];


  return (
    <PageTransition>
      <div className="min-h-screen text-white relative font-sans selection:bg-lime-500/30">
        <div className="space-y-10 pb-20">

          {/* Futurstic Hero Header */}
          <div className="relative rounded-[2.5rem] max-md:rounded-2xl bg-gray-900/40 border border-white/10 backdrop-blur-2xl p-8 md:p-12 max-md:p-5 overflow-hidden shadow-2xl group">
            {/* Subtle Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-lime-500/10 via-transparent to-transparent opacity-30 group-hover:opacity-40 transition-opacity duration-700" />
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-lime-500/10 rounded-full blur-[80px]" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Left: Title Area */}
              <div className="space-y-3 text-center md:text-left flex-1">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-400 text-xs font-bold uppercase tracking-widest mb-2 shadow-[0_0_10px_rgba(132,204,22,0.2)]">
                  <Activity className="w-3 h-3 mr-2" />
                  Live Dashboard
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                  Analytics Overview
                </h1>
                <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                  Monitor your implementation metrics, engagement rates, and growth trajectory in real-time.
                </p>

                {/* ── Orion's Integrated Insight Card ── */}
                <div className="mt-8 relative group/insight max-w-lg">
                  <div className="absolute -inset-2 bg-lime-500/10 blur-xl rounded-2xl opacity-0 group-hover/insight:opacity-100 transition-opacity duration-700" />
                  <div className="relative flex items-start gap-4 p-4 rounded-2xl bg-[#0F0F0F]/60 border border-white/10 backdrop-blur-xl shadow-xl transition-all duration-500 group-hover/insight:border-lime-500/30">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-lime-400 to-emerald-500 p-[1px] shadow-[0_0_15px_rgba(132,204,22,0.2)]">
                      <div className="w-full h-full rounded-xl bg-[#0A0A0A] flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-lime-400" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-lime-400 tracking-widest uppercase opacity-70">Agent ORION</span>
                        <div className="w-1 h-1 rounded-full bg-lime-500 animate-pulse" />
                      </div>
                      <p className="text-[13px] text-gray-200 leading-relaxed font-medium">
                        Let me walk you through your analytics.
                        <span className="block mt-1 text-gray-400 font-normal">
                          "Here, you can track how you're performing as a creator — across weekly, monthly, and yearly views."
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Controls & Character */}
              <div className="flex items-center gap-8 md:gap-12 relative">
                {/* Date Range Picker */}
                <div className="relative z-20">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm font-medium text-white hover:bg-white/5 hover:border-lime-500/30 hover:shadow-[0_0_15px_rgba(132,204,22,0.1)] transition-all duration-300 group/btn"
                  >
                    <div className="p-1.5 rounded-lg bg-white/5 group-hover/btn:bg-lime-500/20 transition-colors">
                      <Clock className="w-4 h-4 text-gray-300 group-hover/btn:text-lime-400" />
                    </div>
                    <span>{rangeOptions.find(o => o.value === range)?.label}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${dropdownOpen ? 'rotate-180 text-lime-400' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-3 w-56 bg-[#0f1115] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/50 animate-in fade-in zoom-in-95 duration-200">
                        {rangeOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setRange(option.value as any);
                              setDropdownOpen(false);
                            }}
                            className="w-full text-left px-5 py-3.5 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all flex items-center gap-3 border-b border-white/5 last:border-0 group/opt"
                          >
                            <span className={`w-2 h-2 rounded-full transition-all duration-300 ${range === option.value ? 'bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)] scale-125' : 'bg-white/10 group-hover/opt:bg-lime-500/50'}`} />
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Ultra-High-Fidelity AI Hologram System */}
                <div className="relative w-56 h-72 md:w-64 md:h-80 flex items-end justify-center pointer-events-auto select-none perspective-[1200px] group/holo">

                  {/* 1. Volumetric Projector Beams (Light Pillars) */}
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-4/5 h-full bg-gradient-to-t from-lime-500/20 via-lime-500/5 to-transparent blur-2xl opacity-50 group-hover/holo:opacity-80 transition-opacity duration-700 pointer-events-none mix-blend-screen" />

                  {/* 2. Rotating Tech Rings (Base) */}
                  <div className="absolute bottom-6 w-full h-20 border border-lime-500/30 rounded-[100%] animate-[spin_8s_linear_infinite] shadow-[0_0_20px_rgba(132,204,22,0.2)] group-hover/holo:border-lime-400/50 transition-colors" />
                  <div className="absolute bottom-6 w-5/6 h-14 border border-dashed border-emerald-400/30 rounded-[100%] animate-[spin_12s_linear_infinite_reverse]" />
                  <div className="absolute bottom-6 w-2/3 h-8 border border-dotted border-white/20 rounded-[100%] animate-[spin_4s_linear_infinite]" />

                  {/* 3. Rising Data Streams (Particles) */}
                  <div className="absolute inset-0 overflow-hidden rounded-full mask-image-[radial-gradient(circle,black,transparent)] pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute bottom-0 text-[10px] font-mono text-lime-400/60 animate-up-fade"
                        style={{
                          left: `${20 + Math.random() * 60}%`,
                          animationDuration: `${3 + Math.random() * 4}s`,
                          animationDelay: `${Math.random() * 2}s`
                        }}
                      >
                        {Math.random() > 0.5 ? '01' : '10'} <br /> {Math.random() > 0.5 ? 'EF' : '3A'}
                      </div>
                    ))}
                  </div>

                  {/* 4. The Character (Hologram with Signal Noise) */}
                  <div className="relative z-10 w-full h-full flex items-end justify-center">

                    {/* Active Scanline - Moves Down */}
                    <div className="absolute inset-x-0 h-1 bg-lime-400/50 shadow-[0_0_15px_#a3e635] z-30 opacity-70 animate-[scan_3s_ease-in-out_infinite] group-hover/holo:opacity-30" />

                    {/* Character Container with Glitch on Idle, Stable on Hover */}
                    <div className="relative w-full h-full transition-transform duration-500 group-hover/holo:scale-[1.02]">
                      <img
                        src={avtar3}
                        alt="AI Analyst"
                        className="h-full w-auto object-contain object-bottom 
                               opacity-85 transition-all duration-500
                               filter grayscale-[0.2] sepia-[0.6] hue-rotate-[60deg] brightness-[1.2] contrast-[1.1]
                               group-hover/holo:grayscale-0 group-hover/holo:sepia-0 group-hover/holo:hue-rotate-0 group-hover/holo:brightness-100
                               mask-image-[linear-gradient(to_bottom,black_80%,transparent_100%)]"
                      />

                      {/* Signal Noise Texture */}
                      <div className="absolute inset-0 opacity-20 mix-blend-overlay brightness-150 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

                      {/* Ghost/Bloom Layer */}
                      <img
                        src={avtar3}
                        alt=""
                        className="absolute inset-0 h-full w-auto object-contain object-bottom opacity-40 blur-[2px] mix-blend-screen animate-pulse"
                      />
                    </div>
                  </div>

                  <div className="absolute -bottom-[5.5rem] left-0 right-0 h-24 transform scale-y-[-1] opacity-25 mask-image-[linear-gradient(to_top,black,transparent)] filter blur-sm">
                    <img src={avtar3} alt="" className="h-full w-auto mx-auto object-contain object-bottom grayscale sepia" />
                  </div>
                </div>

                {/* Add styles for custom animations if not present in global CSS */}
                <style>{`
                @keyframes scan {
                  0%, 100% { top: 0%; opacity: 0; }
                  10% { opacity: 1; }
                  90% { opacity: 1; }
                  100% { top: 100%; opacity: 0; }
                }
                @keyframes up-fade {
                  0% { transform: translateY(0); opacity: 1; }
                  100% { transform: translateY(-100px); opacity: 0; }
                }
                @keyframes float-slow {
                  0%, 100% { transform: translateY(0) rotate(0deg); }
                  50% { transform: translateY(-10px) rotate(1deg); }
                }
              `}</style>
              </div>
            </div>
          </div>

          {/* Stats Section with Neon Titles */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 pl-1">
              <div className="w-1 h-8 bg-gradient-to-b from-lime-400 to-emerald-500 rounded-full shadow-[0_0_12px_#84cc16]" />
              <h2 className="text-xl font-bold text-white tracking-wide">Performance Metrics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Courses", value: totalCourses, icon: Users, sub: "Lifetime created" },
                { label: "Active Range", value: range === 'week' ? 'Weekly' : range === 'month' ? 'Monthly' : 'Yearly', icon: Clock, sub: "Current view" },
                { label: "Peak Date", value: peakLabel, icon: TrendingUp, sub: "Highest activity" },
                { label: "Average", value: buckets.length ? (totalCourses / buckets.length).toFixed(1) : '0.0', icon: Activity, sub: `Per ${range === 'year' ? 'month' : 'day'}` }
              ].map((stat, idx) => (
                <div key={idx} className="group relative bg-gray-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md hover:bg-white/5 hover:border-lime-500/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(132,204,22,0.1)]">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 group-hover:border-lime-500/20 group-hover:bg-lime-500/10 transition-colors duration-500 text-gray-400 group-hover:text-lime-400">
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-extrabold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-lime-200 transition-all duration-500">
                      {stat.value}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 group-hover:text-lime-500/80 uppercase tracking-wider transition-colors duration-300">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Chart Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 pl-1">
              <div className="w-1 h-8 bg-gradient-to-b from-lime-400 to-emerald-500 rounded-full shadow-[0_0_12px_#84cc16]" />
              <h2 className="text-xl font-bold text-white tracking-wide">Activity Visualization</h2>
            </div>

            <div className="relative rounded-[2rem] bg-gray-900/40 border border-white/5 backdrop-blur-xl p-8 shadow-2xl h-[500px] hover:border-white/10 transition-colors duration-700">
              {/* Subtle Chart Glow */}
              <div className="absolute inset-x-20 bottom-0 h-64 bg-lime-500/5 blur-[100px] rounded-full pointer-events-none" />

              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4">
                  <div className="w-10 h-10 border-4 border-lime-500/30 border-t-lime-500 rounded-full animate-spin" />
                  <p className="text-sm font-medium tracking-widest uppercase">Loading Data...</p>
                </div>
              ) : chartReady ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
                  <BarChart data={buckets} margin={{ top: 20, right: 0, left: -20, bottom: 40 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#84cc16" stopOpacity={0.8} />
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
                      dy={20}
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
                      cursor={{ fill: 'rgba(132,204,22,0.05)', radius: 8 }}
                    />
                    <Bar
                      dataKey="count"
                      fill="url(#barGradient)"
                      radius={[6, 6, 6, 6]}
                      barSize={40}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
export default AnalyticsPage;