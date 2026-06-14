import React, { useState, useEffect, useRef } from "react";

const ARCHIVE_ID = "clean_vines_for_the_children_of_jesus";
const buildUrl = (file) => `https://archive.org/download/${ARCHIVE_ID}/${encodeURIComponent(file)}`;

// Real Vine clips streamed from archive.org, with a generated still as fallback
const VINES = [
  { file: "Anything for you Beyonce [3927939 views \u2022 20131027] - by Best Vines - KY_nkn5ShfM.mp4", img: "https://media.base44.com/images/public/6a1f8dc06afda524efce29b2/1488bc7e6_generated_image.png", caption: "Anything for you Beyoncé 💁", handle: "@bestvines", accent: "#f5a623", year: 2013 },
  { file: "Ball Goes Under Treadmill! [5959609 views \u2022 20150305] - by PoohProductions - x1lICBhp_W8.mp4", img: "https://media.base44.com/images/public/6a1f8dc06afda524efce29b2/b7198dc36_generated_image.png", caption: "Ball goes under treadmill! 🛹🔥", handle: "@poohproductions", accent: "#00d4ff", year: 2015 },
  { file: "'Baby It's You' - Vine [16036764 views \u2022 20140613] - by Nene Rawrs - 2IVw0Hx_i_E.mp4", img: "https://media.base44.com/images/public/6a1f8dc06afda524efce29b2/e9a85c880_generated_image.png", caption: "Baby it's you 🐶💕", handle: "@nenerawrs", accent: "#00c896", year: 2014 },
  { file: "Annie Are You Ok [23441736 views \u2022 20160401] - by Ratamamhata kanishka - NR1zHdFN8A4.mp4", img: "https://media.base44.com/images/public/6a1f8dc06afda524efce29b2/972a6f016_generated_image.png", caption: "Annie are you ok? ✨", handle: "@kanishka", accent: "#c471ed", year: 2016 },
];

const CLIP_MS = 3200;

