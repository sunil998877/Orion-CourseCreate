import React, { useMemo } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import AnimatedBackground from '../pages/AnimatedBg';

const Loading = () => {
  const clouds = useMemo(
    () =>
      Array.from({ length: 5 }, () => ({
        size: Math.random() * 120 + 80,
        top: 15 + Math.random() * 70,
        duration: Math.random() * 15 + 15,
        delay: Math.random() * -30,
      })),
    []
  );
  const streaks = useMemo(
    () =>
      Array.from({ length: 8 }, () => ({
        width: Math.random() * 100 + 40,
        top: Math.random() * 100,
        duration: Math.random() * 0.5 + 0.5,
        delay: Math.random() * 2,
      })),
    []
  );
  return (
    <div className="relative min-h-screen overflow-hidden animate-fadeIn">
      <style>{`
        
       

        .cloud {
          position: absolute;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          filter: blur(25px);
          z-index: 1;
          animation-name: cloud-move;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .streak {
          animation-iteration-count: infinite;
        }
        @keyframes streak-fly {
          from { transform: translateX(250px); opacity: 0; }
          50% { opacity: 1; }
          to { transform: translateX(-350px); opacity: 0; }
        }
      `}</style>
      <AnimatedBackground />
      <div className="loader-overlay">
        <div className="wind-container">
          {streaks.map((s, i) => (
            <div
              key={i}
              className="streak"
              style={{
                width: `${s.width}px`,
                top: `${s.top}%`,
                left: '100%',
                animationDuration: `${s.duration}s`,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
        </div>
        {clouds.map((c, i) => (
          <div
            key={i}
            className="cloud"
            style={{
              width: `${c.size}px`,
              height: `${c.size * 0.5}px`,
              top: `${c.top}%`,
              left: '-25%',
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}

      </div>
      <div style={styles.container}>
        <div style={styles.content}>
          <DotLottieReact
            src="https://lottie.host/55a70a92-8774-43ae-860d-7e1dc379c936/7R7C2XMvP3.lottie"
            loop
            autoplay
            style={styles.animation}
          />
          <p style={styles.text}>
            Your course is being generated, please wait a moment...
            <span style={styles.dots}>...</span>
          </p>
        </div>
        <div style={styles.progressBar}>
          <div style={styles.progress}></div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    position: 'relative' as const,
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    maxWidth: '800px',
    width: '100%',
  },
  animation: {
    width: 'min(100%, 400px)',
    height: 'auto',
    filter: 'drop-shadow(0 5px 15px rgba(0, 0, 0, 0.25))',
  },
  text: {
    marginTop: '30px',
    fontSize: 'clamp(16px, 2.5vw, 22px)',
    fontWeight: 500 as const,
    color: '#ffffff',
    textAlign: 'center' as const,
    lineHeight: 1.6,
    position: 'relative' as const,
  },
  dots: {
    display: 'inline-block',
    width: '0.5em',
    overflow: 'hidden',
    verticalAlign: 'bottom',
    animation: 'pulse 1.5s infinite steps(4)',
  },
  progressBar: {
    position: 'absolute' as const,
    bottom: '50px',
    width: 'min(80%, 400px)',
    height: '6px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    width: '0%',
    backgroundImage: 'linear-gradient(to right, #10b981, #22c55e, #84cc16)',
    boxShadow: '0 0 12px rgba(132, 204, 22, 0.35)',
    borderRadius: '3px',
    animation: 'progressAnimation 3s ease-in-out infinite',
  },
  '@keyframes pulse': {
    '0%': { width: '0.5em' },
    '100%': { width: '1.5em' },
  },
  '@keyframes progressAnimation': {
    '0%': { width: '0%', transform: 'translateX(0)' },
    '50%': { width: '100%', transform: 'translateX(0)' },
    '100%': { width: '100%', transform: 'translateX(100%)' },
  },
};

export default Loading;
