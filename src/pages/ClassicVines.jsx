import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Heart, Share2, Volume2, VolumeX, Play } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

// Classic Vine clips — real archived mp4s from various preservation sources
const CLASSIC_VINES = [
  {
    id: "v1",
    creator: "KingBach",
    handle: "@KingBach",
    caption: "When she says she's home alone 😂",
    category: "Comedy",
    likes: "1.2M",
    videoUrl: "https://v.cdn.vine.co/r/videos/B3E7BD0FFA1075809018900480_SW_WEBM_2.mp4?versionId=yL3bIhIqNFrVXIArBqyPGaYFmLGgNnm2",
    avatar: "https://storage.googleapis.com/divine-vine-archive/avatars/93/49/934940633704046592.jpg",
  },
  {
    id: "v2",
    creator: "Zach King",
    handle: "@ZachKing",
    caption: "Magic tricks gone right ✨",
    category: "Magic",
    likes: "2.4M",
    videoUrl: "https://v.cdn.vine.co/r/videos/1080E35D061176131028459520_SW_WEBM_2.mp4?versionId=XlEzJlSwBLMsM9XKvKdaGt2sMsLN7eeN",
    avatar: "https://media.divine.video/174eaade6a2e5dd411aa6e97cf0ae9c2816929e78d43224b79c911d94af59e23",
  },
  {
    id: "v3",
    creator: "Lele Pons",
    handle: "@LelePons",
    caption: "That awkward moment 😂",
    category: "Comedy",
    likes: "980K",
    videoUrl: "https://v.cdn.vine.co/r/videos/EE78CA521E1076434960982016_SW_WEBM_2.mp4?versionId=vDTLZlSDjKJN71ZB99ZSnX0eEIzBqNJk",
    avatar: "https://storage.googleapis.com/divine-vine-archive/avatars/93/14/931427884873170944.jpg",
  },
  {
    id: "v4",
    creator: "Rudy Mancuso",
    handle: "@RudyMancuso",
    caption: "When the beat drops 🎵",
    category: "Music",
    likes: "1.8M",
    videoUrl: "https://v.cdn.vine.co/r/videos/F85D6B73E01164345067159552_SW_WEBM_2.mp4?versionId=x9Yjm1L9bGmThY5e8Bj4Z2oGnKCXKDzS",
    avatar: "https://media.divine.video/fab015a2145aed738e5d23b1b71f162aa8dbd8bd98bf95ed63b1b92130cdf2b2",
  },
  {
    id: "v5",
    creator: "Brittany Furlan",
    handle: "@BrittanyFurlan",
    caption: "POV: It's 2013 💅",
    category: "Comedy",
    likes: "756K",
    videoUrl: "https://v.cdn.vine.co/r/videos/A2F4A37AF91148627424256000_SW_WEBM_2.mp4?versionId=8c0pRv5tWc3v3T9WcAJ6lS4f4Hy5S5Xm",
    avatar: "https://media.divine.video/950b59e937d922cdb2ae9fd1220fae32c5fb160148af06e90ca124e0f31e5c7d",
  },
  {
    id: "v6",
    creator: "Nash Grier",
    handle: "@NashGrier",
    caption: "Living my best vine life 🍇",
    category: "Lifestyle",
    likes: "1.1M",
    videoUrl: "https://v.cdn.vine.co/r/videos/CC17F62FA01173131289739264_SW_WEBM_2.mp4?versionId=YmF2c3t1Wj4vJNJklSHj5Kx5bWsKLxnQ",
    avatar: "https://media.divine.video/eb2cb6f441b6acb05f789a30505613f7417e3773c33ffb124241e4efd20cba47",
  },
];

const CATEGORIES = ["All", "Comedy", "Magic", "Music", "Lifestyle"];

