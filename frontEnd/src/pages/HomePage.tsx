

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Layout, Plus, Presentation, Headphones, BookOpen, Download, Music, Zap } from 'lucide-react';
import avatarImg from '../assests/avtar1.png';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const [username, setUsername] = useState<string>('');
  const navigate = useNavigate();

  const handleCreateNew = () => {
    sessionStorage.setItem('resetCourseData', 'true');
    navigate('/create-course');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
        const payload = JSON.parse(atob(padded));
        if (payload?.username) {
          setUsername(String(payload.username));
        }
      }
    } catch { }
  }, []);

  return (
    <PageTransition>
      <div className="space-y-8 animate-fade-in  ">
        {/* Hero Section */}
        <section className="relative w-full rounded-[2.5rem] max-md:rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/5 shadow-2xl group isolate transition-all duration-700 hover:shadow-emerald-900/10">
          <div className="absolute inset-0 opacity-20 brightness-100 contrast-150 mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-lime-500/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3 opacity-50" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/4 opacity-50" />

          <div className="relative bottom-4 z-10 flex flex-col md:flex-row items-center md:items-end justify-between px-8 pt-12 pb-0 md:px-16 md:pt-16 gap-8 md:gap-12 min-h-[480px] max-md:px-4 max-md:pt-6 max-md:min-h-0">
            <div className="relative flex-1 space-y-6 md:space-y-8 max-w-2xl text-center md:text-left pb-6 md:pb-20 self-center max-md:w-full">
              <div className="absolute -inset-10 bg-lime-500/5 blur-3xl rounded-full -z-10 pointer-events-none mix-blend-screen opacity-50" />

              <div className="space-y-4 md:space-y-6 relative">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wide text-lime-400 w-fit mx-auto md:mx-0 uppercase backdrop-blur-md shadow-lg shadow-lime-900/10">
                  <Sparkles className="w-3 h-3 mr-2" />
                  AI-Powered Learning
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-8xl font-black text-white tracking-tighter leading-[1.05] md:leading-[0.9] mb-2 md:mb-4">
                  Welcome back, <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-lime-300 via-emerald-400 to-teal-500 animate-gradient-x px-1">
                    {username || 'Creator'}
                  </span>
                </h1>

                <div className="mt-6 space-y-6 text-left w-full max-w-xl mx-auto md:mx-0">
                  <div className="relative p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden group/guide">
                    <div className="absolute inset-0 bg-gradient-to-br from-lime-500/[0.05] via-transparent to-transparent opacity-0 group-hover/guide:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-lime-500/20 flex items-center justify-center border border-lime-500/30">
                          <Sparkles className="w-5 h-5 text-lime-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight">First-Time User Guidance</h3>
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-300 font-medium italic">New here? Let's get you started.</p>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-lime-400 mt-0.5">1</div>
                          <p className="text-gray-400 text-sm leading-relaxed">
                            Check out the section immediately below: <span className="text-white font-semibold">"Ready to build your next Masterpiece?"</span>
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-lime-400 mt-0.5">2</div>
                          <p className="text-gray-400 text-sm leading-relaxed">
                            Click on <button onClick={handleCreateNew} className="text-lime-400 font-bold underline underline-offset-4 decoration-lime-500/30 hover:text-lime-300 transition-colors cursor-pointer">"Start Creating"</button> to begin your journey.
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-lime-400 mt-0.5">3</div>
                          <p className="text-gray-400 text-sm leading-relaxed">
                            Click on <span className="text-white font-semibold">"Create New Course"</span> to get started by <button onClick={() => navigate('/course-dashboard')} className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors cursor-pointer underline underline-offset-4 decoration-emerald-500/30">on the course dashboard</button>.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto flex justify-center md:justify-end">
              <div className="relative w-[320px] md:w-[480px] h-[400px] md:h-[500px] flex items-end justify-center perspective-[1200px] group/scene">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-full bg-gradient-to-t from-lime-500/10 via-emerald-500/5 to-transparent blur-3xl opacity-60 pointer-events-none mix-blend-screen" />
                <div
                  className="absolute top-10 left-6 right-6 bottom-16 bg-gray-900/60 backdrop-blur-md border border-white/10 rounded-2xl -z-10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] flex flex-col gap-4 p-6 transition-all duration-700 ease-out transform-gpu group-hover/scene:rotate-y-[-5deg] group-hover/scene:rotate-x-[5deg] group-hover/scene:translate-x-2"
                  style={{ transform: 'rotateY(-12deg) rotateX(5deg) scale(0.95)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-2xl pointer-events-none" />
                  <div className="flex gap-2 mb-2 opacity-50">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 h-28 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
                      <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-lime-500/20 to-transparent" />
                    </div>
                    <div className="flex-1 h-28 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
                      <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-emerald-500/20 to-transparent" />
                    </div>
                  </div>
                  <div className="space-y-3 mt-auto">
                    <div className="h-2 w-3/4 bg-white/10 rounded-full" />
                    <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                  </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[280px] h-[80px] pointer-events-none" style={{ transform: 'rotateX(60deg)' }}>
                  <div className="absolute inset-0 border-[3px] border-lime-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
                  <div className="absolute inset-2 border-[2px] border-dashed border-emerald-400/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                  <div className="absolute inset-8 bg-lime-400/20 blur-xl rounded-full animate-pulse" />
                </div>

                <div className="relative z-20 w-full h-full flex items-end justify-center pointer-events-none">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
                    className="absolute top-0 right-0 z-30 animate-float-slow"
                  >
                    <div className="relative bg-[#0F172A]/90 backdrop-blur-2xl border border-lime-500/30 rounded-[2rem] rounded-br-lg px-6 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(132,204,22,0.1)] max-w-[220px]">
                      <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-lime-400 to-transparent" />
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_10px_#a3e635] animate-pulse" />
                        <span className="text-[10px] font-black text-lime-400 tracking-[0.2em] uppercase">Status: Online</span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed font-medium">
                        I've prepared your architecture. <span className="text-lime-400 font-bold italic">Ready to build?</span>
                      </p>
                      <div className="absolute -bottom-2 right-6 w-5 h-5 bg-[#0F172A]/90 border-r border-b border-lime-500/20 rotate-45" />
                    </div>
                  </motion.div>

                  <img
                    src={avatarImg}
                    alt="Orion — AI Course Architect"
                    className="w-auto h-[110%] object-contain object-bottom drop-shadow-[0_40px_60px_rgba(0,0,0,0.8)] animate-float-medium transition-transform duration-700 group-hover/scene:scale-105"
                    style={{
                      maskImage: 'linear-gradient(to_bottom, black 80%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to_bottom, black 80%, transparent 100%)'
                    }}
                  />
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-12 bg-lime-500/20 blur-3xl rounded-full -z-10" />
                </div>

                <div className="absolute inset-0 z-30 pointer-events-none">
                  <motion.div
                    animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
                    className="absolute top-1/4 left-0 w-16 h-16 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl flex items-center justify-center rotate-12"
                  >
                    <Sparkles className="w-7 h-7 text-lime-400" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
                    className="absolute bottom-1/3 right-0 w-14 h-14 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[1.25rem] shadow-2xl flex items-center justify-center -rotate-12"
                  >
                    <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_15px_#34d399] animate-pulse" />
                  </motion.div>
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 scale-110">
                    <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-[#0F172A]/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] ring-1 ring-lime-500/20">
                      <div className="w-2.5 h-2.5 rounded-full bg-lime-400 shadow-[0_0_12px_rgba(163,230,53,1)] animate-pulse" />
                      <span className="text-[10px] font-black text-white tracking-[0.3em] uppercase">Orion Architect</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Premium CTA Section */}
        <div className="relative overflow-hidden rounded-[2.5rem] max-md:rounded-2xl bg-[#0F0F0F] border border-white/10 p-12 max-md:p-6 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-10 group">
          <div className="absolute inset-0 bg-gradient-to-r from-lime-500/5 to-emerald-500/5 opacity-50" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Ready to build your next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400">Masterpiece?</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Join thousands of creators sharing their knowledge. It only takes a few clicks to get started.
            </p>
          </div>
          <div className="relative z-10">
            <button
              onClick={handleCreateNew}
              className="group/btn relative px-8 py-4 bg-gradient-to-r from-lime-400 to-emerald-500 rounded-2xl text-black font-bold text-lg hover:brightness-110 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(132,204,22,0.3)] flex items-center gap-3"
            >
              <Plus className="w-6 h-6" />
              <span>Start Creating</span>
              <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 group-hover/btn:ring-white/40 transition-all" />
            </button>
          </div>
        </div>

        {/* Feature Section Header */}
        <div className="flex flex-col items-center text-center space-y-3 pt-6 pb-2 animate-fade-in-up">
          <div className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
            Platform Capabilities
          </div>
        </div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-md:gap-4 pb-12"
        >
          {/* Card 1: User Guidance */}
          <motion.div variants={itemVariants} className="group relative p-8 max-md:p-5 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-white/5 hover:border-fuchsia-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(217,70,239,0.1)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500/20 to-purple-500/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500">
                <Zap className="w-7 h-7 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Procedural Wizard Guidance</h3>
              <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                Navigate the course architecture with ease. Orion features built-in interactive guidance in every form section, providing procedural instructions to ensure the perfect course setup.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Slide Generation */}
          <motion.div variants={itemVariants} className="group relative p-8 max-md:p-5 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-white/5 hover:border-lime-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(132,204,22,0.1)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-lime-500/20 to-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500">
                <Presentation className="w-7 h-7 text-lime-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">AI Slide Orchestration</h3>
              <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                Generate professional slide decks with distinct themes tailored to your course’s unique tone. From academic formality to storytelling, Orion crafts visuals that align perfectly with your brand.
              </p>
            </div>
          </motion.div>

          {/* Card 3: PPTX Downloads */}
          <motion.div variants={itemVariants} className="group relative p-8 max-md:p-5 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-white/5 hover:border-rose-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.1)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-500/20 to-pink-500/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500">
                <Download className="w-7 h-7 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Structured PPTX Exports</h3>
              <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                Download your modules in professional PowerPoint format. Each slide is organized with a specialized split-screen layout, balancing slide content with its corresponding voice script.
              </p>
            </div>
          </motion.div>

          {/* Card 4: Audiobooks */}
          <motion.div variants={itemVariants} className="group relative p-8 max-md:p-5 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-white/5 hover:border-indigo-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.1)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500">
                <Headphones className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Narrative Audiobooks</h3>
              <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                Export high-fidelity audio courses with perfectly synchronized transcripts. Our character-driven narration ensures a premium, studio-quality learning experience for your audience.
              </p>
            </div>
          </motion.div>

          {/* Card 5: Voice Scripts */}
          <motion.div variants={itemVariants} className="group relative p-8 max-md:p-5 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-white/5 hover:border-cyan-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.1)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-sky-500/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500">
                <Music className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Production-Ready Scripts</h3>
              <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                Generate detailed narration scripts optimized for commercial-grade video production. Every module includes a deep voiceover transcript ready for synchronized video creation.
              </p>
            </div>
          </motion.div>

          {/* Card 6: Ebooks */}
          <motion.div variants={itemVariants} className="group relative p-8 max-md:p-5 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-white/5 hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.1)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500">
                <BookOpen className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Polished Ebook Publishing</h3>
              <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                Transform module structures into comprehensive ebooks. Our AI converts fragmented points into smooth, human-readable narratives with detailed explanations and visual diagrams.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <style>{`
        @keyframes float-medium {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </PageTransition>
  );
};

export default HomePage;

