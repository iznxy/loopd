import React, { useState, useEffect, useRef } from "react";

// A well-known Vine compilation on YouTube that's embeddable
const VINE_VIDEO_ID = "ZapWh3a7Usk"; // "Best Vines of 2016" compilation - widely embeddable

export default function WelcomeVineReel({ onFinish }) {
  const [phase, setPhase] = useState("video"); // "video" | "welcome"
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const iframeRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (phase === "video") {
      // After 6 seconds, transition to welcome screen
      timerRef.current = setTimeout(() => {
        setPhase("welcome");
        setTimeout(() => setWelcomeVisible(true), 100);
      }, 6000);
    }
    return () => clearTimeout(timerRef.current);
  }, [phase]);

  function handleSkip() {
    clearTimeout(timerRef.current);
    setPhase("welcome");
    setTimeout(() => setWelcomeVisible(true), 100);
  }

  if (phase === "welcome") {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{
          background: "linear-gradient(180deg, #0a0a0a 0%, #001a12 60%, #0a0a0a 100%)",
          opacity: welcomeVisible ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      >
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0 ? "#00c896" : "#00a8ff",
              animation: `floatParticle ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.4 + Math.random() * 0.4,
            }}
          />
        ))}

        <div
          className="text-center px-8 z-10"
          style={{
            animation: welcomeVisible ? "welcomeIn 0.9s cubic-bezier(0.34,1.56,0.64,1) forwards" : "none",
          }}
        >
          {/* Vine leaf throwback */}
          <div className="text-5xl mb-2" style={{ animation: "grapeWiggle 2s ease-in-out infinite" }}>🍇</div>
          <div className="text-white/30 text-xs font-mono tracking-widest mb-8 uppercase">2013 – 2017 · Rest in loops</div>

          {/* Loopd infinity logo */}
          <div
            className="text-8xl font-bold mb-4"
            style={{
              background: "linear-gradient(135deg, #00c896, #00a8ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 40px rgba(0,200,150,0.5))",
            }}
          >
            ∞
          </div>

          <div
            className="text-4xl font-bold text-white mb-3 tracking-tight"
            style={{ textShadow: "0 0 50px rgba(0,200,150,0.5)" }}
          >
            Welcome to Loopd
          </div>
          <div className="text-white/50 text-sm mb-1">Where every moment loops forever.</div>
          <div className="text-white/25 text-xs mb-10">For the Vine generation 🍇</div>

          <button
            onClick={onFinish}
            className="px-10 py-4 rounded-2xl text-white font-bold text-lg"
            style={{
              background: "linear-gradient(135deg, #00c896, #00a8ff)",
              boxShadow: "0 0 40px rgba(0,200,150,0.35), 0 4px 20px rgba(0,0,0,0.4)",
              animation: "ctaPulse 2.5s ease-in-out infinite",
            }}
          >
            Start Looping 🚀
          </button>
        </div>

        <style>{`
          @keyframes welcomeIn {
            from { opacity: 0; transform: translateY(30px) scale(0.92); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes grapeWiggle {
            0%, 100% { transform: rotate(-8deg) scale(1); }
            50%       { transform: rotate(8deg) scale(1.15); }
          }
          @keyframes floatParticle {
            0%, 100% { transform: translateY(0); opacity: 0.4; }
            50%       { transform: translateY(-20px); opacity: 0.8; }
          }
          @keyframes ctaPulse {
            0%, 100% { box-shadow: 0 0 40px rgba(0,200,150,0.35), 0 4px 20px rgba(0,0,0,0.4); }
            50%       { box-shadow: 0 0 60px rgba(0,200,150,0.6), 0 4px 20px rgba(0,0,0,0.4); }
          }
        `}</style>
      </div>
    );
  }

  // Phase: video — show YouTube embed for 6 seconds
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {/* VHS scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)",
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)" }}
      />

      {/* VHS REC badge */}
      <div className="absolute top-10 left-5 z-20 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" style={{ animation: "recBlink 1s step-start infinite" }} />
        <span className="text-white/70 font-mono text-xs tracking-widest">REC · VINE ERA</span>
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-10 right-5 z-20 text-white/50 text-sm font-medium hover:text-white/80 transition-colors"
      >
        Skip →
      </button>

      {/* YouTube iframe — autoplay, muted, no controls */}
      <div className="w-full h-full relative">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${VINE_VIDEO_ID}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=0&start=30&playsinline=1&fs=0&disablekb=1`}
          allow="autoplay; encrypted-media"
          className="w-full h-full border-0"
          title="Vine Greatest Moments"
        />
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-10 left-0 right-0 z-20 flex flex-col items-center gap-2">
        <div className="text-white/80 text-sm font-semibold tracking-wide" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
          The greatest 6 seconds in internet history
        </div>
        {/* 6-second countdown bar */}
        <div className="w-48 h-0.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-white"
            style={{ animation: "countdownBar 6s linear forwards" }}
          />
        </div>
      </div>

      <style>{`
        @keyframes recBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes countdownBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}