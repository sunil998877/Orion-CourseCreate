import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  LayoutGrid,
  Rocket,
  FileText,
  Presentation,
  Headphones,
  BookOpen,
  Download,
  Music,
  Zap,
} from 'lucide-react';
import heroBgImg from '../assets/homepage-hero-bg.jpg';
import heroAvatarMobile from '../assets/hero-avatar-mobile.png';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const [username, setUsername] = useState<string>('');
  const navigate = useNavigate();

  const handleCreateNew = () => {
    sessionStorage.setItem('resetCourseData', 'true');
    navigate('/create-course');
  };

  useEffect(() => {
    const localUser = localStorage.getItem('username');
    if (localUser) {
      setUsername(localUser);
    }
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

  const displayName = username
    ? username.charAt(0).toUpperCase() + username.slice(1).split('@')[0]
    : 'Sunil';

  return (
    <PageTransition>
      <div className="space-y-10 animate-fade-in">
        {/* Main Hero Card - Exactly matches the reference image */}
        <section className="relative w-full rounded-[2.5rem] max-md:rounded-2xl overflow-hidden bg-[#070d0a] border border-[#1a3324] shadow-[0_24px_80px_rgba(0,0,0,0.6)] group isolate transition-all duration-700 min-h-[560px] lg:min-h-[600px] flex items-stretch">
          
          {/* Full-width 3D Stage Room Background (Desktop only - 100% unchanged) */}
          <div className="absolute inset-0 pointer-events-none select-none z-0 hidden lg:block">
            <img
              src={heroBgImg}
              alt="Orion AI Course Creator Studio"
              className="w-full h-full object-cover object-right md:object-center"
            />
          </div>

          {/* Clean dark studio background for mobile (prevents avatar collision behind text) */}
          <div className="absolute inset-0 pointer-events-none select-none z-0 lg:hidden bg-[#070d0a]">
            <div className="absolute top-0 right-0 w-72 h-72 bg-lime-500/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[90px] rounded-full" />
          </div>

          {/* Foreground Content */}
          <div className="relative z-10 w-full flex flex-col lg:flex-row items-stretch justify-between px-4 pt-6 pb-6 sm:px-10 sm:pt-10 sm:pb-10 lg:px-12 lg:pt-12 lg:pb-12 gap-6 lg:gap-8">
            
            {/* Left Column: Badge, Headline, CTA buttons, and Quick start stepper */}
            <div className="flex-1 flex flex-col justify-between max-w-[540px] space-y-6 sm:space-y-7">
              
              {/* Heading & Subtitle Block */}
              <div className="space-y-3.5 sm:space-y-4">
                {/* AI Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#122218]/90 border border-lime-400/25 text-[11px] font-bold tracking-wider text-[#a3e635] uppercase backdrop-blur-md shadow-[0_0_20px_rgba(163,230,53,0.15)]">
                  <Sparkles className="w-3.5 h-3.5 text-[#a3e635] fill-lime-400/30" />
                  <span>AI-POWERED LEARNING</span>
                </div>

                {/* Big Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-[3.85rem] font-black text-white tracking-[-0.03em] leading-[1.06] lg:leading-[1.04]">
                  Welcome back,<br />
                  <span className="text-[#a3e635] font-black drop-shadow-[0_0_30px_rgba(163,230,53,0.35)]">
                    {displayName}!
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-gray-300 text-xs sm:text-base font-normal leading-relaxed max-w-[460px]">
                  Build, launch, and scale high-quality courses with the power of AI.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1 sm:pt-2">
                  {/* Start Creating Button */}
                  <button
                    onClick={handleCreateNew}
                    className="group relative inline-flex items-center gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-[#a3e635] hover:bg-[#b4f636] text-black font-extrabold text-xs sm:text-base tracking-tight transition-all duration-300 shadow-[0_0_35px_rgba(163,230,53,0.4)] hover:shadow-[0_0_45px_rgba(163,230,53,0.6)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded-full bg-black/15 flex items-center justify-center font-black text-sm">
                      +
                    </div>
                    <span>Start Creating</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5] text-black transition-transform duration-300 group-hover:translate-x-1" />
                  </button>

                  {/* Explore Dashboard Button */}
                  <button
                    onClick={() => navigate('/course-dashboard')}
                    className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-[#111c16]/80 hover:bg-[#18291f] border border-white/10 hover:border-lime-500/30 text-white font-bold text-xs sm:text-base tracking-tight backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg"
                  >
                    <LayoutGrid className="w-4 h-4 text-gray-200" />
                    <span>Explore Dashboard</span>
                  </button>
                </div>

                {/* Mobile-Only Dedicated 3D Avatar Scene Showcase - 100% visible, crisp & uncropped */}
                <div className="relative w-full rounded-2xl overflow-hidden border border-[#1b3425] bg-[#070e0a] shadow-xl lg:hidden mt-2 mb-1">
                  <img
                    src={heroAvatarMobile}
                    alt="Orion AI Course Architect"
                    className="w-full h-auto object-contain block"
                  />
                </div>
              </div>

              {/* Quick start Stepper Card */}
              <div className="rounded-2xl sm:rounded-[1.75rem] bg-[#0c1410]/85 border border-[#1b3123] backdrop-blur-xl p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)] space-y-3.5 sm:space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-3.5">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-[#a3e635]" />
                    <span className="text-white font-bold text-sm sm:text-base tracking-tight">Quick start</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                    GET STARTED IN 3 SIMPLE STEPS
                  </span>
                </div>

                {/* Steps List */}
                <div className="space-y-3.5">
                  {/* Step 1 */}
                  <div
                    onClick={handleCreateNew}
                    className="group flex items-start gap-3.5 cursor-pointer transition-all hover:translate-x-1"
                  >
                    <div className="flex flex-col items-center self-stretch shrink-0">
                      <div className="w-6 h-6 rounded-full bg-[#111e16] border border-[#203a29] text-[#a3e635] text-[11px] font-bold flex items-center justify-center group-hover:border-lime-400 group-hover:scale-105 transition-all">
                        1
                      </div>
                      <div className="w-[1.5px] grow border-l-2 border-dashed border-[#203a29] my-1" />
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-[#122318] border border-lime-400/20 flex items-center justify-center shrink-0 group-hover:border-lime-400/50 group-hover:shadow-[0_0_12px_rgba(163,230,53,0.25)] transition-all">
                      <Sparkles className="w-4 h-4 text-[#a3e635]" />
                    </div>

                    <div className="min-w-0 pt-0.5">
                      <h4 className="text-white font-bold text-xs sm:text-sm tracking-tight group-hover:text-lime-300 transition-colors">
                        Create New Course
                      </h4>
                      <p className="text-gray-400 text-[11px] sm:text-xs leading-relaxed">
                        Tell us your idea and let AI generate the structure.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div
                    onClick={() => navigate('/course-dashboard')}
                    className="group flex items-start gap-3.5 cursor-pointer transition-all hover:translate-x-1"
                  >
                    <div className="flex flex-col items-center self-stretch shrink-0">
                      <div className="w-6 h-6 rounded-full bg-[#111e16] border border-[#203a29] text-[#a3e635] text-[11px] font-bold flex items-center justify-center group-hover:border-lime-400 group-hover:scale-105 transition-all">
                        2
                      </div>
                      <div className="w-[1.5px] grow border-l-2 border-dashed border-[#203a29] my-1" />
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-[#122318] border border-lime-400/20 flex items-center justify-center shrink-0 group-hover:border-lime-400/50 group-hover:shadow-[0_0_12px_rgba(163,230,53,0.25)] transition-all">
                      <FileText className="w-4 h-4 text-[#a3e635]" />
                    </div>

                    <div className="min-w-0 pt-0.5">
                      <h4 className="text-white font-bold text-xs sm:text-sm tracking-tight group-hover:text-lime-300 transition-colors">
                        Customize & Enhance
                      </h4>
                      <p className="text-gray-400 text-[11px] sm:text-xs leading-relaxed">
                        Edit content, add media and assessments.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div
                    onClick={() => navigate('/course-dashboard')}
                    className="group flex items-start gap-3.5 cursor-pointer transition-all hover:translate-x-1"
                  >
                    <div className="flex flex-col items-center self-stretch shrink-0">
                      <div className="w-6 h-6 rounded-full bg-[#111e16] border border-[#203a29] text-[#a3e635] text-[11px] font-bold flex items-center justify-center group-hover:border-lime-400 group-hover:scale-105 transition-all">
                        3
                      </div>
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-[#122318] border border-lime-400/20 flex items-center justify-center shrink-0 group-hover:border-lime-400/50 group-hover:shadow-[0_0_12px_rgba(163,230,53,0.25)] transition-all">
                      <Rocket className="w-4 h-4 text-[#a3e635]" />
                    </div>

                    <div className="min-w-0 pt-0.5">
                      <h4 className="text-white font-bold text-xs sm:text-sm tracking-tight group-hover:text-lime-300 transition-colors">
                        Launch & Share
                      </h4>
                      <p className="text-gray-400 text-[11px] sm:text-xs leading-relaxed">
                        Publish your course and reach learners worldwide.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Interactive Hotspots (Desktop only - aligned with the 4 feature pills) */}
            <div className="hidden lg:flex relative flex-1 w-full lg:w-1/2 items-center justify-end self-stretch pointer-events-none">
              <div
                className="absolute right-0 sm:right-4 lg:right-6 top-[34%] bottom-[30%] w-[130px] sm:w-[155px] flex flex-col justify-between pointer-events-auto"
                aria-label="Platform Quick Actions"
              >
                <button
                  onClick={handleCreateNew}
                  title="Generate with AI"
                  className="h-[22%] w-full rounded-2xl cursor-pointer hover:bg-lime-400/10 hover:ring-1 hover:ring-lime-400/40 transition-all opacity-0 hover:opacity-100"
                />
                <button
                  onClick={() => navigate('/create-course')}
                  title="Add Media"
                  className="h-[22%] w-full rounded-2xl cursor-pointer hover:bg-lime-400/10 hover:ring-1 hover:ring-lime-400/40 transition-all opacity-0 hover:opacity-100"
                />
                <button
                  onClick={() => navigate('/course-dashboard')}
                  title="Create Assessments"
                  className="h-[22%] w-full rounded-2xl cursor-pointer hover:bg-lime-400/10 hover:ring-1 hover:ring-lime-400/40 transition-all opacity-0 hover:opacity-100"
                />
                <button
                  onClick={() => navigate('/course-dashboard')}
                  title="Publish and Share"
                  className="h-[22%] w-full rounded-2xl cursor-pointer hover:bg-lime-400/10 hover:ring-1 hover:ring-lime-400/40 transition-all opacity-0 hover:opacity-100"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section Divider & Heading */}
        <div className="flex flex-col items-center text-center space-y-3 animate-fade-in-up pt-4">
          <div className="inline-flex items-center px-3.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
            Platform Capabilities
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Engineered for Modern Course Creation
          </h2>
          <p className="text-gray-400 text-sm max-w-lg">
            Everything you need to turn knowledge into high-converting multimedia learning experiences.
          </p>
        </div>

        {/* Capabilities Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pb-12"
        >
          <motion.div
            variants={itemVariants}
            className="group relative p-8 max-md:p-5 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-white/5 hover:border-fuchsia-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(217,70,239,0.1)] overflow-hidden"
          >
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

          <motion.div
            variants={itemVariants}
            className="group relative p-8 max-md:p-5 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-white/5 hover:border-lime-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(132,204,22,0.1)] overflow-hidden"
          >
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

          <motion.div
            variants={itemVariants}
            className="group relative p-8 max-md:p-5 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-white/5 hover:border-rose-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.1)] overflow-hidden"
          >
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

          <motion.div
            variants={itemVariants}
            className="group relative p-8 max-md:p-5 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-white/5 hover:border-indigo-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.1)] overflow-hidden"
          >
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

          <motion.div
            variants={itemVariants}
            className="group relative p-8 max-md:p-5 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-white/5 hover:border-cyan-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.1)] overflow-hidden"
          >
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

          <motion.div
            variants={itemVariants}
            className="group relative p-8 max-md:p-5 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-white/5 hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.1)] overflow-hidden"
          >
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
    </PageTransition>
  );
};

export default HomePage;
