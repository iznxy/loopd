import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Play, ExternalLink, ChevronDown, ChevronUp, Copyright, HardDrive } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import DriveImporter from "@/components/DriveImporter";

// All YouTube IDs verified live as of 2024-2026
const CLASSIC_VINES = [
  {
    id: "cv1",
    title: "Iconic & Legendary Vine Compilation",
    creator: "Warenya (DinahSo)",
    creatorHandle: "@Warenya",
    year: "2013–2016",
    quote: "Classic vines for when life gives you lemons. Road Work Ahead, Hi Welcome to Chilis, and all the greats.",
    category: "Compilation",
    emoji: "🍇",
    gradient: "linear-gradient(135deg,#f093fb,#f5576c)",
    youtubeId: "nwP3TeK-fPs",
    copyright: "Original clips © their respective Vine creators. Compiled by Warenya for preservation. 12M+ views.",
    views: "12M views",
  },
  {
    id: "cv2",
    title: "Best Vines of 2013 Compilation",
    creator: "MarQuis Trill",
    creatorHandle: "@MarQuisTrill",
    year: "2013",
    quote: "The year it all began. 3+ hours of the earliest and most iconic 6-second clips ever made.",
    category: "Compilation",
    emoji: "📅",
    gradient: "linear-gradient(135deg,#43e97b,#38f9d7)",
    youtubeId: "DAVwQBPAySo",
    copyright: "All clips © original Vine creators, 2013. Compiled under Fair Use for archival/educational purposes.",
    views: "110K views",
  },
  {
    id: "cv3",
    title: "Compilation of Vines 2013",
    creator: "SQUYM",
    creatorHandle: "@jeremy25200",
    year: "2013–2014",
    quote: "23 minutes of pure 2013 Vine gold — the clips that started the revolution.",
    category: "Compilation",
    emoji: "🎬",
    gradient: "linear-gradient(135deg,#667eea,#764ba2)",
    youtubeId: "l0Odbrmt4wc",
    copyright: "All clips © their respective Vine creators. Compiled by SQUYM for preservation.",
    views: "228K views",
  },
  {
    id: "cv4",
    title: "Musical Vine Compilation 2013–2017",
    creator: "Various",
    creatorHandle: "@vine",
    year: "2013–2017",
    quote: "Music was a HUGE part of so many vines. These will get stuck in your head.",
    category: "Music",
    emoji: "🎵",
    gradient: "linear-gradient(135deg,#fa709a,#fee140)",
    youtubeId: "SsHG3ofm6pg",
    copyright: "Musical clips © their respective Vine creators. Music rights belong to original artists & labels.",
    views: "Preserved compilation",
  },
];

const CATEGORIES = ["All", "Compilation", "Comedy", "Music"];

const VINE_STORY = [
  { era: "Jan 2013 — Launch", icon: "🌱", text: "Vine launched January 24, 2013, acquired by Twitter pre-launch for $30M. It pioneered 6-second looping videos — a radical constraint that sparked unmatched creativity." },
  { era: "2013–2014 — Golden Age", icon: "⭐", text: "King Bach, Lele Pons, Nash Grier, and Brittany Furlan amassed tens of millions of followers. The 6-second format forced creators to be funny fast — and they delivered." },
  { era: "2015 — Peak Culture", icon: "🔥", text: "Road Work Ahead, Damn Daniel, Back at it Again — not just clips, but cultural events replayed billions of times. Vine was the internet." },
  { era: "2016 — The Cracks Show", icon: "💔", text: "Top Viners demanded $1.2M each to stay. Twitter refused. Instagram added video. Vine lost its stars and could never offer direct creator monetisation — a fatal flaw." },
  { era: "Jan 17, 2017 — Shutdown", icon: "🪦", text: "Twitter announced closure Oct 27, 2016. App went read-only Jan 17, 2017. Over 200 million loops were deleted. The internet mourned." },
  { era: "The Legacy", icon: "🍇", text: "Vine invented the short-video format. TikTok, YouTube Shorts, Instagram Reels — they all owe their existence to Vine. It proved 6 seconds was enough to change the world." },
];

