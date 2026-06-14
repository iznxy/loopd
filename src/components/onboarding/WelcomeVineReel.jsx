import React, { useState, useEffect, useRef } from "react";

// A curated set of nostalgic Vine-era YouTube clips that are embeddable
const VINE_CLIPS = [
  { id: "uFHQ_2jBDys", start: 0, label: "Do it!" },
  { id: "9GgAbyYDFeg", start: 0, label: "Watermelon" },
  { id: "FMbBzf0SZUY", start: 0, label: "Road work" },
  { id: "5vh9qY7s5bE", start: 0, label: "Zach King magic" },
  { id: "bz7-G0bVRdg", start: 0, label: "Pizza roll" },
];

// We'll show a video-style slideshow using gradient cards with Vine vibes,
// then a big welcome screen. Real YouTube embeds can't autoplay+mute reliably cross-origin.
const NOSTALGIA_FRAMES = [
  { bg: "linear-gradient(135deg,#1a1a2e,#16213e)", text: "2013", sub: "Vine launches…", icon: "🍇" },
  { bg: "linear-gradient(135deg,#0f3460,#533483)", text: "\"Road work ahead?\"", sub: "6 seconds of gold", icon: "🛣️" },
  { bg: "linear-gradient(135deg,#533483,#e94560)", text: "\"Back at it again…\"", sub: "The Krispy Kreme era", icon: "🍩" },
  { bg: "linear-gradient(135deg,#e94560,#f5a623)", text: "\"Hi, welcome to Chili's\"", sub: "We still quote it", icon: "🌶️" },
  { bg: "linear-gradient(135deg,#f5a623,#e94560)", text: "January 2017", sub: "Vine shuts down…", icon: "😢" },
  { bg: "linear-gradient(135deg,#0a0a0a,#00c896)", text: "But loops live on.", sub: "The spirit never dies", icon: "∞" },
];

export default function WelcomeVineReel({ onFinish }) {
  const [frame, setFrame] = useState(0);
  const [done, setDone] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const timerRef = useRef(null);

  useEffect(() => {
    if (frame < NOSTALGIA_FRAMES.length - 1) {
      timerRef.current = setTimeout(() => {
        setOpacity(0);
        setTimeout(() => {
          setFrame(f => f + 1);
          setOpacity(1);
        }, 250);
      }, 1000);
    } else {
      // Show welcome screen after last frame
      timerRef.current = setTimeout(() => {
        setDone(true);
      }, 1800);
    }
    return () => clearTimeout(timerRef.current);
  }, [frame]);

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #001a12 100%)" }}>
        <div style={{ animation: "welcomeIn 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
          <div className="text-center px-8">
            <div className="text-8xl mb-6" style={{ filter: "drop-shadow(0 0 30px #00c896)" }}>∞</div>
            <div className="text-4xl font-bold text-white mb-3 tracking-tight"
              style={{ textShadow: "0 0 40px rgba(0,200,150,0.6)" }}>
              Welcome to Loopd
            </div>
            <div className="text-white/60 text-base mb-2">Where every moment loops forever.</div>
            <div className="text-white/30 text-sm mb-10">For the Vine generation 🍇</div>
            <button
              onClick={onFinish}
              className="px-10 py-4 rounded-2xl text-white font-bold text-lg"
              style={{ background: "linear-gradient(135deg,#00c896,#00a8ff)", boxShadow: "0 0 30px rgba(0,200,150,0.4)" }}
            >
              Start Looping 🚀
            </button>
          </div>
        </div>
        <style>{`
          @keyframes welcomeIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  const current = NOSTALGIA_FRAMES[frame];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: current.bg, transition: "opacity 0.25s ease", opacity }}
    >
      {/* VHS scanline overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
          animation: "scanlines 8s linear infinite",
        }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)" }} />

      {/* Content */}
      <div className="text-center z-10 px-8">
        {/* VHS timestamp */}
        <div className="text-white/40 font-mono text-xs mb-8 tracking-widest">
          ● REC &nbsp; {String(frame + 1).padStart(2, "0")}/{NOSTALGIA_FRAMES.length}
        </div>
        <div className="text-7xl mb-6">{current.icon}</div>
        <div className="text-white font-bold text-2xl mb-2" style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.5)" }}>
          {current.text}
        </div>
        <div className="text-white/60 text-sm">{current.sub}</div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-16 left-8 right-8">
        <div className="flex gap-1.5 justify-center">
          {NOSTALGIA_FRAMES.map((_, i) => (
            <div key={i} className="h-0.5 rounded-full transition-all duration-300"
              style={{
                flex: i === frame ? 3 : 1,
                background: i <= frame ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Skip */}
      <button
        onClick={() => setDone(true)}
        className="absolute top-12 right-6 text-white/40 text-sm font-medium"
      >
        Skip
      </button>

      <style>{`
        @keyframes scanlines {
          from { background-position: 0 0; }
          to { background-position: 0 100px; }
        }
      `}</style>
    </div>
  );
}