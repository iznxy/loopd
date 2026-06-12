import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Heart, Share2, Volume2, VolumeX, Play } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

// Real archive.org hosted vine compilation videos — confirmed direct mp4 URLs
// Pattern: https://archive.org/download/{identifier}/{filename}
const CLASSIC_VINES = [
  {
    id: "v1",
    creator: "Emisoccer",
    handle: "emisoccer",
    caption: "Dank Memes Vine Compilation 🔥",
    category: "Comedy",
    year: "2016",
    likes: "13K",
    videoUrl: "https://archive.org/download/youtube-gYeAscy46HA/Dank_Memes_Vine_Compilation-gYeAscy46HA.webm",
    thumbnail: "https://archive.org/download/youtube-gYeAscy46HA/Dank_Memes_Vine_Compilation-gYeAscy46HA.jpg",
  },
  {
    id: "v2",
    creator: "WOWL",
    handle: "WOWL_TV",
    caption: "2015 Vine Compilation 🍇",
    category: "Comedy",
    year: "2015",
    likes: "528",
    videoUrl: "https://archive.org/download/msdme-2015_Vine_Compilation/2015_Vine_Compilation.mp4",
    thumbnail: "https://archive.org/services/img/msdme-2015_Vine_Compilation",
  },
  {
    id: "v3",
    creator: "Emisoccer",
    handle: "emisoccer",
    caption: "Dank Memes Vine Compilation V21 🤣",
    category: "Memes",
    year: "2016",
    likes: "4K",
    videoUrl: "https://archive.org/download/youtube-aoArpGRCNhc/Dank_Memes_Vine_Compilation_V21-aoArpGRCNhc.webm",
    thumbnail: "https://archive.org/services/img/youtube-aoArpGRCNhc",
  },
  {
    id: "v4",
    creator: "King Nate",
    handle: "KingNate",
    caption: "IT'S JOHN CENA 🎺 Vine Compilation",
    category: "Comedy",
    year: "2015",
    likes: "655",
    videoUrl: "https://archive.org/download/youtube-TUQ3nVoN-ko/IT_S_JOHN_CENA_Vine_compilation-TUQ3nVoN-ko.webm",
    thumbnail: "https://archive.org/services/img/youtube-TUQ3nVoN-ko",
  },
  {
    id: "v5",
    creator: "King Nate",
    handle: "KingNate",
    caption: "IT'S JOHN CENA 🎺 Vine Compilation 2",
    category: "Comedy",
    year: "2015",
    likes: "307",
    videoUrl: "https://archive.org/download/youtube-lZqR5zv8TjE/IT_S_JOHN_CENA_Vine_compilation_2-lZqR5zv8TjE.webm",
    thumbnail: "https://archive.org/services/img/youtube-lZqR5zv8TjE",
  },
  {
    id: "v6",
    creator: "VINESRB",
    handle: "VINESRB",
    caption: "IT'S JOHN CENA Vine Compilation 🎵",
    category: "Comedy",
    year: "2016",
    likes: "1K",
    videoUrl: "https://archive.org/download/youtube-roSzpJU6HG0/IT_S_JOHN_CENA__Vine_compilation-roSzpJU6HG0.webm",
    thumbnail: "https://archive.org/services/img/youtube-roSzpJU6HG0",
  },
  {
    id: "v7",
    creator: "Funny Cats",
    handle: "RandomReposts",
    caption: "Funny Cats Vine Compilation 2016 🐱",
    category: "Animals",
    year: "2016",
    likes: "47",
    videoUrl: "https://archive.org/download/videoplayback_20250310_1051/videoplayback.mp4",
    thumbnail: "https://archive.org/services/img/videoplayback_20250310_1051",
  },
  {
    id: "v8",
    creator: "Emisoccer",
    handle: "emisoccer",
    caption: "Dank Memes Vine Compilation V3 ͡° ͜ʖ ͡°",
    category: "Memes",
    year: "2016",
    likes: "1.5K",
    videoUrl: "https://archive.org/download/youtube-y0g7Yr1gYaU/Dank_Memes_Vine_Compilation_v3-y0g7Yr1gYaU.webm",
    thumbnail: "https://archive.org/services/img/youtube-y0g7Yr1gYaU",
  },
];

const CATEGORIES = ["All", "Comedy", "Memes", "Animals"];

const BG_GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
];

function VineCard({ vine, isActive, accentColor, index }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      video.pause();
      video.currentTime = 0;
      setPlaying(false);
    }
  }, [isActive]);

  function togglePlay(e) {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play(); setPlaying(true); }
    else { video.pause(); setPlaying(false); }
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
      {!error ? (
        <video
          ref={videoRef}
          src={vine.videoUrl}
          poster={vine.thumbnail}
          className="w-full h-full object-cover"
          loop
          muted={muted}
          playsInline
          onError={() => setError(true)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center gap-4"
          style={{ background: BG_GRADIENTS[index % BG_GRADIENTS.length] }}
        >
          <div className="text-6xl">🍇</div>
          <div className="text-white font-bold text-center px-8 text-lg">{vine.caption}</div>
          <div className="text-white/70 text-sm">by {vine.creator}</div>
          <div className="text-white/50 text-xs mt-2">Video unavailable</div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70 pointer-events-none" />

      {/* Play indicator */}
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

      {/* Mute */}
      {!error && (
        <button
          className="absolute top-16 right-4 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center z-10 backdrop-blur-sm"
          onClick={e => { e.stopPropagation(); setMuted(m => !m); }}
        >
          {muted ? <VolumeX size={15} color="#fff" /> : <Volume2 size={15} color="#fff" />}
        </button>
      )}

      {/* Right actions */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
        <div
          className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-lg font-bold text-white"
          style={{ background: accentColor }}
        >
          {vine.creator[0]}
        </div>

        <button onClick={e => { e.stopPropagation(); setLiked(l => !l); }} className="flex flex-col items-center gap-1">
          <Heart size={28} fill={liked ? "#e91e8c" : "none"} color={liked ? "#e91e8c" : "#fff"} strokeWidth={2} />
          <span className="text-white text-xs font-bold drop-shadow">{vine.likes}</span>
        </button>

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
        <div className="font-bold text-white text-sm mb-1 drop-shadow-md">@{vine.handle}</div>
        <p className="text-white text-sm leading-snug line-clamp-2 drop-shadow mb-2">{vine.caption}</p>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-white/20 backdrop-blur-sm">
          🍇 Classic Vine · {vine.year}
        </span>
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

  useEffect(() => {
    setCurrentIndex(0);
    if (feedRef.current) feedRef.current.scrollTop = 0;
  }, [activeCategory]);

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 pt-3 pb-2 bg-gradient-to-b from-black/70 to-transparent">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={24} color="white" />
        </button>
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar flex-1">
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
            isActive={i === currentIndex}
            accentColor={accentColor}
          />
        ))}
      </div>
    </div>
  );
}