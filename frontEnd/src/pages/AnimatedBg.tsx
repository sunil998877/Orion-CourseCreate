import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <>
      <style>{`
        @keyframes move-grid {
          from { transform: translateY(0); }
          to { transform: translateY(40px); }
        }
        .animate-pulse-slow {
          animation: pulse-glow 8s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.2); opacity: 0.4; }
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.6; }
        }
      `}</style>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#09090b]">
        {/* Moving Grid */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #a3e635 1px, transparent 1px),
              linear-gradient(to bottom, #a3e635 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
            animation: 'move-grid 20s linear infinite'
          }}
        ></div>

        {/* Floating Light Accents */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-lime-500/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-lime-400/10 rounded-full blur-[100px] animate-pulse-slow delay-500"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-lime-500/30 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/30 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-lime-400/20 rounded-full blur-[100px] animate-pulse-slow delay-500"></div>
        <div className="absolute bottom-[30%] left-[40%] w-[30%] h-[30%] bg-emerald-400/20 rounded-full blur-[90px] animate-pulse-slow delay-2000"></div>
      </div>
    </>
  );
};

export default AnimatedBackground;
