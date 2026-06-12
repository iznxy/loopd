import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Heart, Share2, Volume2, VolumeX, Play } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

// Real Wayback Machine captured Vine mp4s — format: https://web.archive.org/web/{timestamp}/{original}
const CLASSIC_VINES = [
  {
    id: "v1",
    creator: "Vine Creator",
    handle: "vinecreator",
    caption: "Classic Vine 🍇",
    category: "Comedy",
    year: "2016",
    videoUrl: "https://web.archive.org/web/20160221000323/https://v.cdn.vine.co/r/videos/00022846011073763425215283200_2de5689959f.0.0.3343929428769504975.mp4",
  },
  {
    id: "v2",
    creator: "Vine Creator",
    handle: "vinecreator",
    caption: "When you hear that beat drop 🔥",
    category: "Music",
    year: "2016",
    videoUrl: "https://web.archive.org/web/20160217095137/https://v.cdn.vine.co/r/videos/000283A8061108103777900265472_1ac120dd6ab.3.2.mp4",
  },
  {
    id: "v3",
    creator: "Vine Creator",
    handle: "vinecreator",
    caption: "That feeling tho 😂",
    category: "Comedy",
    year: "2016",
    videoUrl: "https://web.archive.org/web/20160107044348/https://v.cdn.vine.co/r/videos/0004C5629B1126666895773597696_2b3b730dfd7.5.1.1242015930627913574.mp4",
  },
  {
    id: "v4",
    creator: "Vine Creator",
    handle: "vinecreator",
    caption: "Everyday struggle 😅",
    category: "Comedy",
    year: "2016",
    videoUrl: "https://web.archive.org/web/20160228022542/https://v.cdn.vine.co/r/videos/000AB52B001171947363653541888_3f631ad48d5.1.5.3259802330446963681.mp4",
  },
  {
    id: "v5",
    creator: "Vine Creator",
    handle: "vinecreator",
    caption: "LOL 💀",
    category: "Comedy",
    year: "2016",
    videoUrl: "https://web.archive.org/web/20160319235556/https://v.cdn.vine.co/r/videos/000BAAEF1E1031338902159761408_1f17791aafb.3.2_eBsaa_RlVr9ABm7rgahbULB_UjFkb5zZWoxQySEIaLJB2hZAkcwS8awWdXi4z6jI.mp4",
  },
  {
    id: "v6",
    creator: "Vine Creator",
    handle: "vinecreator",
    caption: "Classic internet moment 🌐",
    category: "Memes",
    year: "2015",
    videoUrl: "https://web.archive.org/web/20150528090041/https://v.cdn.vine.co/r/videos/00275AEE5C1215437408410464256_3b5bd324e33.3.3.14947551680605121529.mp4",
  },
  {
    id: "v7",
    creator: "Vine Creator",
    handle: "vinecreator",
    caption: "Nailed it 👌",
    category: "Comedy",
    year: "2016",
    videoUrl: "https://web.archive.org/web/20160422090056/https://v.cdn.vine.co/r/videos/0027C30AF21228149443073867776_34dec49f21e.4.1.10986193055696548953.mp4",
  },
  {
    id: "v8",
    creator: "Vine Creator",
    handle: "vinecreator",
    caption: "2016 energy ⚡",
    category: "Memes",
    year: "2016",
    videoUrl: "https://web.archive.org/web/20160213205826/https://v.cdn.vine.co/r/videos/002DBF217F1158866776185348096_3615d523856.1.3.6861858018398256032.mp4",
  },
  {
    id: "v9",
    creator: "Vine Creator",
    handle: "vinecreator",
    caption: "That's a vibe 🎵",
    category: "Music",
    year: "2016",
    videoUrl: "https://web.archive.org/web/20160320073042/https://v.cdn.vine.co/r/videos/002E647B741189775540043800576_3c658636910.1.5.550855617011013392.mp4",
  },
  {
    id: "v10",
    creator: "Vine Creator",
    handle: "vinecreator",
    caption: "Iconic 🍇 2016",
    category: "Comedy",
    year: "2016",
    videoUrl: "https://web.archive.org/web/20160402044600/https://v.cdn.vine.co/r/videos/00386D85451055360781698437120_1aa230b9f58.4.8.12402620832533553381.mp4",
  },
  {
    id: "v11",
    creator: "Vine Creator",
    handle: "vinecreator",
    caption: "Can't stop watching 🔁",
    category: "Comedy",
    year: "2016",
    videoUrl: "https://web.archive.org/web/20160226174907/https://v.cdn.vine.co/r/videos/003EF46D031088997770649653248_152466eebf5.3.2.mp4",
  },
  {
    id: "v12",
    creator: "Vine Creator",
    handle: "vinecreator",
    caption: "Pure vibes 🍇",
    category: "Memes",
    year: "2016",
    videoUrl: "https://web.archive.org/web/20160221030417/https://v.cdn.vine.co/r/videos/0043A120B01078034738297655296_195fe3900e4.3.2.mp4",
  },
  {
    id: "v13",
    creator: "Vine Creator",
    handle: "vinecreator",
    caption: "Back in the day 🕹️",
    category: "Comedy",
    year: "2015",
    videoUrl: "https://web.archive.org/web/20150714170745/https://v.cdn.vine.co/r/videos/0013451D9C1230779227234811904_3ba8ec366a8.4.1.16132336053397986897.mp4",
  },
  {
    id: "v14",
    creator: "Vine Creator",
    handle: "vinecreator",
    caption: "Golden era content ✨",
    category: "Comedy",
    year: "2016",
    videoUrl: "https://web.archive.org/web/20160229201837/https://v.cdn.vine.co/r/videos/00134A584D1177763787554836480_39df7369ae6.1.5.1973425161078706752.mp4",
  },
  {
    id: "v15",
    creator: "Vine Creator",
    handle: "vinecreator",
    caption: "RIP Vine 😢🍇",
    category: "Comedy",
    year: "2016",
    videoUrl: "https://web.archive.org/web/20160623035712/https://v.cdn.vine.co/r/videos/0045A5FA261246957012853108736_3bf47e9ec02.4.6.1748508966761163721.mp4",
  },
];