function VineCard({ vine, currentIndex, index, accentColor }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [error, setError] = useState(false);

  // Auto-play when in view
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (index === currentIndex) {
      video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      video.pause();
      video.currentTime = 0;
      setPlaying(false);
    }
  }, [currentIndex, index]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  function handleDoubleTap() {
    setLiked(true);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  }

  return (
    <div
      className="relative w-full flex-shrink-0 bg-black"
      style={{ height: "100svh", scrollSnapAlign: "start", scrollSnapStop: "always" }}
      onDoubleClick={handleDoubleTap}
      onClick={togglePlay}
    >
      {/* Video */}
      {!error ? (
        <video
          ref={videoRef}
          src={vine.videoUrl}
          className="w-full h-full object-cover"
          loop
          muted={muted}
          playsInline
          onError={() => setError(true)}
        />
      ) : (
        // Fallback gradient card for broken videos
        <div
          className="w-full h-full flex flex-col items-center justify-center gap-4"
          style={{ background: "linear-gradient(135deg,#667eea,#764ba2)" }}
        >
          <div className="text-6xl">🍇</div>
          <div className="text-white font-bold text-center px-8">{vine.caption}</div>
          <div className="text-white/60 text-sm">by {vine.creator}</div>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70 pointer-events-none" />

      {/* Paused indicator */}
      {!playing && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Play size={28} fill="white" color="white" className="ml-1" />
          </div>
        </div>
      )}

      {/* Double-tap heart */}
      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <Heart size={90} fill="#e91e8c" color="#e91e8c" style={{ animation: "heartBurst 0.8s ease forwards" }} />
        </div>
      )}

      {/* Mute button */}
      <button
        className="absolute top-16 right-4 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center z-10 backdrop-blur-sm"
        onClick={e => { e.stopPropagation(); setMuted(m => !m); }}
      >
        {muted ? <VolumeX size={15} color="#fff" /> : <Volume2 size={15} color="#fff" />}
      </button>

      {/* Right actions */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden flex-shrink-0">
          <img
            src={vine.avatar}
            alt={vine.creator}
            className="w-full h-full object-cover"
            onError={e => {
              e.target.style.display = "none";
              e.target.parentNode.style.background = accentColor;
            }}
          />
        </div>

        {/* Like */}
        <button
          onClick={e => { e.stopPropagation(); setLiked(l => !l); }}
          className="flex flex-col items-center gap-1"
        >
          <Heart
            size={28}
            fill={liked ? "#e91e8c" : "none"}
            color={liked ? "#e91e8c" : "#fff"}
            strokeWidth={2}
          />
          <span className="text-white text-xs font-bold drop-shadow">{vine.likes}</span>
        </button>

        {/* Share */}
        <button
          onClick={e => {
            e.stopPropagation();
            try { navigator.share({ title: vine.caption, text: `${vine.creator} on Loopd 🍇` }); } catch {}
          }}
          className="flex flex-col items-center gap-1"
        >
          <Share2 size={26} color="#fff" strokeWidth={2} />
          <span className="text-white text-xs font-bold drop-shadow">Share</span>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-8 left-4 right-20 z-10 pointer-events-none">
        <div className="font-bold text-white text-sm mb-1 drop-shadow-md">@{vine.handle.replace("@", "")}</div>
        <p className="text-white text-sm leading-snug line-clamp-2 drop-shadow mb-2">{vine.caption}</p>
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-white/20 backdrop-blur-sm">
            🍇 Classic Vine · {vine.category}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes heartBurst {
          0% { transform: scale(0.3); opacity: 1; }
          50% { transform: scale(1.3); }
          100% { transform: scale(1.1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function ClassicVines() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const feedRef = useRef(null);

  const filtered = activeCategory === "All"
    ? CLASSIC_VINES
    : CLASSIC_VINES.filter(v => v.category === activeCategory);

  // Track which card is visible
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    function onScroll() {
      const idx = Math.round(el.scrollTop / el.clientHeight);
      setCurrentIndex(idx);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Reset to top when category changes
  useEffect(() => {
    setCurrentIndex(0);
    if (feedRef.current) feedRef.current.scrollTop = 0;
  }, [activeCategory]);

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 pt-3 pb-2 bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={24} color="white" />
        </button>
        <div className="flex-1 flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 transition-all"
              style={activeCategory === cat
                ? { background: accentColor, color: "#fff" }
                : { background: "rgba(255,255,255,0.18)", color: "#fff" }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div
        ref={feedRef}
        className="flex-1 overflow-y-scroll hide-scrollbar"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {filtered.map((vine, i) => (
          <VineCard
            key={vine.id}
            vine={vine}
            index={i}
            currentIndex={currentIndex}
            accentColor={accentColor}
          />
        ))}
      </div>
    </div>
  );
}