export default function ClassicVines() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [activeCategory, setActiveCategory] = useState("All");
  const [showStory, setShowStory] = useState(false);
  const [showDriveImporter, setShowDriveImporter] = useState(false);
  const [driveClips, setDriveClips] = useState([]);

  function handleDriveImport(files) {
    setDriveClips(prev => {
      const existingIds = new Set(prev.map(f => f.id));
      return [...prev, ...files.filter(f => !existingIds.has(f.id))];
    });
  }

  const filtered = activeCategory === "All"
    ? CLASSIC_VINES
    : CLASSIC_VINES.filter(v => v.category === activeCategory);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={22} className="text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-foreground">🍇 Classic Vines</h1>
          <p className="text-[11px] text-muted-foreground">The originals that defined internet culture</p>
        </div>
        <button
          onClick={() => setShowDriveImporter(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white flex-shrink-0"
          style={{ background: accentColor }}
        >
          <HardDrive size={13} />
          Drive
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* Hero */}
        <div
          className="mx-4 mt-4 rounded-2xl px-5 py-5 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#00b894,#00cec9)" }}
        >
          <div className="text-white font-bold text-xl mb-1">The Vine Archive 🎬</div>
          <div className="text-white/80 text-sm mb-4 leading-relaxed">
            6-second loops that changed the internet forever. 2013–2017.
          </div>
          <button
            onClick={() => setShowStory(!showStory)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-full transition-all"
          >
            {showStory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showStory ? "Hide history" : "Why Vine died — and why it matters →"}
          </button>
        </div>

        {/* Vine Story Timeline */}
        {showStory && (
          <div className="mx-4 mt-3 space-y-2">
            {VINE_STORY.map(s => (
              <div key={s.era} className="bg-card border border-border rounded-xl px-4 py-3 flex gap-3 items-start">
                <span className="text-xl flex-shrink-0 mt-0.5">{s.icon}</span>
                <div>
                  <div className="text-xs font-bold text-foreground mb-0.5">{s.era}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.text}</p>
                </div>
              </div>
            ))}
            <div className="bg-muted rounded-xl px-4 py-3 text-[10px] text-muted-foreground leading-relaxed">
              📌 Videos below are original Vine content re-uploaded to YouTube for preservation. All rights belong to respective creators. Loopd is not affiliated with Vine or Twitter/X Corp.
            </div>
          </div>
        )}

        {/* Category filter */}
        <div className="px-4 pt-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all"
              style={activeCategory === cat
                ? { background: accentColor, color: "#fff" }
                : { background: "var(--muted)", color: "var(--muted-foreground)" }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Vine Cards */}
        <div className="px-4 pb-8 space-y-5">
          {filtered.map(vine => (
            <div key={vine.id} className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
              {/* Thumbnail */}
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9", background: vine.gradient }}>
                <img
                  src={`https://i.ytimg.com/vi/${vine.youtubeId}/hqdefault.jpg`}
                  alt={vine.title}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = "none"; }}
                />
                {/* Play overlay */}
                <a
                  href={`https://www.youtube.com/watch?v=${vine.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black/30 flex items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play size={28} className="text-black ml-1" fill="black" />
                  </div>
                </a>
                {/* Category badge */}
                <span className="absolute top-3 right-3 text-[10px] font-bold text-white bg-black/60 rounded-full px-2.5 py-1 pointer-events-none">
                  {vine.category}
                </span>
                {/* Year + views badge */}
                <span className="absolute top-3 left-3 text-[10px] font-bold text-white bg-black/60 rounded-full px-2.5 py-1 pointer-events-none">
                  {vine.year}
                </span>
                <span className="absolute bottom-3 left-3 text-[10px] text-white bg-black/60 rounded-full px-2.5 py-1 pointer-events-none">
                  ▶ {vine.views}
                </span>
              </div>

              {/* Info */}
              <div className="px-4 pt-3 pb-1">
                <h3 className="font-bold text-sm text-foreground mb-1">{vine.title}</h3>
                <p className="text-xs text-muted-foreground italic leading-relaxed mb-3">"{vine.quote}"</p>

                {/* Creator info */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: vine.gradient }}
                  >
                    {vine.emoji}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">{vine.creator}</div>
                  <div className="text-[10px] text-muted-foreground">{vine.creatorHandle} · {vine.year}</div>
                  </div>
                </div>

                {/* Watch button */}
                <a
                  href={`https://www.youtube.com/watch?v=${vine.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold mb-3"
                  style={{ background: accentColor, display: "flex" }}
                >
                  <ExternalLink size={15} />
                  Watch on YouTube
                </a>
              </div>

              {/* Copyright footer */}
              <div className="mx-4 mb-4 bg-muted rounded-xl px-3 py-2.5 flex gap-2 items-start">
                <Copyright size={12} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">{vine.copyright}</p>
              </div>
            </div>
          ))}

          {/* Drive-imported clips */}
          {driveClips.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HardDrive size={14} style={{ color: accentColor }} />
                <span className="text-xs font-bold text-foreground">From Your Drive</span>
                <span className="text-[10px] text-muted-foreground">({driveClips.length} clip{driveClips.length > 1 ? "s" : ""})</span>
              </div>
              <div className="space-y-3">
                {driveClips.map(file => (
                  <div key={file.id} className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
                    <div className="relative w-full overflow-hidden bg-muted" style={{ aspectRatio: "16/9" }}>
                      {file.thumbnailLink
                        ? <img src={file.thumbnailLink} alt={file.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>
                      }
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/30 flex items-center justify-center"
                      >
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <Play size={24} className="text-black ml-1" fill="black" />
                        </div>
                      </a>
                      <span className="absolute top-3 left-3 text-[10px] font-bold text-white bg-black/60 rounded-full px-2.5 py-1 pointer-events-none">
                        Drive
                      </span>
                    </div>
                    <div className="px-4 py-3">
                      <div className="text-sm font-bold text-foreground truncate mb-2">{file.name}</div>
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold"
                        style={{ background: accentColor, display: "flex" }}
                      >
                        <ExternalLink size={14} />
                        Open in Drive
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Global disclaimer */}
          <div className="bg-muted rounded-2xl px-4 py-4 text-center">
            <div className="text-base mb-1">🍇</div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Vine (2013–2017) was a Twitter-owned platform. All content belongs to its original creators.
              Displayed here for cultural preservation only. Loopd holds no rights to any content shown.
            </p>
          </div>
        </div>
      </div>
      {showDriveImporter && (
        <DriveImporter
          onImport={handleDriveImport}
          onClose={() => setShowDriveImporter(false)}
        />
      )}
    </div>
  );
}