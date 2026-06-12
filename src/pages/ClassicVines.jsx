import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ExternalLink, Heart, Share2 } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

// Iconic Vine compilation YouTube videos — verified embeddable
const VINES = [
  {
    id: "v1",
    title: "Ultimate Vine Compilation 2013-2014",
    description: "The OG era — where it all began 🍇",
    youtubeId: "5IFnvmxBBJY",
    year: "2013–2014",
    category: "All Time",
    emoji: "🌟",
  },
  {
    id: "v2",
    title: "Best Vines of 2015",
    description: "Peak Vine energy, peak internet culture ⚡",
    youtubeId: "qnkGI40EVEM",
    year: "2015",
    category: "Comedy",
    emoji: "😂",
  },
  {
    id: "v3",
    title: "Best Vines of 2016",
    description: "The final golden year before the shutdown 🥲",
    youtubeId: "5vbeE_yv0dc",
    year: "2016",
    category: "Comedy",
    emoji: "💀",
  },
  {
    id: "v4",
    title: "Iconic Vine Moments Compilation",
    description: "The vines that lived rent-free in our heads 🧠",
    youtubeId: "lClYpkHFsE8",
    year: "2013–2017",
    category: "All Time",
    emoji: "🔁",
  },
  {
    id: "v5",
    title: "Dankest Vine Memes Compilation",
    description: "Internet's finest 6-second memes 🤌",
    youtubeId: "Z-AyiNKb3qA",
    year: "2014–2016",
    category: "Memes",
    emoji: "🌀",
  },
  {
    id: "v6",
    title: "RIP Vine — The Best of All Time",
    description: "A tribute to the app that started it all 🍇✨",
    youtubeId: "BIjZtE3pkLc",
    year: "2013–2017",
    category: "All Time",
    emoji: "🪦",
  },
  {
    id: "v7",
    title: "Vine Compilation — Try Not To Laugh",
    description: "Good luck keeping a straight face 😅",
    youtubeId: "UE5Yn6EqV8I",
    year: "2015–2016",
    category: "Comedy",
    emoji: "🤣",
  },
  {
    id: "v8",
    title: "Best Music Vines Compilation",
    description: "Six seconds of pure musical genius 🎵",
    youtubeId: "K1wDMLRyWVw",
    year: "2014–2016",
    category: "Music",
    emoji: "🎶",
  },
];

const CATEGORIES = ["All", "All Time", "Comedy", "Memes", "Music"];

const CARD_GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#ffecd2,#fcb69f)",
  "linear-gradient(135deg,#a1c4fd,#c2e9fb)",
];

export default function ClassicVines() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeVideo, setActiveVideo] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());

  const filtered = activeCategory === "All"
    ? VINES
    : VINES.filter(v => v.category === activeCategory);

  function toggleLike(id) {
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-4 pb-3 bg-black border-b border-white/10">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={24} color="white" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-white font-bold text-base">🍇 Classic Vines</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex-shrink-0 flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar bg-black">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all"
            style={activeCategory === cat
              ? { background: accentColor, color: "#fff" }
              : { background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video player modal */}
      {activeVideo && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center gap-3 px-4 pt-4 pb-3">
            <button onClick={() => setActiveVideo(null)}>
              <ChevronLeft size={24} color="white" />
            </button>
            <span className="text-white font-bold text-sm flex-1 line-clamp-1">{activeVideo.title}</span>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="w-full" style={{ aspectRatio: "16/9" }}>
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
                title={activeVideo.title}
              />
            </div>
            <div className="p-4 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{activeVideo.emoji}</span>
                <div>
                  <div className="text-white font-bold text-sm">{activeVideo.title}</div>
                  <div className="text-white/50 text-xs">{activeVideo.year}</div>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{activeVideo.description}</p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => toggleLike(activeVideo.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
                  style={{ background: likedIds.has(activeVideo.id) ? "#e91e8c" : "rgba(255,255,255,0.12)", color: "#fff" }}
                >
                  <Heart size={16} fill={likedIds.has(activeVideo.id) ? "#fff" : "none"} />
                  {likedIds.has(activeVideo.id) ? "Liked" : "Like"}
                </button>
                <a
                  href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
                  style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
                >
                  <ExternalLink size={16} />
                  YouTube
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card grid */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-2 pb-6">
        <div className="flex flex-col gap-4">
          {filtered.map((vine, i) => (
            <div
              key={vine.id}
              className="rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
              style={{ background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}
              onClick={() => setActiveVideo(vine)}
            >
              {/* Thumbnail */}
              <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
                <img
                  src={`https://i.ytimg.com/vi/${vine.youtubeId}/hqdefault.jpg`}
                  alt={vine.title}
                  className="w-full h-full object-cover"
                />
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[10px] border-b-[10px] border-l-[18px] border-transparent border-l-white ml-1" />
                  </div>
                </div>
                <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-bold text-white bg-black/60 backdrop-blur-sm">
                  📼 {vine.year}
                </div>
              </div>
              {/* Info row */}
              <div className="flex items-center gap-3 px-4 py-3 bg-black/30 backdrop-blur-sm">
                <span className="text-2xl">{vine.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm line-clamp-1">{vine.title}</div>
                  <div className="text-white/60 text-xs line-clamp-1">{vine.description}</div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); toggleLike(vine.id); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
                  style={{ background: likedIds.has(vine.id) ? "#e91e8c" : "rgba(255,255,255,0.15)" }}
                >
                  <Heart size={14} fill={likedIds.has(vine.id) ? "#fff" : "none"} color="#fff" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}