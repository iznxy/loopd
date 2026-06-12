import React, { useState } from "react";
import { Play, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

const CLASSIC_VINES = [
  {
    id: "cv1",
    title: "Road Work Ahead",
    creator: "Danny Duncan",
    year: "2015",
    quote: "Road work ahead? Uh, yeah, I sure hope it does!",
    category: "Comedy",
    emoji: "🚧",
    gradient: "linear-gradient(135deg,#f093fb,#f5576c)",
    youtubeId: "ZUG9HYIkFaU",
    copyright: "© Danny Duncan",
  },
  {
    id: "cv2",
    title: "Do It For The Vine — Best Compilation",
    creator: "Various Creators",
    year: "2013–2016",
    quote: "The rallying cry of a generation. Creators doing anything for the camera.",
    category: "Compilation",
    emoji: "🍇",
    gradient: "linear-gradient(135deg,#43e97b,#38f9d7)",
    youtubeId: "hbGH95HmMRQ",
    copyright: "© Various Vine creators",
  },
  {
    id: "cv3",
    title: "Back At It Again at Krispy Kreme",
    creator: "Darius Benson",
    year: "2015",
    quote: "The skateboarder + donut shop combo nobody saw coming.",
    category: "Iconic",
    emoji: "🍩",
    gradient: "linear-gradient(135deg,#667eea,#764ba2)",
    youtubeId: "NisCkxU544c",
    copyright: "© Darius Benson",
  },
  {
    id: "cv4",
    title: "Hi Welcome to Chilis",
    creator: "Anonymous",
    year: "2014",
    quote: "Hi, welcome to Chilis. The most recognisable Vine opener ever.",
    category: "Iconic",
    emoji: "🌶️",
    gradient: "linear-gradient(135deg,#fa709a,#fee140)",
    youtubeId: "3TKdS7pniLg",
    copyright: "© Original creator unknown. Viral format.",
  },
  {
    id: "cv5",
    title: "Damn Daniel",
    creator: "Josh Holz",
    year: "2016",
    quote: "Damn Daniel! Back at it again with the white Vans!",
    category: "Viral",
    emoji: "👟",
    gradient: "linear-gradient(135deg,#4facfe,#00f2fe)",
    youtubeId: "G-yn6NlNzS0",
    copyright: "© Josh Holz, 2016",
  },
  {
    id: "cv6",
    title: "It Is Wednesday My Dudes",
    creator: "Internet Classic",
    year: "2016",
    quote: "Every Wednesday, millions posted this. Mid-week internet culture defined.",
    category: "Meme",
    emoji: "🐸",
    gradient: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
    youtubeId: "PF0DUGG8hoo",
    copyright: "© Viral meme format. Original footage public domain.",
  },
  {
    id: "cv7",
    title: "Deez Nuts",
    creator: "WelvenDaGreat",
    year: "2015",
    quote: "The prank call format that launched a thousand parodies.",
    category: "Comedy",
    emoji: "😆",
    gradient: "linear-gradient(135deg,#f5576c,#f093fb)",
    youtubeId: "rvHikK2lMxw",
    copyright: "© Welven Harris (WelvenDaGreat), 2015",
  },
  {
    id: "cv8",
    title: "Vines Greatest Hits Compilation",
    creator: "Multiple Creators",
    year: "2013–2016",
    quote: "The best 6-second moments that defined an entire platform and era.",
    category: "Compilation",
    emoji: "🎬",
    gradient: "linear-gradient(135deg,#43e97b,#667eea)",
    youtubeId: "YHRQGRbwFEU",
    copyright: "© Various Vine creators. Compilation for archival purposes.",
  },
];

const CATEGORIES = ["All", "Comedy", "Iconic", "Meme", "Viral", "Compilation"];

const VINE_STORY = [
  {
    era: "2012 — The Birth",
    icon: "🌱",
    text: "Vine launched January 24, 2013 (founded mid-2012, acquired by Twitter pre-launch for $30M). It pioneered 6-second looping videos — a radical constraint that sparked unmatched creativity.",
  },
  {
    era: "2013–2014 — The Golden Age",
    icon: "⭐",
    text: "Vine exploded. Stars like King Bach, Lele Pons, Nash Grier, and Brittany Furlan amassed tens of millions of followers. The 6-second format forced creators to be funny fast — and they delivered.",
  },
  {
    era: "2015 — Peak Culture",
    icon: "🔥",
    text: "Road Work Ahead, Damn Daniel, Back at it Again — these were not just clips, they were cultural events replayed billions of times. Vine was the internet.",
  },
  {
    era: "2016 — The Cracks Show",
    icon: "💔",
    text: "Top Viners demanded $1.2M each to stay. Twitter refused. Instagram added 15-second video. Vine lost its stars. Creators could never earn directly from the platform — a fatal flaw.",
  },
  {
    era: "Jan 17, 2017 — Shutdown",
    icon: "🪦",
    text: "Twitter announced Vine closing on Oct 27, 2016. App went read-only Jan 17, 2017. Over 200 million loops were deleted. The internet mourned.",
  },
  {
    era: "The Legacy",
    icon: "🍇",
    text: "Vine invented the short-video format. TikTok, YouTube Shorts, Instagram Reels — they all owe their existence to Vine. It proved 6 seconds was enough to change the world.",
  },
];

export default function ClassicVines() {
  const { accentColor } = useTheme();
  const [activeCategory, setActiveCategory] = useState("All");
  const [playingId, setPlayingId] = useState(null);
  const [showStory, setShowStory] = useState(false);

  const filtered = activeCategory === "All"
    ? CLASSIC_VINES
    : CLASSIC_VINES.filter(v => v.category === activeCategory);

  return (
    <div className="flex flex-col overflow-y-auto hide-scrollbar">
      {/* Hero banner */}
      <div className="mx-4 mt-4 rounded-2xl overflow-hidden flex-shrink-0"
        style={{ background: "linear-gradient(135deg,#00b894,#00cec9)" }}>
        <div className="px-5 py-4">
          <div className="text-white font-bold text-lg">🍇 Classic Vines</div>
          <div className="text-white/80 text-xs mt-0.5">The originals that defined internet culture (2013–2017)</div>
          <button
            onClick={() => setShowStory(!showStory)}
            className="mt-3 flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full"
          >
            {showStory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showStory ? "Hide story" : "Why Vine was legendary — and why it died →"}
          </button>
        </div>
      </div>

      {/* Vine Story */}
      {showStory && (
        <div className="mx-4 mt-3 space-y-2">
          {VINE_STORY.map(s => (
            <div key={s.era} className="bg-card border border-border rounded-xl px-4 py-3 flex gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">{s.icon}</span>
              <div>
                <div className="text-xs font-bold text-foreground mb-0.5">{s.era}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            </div>
          ))}
          <div className="bg-muted rounded-xl px-4 py-3 text-[10px] text-muted-foreground leading-relaxed">
            Videos below are original Vine content re-uploaded to YouTube by creators and fans for preservation. All content belongs to its respective creators. Loopd is not affiliated with Vine or Twitter/X Corp.
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 transition-all"
              style={activeCategory === cat
                ? { background: accentColor, color: "#fff" }
                : { background: "var(--muted)", color: "var(--muted-foreground)" }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vine cards */}
      <div className="px-4 pb-6 space-y-4">
        {filtered.map(vine => (
          <div key={vine.id} className="rounded-2xl overflow-hidden border border-border bg-card">
            <div className="flex items-center gap-3 px-4 py-3" style={{ background: vine.gradient }}>
              <span className="text-2xl">{vine.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-sm drop-shadow truncate">{vine.title}</div>
                <div className="text-white/80 text-xs">@{vine.creator} · {vine.year}</div>
              </div>
              <span className="text-white/70 text-[10px] bg-black/20 rounded-full px-2 py-0.5 flex-shrink-0">
                {vine.category}
              </span>
            </div>

            <div className="px-4 pt-3 pb-2">
              <p className="text-xs text-muted-foreground italic">{vine.quote}</p>
            </div>

            {playingId === vine.id ? (
              <div className="mx-4 mb-3 rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <iframe
                  src={`https://www.youtube.com/embed/${vine.youtubeId}?autoplay=1&rel=0`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={vine.title}
                />
              </div>
            ) : (
              <div className="mx-4 mb-3">
                <button
                  onClick={() => setPlayingId(vine.id)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold"
                  style={{ background: accentColor }}
                >
                  <Play size={16} fill="white" /> Watch Original
                </button>
              </div>
            )}

            <div className="px-4 pb-3">
              <p className="text-[10px] text-muted-foreground">{vine.copyright}</p>
            </div>
          </div>
        ))}

        <div className="bg-muted rounded-xl px-4 py-3">
          <p className="text-[11px] text-muted-foreground leading-relaxed text-center">
            🍇 Vine (2013–2017) was a Twitter-owned platform. All vine content belongs to original creators. Shown here for cultural preservation only.
          </p>
        </div>
      </div>
    </div>
  );
}