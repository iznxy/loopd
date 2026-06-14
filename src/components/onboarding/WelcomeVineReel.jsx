import React, { useState, useEffect } from "react";

const VINE_MOMENTS = [
  { emoji: "🌊", text: "What are those?!", color: "#1a1a2e", accent: "#e94560" },
  { emoji: "🔥", text: "Do it for the Vine!", color: "#16213e", accent: "#f5a623" },
  { emoji: "😂", text: "Road work ahead...", color: "#0f3460", accent: "#00d4ff" },
  { emoji: "🎵", text: "I smell like beef 🐄", color: "#1a0a2e", accent: "#c471ed" },
  { emoji: "✂️", text: "Goodbye!", color: "#0a2e1a", accent: "#00c896" },
  { emoji: "💀", text: "RIP Vine 2013–2017", color: "#1a1a1a", accent: "#ffffff" },
];

export default function WelcomeVineReel({ onFinish }) {
  const [frameIdx, setFrameIdx] = useState(0);
  const [phase, setPhase] = useState("reel"); // "reel" | "welcome"
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    if (phase !== "reel") return;

    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setFrameIdx(prev => {
          const next = prev + 1;
          if (next >= VINE_MOMENTS.length) {
            clearInterval(interval);
            setPhase("welcome");
            return prev;
          }
          setFadeIn(true);
          return next;
        });
      }, 200);
    }, 900);

    return () => clearInterval(interval);
  }, [phase]);

  // Welcome screen
  if (phase === "welcome") {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #001a12 60%, #0a0a0a 100%)" }}
      >
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 3 + (i % 3),
              height: 3 + (i % 3),
              left: `${10 + i * 9}%`,
              top: `${15 + (i * 7) % 70}%`,
              background: i % 2 === 0 ? "#00c896" : "#00a8ff",
              opacity: 0.5,
              animation: `floatUp ${3 + i * 0.4}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}

        <div className="text-center px-8 z-10" style={{ animation: "popIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
          <div className="text-5xl mb-2" style={{ animation: "wiggle 2s ease-in-out infinite" }}>🍇</div>
          <div className="text-white/30 text-xs font-mono tracking-widest mb-8 uppercase">2013 – 2017 · Rest in loops</div>

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

          <div className="text-4xl font-bold text-white mb-3 tracking-tight" style={{ textShadow: "0 0 50px rgba(0,200,150,0.5)" }}>
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
              animation: "glow 2.5s ease-in-out infinite",
            }}
          >
            Start Looping 🚀
          </button>
        </div>

        <style>{`
          @keyframes popIn { from { opacity:0; transform:translateY(30px) scale(0.9); } to { opacity:1; transform:translateY(0) scale(1); } }
          @keyframes wiggle { 0%,100% { transform:rotate(-8deg) scale(1); } 50% { transform:rotate(8deg) scale(1.15); } }
          @keyframes floatUp { 0%,100% { transform:translateY(0); opacity:0.5; } 50% { transform:translateY(-18px); opacity:0.9; } }
          @keyframes glow { 0%,100% { box-shadow:0 0 40px rgba(0,200,150,0.35),0 4px 20px rgba(0,0,0,0.4); } 50% { box-shadow:0 0 60px rgba(0,200,150,0.65),0 4px 20px rgba(0,0,0,0.4); } }
        `}</style>
      </div>
    );
  }

  const frame = VINE_MOMENTS[frameIdx];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-300"
      style={{ background: frame.color }}
    >
      {/* VHS scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.08) 3px,rgba(0,0,0,0.08) 4px)" }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.75) 100%)" }} />

      {/* REC badge */}
      <div className="absolute top-10 left-5 z-20 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" style={{ animation: "recBlink 1s step-start infinite" }} />
        <span className="text-white/60 font-mono text-xs tracking-widest">REC · VINE ERA</span>
      </div>

      {/* Skip */}
      <button
        onClick={() => setPhase("welcome")}
        className="absolute top-10 right-5 z-20 text-white/40 text-sm hover:text-white/70 transition-colors"
      >
        Skip →
      </button>

      {/* Frame counter */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {VINE_MOMENTS.map((_, i) => (
          <div
            key={i}
            className="h-0.5 rounded-full transition-all duration-300"
            style={{ width: i === frameIdx ? 20 : 6, background: i <= frameIdx ? frame.accent : "rgba(255,255,255,0.2)" }}
          />
        ))}
      </div>

      {/* Main content */}
      <div
        className="flex flex-col items-center gap-6 px-8 text-center"
        style={{ opacity: fadeIn ? 1 : 0, transform: fadeIn ? "scale(1)" : "scale(0.92)", transition: "opacity 0.2s, transform 0.2s" }}
      >
        <div className="text-[100px] leading-none" style={{ filter: `drop-shadow(0 0 30px ${frame.accent})` }}>
          {frame.emoji}
        </div>
        <div
          className="text-3xl font-black text-white leading-tight max-w-xs"
          style={{ textShadow: `0 0 40px ${frame.accent}`, fontStyle: "italic" }}
        >
          "{frame.text}"
        </div>
        <div className="text-xs font-mono tracking-widest" style={{ color: frame.accent }}>
          VINE · {2013 + frameIdx}
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="absolute bottom-10 left-8 right-8 z-20">
        <div className="w-full h-0.5 bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              background: frame.accent,
              width: `${((frameIdx + 1) / VINE_MOMENTS.length) * 100}%`,
              transition: "width 0.9s linear",
            }}
          />
        </div>
        <div className="text-center text-white/30 text-[10px] font-mono mt-2 tracking-widest">
          {frameIdx + 1} / {VINE_MOMENTS.length}
        </div>
      </div>

      <style>{`
        @keyframes recBlink { 0%,100%{opacity:1;} 50%{opacity:0;} }
      `}</style>
    </div>
  );
}