const CATEGORIES = ["All", "Comedy", "Memes", "Music"];

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
          className="w-full h-full object-cover"
          loop
          muted={muted}
          playsInline
          crossOrigin="anonymous"
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
          <div className="text-white/50 text-xs mt-2">Archived · {vine.year}</div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70 pointer-events-none" />

      {!playing && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Play size={28} fill="white" color="white" className="ml-1" />
          </div>
        </div>
      )}

      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <Heart size={90} fill="#e91e8c" color="#e91e8c" style={{ animation: "heartBurst 0.8s ease forwards" }} />
        </div>
      )}

      {!error && (
        <button
          className="absolute top-16 right-4 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center z-10 backdrop-blur-sm"
          onClick={e => { e.stopPropagation(); setMuted(m => !m); }}
        >
          {muted ? <VolumeX size={15} color="#fff" /> : <Volume2 size={15} color="#fff" />}
        </button>
      )}

      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
        <div
          className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-lg font-bold text-white"
          style={{ background: accentColor }}
        >
          🍇
        </div>
        <button onClick={e => { e.stopPropagation(); setLiked(l => !l); }} className="flex flex-col items-center gap-1">
          <Heart size={28} fill={liked ? "#e91e8c" : "none"} color={liked ? "#e91e8c" : "#fff"} strokeWidth={2} />
          <span className="text-white text-xs font-bold drop-shadow">{liked ? "Liked" : "Like"}</span>
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            try { navigator.share({ title: vine.caption, text: `Classic Vine on Loopd 🍇` }); } catch {}
          }}
          className="flex flex-col items-center gap-1"
        >
          <Share2 size={26} color="#fff" strokeWidth={2} />
          <span className="text-white text-xs font-bold drop-shadow">Share</span>
        </button>
      </div>

      <div className="absolute bottom-8 left-4 right-20 z-10 pointer-events-none">
        <div className="font-bold text-white text-sm mb-1 drop-shadow-md">🍇 Classic Vine</div>
        <p className="text-white text-sm leading-snug line-clamp-2 drop-shadow mb-2">{vine.caption}</p>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-white/20 backdrop-blur-sm">
          📼 Wayback Machine · {vine.year}
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