export default function WelcomeVineReel({ onFinish }) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("reel"); // "reel" | "welcome"
  const [fade, setFade] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (phase !== "reel") return;
    const t = setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        setIdx(prev => {
          const next = prev + 1;
          if (next >= VINES.length) {
            setPhase("welcome");
            return prev;
          }
          setVideoFailed(false);
          setFade(true);
          return next;
        });
      }, 260);
    }, CLIP_MS);
    return () => clearTimeout(t);
  }, [idx, phase]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) { v.currentTime = 0; v.play().catch(() => {}); }
  }, [idx]);

  if (phase === "welcome") {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "radial-gradient(ellipse at 50% 30%, #06251c 0%, #050505 70%)" }}
      >
        {/* Floating particles */}
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 2 + (i % 4),
              height: 2 + (i % 4),
              left: `${(i * 13 + 5) % 95}%`,
              top: `${(i * 17 + 8) % 88}%`,
              background: i % 2 === 0 ? "#00c896" : "#00a8ff",
              opacity: 0.45,
              animation: `vrFloat ${3.5 + (i % 4) * 0.6}s ease-in-out infinite`,
              animationDelay: `${i * 0.25}s`,
            }}
          />
        ))}

        <div className="text-center px-8 z-10" style={{ animation: "vrPopIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
          <div className="text-white/30 text-[11px] font-mono tracking-[0.3em] mb-6 uppercase">2013 — 2017 · rest in loops</div>

          <div
            className="text-8xl font-bold mb-2 leading-none"
            style={{
              background: "linear-gradient(135deg,#00c896,#00a8ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 40px rgba(0,200,150,0.5))",
            }}
          >
            ∞
          </div>

          <div className="text-[40px] font-bold text-white mb-3 tracking-tight leading-none" style={{ textShadow: "0 0 50px rgba(0,200,150,0.45)" }}>
            Welcome to Loopd
          </div>
          <div className="text-white/55 text-sm mb-1">Where every moment loops forever.</div>
          <div className="text-white/30 text-xs mb-10">Built for the Vine generation 🍇</div>

          <button
            onClick={onFinish}
            className="px-10 py-4 rounded-2xl text-white font-bold text-base active:scale-95 transition-transform"
            style={{
              background: "linear-gradient(135deg,#00c896,#00a8ff)",
              boxShadow: "0 0 40px rgba(0,200,150,0.35),0 8px 24px rgba(0,0,0,0.45)",
              animation: "vrGlow 2.5s ease-in-out infinite",
            }}
          >
            Start Looping 🚀
          </button>
        </div>

        <style>{`
          @keyframes vrPopIn { from { opacity:0; transform:translateY(28px) scale(0.94);} to { opacity:1; transform:translateY(0) scale(1);} }
          @keyframes vrFloat { 0%,100% { transform:translateY(0); opacity:0.45;} 50% { transform:translateY(-16px); opacity:0.85;} }
          @keyframes vrGlow { 0%,100% { box-shadow:0 0 40px rgba(0,200,150,0.35),0 8px 24px rgba(0,0,0,0.45);} 50% { box-shadow:0 0 64px rgba(0,200,150,0.6),0 8px 24px rgba(0,0,0,0.45);} }
        `}</style>
      </div>
    );
  }

  const vine = VINES[idx];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* Blurred ambient backdrop from current image */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          backgroundImage: `url(${vine.img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(40px) brightness(0.4)",
          transform: "scale(1.2)",
        }}
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Progress bars (Stories style) */}
      <div className="absolute top-8 left-4 right-4 z-30 flex gap-1.5">
        {VINES.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full bg-white/25 overflow-hidden">
            <div
              className="h-full rounded-full bg-white"
              style={{
                width: i < idx ? "100%" : i === idx ? "100%" : "0%",
                transition: i === idx ? `width ${CLIP_MS}ms linear` : "none",
                animation: i === idx ? `vrBar ${CLIP_MS}ms linear forwards` : "none",
              }}
            />
          </div>
        ))}
      </div>

      {/* REC badge */}
      <div className="absolute top-12 left-5 z-30 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500" style={{ animation: "vrBlink 1s step-start infinite" }} />
        <span className="text-white/70 font-mono text-[10px] tracking-[0.25em]">REC · VINE ERA</span>
      </div>

      <button
        onClick={() => setPhase("welcome")}
        className="absolute top-11 right-5 z-30 text-white/55 text-sm hover:text-white transition-colors px-2 py-1"
      >
        Skip →
      </button>

      {/* Phone-style clip frame */}
      <div
        className="relative z-20 rounded-[28px] overflow-hidden shadow-2xl"
        style={{
          width: "min(78vw, 320px)",
          aspectRatio: "9/16",
          border: "3px solid rgba(255,255,255,0.12)",
          opacity: fade ? 1 : 0,
          transform: fade ? "scale(1)" : "scale(0.96)",
          transition: "opacity 0.22s, transform 0.22s",
          boxShadow: `0 0 60px ${vine.accent}55, 0 20px 60px rgba(0,0,0,0.6)`,
        }}
      >
        {/* The "playing" clip — real Vine video, image fallback on error */}
        {!videoFailed ? (
          <video
            ref={videoRef}
            src={buildUrl(vine.file)}
            className="w-full h-full object-cover bg-black"
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoFailed(true)}
          />
        ) : (
          <img
            src={vine.img}
            alt=""
            className="w-full h-full object-cover"
            style={{ animation: "vrKenBurns 3.2s ease-out forwards" }}
          />
        )}

        {/* VHS scanlines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.10) 3px,rgba(0,0,0,0.10) 4px)" }}
        />
        {/* Film grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "120px" }}
        />
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,0.55) 100%)" }} />
        {/* Bottom gradient + caption */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="text-white font-bold text-sm mb-0.5 drop-shadow">{vine.handle}</div>
          <div className="text-white/90 text-[13px] leading-snug drop-shadow">{vine.caption}</div>
        </div>
        {/* Loop badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/45 backdrop-blur-sm rounded-full px-2.5 py-1">
          <span style={{ color: vine.accent }} className="text-xs">∞</span>
          <span className="text-white/80 text-[10px] font-bold">{vine.year}</span>
        </div>
      </div>

      {/* Caption strip under frame */}
      <div className="relative z-20 mt-6 text-center" style={{ opacity: fade ? 1 : 0, transition: "opacity 0.22s" }}>
        <div className="text-white/40 text-[10px] font-mono tracking-[0.3em] uppercase">
          loop {idx + 1} of {VINES.length}
        </div>
      </div>

      <style>{`
        @keyframes vrBlink { 0%,100%{opacity:1;} 50%{opacity:0.2;} }
        @keyframes vrBar { from { width:0%;} to { width:100%;} }
        @keyframes vrKenBurns { from { transform:scale(1.0);} to { transform:scale(1.12);} }
      `}</style>
    </div>
  );
}